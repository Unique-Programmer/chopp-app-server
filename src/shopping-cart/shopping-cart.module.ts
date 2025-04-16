import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Product } from 'src/products/product.model';
import { User } from 'src/users/users.model';
import { ShoppingCartController } from './shopping-cart.controller';
import { ShoppingCartService } from './shopping-cart.service';
import { AuthModule } from 'src/auth/auth.module';
import { ShoppingCart } from './shopping-cart.model';
import { ShoppingCartItem } from './shopping-cart-item.model';

@Module({
  imports: [
    SequelizeModule.forFeature([ShoppingCart, ShoppingCartItem, Product, User]),
    forwardRef(() => AuthModule),
  ],
  controllers: [ShoppingCartController],
  providers: [ShoppingCartService],
})
export class ShoppingCartModule {}