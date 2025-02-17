import { ApiProperty } from '@nestjs/swagger';

export class ChatStatsDto {
  @ApiProperty({ example: '2', description: 'Total count of messages' })
  readonly total: number;

  @ApiProperty({ example: '1', description: "Count of readed messages" })
  readonly read: number;

  @ApiProperty({ example: '3', description: "Count of unreaded messages" })
  readonly unread: number;
}

