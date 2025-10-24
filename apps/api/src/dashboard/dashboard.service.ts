import { Injectable } from '@nestjs/common';
import { ElevenLabsService } from '../integrations/elevenlabs/elevenlabs.service';
import { GHLService } from '../integrations/ghl/ghl.service';
import { TwilioService } from '../integrations/twilio/twilio.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly elevenLabsService: ElevenLabsService,
    private readonly twilioService: TwilioService,
    private readonly ghlService: GHLService,
  ) {}

  async getStats(accountId: string) {
    // Get agents count
    const agentsCount = await this.prisma.agent.count({
      where: { accountId },
    });

    // Get active agents count
    const activeAgentsCount = await this.prisma.agent.count({
      where: { accountId, status: 'active' },
    });

    // Get campaigns count
    const campaignsCount = await this.prisma.campaign.count({
      where: { accountId },
    });

    // Get active campaigns count
    const activeCampaignsCount = await this.prisma.campaign.count({
      where: { accountId, status: 'running' },
    });

    // Get contacts count
    const contactsCount = await this.prisma.contact.count({
      where: { accountId },
    });

    // Get calls count
    const callsCount = await this.prisma.call.count({
      where: { accountId },
    });

    // Get answered calls count
    const answeredCallsCount = await this.prisma.call.count({
      where: {
        accountId,
        status: 'completed',
        success: true,
      },
    });

    // Get phone numbers count
    const phoneNumbersCount = await this.prisma.phoneNumber.count({
      where: { accountId },
    });

    // Calculate real projected minutes from actual call data
    const calls = await this.prisma.call.findMany({
      where: { accountId },
      select: { duration: true, direction: true },
    });

    const projectedOutboundMinutes =
      calls
        .filter((call) => call.direction === 'outbound')
        .reduce((total, call) => total + (call.duration || 0), 0) / 60; // Convert to minutes

    const projectedInboundMinutes =
      calls
        .filter((call) => call.direction === 'inbound')
        .reduce((total, call) => total + (call.duration || 0), 0) / 60; // Convert to minutes

    // Calculate real total cost from actual call data
    const totalCost = 0; // No hay campo cost en el esquema actual

    return {
      projectedOutboundMinutes,
      projectedInboundMinutes,
      activePhoneNumbers: phoneNumbersCount,
      nextPayment: totalCost,
      totalCalls: callsCount,
      answeredCalls: answeredCallsCount,
      missedCalls: callsCount - answeredCallsCount,
      totalCost,
      agentsCount,
      activeAgentsCount,
      campaignsCount,
      activeCampaignsCount,
      contactsCount,
    };
  }

  async getRecentActivity(accountId: string) {
    // Get recent calls
    const recentCalls = await this.prisma.call.findMany({
      where: { accountId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        contact: true,
        agent: true,
      },
    });

    // Get recent agents
    const recentAgents = await this.prisma.agent.findMany({
      where: { accountId },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });

    // Get recent campaigns
    const recentCampaigns = await this.prisma.campaign.findMany({
      where: { accountId },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });

    const activities = [];

    // Add call activities
    recentCalls.forEach((call) => {
      activities.push({
        id: `call-${call.id}`,
        type: 'call',
        description: `Call to ${call.contact?.name || 'Unknown'} ${call.success ? 'completed' : 'missed'}`,
        timestamp:
          call.startedAt?.toISOString() || call.createdAt.toISOString(),
        status: call.success ? 'success' : 'error',
      });
    });

    // Add agent activities
    recentAgents.forEach((agent) => {
      activities.push({
        id: `agent-${agent.id}`,
        type: 'agent',
        description: `Agent "${agent.name}" ${agent.status === 'active' ? 'activated' : 'created'}`,
        timestamp: agent.createdAt.toISOString(),
        status: 'success',
      });
    });

    // Add campaign activities
    recentCampaigns.forEach((campaign) => {
      activities.push({
        id: `campaign-${campaign.id}`,
        type: 'campaign',
        description: `Campaign "${campaign.name}" ${campaign.status === 'running' ? 'started' : 'created'}`,
        timestamp: campaign.createdAt.toISOString(),
        status: 'success',
      });
    });

    // Sort by timestamp and return latest 10
    return activities
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, 10);
  }

  async getCallsByElevenLabsIds(accountId: string, elevenLabsIds: string[]) {
    return await this.prisma.call.findMany({
      where: {
        accountId,
        elevenLabsConversationId: {
          in: elevenLabsIds,
        },
      },
      select: {
        id: true,
        phoneNumber: true,
        notes: true,
        elevenLabsConversationId: true,
      },
    });
  }
}
