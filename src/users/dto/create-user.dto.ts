import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({ example: 'user@gmail.com', description: 'unique email' })
    readonly email: string;

    @ApiProperty({ example: '1234', description: 'password' })
    readonly password: string;

    @ApiProperty({ example: 'Zovut Syava', description: 'full name, splitted' })
    readonly fullName: string;

    @ApiProperty({ example: '8-989-898-98-98', description: 'phone number like string' })
    readonly phoneNumber: string;
}