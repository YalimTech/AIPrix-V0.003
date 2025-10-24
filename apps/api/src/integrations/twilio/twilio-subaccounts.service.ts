import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import twilio from 'twilio';
import { PrismaService } from '../../prisma/prisma.service';

export interface TwilioSubaccount {
  sid: string;
  friendlyName: string;
  status: 'active' | 'suspended' | 'closed';
  dateCreated: Date;
  dateUpdated: Date;
}

@Injectable()
export class TwilioSubaccountsService {
  private readonly logger = new Logger(TwilioSubaccountsService.name);
  private masterTwilioClient: twilio.Twilio;

  constructor(private readonly prisma: PrismaService) {
    // Cliente maestro para gestionar subcuentas
    const masterAccountSid = process.env.TWILIO_MASTER_ACCOUNT_SID;
    const masterAuthToken = process.env.TWILIO_MASTER_AUTH_TOKEN;

    if (masterAccountSid && masterAuthToken) {
      this.masterTwilioClient = twilio(masterAccountSid, masterAuthToken);
    } else {
      this.logger.warn(
        'Master Twilio credentials not configured. Subaccount functionality will be limited.',
      );
    }
  }

  /**
   * Crear una subcuenta de Twilio para un cliente
   * Según documentación oficial: POST /2010-04-01/Accounts.json
   */
  async createSubaccount(
    accountId: string,
    friendlyName: string,
  ): Promise<TwilioSubaccount> {
    if (!this.masterTwilioClient) {
      throw new InternalServerErrorException(
        'Master Twilio client not configured',
      );
    }

    try {
      this.logger.log(`Creating Twilio subaccount for account ${accountId}`);

      const subaccount = await this.masterTwilioClient.api.accounts.create({
        friendlyName: `${friendlyName} - ${accountId}`,
      });

      // Guardar la subcuenta en la base de datos
      await this.prisma.accountTwilioConfig.upsert({
        where: { accountId },
        update: {
          accountSid: subaccount.sid,
          authToken: subaccount.authToken, // Twilio genera un nuevo auth token para la subcuenta
          webhookUrl: `${process.env.APP_URL || `${process.env.API_PROTOCOL || 'http'}://${process.env.API_HOST || 'localhost'}:${process.env.API_PORT || '3004'}`}/api/v1/webhooks/voice`,
        },
        create: {
          accountId,
          accountSid: subaccount.sid,
          authToken: subaccount.authToken,
          webhookUrl: `${process.env.APP_URL || `${process.env.API_PROTOCOL || 'http'}://${process.env.API_HOST || 'localhost'}:${process.env.API_PORT || '3004'}`}/api/v1/webhooks/voice`,
        },
      });

      this.logger.log(
        `Successfully created subaccount ${subaccount.sid} for account ${accountId}`,
      );

      return {
        sid: subaccount.sid,
        friendlyName: subaccount.friendlyName,
        status: subaccount.status as 'active' | 'suspended' | 'closed',
        dateCreated: subaccount.dateCreated,
        dateUpdated: subaccount.dateUpdated,
      };
    } catch (error) {
      this.logger.error(
        `Error creating subaccount for account ${accountId}:`,
        error,
      );
      throw new InternalServerErrorException(
        'Failed to create Twilio subaccount',
      );
    }
  }

  /**
   * Suspender una subcuenta
   * Según documentación oficial: POST /2010-04-01/Accounts/{Sid}.json
   */
  async suspendSubaccount(accountId: string): Promise<void> {
    if (!this.masterTwilioClient) {
      throw new InternalServerErrorException(
        'Master Twilio client not configured',
      );
    }

    const config = await this.prisma.accountTwilioConfig.findUnique({
      where: { accountId },
    });

    if (!config) {
      throw new InternalServerErrorException(
        'Twilio configuration not found for account',
      );
    }

    try {
      await this.masterTwilioClient.api.accounts(config.accountSid).update({
        status: 'suspended',
      });

      this.logger.log(
        `Successfully suspended subaccount ${config.accountSid} for account ${accountId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error suspending subaccount for account ${accountId}:`,
        error,
      );
      throw new InternalServerErrorException(
        'Failed to suspend Twilio subaccount',
      );
    }
  }

  /**
   * Reactivar una subcuenta
   */
  async activateSubaccount(accountId: string): Promise<void> {
    if (!this.masterTwilioClient) {
      throw new InternalServerErrorException(
        'Master Twilio client not configured',
      );
    }

    const config = await this.prisma.accountTwilioConfig.findUnique({
      where: { accountId },
    });

    if (!config) {
      throw new InternalServerErrorException(
        'Twilio configuration not found for account',
      );
    }

    try {
      await this.masterTwilioClient.api.accounts(config.accountSid).update({
        status: 'active',
      });

      this.logger.log(
        `Successfully activated subaccount ${config.accountSid} for account ${accountId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error activating subaccount for account ${accountId}:`,
        error,
      );
      throw new InternalServerErrorException(
        'Failed to activate Twilio subaccount',
      );
    }
  }

  /**
   * Obtener información de una subcuenta
   */
  async getSubaccountInfo(accountId: string): Promise<TwilioSubaccount | null> {
    if (!this.masterTwilioClient) {
      return null;
    }

    const config = await this.prisma.accountTwilioConfig.findUnique({
      where: { accountId },
    });

    if (!config) {
      return null;
    }

    try {
      const subaccount = await this.masterTwilioClient.api
        .accounts(config.accountSid)
        .fetch();

      return {
        sid: subaccount.sid,
        friendlyName: subaccount.friendlyName,
        status: subaccount.status as 'active' | 'suspended' | 'closed',
        dateCreated: subaccount.dateCreated,
        dateUpdated: subaccount.dateUpdated,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching subaccount info for account ${accountId}:`,
        error,
      );
      return null;
    }
  }
}
