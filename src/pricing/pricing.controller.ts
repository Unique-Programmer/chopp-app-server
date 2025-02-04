import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreatePricingConfigDto } from './dto/create-pricing-config.dto';
import { PricingService } from './pricing.service';
import { PricingConfig } from './pricing-config.model';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

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
}
