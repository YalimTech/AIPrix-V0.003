import { PartialType } from '@nestjs/mapped-types';
import { CreateCampaignDto } from './create-campaign.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { CampaignStatus } from './create-campaign.dto';

export class UpdateCampaignDto extends PartialType(CreateCampaignDto) {
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;
}
