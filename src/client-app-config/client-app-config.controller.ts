import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateClientAppConfigDto } from './dto/create-client-app-config.dto';
import { ClientAppConfigService } from './client-app-config.service';
import { ClientAppConfig } from './client-app-config.model';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('client-app-config')
@Controller('client-app-config')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ClientAppConfigController {
  constructor(private clientAppConfigService: ClientAppConfigService) {}

  @Post()
  @ApiOperation({ summary: 'Create or update client app configuration' })
  @ApiResponse({
    status: 201,
    description:
      'The client app configuration has been successfully created or updated.',
    type: ClientAppConfig,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Possible reasons: Invalid data in request body.',
  })
  createOrUpdateConfig(
    @Body() dto: CreateClientAppConfigDto,
  ): Promise<ClientAppConfig> {
    return this.clientAppConfigService.createOrUpdateConfig(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get client app configuration' })
  @ApiResponse({
    status: 200,
    description: 'The client app configuration details.',
    type: ClientAppConfig,
  })
  @ApiResponse({
    status: 404,
    description: 'Client app configuration not found.',
  })
  getConfig(): Promise<ClientAppConfig> {
    return this.clientAppConfigService.getConfig();
  }
}
