import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

const FULLNAME_MINIMAL_LENGTH = 0;
const FULLNAME_MAXIMUM_LENGTH = 150;

export class CreateMessageDto {
  @ApiProperty({ example: 'Hello! How are you name from?', description: 'Text of the message' })
  @IsString({ message: 'STRING field type expected' })
  @Length(FULLNAME_MINIMAL_LENGTH, FULLNAME_MAXIMUM_LENGTH, {
    message: `User message must be from ${FULLNAME_MINIMAL_LENGTH} to ${FULLNAME_MAXIMUM_LENGTH} characters`,
  })
  readonly text: string;
}

