import { CampaignType, CampaignStatus } from './create-campaign.dto';

export class CampaignDto {
  id: string;
  accountId: string;
  agentId: string;
  contactListId: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  type: CampaignType;
  scheduledStartDate?: Date;
  scheduledEndDate?: Date;
  maxRetries: number;
  retryDelayMinutes: number;
  timezone: string;
  scheduleConfig?: string;
  webhookUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;

  // Relaciones
  agent?: {
    id: string;
    name: string;
    voiceName: string;
  };
  contactList?: {
    id: string;
    name: string;
    contactCount: number;
  };
  calls?: {
    id: string;
    status: string;
    duration?: number;
    success?: boolean;
    createdAt: Date;
  }[];
}

export class CampaignStatsDto {
  totalCalls: number;
  completedCalls: number;
  successfulCalls: number;
  failedCalls: number;
  averageDuration: number;
  successRate: number;
  completionRate: number;
}

export class CampaignExecutionDto {
  campaignId: string;
  status: 'starting' | 'running' | 'paused' | 'completed' | 'error';
  currentCall: number;
  totalCalls: number;
  progress: number;
  estimatedCompletion?: Date;
  errors?: string[];
}
