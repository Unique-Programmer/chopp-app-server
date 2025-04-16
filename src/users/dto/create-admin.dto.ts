import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({
    example: 'superadmin@example.com',
    description: 'Super admin login email for authentication',
  })
  superadminLogin: string;

  @ApiProperty({
    example: 'SuperAdminPassword!123',
    description: 'Super admin password for authentication',
  })
  @IsString()
  @Length(8, 160, {
    message: 'Password must be between 8 and 160 characters long',
  })
  superadminPassword: string;

  @ApiProperty({
    example: 'admin@example.com',
    description: 'New admin login email',
  })
  adminLogin: string;

  @ApiProperty({
    example: 'AdminStrongPassword!123',
    description: 'New admin password',
  })
  @IsString()
  @Length(8, 160, {
    message: 'Password must be between 8 and 160 characters long',
  })
  adminPassword: string;
}
