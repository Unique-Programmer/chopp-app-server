import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, Length } from 'class-validator';
import { USER_ROLE } from 'src/shared/enums';

const PASSWORD_MINIMAL_LENGTH = 8;
const PASSWORD_MAXIMUM_LENGTH = 16;

export class AuthDto {
  @ApiProperty({
    example: '8-989-898-98-98 or use email value',
    description: 'unique phone number',
  })
  @IsOptional()
  @IsString({ message: 'STRING field type expected' })
  readonly phoneNumber: string;

  @ApiProperty({
    example: 'email@gmail.com or use phone number value',
    description: 'unique phone number',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Must be a valid email address' })
  email?: string;

  @ApiProperty({ example: '12345678', description: 'password' })
  @IsString({ message: 'STRING field type expected' })
  @Length(PASSWORD_MINIMAL_LENGTH, PASSWORD_MAXIMUM_LENGTH, {
    message: `Password must be from ${PASSWORD_MINIMAL_LENGTH} to ${PASSWORD_MAXIMUM_LENGTH} characters`,
  })
  readonly password: string;

  @ApiProperty({ example: USER_ROLE.USER, description: 'User role' })
  @IsEnum(USER_ROLE, { message: 'Must be a valid USER_ROLE value' })
  readonly context: USER_ROLE;
}

export class RefreshDto {
  @ApiProperty({ example: 'asdd334safs', description: 'refresh token' })
  @IsString({ message: 'STRING field type expected' })
  readonly refreshToken: string;
}

export class LoginDto {
  @ApiProperty({ example: '+79876543210', description: 'Phone number' })
  @IsNotEmpty()
  @IsPhoneNumber()
  phoneNumber: string;
}

export class VerifyCodeDto {
  @ApiProperty({ example: '+79876543210', description: 'Phone number' })
  @IsNotEmpty()
  @IsPhoneNumber()
  phoneNumber: string;

  @ApiProperty({ example: '1234', description: '4-digit verification code' })
  @IsNotEmpty()
  @Length(4, 4)
  code: string;
}
