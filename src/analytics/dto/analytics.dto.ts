import { IsOptional, IsString, IsEnum, IsInt, Min, IsISO8601 } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PERIOD } from 'src/shared/enums/period';

export class GetOrderAnalyticsDTO {
  @IsOptional()
  @IsEnum(PERIOD, { message: 'period должен быть day, week или month' })
  period: PERIOD;

  @IsOptional()
  @IsInt({ message: 'days должен быть числом' })
  @Min(1, { message: 'days должен быть больше 0' })
  @Type(() => Number)
  days?: number;

  @IsOptional()
  @IsISO8601({}, { message: 'startDate должен быть в формате ISO8601 (YYYY-MM-DD)' })
  @Transform(({ value }) => new Date(value).toISOString())
  startDate?: string;

  @IsOptional()
  @IsISO8601({}, { message: 'endDate должен быть в формате ISO8601 (YYYY-MM-DD)' })
  @Transform(({ value }) => new Date(value).toISOString())
  endDate?: string;
}
