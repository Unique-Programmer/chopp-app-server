import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SystemMonitorService } from './system-monitor.service';
import { RolesGuard } from '../auth/roles-auth.guard';
import { Roles } from '../auth/roles-auth.decorator';
import { SystemMonitorDto } from './dto/system-monitor.dto';

@ApiTags('monitor')
@Controller('system-monitor')
export class SystemMonitorController {
  constructor(private readonly systemMonitorService: SystemMonitorService) {}

  @Get()
  @ApiOperation({ summary: 'Получить информацию о системных ресурсах' })
  @ApiResponse({ status: 200, description: 'Успешно', type: SystemMonitorDto })
  @ApiBearerAuth()
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async getSystemStats(): Promise<SystemMonitorDto> {
    return this.systemMonitorService.getSystemStats();
  }
}
