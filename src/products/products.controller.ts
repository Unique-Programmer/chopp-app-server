// import {
//   Controller,
//   Post,
//   UseInterceptors,
//   UploadedFiles,
//   Body,
//   Get,
//   Query,
//   Param,
//   Put,
//   HttpException,
//   HttpStatus,
// } from '@nestjs/common';
// import { FileFieldsInterceptor } from '@nestjs/platform-express';
// // import { File } from 'multer';
// import { FilesService } from '../files/files.service';
// import { ProductService } from './products.service';
// import { CreateProductDto } from './dto/create-product.dto';
// import {
//   ApiBody,
//   ApiConsumes,
//   ApiParam,
//   ApiQuery,
//   ApiTags,
// } from '@nestjs/swagger';
// import { UpdateProductDto } from './dto/update-product.dto';

// @ApiTags('products')
// @Controller('products')
// export class ProductsController {
//   constructor(
//     private productService: ProductService,
//     private filesService: FilesService,
//   ) {}

//   @Post()
//   @ApiConsumes('multipart/form-data') // Определяем тип контента, так как это загрузка файлов
//   @ApiBody({
//     description: 'Create a new product with images',
//     type: CreateProductDto,
//   })
//   @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 5 }]))
//   async createProduct(
//     @UploadedFiles() files: { images?: any[] },
//     @Body() productData: CreateProductDto,
//   ) {
//     const imageUrls = await Promise.all(
//       files.images?.map((file) => this.filesService.uploadFile(file)) || [],
//     );

//     return this.productService.createProduct({
//       ...productData,
//       imageIds: imageUrls.map((item) => item.id),
//     });
//   }

//   @Put(':id')
//   @ApiConsumes('multipart/form-data') // Определяем тип контента, так как это загрузка файлов
//   @ApiBody({
//     description: 'Update product',
//     type: CreateProductDto,
//   })
//   @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 5 }]))
//   async updateProduct(
//     @UploadedFiles() files: { images?: File[] },
//     @Body() productData: UpdateProductDto,
//     @Param() params,
//   ) {
//     const { id } = params;
//     const imageModels = await Promise.all(
//       files.images?.map((file) => this.filesService.uploadFile(file)) || [],
//     );

//     try {
//       let onlyNewUploadedImagesIds = [];
//       let initialImagesIds = [];
//       let initialImagesParsed = []
//       let initialImagesHashSet = new Set();

//       if (Array.isArray(productData.initialImages)) {
//         initialImagesParsed = productData.initialImages.map((item) =>
//           JSON.parse(item),
//         );
//         console.log('initialImagesArr: ', initialImagesParsed);

//       } else {

//         initialImagesParsed = [JSON.parse(productData.initialImages)];
//         // initialImagesHashSet = new Set(
//         //   initialImagesParsed.map((item) => item.hash),
//         // );

//         // const initialImage = JSON.parse(productData.initialImages);

//         // onlyNewUploadedImagesIds = imageModels
//         //   .filter((item) => initialImage.hash !== item.hash)
//         //   .map((item) => item.id);
//         // initialImagesIds = [initialImage.id];
//       }

//       console.log('[...initialImagesIds, ...onlyNewUploadedImagesIds]; ', [
//         ...initialImagesIds,
//         ...onlyNewUploadedImagesIds,
//       ]);

//       initialImagesHashSet = new Set(
//         initialImagesParsed.map((item) => item.hash),
//       );

//       onlyNewUploadedImagesIds = imageModels
//         .filter((item) => !initialImagesHashSet.has(item.hash))
//         .map((item) => item.id);

//       initialImagesIds = initialImagesParsed.map((item) => item.uid);

//       return this.productService.updateProduct({
//         ...productData,
//         imageIds: [...initialImagesIds, ...onlyNewUploadedImagesIds],
//         id,
//       });
//     } catch (error) {
//       console.log('❌ updateProduct error: ', error);
//       throw new HttpException(error, HttpStatus.BAD_REQUEST);
//     }
//   }

