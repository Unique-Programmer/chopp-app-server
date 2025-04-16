import { Controller, Get, UseGuards, Res } from '@nestjs/common';
import { SystemMonitorService } from './system-monitor.service';
import { RolesGuard } from '../auth/roles-auth.guard';
import { Roles } from '../auth/roles-auth.decorator';
import { Response } from 'express';

@Controller('system-monitor')
export class SystemMonitorController {
  constructor(private readonly systemMonitorService: SystemMonitorService) {}

  @Get('log')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async getSystemMonitorLog(@Res() res: Response) {
    await this.systemMonitorService.getSystemMotinorLogFile(res);
  }
}
