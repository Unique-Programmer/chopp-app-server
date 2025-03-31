import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Product } from 'src/products/product.model';
import { User } from 'src/users/users.model';
import { ShoppingCart } from './shopping-cart.model';
import { Transaction } from 'sequelize';
import { ShoppingCartDto } from './dto/shopping-cart.dto';
import { ShoppingCartItem } from './shopping-cart-item.model';
import { FileModel } from 'src/files/file.model';

@Injectable()
export class ShoppingCartService implements OnModuleInit {
  private readonly logger = new Logger(ShoppingCartService.name);

  constructor(
    @InjectModel(ShoppingCart) private shoppingCartModel: typeof ShoppingCart,
    @InjectModel(ShoppingCartItem) private shoppingCartItemModel: typeof ShoppingCartItem,
    @InjectModel(Product) private productModel: typeof Product,
    @InjectModel(User) private userModel: typeof User,
  ) {}

  async onModuleInit() {
    if (process.env.NODE_ENV !== 'development') return;

    const users = await this.userModel.findAll();
    const cartUserIds = (
      await this.shoppingCartModel.findAll({ attributes: ['userId'] })
    )
      .map((cart) => cart.userId)
      .filter((userId) => userId != null);

    const usersWithoutCart = users.filter(
      (user) => !cartUserIds.includes(user.id),
    );

    for (const user of usersWithoutCart) {
      await this.shoppingCartModel.create({
        userId: user.id,
        items: [],
        totalPrice: 0,
      });
      this.logger.log(`🚀 Created shopping cart for user ID: ${user.id}`);
    }

    if (usersWithoutCart.length > 0) {
      this.logger.log(
        `✅ Added shopping carts for ${usersWithoutCart.length} users.`,
      );
    } else {
      this.logger.log(`✅ All users already have shopping carts.`);
    }
  }

  async getShoppingCart(userId: number): Promise<ShoppingCartDto> {
    const cart = await this.shoppingCartModel.findOne({
      where: { userId },
      include: [
        {
          model: ShoppingCartItem,
          include: [
            {
              model: Product,
              include: [{ model: FileModel, as: 'images' }], // Включаем связанные изображения
            },
          ],
        },
      ],
    });
  
    if (!cart) {
      throw new NotFoundException('Shopping cart not found');
    }
  
    // Преобразуем данные в JSON, чтобы избежать циклических ссылок
    const plainCart = cart.toJSON();
  
    const items = plainCart.items.map((item) => ({
      product: {
        ...item?.product,
        images: item.product?.images, // Добавляем изображения
      },
      quantity: item.quantity,
      totalPrice: item.quantity * item.product?.price,
    }));
  
    return { items, totalPrice: plainCart.totalPrice, quantity: plainCart.quantity };
  }
  
  
  async addProductsToCart(
    userId: number,
    items: { productId: number; quantity: number }[],
  ): Promise<{ items: any[]; totalPrice: number; quantity: number }> {
    const transaction = await this.shoppingCartModel.sequelize.transaction();
    try {
      let cart = await this.shoppingCartModel.findOne({
        where: { userId },
        transaction,
      });
  
      if (!cart) {
        cart = await this.shoppingCartModel.create(
          {
            userId,
            totalPrice: 0,
            quantity: 0,
          },
          { transaction },
        );
      }
  
      // Удаляем старые элементы корзины
      await this.shoppingCartItemModel.destroy({
        where: { shoppingCartId: cart.id },
        transaction,
      });
  
      let detailedItems = [];
      let totalPrice = 0;
      let totalQuantity = 0;
  
      // Добавляем новые элементы в корзину
      for (const item of items) {
        const product = await this.productModel.findByPk(item.productId, {
          include: [{ model: FileModel, as: 'images' }], // Включаем изображения
          transaction,
        });
        if (!product) {
          throw new NotFoundException(`Product with ID ${item.productId} not found`);
        }
  
        const newItem = await this.shoppingCartItemModel.create(
          {
            productId: item.productId,
            quantity: item.quantity,
            shoppingCartId: cart.id,
          },
          { transaction },
        );
  
        const itemTotalPrice = newItem.quantity * product.price;
        totalPrice += itemTotalPrice;
        totalQuantity += newItem.quantity;
  
        detailedItems.push({
          product: {
            ...product?.toJSON(),
            images: product?.images,
          },
          quantity: newItem.quantity,
          totalPrice: itemTotalPrice,
        });
      }
  
      // Обновляем корзину с пересчитанными значениями
      cart.totalPrice = totalPrice;
      cart.quantity = totalQuantity;
      await cart.save({ transaction });
  
      await transaction.commit();
  
      return {
        items: detailedItems,
        totalPrice: cart.totalPrice,
        quantity: cart.quantity,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  
  


  async clearCart(userId: number): Promise<any> {
    const transaction = await this.shoppingCartModel.sequelize.transaction();

    try {
      const cart = await this.shoppingCartModel.findOne({
        where: { userId },
        transaction,
      });

      if (!cart) {
        throw new NotFoundException('Shopping cart not found');
      }

      await this.shoppingCartItemModel.destroy({
        where: { shoppingCartId: cart.id },
        transaction,
      });

      // Обнуляем общее количество и стоимость
      cart.totalPrice = 0;
      cart.quantity = 0;
      await cart.save({ transaction });

      await transaction.commit();
      return { message: 'Shopping cart cleared successfully' };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
