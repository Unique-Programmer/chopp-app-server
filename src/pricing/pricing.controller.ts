import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CreatePricingConfigDto } from './dto/create-pricing-config.dto';
import { PricingService } from './pricing.service';
import { PricingConfig } from './pricing-config.model';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';


// ==================== Тренировочный DTO ====================
class ShopSettingsDto {
  shopId: string;
}

// ==================== Тренировочный DTO ====================

@ApiTags('pricing')
@Controller('pricing')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PricingController {
  constructor(private pricingService: PricingService) {}

  @Post()
  @ApiOperation({ summary: 'Create or update pricing configuration' })
  @ApiResponse({
    status: 201,
    description:
      'The pricing configuration has been successfully created or updated.',
    type: PricingConfig,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Possible reasons: Invalid data in request body.',
  })
  createOrUpdateConfig(
    @Body() dto: CreatePricingConfigDto,
  ): Promise<PricingConfig> {
    return this.pricingService.createOrUpdateConfig(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get pricing configuration' })
  @ApiResponse({
    status: 200,
    description: 'The pricing configuration details.',
    type: PricingConfig,
  })
  @ApiResponse({
    status: 404,
    description: 'Pricing configuration not found.',
  })
  getConfig(): Promise<PricingConfig> {
    return this.pricingService.getConfig();
  }

  // ==================== Тренировочные эндпоинты ====================
  
  private static settings: { shopId: string } | null = null;

  @Post('settings')
  @ApiOperation({ summary: 'Save shop settings' })
  @ApiBody({
    description: 'Object containing shop ID',
    type: ShopSettingsDto,
    examples: {
      example1: {
        summary: 'Valid request',
        value: { shopId: '12345' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Shop settings have been successfully saved.',
    schema: {
      example: { shopId: '12345' },
    },
  })
  saveSettings(@Body() settings: { shopId: string }) {
    PricingController.settings = settings;
    return settings;
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get shop settings' })
  @ApiResponse({
    status: 200,
    description: 'Returns the saved shop settings.',
    schema: {
      example: { shopId: '12345' },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Shop settings not found.',
    schema: {
      example: { message: 'Shop settings not found.' },
    },
  })
  getSettings() {
    console.log('getSettingsgetSettingsgetSettingsgetSettings: ')
    if (!PricingController.settings) {
      return { message: 'Shop settings not found.' };
    }
    return PricingController.settings;
  }

  // ==================== Тренировочные эндпоинты ====================
}
