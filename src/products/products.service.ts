import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Product } from './product.model';
import { CreateProductDto } from './dto/create-product.dto';
import { Category } from 'src/categories/category.model';
import { Op } from 'sequelize';
import { FileModel } from 'src/files/file.model';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiResponse, PRODUCT_STATE } from 'src/shared/enums';
import { ProductFile } from './product-file.model';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product) private readonly productRepository: typeof Product,
    @InjectModel(ProductFile) private readonly productFileRepository: typeof ProductFile,
  ) {}

  async createProduct(dto: CreateProductDto): Promise<Product> {
    const existingProduct = await this.productRepository.findOne({
      where: { title: dto.title },
    });

    if (existingProduct) {
      throw new HttpException('Product with this title already exists', HttpStatus.BAD_REQUEST);
    }

    const product = await this.productRepository.create({
      title: dto.title,
      description: dto.description,
      price: dto.price,
      categoryId: dto.categoryId,
      imagesOrder: dto.imageIds,
      state: dto.state,
    });

    if (dto.imageIds?.length) {
      await product.$set('images', dto.imageIds);
    }

    return this.getProductById(product.id);
  }

  async updateProduct(dto: UpdateProductDto): Promise<Product> {
    const existingProduct = await this.productRepository.findByPk(dto.id);

    if (!existingProduct) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }

    await existingProduct.update({
      title: dto.title,
      description: dto.description,
      price: dto.price,
      categoryId: dto.categoryId,
      imagesOrder: dto.imageIds,
      state: dto.state,
    });

    if (dto.imageIds?.length) {
      await existingProduct.$set('images', dto.imageIds);
    }

    return this.getProductById(existingProduct.id);
  }

  async getProductById(productId: number): Promise<Product> {
    return this.productRepository.findByPk(productId, {
      include: [
        {
          model: FileModel,
          as: 'images',
          through: { attributes: [] },
        },
        Category,
      ],
      attributes: { exclude: ['categoryId'] },
    });
  }

  async findAllProducts(
    pageNumber = 1,
    limit = 10,
    categoryId?: number,
    search?: string,
    sort: string = 'id',
    order: string = 'ASC',
    state?: PRODUCT_STATE[], // Массив состояний
  ) {
    const offset = (pageNumber - 1) * limit;

    const whereCondition: any = {};
    if (categoryId) whereCondition.categoryId = categoryId;
    if (search) {
      whereCondition[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (state && state.length > 0) {
      whereCondition.state = { [Op.in]: state }; // Фильтр по массиву состояний
    }

    const validSortColumns = ['id', 'title', 'price', 'createdAt', 'updatedAt'];
    if (!validSortColumns.includes(sort)) sort = 'id';
    order = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const { rows: items, count: totalItems } = await this.productRepository.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      order: [[sort, order]],
      distinct: true,
      include: [{ model: FileModel, as: 'images' }, { model: Category }],
      attributes: { exclude: ['categoryId'] },
    });

    return {
      items,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      pageNumber,
      limit,
    };
  }

  async findProductById(id: number) {
    return this.productRepository.findOne({
      where: { id },
      include: [{ model: FileModel, as: 'images' }, { model: Category }],
      attributes: { exclude: ['categoryId'] },
    });
  }

  async updateProductState(productId: number, state: PRODUCT_STATE): Promise<Product> {
    const product = await this.productRepository.findByPk(productId);

    if (!product) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }

    await product.update({ state });
    return this.getProductById(productId);
  }

  async deleteProduct(productId: number): Promise<ApiResponse> {
    const product = await this.productRepository.findByPk(productId);

    if (!product) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }

    await this.productFileRepository.destroy({ where: { productId } });
    await this.productRepository.destroy({ where: { id: productId } });

    return { status: HttpStatus.OK, message: 'ok' };
  }
}
