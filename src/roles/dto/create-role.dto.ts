import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateRoleDto {
    @ApiProperty({ example: 'ADMIN', description: 'role value, must be unique' })
    @IsString({ message: 'STRING field type expected' })
    readonly value: string;

    @ApiProperty({ example: 'Description for role', description: 'role description' })
    @IsNumber({}, { message: 'NUMBER field type expected' })
    readonly description: string;
}