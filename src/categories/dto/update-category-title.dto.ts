import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateCategoryDto {
  @ApiProperty({
    description: 'New title of the category',
    example: 'Renamed Category',
  })
  @IsString()
  title: string;
}
