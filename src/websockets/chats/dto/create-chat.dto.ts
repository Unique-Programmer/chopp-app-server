import { ApiProperty } from '@nestjs/swagger';

export class CreateChatDto {
  @ApiProperty({ example: '2', description: 'Id of invitated user' })
  readonly userId: string;

  @ApiProperty({ example: '1', description: "Id of chat's creator" })
  readonly ownerId: string;
}

