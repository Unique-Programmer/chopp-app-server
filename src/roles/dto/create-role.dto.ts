import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
    @ApiProperty({ example: 'ADMIN', description: 'role value, must be unique' })
    readonly value: string;

    @ApiProperty({ example: 'Description for role', description: 'role description' })
    readonly description: string;
}