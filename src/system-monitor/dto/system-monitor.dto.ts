import { ApiProperty } from '@nestjs/swagger';

export class CpuDto {
  @ApiProperty({ example: '1.51%', description: 'Текущая общая загрузка процессора' })
  load: string;

  @ApiProperty({ example: 12, description: 'Количество ядер процессора' })
  cores: number;

  @ApiProperty({ example: '0.49%', description: 'Загрузка процессора пользовательскими процессами' })
  user: string;

  @ApiProperty({ example: '1.02%', description: 'Загрузка процессора системными процессами' })
  system: string;
}

export class MemoryDto {
  @ApiProperty({ example: '15.58 GB', description: 'Общий объем оперативной памяти' })
  total: string;

  @ApiProperty({ example: '1.47 GB', description: 'Используемый объем оперативной памяти' })
  used: string;

  @ApiProperty({ example: '14.12 GB', description: 'Свободный объем оперативной памяти' })
  free: string;

  @ApiProperty({ example: '9.41%', description: 'Процент использования оперативной памяти' })
  usage: string;
}

export class DiskDto {
  @ApiProperty({ example: '/', description: 'Точка монтирования диска' })
  mount: string;

  @ApiProperty({ example: '1006.85 GB', description: 'Общий размер диска' })
  total: string;

  @ApiProperty({ example: '2.69 GB', description: 'Используемое пространство на диске' })
  used: string;

  @ApiProperty({ example: '952.94 GB', description: 'Свободное пространство на диске' })
  free: string;

  @ApiProperty({ example: '0.28%', description: 'Процент использования диска' })
  usage: string;
}

export class ProcessDto {
  @ApiProperty({ example: 53, description: 'ID процесса' })
  pid: number;

  @ApiProperty({ example: 'ps', description: 'Название процесса' })
  name: string;

  @ApiProperty({ example: '0.00%', description: 'Загрузка CPU процессом' })
  cpu: string;

  @ApiProperty({ example: '0.90 MB', description: 'Объем используемой памяти процессом' })
  mem: string;
}

export class DockerContainerMemoryDto {
  @ApiProperty({ example: '512.25 MB', description: 'Используемая память контейнером' })
  used: string;

  @ApiProperty({ example: '2048.00 MB', description: 'Лимит памяти контейнера' })
  limit: string;

  @ApiProperty({ example: '25.01%', description: 'Процент использования памяти' })
  percent: string;
}

export class DockerContainerNetworkDto {
  @ApiProperty({ example: '12.34 MB', description: 'Полученные данные (incoming)' })
  rx: string;

  @ApiProperty({ example: '5.67 MB', description: 'Отправленные данные (outgoing)' })
  tx: string;
}

export class DockerContainerStatsDto {
  @ApiProperty({ example: 'abc123def456', description: 'ID контейнера (короткий)' })
  id: string;

  @ApiProperty({ example: 'postgres', description: 'Имя контейнера' })
  name: string;

  @ApiProperty({ example: 'running', description: 'Состояние контейнера (running, exited, etc.)' })
  state: string;

  @ApiProperty({ example: '2.45%', description: 'Использование CPU контейнером' })
  cpu: string;

  @ApiProperty({ type: DockerContainerMemoryDto, description: 'Статистика памяти контейнера' })
  memory: DockerContainerMemoryDto;

  @ApiProperty({ type: DockerContainerNetworkDto, description: 'Статистика сети контейнера' })
  network: DockerContainerNetworkDto;
}

export class SystemMonitorDto {
  @ApiProperty({ type: CpuDto, description: 'Информация о процессоре' })
  cpu: CpuDto;

  @ApiProperty({ type: MemoryDto, description: 'Информация о памяти' })
  memory: MemoryDto;

  @ApiProperty({ type: DiskDto, description: 'Информация о диске' })
  disk: DiskDto;

  @ApiProperty({ type: [ProcessDto], description: 'Список активных процессов' })
  processes: ProcessDto[];

  @ApiProperty({ type: [DockerContainerStatsDto], description: 'Статистика Docker контейнеров' })
  docker?: DockerContainerStatsDto[];
}
