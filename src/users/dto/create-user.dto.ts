import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, IsEmail, IsBoolean } from 'class-validator';
import { Role } from 'src/roles/roles.model';

const PASSWORD_MINIMAL_LENGTH = 8;
const PASSWORD_MAXIMUM_LENGTH = 16;
const FULLNAME_MINIMAL_LENGTH = 8;
const FULLNAME_MAXIMUM_LENGTH = 60;
const PHONE_NUMBER_MINIMAL_LENGTH = 6;
const PHONE_NUMBER_MAXIMUM_LENGTH = 16;

export class CreateUserDto {
  @ApiProperty({ example: 'user@gmail.com', description: 'unique email' })
  @IsString({ message: 'STRING field type expected' })
  @IsEmail({}, { message: 'Field must be email' })
  readonly email?: string;

  @ApiProperty({ example: '12345678', description: 'password' })
  @IsString({ message: 'STRING field type expected' })
  @Length(PASSWORD_MINIMAL_LENGTH, PASSWORD_MAXIMUM_LENGTH, {
    message: `Password must be from ${PASSWORD_MINIMAL_LENGTH} to ${PASSWORD_MAXIMUM_LENGTH} characters`,
  })
  readonly password?: string;

  @ApiProperty({ example: 'Zovut Syava', description: 'full name, splitted' })
  @IsString({ message: 'STRING field type expected' })
  @Length(FULLNAME_MINIMAL_LENGTH, FULLNAME_MAXIMUM_LENGTH, {
    message: `User fullname must be from ${FULLNAME_MINIMAL_LENGTH} to ${FULLNAME_MAXIMUM_LENGTH} characters`,
  })
  readonly fullName?: string;

  @ApiProperty({
    example: '8-989-898-98-98',
    description: 'phone number like string',
  })
  @Length(PHONE_NUMBER_MINIMAL_LENGTH, PHONE_NUMBER_MAXIMUM_LENGTH, {
    message: `Phone number must be from ${PHONE_NUMBER_MINIMAL_LENGTH} to ${PHONE_NUMBER_MAXIMUM_LENGTH} characters`,
  })
  readonly phoneNumber: string;

  @ApiProperty({
    example: 'true',
    description:
      'Флаг isRegistered по умолчанию false. Пользователь считается зарегистрированным только после успешного подтверждения кода. Это может предотвратить создание мусорных аккаунтов.',
  })
  @IsBoolean({ message: 'BOOLEAN field type expected' })
  readonly isRegistered: boolean;
}

export class UserRO {
  id: number;
  email?: string;
  fullName?: string;
  phoneNumber?: string;
  roles: Role[];
}

export class AdminRO {}
