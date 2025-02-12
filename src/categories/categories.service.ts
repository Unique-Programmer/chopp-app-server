import { HttpException, HttpStatus, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Category } from './category.model';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Sequelize, Op } from 'sequelize';
import { UpdateCategoriesDto } from './dto/update-categories.dto';
import { Product } from 'src/products/product.model';

const NO_CATEGORY = 'Другое'

@Injectable()
export class CategoriesService implements OnModuleInit {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectModel(Category) private categoryModel: typeof Category,
    @InjectModel(Product) private productModel: typeof Product,
  ) {}

  async onModuleInit() {
    const categories = await this.categoryModel.findAll();
    const categoriesNames = categories.map((item) => item.title);

    if (!categoriesNames.includes(NO_CATEGORY)) {
      this.categoryModel.create({
        title: NO_CATEGORY,
        order: categories.length,
      });

      this.logger.log(`🚀 Создана дефолтная категория: ${NO_CATEGORY}`);
    }
  }

  async createCategory(dto: CreateCategoryDto): Promise<Category> {
    const existingCategory = await this.categoryModel.findOne({
      where: { title: dto.title },
    });

    if (existingCategory) {
      throw new HttpException('Category with this title already exists', HttpStatus.BAD_REQUEST);
    }

    const category = await this.categoryModel.create(dto);
    return category;
  }

  async getAllCategories(): Promise<Category[]> {
    return this.categoryModel.findAll();
  }

  async updateCategories(dtos: UpdateCategoriesDto[]): Promise<Category[]> {
    const updatedCategories = dtos.map(async (dto) => {
      const category = await this.categoryModel.findByPk(dto.id);
      if (category) {
        return category.update(dto);
      }
    });
    return Promise.all(updatedCategories);
  }

  async updateCategoryTitle(id: number, newTitle: string): Promise<Category> {
    const category = await this.categoryModel.findByPk(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Запрещаем редактировать категорию "Другое"
    if (category.title === NO_CATEGORY) {
      throw new HttpException(`Cannot edit the title of the default category "${NO_CATEGORY}"`, HttpStatus.FORBIDDEN);
    }

    // Проверяем, не существует ли уже категории с таким названием
    const existingCategory = await this.categoryModel.findOne({
      where: { title: newTitle },
    });
    if (existingCategory && existingCategory.id !== id) {
      throw new HttpException(`Category with title "${newTitle}" already exists`, HttpStatus.BAD_REQUEST);
    }

    category.title = newTitle;
    await category.save();
    return category;
  }

  async deleteCategory(id: number): Promise<Category[]> {
    const categoryToDelete = await this.categoryModel.findByPk(id, { include: [Product] });

    if (!categoryToDelete) {
      throw new NotFoundException(`Категория с ID ${id} не найдена`);
    }

    // Проверяем, если это категория с названием "Другое"
    if (categoryToDelete.title === NO_CATEGORY) {
      throw new HttpException(`Нельзя удалить категорию "${NO_CATEGORY}"`, HttpStatus.FORBIDDEN);
    }

    return await this.categoryModel.sequelize.transaction(async (t) => {
      // Находим категорию "Другое"
      const noCategory = await this.categoryModel.findOne({
        where: { title: NO_CATEGORY },
        transaction: t,
      });

      // Если категории "Другое" нет — выбрасываем ошибку
      if (!noCategory) {
        throw new NotFoundException(`Категория "${NO_CATEGORY}" не найдена. Перенос невозможен.`);
      }

      // Перенос всех продуктов из удаляемой категории в "Другое"
      await this.productModel.update(
        { categoryId: noCategory.id },
        { where: { categoryId: categoryToDelete.id }, transaction: t },
      );

      // Удаление категории
      await categoryToDelete.destroy({ transaction: t });

      // Обновление порядка оставшихся категорий
      await this.categoryModel.update(
        { order: Sequelize.literal('"order" - 1') },
        { where: { order: { [Op.gt]: categoryToDelete.order } }, transaction: t },
      );

      // Возвращаем обновленный список категорий
      return this.categoryModel.findAll({
        order: [['order', 'ASC']],
        transaction: t,
      });
    });
  }
}
