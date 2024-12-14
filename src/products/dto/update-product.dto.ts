import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min, IsArray, IsInt } from 'class-validator';

export class UpdateProductDto {
  @ApiProperty({
    description: 'ID of the product to update',
    example: 3,
  })
  @IsInt()
  id: number;

  @ApiProperty({
    description: 'Product title',
    example: 'Car',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Product description',
    example: 'So fast',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Product price',
    example: 100,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Product category',
    example: 1,
  })
  @IsNumber()
  categoryId: number;

  @ApiProperty({
    description: 'Product images',
    type: 'array',
    items: {
      type: 'string',
      example: 'uuid1',
    },
  })
  @IsArray()
  images: string[];
}
