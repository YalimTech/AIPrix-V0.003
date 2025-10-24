import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WebSocketService {
  private readonly logger = new Logger(WebSocketService.name);

  constructor() {}

  // Métodos de logging para notificaciones (sin dependencias circulares)
  logCampaignUpdate(accountId: string, campaignData: any) {
    this.logger.log(`Campaign update for account: ${accountId}`, campaignData);
  }

  logCampaignStatusChange(
    accountId: string,
    campaignId: string,
    status: string,
  ) {
    this.logger.log(
      `Campaign status change: ${campaignId} -> ${status} for account: ${accountId}`,
    );
  }

  logCallUpdate(accountId: string, callData: any) {
    this.logger.log(`Call update for account: ${accountId}`, callData);
  }

  logCallStatusChange(accountId: string, callId: string, status: string) {
    this.logger.log(
      `Call status change: ${callId} -> ${status} for account: ${accountId}`,
    );
  }

  logAgentUpdate(accountId: string, agentData: any) {
    this.logger.log(`Agent update for account: ${accountId}`, agentData);
  }

  logAgentStatusChange(accountId: string, agentId: string, status: string) {
    this.logger.log(
      `Agent status change: ${agentId} -> ${status} for account: ${accountId}`,
    );
  }

  logSystemMessage(
    accountId: string,
    message: string,
    type: 'info' | 'warning' | 'error' = 'info',
  ) {
    this.logger.log(
      `System message for account: ${accountId} [${type}]: ${message}`,
    );
  }

  logGlobalSystemMessage(
    message: string,
    type: 'info' | 'warning' | 'error' = 'info',
  ) {
    this.logger.log(`Global system message [${type}]: ${message}`);
  }

  logContactUpdate(accountId: string, contactData: any) {
    this.logger.log(`Contact update for account: ${accountId}`, contactData);
  }

  logPhoneNumberUpdate(accountId: string, phoneNumberData: any) {
    this.logger.log(
      `Phone number update for account: ${accountId}`,
      phoneNumberData,
    );
  }

  logCallAnalysis(accountId: string, callId: string, analysisData: any) {
    this.logger.log(
      `Call analysis for account: ${accountId}, call: ${callId}`,
      analysisData,
    );
  }
}
