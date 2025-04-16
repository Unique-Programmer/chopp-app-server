import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Order of the category in the list',
    example: 1,
  })
  @IsInt()
  @Min(0)
  order: number;

  @ApiProperty({
    description: 'Title of the category',
    example: 'New Category',
  })
  @IsString()
  title: string;
}