//   // @Put(':id')
//   // @ApiConsumes('multipart/form-data')
//   // @ApiParam({
//   //   name: 'id',
//   //   required: true,
//   //   description: 'Product ID',
//   //   type: Number,
//   // })
//   // @ApiBody({
//   //   description: 'Update an existing product with images',
//   //   type: UpdateProductDto, // You may need to define this DTO if it differs from CreateProductDto
//   // })
//   // @UseInterceptors(FileFieldsInterceptor([{ name: 'newFiles', maxCount: 5 }]))
//   // async updateProduct(
//   //   @Param('id') id: number,
//   //   @UploadedFiles() files: { newFiles?: File[] },
//   //   @Body() productData: UpdateProductDto,
//   // ) {
//   //   const newImageUrls = files.newFiles
//   //     ? await Promise.all(
//   //         files.newFiles.map((file) => this.filesService.uploadFile(file)),
//   //       )
//   //     : [];

//   //   let initialImages = [];
//   //   try {
//   //     initialImages = JSON.parse(productData.initialImages);
//   //     return this.productService.updateProduct(id, {
//   //       ...productData,
//   //       initialImages,
//   //       newImageUrls: newImageUrls.map((item) => item.path),
//   //     });
//   //   } catch (error) {
//   //     throw new HttpException(
//   //       'Error while parsing -initialImages-',
//   //       HttpStatus.BAD_REQUEST,
//   //     );
//   //   }
//   // }

//   // В ProductsController
//   @Get()
//   @ApiQuery({
//     name: 'page',
//     required: false,
//     type: Number,
//     description: 'Page number',
//   })
//   @ApiQuery({
//     name: 'limit',
//     required: false,
//     type: Number,
//     description: 'Limit of products per page',
//   })
//   @ApiQuery({
//     name: 'categoryId',
//     required: false,
//     type: Number,
//     description: 'Filter by category ID',
//   })
//   @ApiQuery({
//     name: 'search',
//     required: false,
//     type: String,
//     description: 'Search by title or description',
//   })
//   @ApiQuery({
//     name: 'sort',
//     required: false,
//     type: String,
//     description: 'Sort key',
//   })
//   @ApiQuery({
//     name: 'order',
//     required: false,
//     type: String,
//     enum: ['ASC', 'DESC'],
//     description: 'Sort order',
//   })
//   async getAllProducts(
//     @Query('pageNumber') pageNumber: number = 1,
//     @Query('limit') limit: number = 10,
//     @Query('categoryId') categoryId: number,
//     @Query('search') search: string,
//     @Query('sort') sort: string,
//     @Query('order') order: string = 'ASC',
//   ) {
//     return this.productService.findAllProducts(
//       Number(pageNumber),
//       Number(limit),
//       categoryId,
//       search,
//       sort,
//       order,
//     );
//   }
// }

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
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { FilesService } from '../files/files.service';
import { ProductService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

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

      let initialImagesParsed: { id: number; hash: string }[] = [];
      let initialImagesHashSet = new Set<string>();

      if (productData.initialImages) {
        initialImagesParsed = Array.isArray(productData.initialImages)
          ? productData.initialImages.map((item) => JSON.parse(item))
          : [JSON.parse(productData.initialImages)];

        initialImagesHashSet = new Set(initialImagesParsed.map((item) => item.hash));
      }

      const onlyNewUploadedImagesIds = imageModels
        .filter((item) => !initialImagesHashSet.has(item.hash))
        .map((item) => item.id);

      const initialImagesIds = initialImagesParsed.map((item) => item.id);

      return this.productService.updateProduct({
        ...productData,
        imageIds: [...initialImagesIds, ...onlyNewUploadedImagesIds],
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
  async getAllProducts(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('categoryId') categoryId?: number,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
    @Query('order') order: 'ASC' | 'DESC' = 'ASC',
  ) {
    return this.productService.findAllProducts(Number(page), Number(limit), categoryId, search, sort, order);
  }
}
