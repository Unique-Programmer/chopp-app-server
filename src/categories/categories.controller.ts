import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoriesService } from './categories.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Category } from './category.model';

import { UpdateCategoriesDto } from './dto/update-categories.dto';
import { UpdateCategoryDto } from './dto/update-category-title.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('categories')
@Controller('categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create category' })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully.',
    type: Category,
  })
  @UseGuards(JwtAuthGuard)
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.createCategory(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({
    status: 200,
    description: 'List of categories',
    type: [Category],
  })
  @UseGuards(JwtAuthGuard)
  getAllCategories(): Promise<Category[]> {
    return this.categoriesService.getAllCategories();
  }

  @Put()
  @ApiOperation({ summary: 'Update multiple categories' })
  @ApiResponse({
    status: 200,
    description: 'Categories updated successfully.',
    type: [Category],
  })
  @UseGuards(JwtAuthGuard)
  updateCategories(@Body() updateCategoriesDtos: UpdateCategoriesDto[]): Promise<Category[]> {
    return this.categoriesService.updateCategories(updateCategoriesDtos);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category and return updated list' })
  @ApiResponse({
    status: 200,
    description: 'Category deleted and updated list returned.',
    type: [Category],
  })
  @UseGuards(JwtAuthGuard)
  async deleteCategory(@Param('id', ParseIntPipe) id: number): Promise<Category[]> {
    return this.categoriesService.deleteCategory(id);
  }

  @Put(':id/title')
  @ApiOperation({ summary: 'Update category title' })
  @ApiResponse({
    status: 200,
    description: 'Category title updated successfully.',
    type: Category,
  })
  @UseGuards(JwtAuthGuard)
  async updateCategoryTitle(
    @Param('id', ParseIntPipe) id: number,
    @Body() { title }: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.updateCategoryTitle(id, title);
  }
}
