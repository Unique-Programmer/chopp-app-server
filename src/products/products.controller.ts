import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Body,
  Get,
  Query,
  Param,
  Put,
  HttpException,
  HttpStatus,
  UseGuards,
  Patch,
  Delete,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { FilesService } from '../files/files.service';
import { ProductService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PRODUCT_STATE } from 'src/shared/enums';

@ApiTags('products')
@Controller('products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProductsController {
  constructor(
    private readonly productService: ProductService,
    private readonly filesService: FilesService,
  ) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Create a new product with images',
    type: CreateProductDto,
  })
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 5 }]))
  async createProduct(
    @UploadedFiles() files: { images?: Express.Multer.File[] },
    @Body() productData: CreateProductDto,
  ) {
    try {
      const imageUrls = await Promise.all(files.images?.map((file) => this.filesService.uploadFile(file)) || []);
      return this.productService.createProduct({
        ...productData,
        imageIds: imageUrls.map((item) => item.id),
      });
    } catch (error) {
      throw new HttpException('Error creating product', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'Update product', type: UpdateProductDto })
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 5 }]))
  async updateProduct(
    @UploadedFiles() files: { images?: Express.Multer.File[] },
    @Body() productData: UpdateProductDto,
    @Param('id') id: number,
  ) {
    try {
      const imageModels = await Promise.all(files.images?.map((file) => this.filesService.uploadFile(file)) || []);

      let remainingOldImagesParsed: { id: number; hash: string }[] = [];
      let remainingOldImagesHashSet = new Set<string>();

      if (productData.remainingOldImages) {
        remainingOldImagesParsed = Array.isArray(productData.remainingOldImages)
          ? productData.remainingOldImages.map((item) => JSON.parse(item))
          : [JSON.parse(productData.remainingOldImages)];

        remainingOldImagesHashSet = new Set(remainingOldImagesParsed.map((item) => item.hash));
      }

      const onlyNewUploadedImagesIds = imageModels
        .filter((item) => !remainingOldImagesHashSet.has(item.hash))
        .map((item) => item.id);

      const remainingOldImagesIds = remainingOldImagesParsed.map((item) => item.id);

      return this.productService.updateProduct({
        ...productData,
        imageIds: [...remainingOldImagesIds, ...onlyNewUploadedImagesIds],
        id,
      });
    } catch (error) {
      throw new HttpException('Error updating product', HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit of products per page' })
  @ApiQuery({ name: 'categoryId', required: false, type: Number, description: 'Filter by category ID' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by title or description' })
  @ApiQuery({ name: 'sort', required: false, type: String, description: 'Sort key' })
  @ApiQuery({ name: 'order', required: false, type: String, enum: ['ASC', 'DESC'], description: 'Sort order' })
  @ApiQuery({ name: 'state', required: false, type: [String], description: 'Filter by product state' }) // Массив состояний
  async getAllProducts(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('categoryId') categoryId?: number,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
    @Query('order') order: 'ASC' | 'DESC' = 'ASC',
    @Query('state') state?: PRODUCT_STATE | PRODUCT_STATE[], // Массив состояний
  ) {
    const stateArray = Array.isArray(state) ? state : state ? [state] : undefined;

    return this.productService.findAllProducts(
      Number(page),
      Number(limit),
      categoryId,
      search,
      sort,
      order,
      stateArray, // Передаем массив состояний
    );
  }

  @Patch(':id/state')
  @ApiBody({
    description: 'Update product visibility',
    schema: { type: 'object', properties: { state: { type: typeof PRODUCT_STATE } } },
  })
  async updateProductState(@Param('id') id: number, @Body('state') state: PRODUCT_STATE) {
    return this.productService.updateProductState(id, state);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удаление товара', description: 'Удаляет товар по ID вместе со связанными файлами.' })
  async deleteProduct(@Param('id') id: number) {
    return this.productService.deleteProduct(id);
  }
}
