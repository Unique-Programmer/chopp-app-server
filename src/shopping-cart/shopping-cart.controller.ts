import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ShoppingCartService } from './shopping-cart.service';
import { AddProductsToCartDto } from './dto/add-products-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ShoppingCartDto } from './dto/shopping-cart.dto';
import { RolesGuard } from 'src/auth/roles-auth.guard';

@ApiTags('shopping-cart')
@ApiBearerAuth()
@Controller('shopping-cart')
@UseGuards(JwtAuthGuard)
export class ShoppingCartController {
  constructor(private readonly shoppingCartService: ShoppingCartService) {}

  @Get()
  @ApiOperation({ summary: 'Get shopping cart by user ID for admin or for logged-in user' })
  @ApiResponse({
    status: 200,
    description: 'Returned the shopping cart for the user.',
    type: ShoppingCartDto,
  })
  async getShoppingCart(@Req() req: any): Promise<ShoppingCartDto> {
    const userId = req.user.id;
    return await this.shoppingCartService.getShoppingCart(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Add multiple products to the cart' })
  @ApiBody({ type: AddProductsToCartDto })
  @ApiResponse({ status: 201, description: 'Products added to the cart successfully.' })
  async addProductsToCart(@Req() req: any, @Body() body: AddProductsToCartDto): Promise<any> {
    return await this.shoppingCartService.addProductsToCart(req.user.id, body.items);
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Clear the shopping cart' })
  @ApiResponse({ status: 200, description: 'Shopping cart cleared successfully.' })
  async clearCart(@Req() req: any): Promise<any> {
    return await this.shoppingCartService.clearCart(req.user.id);
  }
}
