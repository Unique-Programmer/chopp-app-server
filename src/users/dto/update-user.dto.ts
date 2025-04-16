import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, IsEmail, IsOptional } from 'class-validator';

const PASSWORD_MINIMAL_LENGTH = 8;
const PASSWORD_MAXIMUM_LENGTH = 16;
const FULLNAME_MINIMAL_LENGTH = 8;
const FULLNAME_MAXIMUM_LENGTH = 60;
const PHONE_NUMBER_MINIMAL_LENGTH = 6;
const PHONE_NUMBER_MAXIMUM_LENGTH = 16;

export class UpdateUserDto {
  @ApiProperty({
    example: 'user@gmail.com',
    description: 'will checked by unique',
  })
  @IsOptional()
  @IsString({ message: 'STRING field type expected' })
  @IsEmail({}, { message: 'Field must be email' })
  readonly email: string;

  @ApiProperty({ example: '1234', description: 'password' })
  @IsOptional()
  @IsString({ message: 'STRING field type expected' })
  @Length(PASSWORD_MINIMAL_LENGTH, PASSWORD_MAXIMUM_LENGTH, {
    message: `Password must be from ${PASSWORD_MINIMAL_LENGTH} to ${PASSWORD_MAXIMUM_LENGTH} characters`,
  })
  readonly password: string;

  @ApiProperty({ example: 'Zovut Syava', description: 'full name, splitted' })
  @IsOptional()
  @IsString({ message: 'STRING field type expected' })
  @Length(FULLNAME_MINIMAL_LENGTH, FULLNAME_MAXIMUM_LENGTH, {
    message: `User fullname must be from ${FULLNAME_MINIMAL_LENGTH} to ${FULLNAME_MAXIMUM_LENGTH} characters`,
  })
  readonly fullName: string;

  @ApiProperty({
    example: '8-989-898-98-98',
    description: 'phone number like string',
  })
  @IsOptional()
  @Length(PHONE_NUMBER_MINIMAL_LENGTH, PHONE_NUMBER_MAXIMUM_LENGTH, {
    message: `Phone number must be from ${PHONE_NUMBER_MINIMAL_LENGTH} to ${PHONE_NUMBER_MAXIMUM_LENGTH} characters`,
  })
  readonly phoneNumber: string;
}
