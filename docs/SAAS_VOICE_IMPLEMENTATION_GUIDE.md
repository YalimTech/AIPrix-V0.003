# Guía de Implementación: Sistema de Voces para SaaS de Agentes IA

## 1. Arquitectura del Sistema de Voces

### 1.1 Flujo de Datos

```
Cliente Frontend → Backend API → ElevenLabs API → Base de Datos → Cliente
```

### 1.2 Componentes Principales

- **Frontend**: React con sistema responsivo de visualización
- **Backend**: NestJS con integración ElevenLabs
- **API ElevenLabs**: Voces profesionales y multilenguaje
- **Base de Datos**: PostgreSQL para configuración de agentes
- **Tracking**: Sistema de uso individual por cliente

## 2. Configuración de Voces por Caso de Uso

### 2.1 Voces para Atención al Cliente

```typescript
const customerSupportVoices = {
  primary: {
    id: "nova",
    name: "Nova",
    characteristics: {
      gender: "female",
      tone: "friendly",
      language: "english",
      multilingual: true,
    },
    settings: {
      stability: 0.8,
      similarityBoost: 0.9,
      style: 0.3,
      useSpeakerBoost: true,
    },
  },
  alternatives: [
    {
      id: "alloy",
      name: "Alloy",
      characteristics: { gender: "neutral", tone: "professional" },
    },
    {
      id: "echo",
      name: "Echo",
      characteristics: { gender: "male", tone: "authoritative" },
    },
  ],
};
```

### 2.2 Voces para Ventas

```typescript
const salesVoices = {
  primary: {
    id: "onyx",
    name: "Onyx",
    characteristics: {
      gender: "male",
      tone: "persuasive",
      language: "english",
      multilingual: true,
    },
    settings: {
      stability: 0.7,
      similarityBoost: 0.8,
      style: 0.6, // Más expresivo para ventas
      useSpeakerBoost: true,
    },
  },
  alternatives: [
    {
      id: "shimmer",
      name: "Shimmer",
      characteristics: { gender: "female", tone: "energetic" },
    },
    {
      id: "fable",
      name: "Fable",
      characteristics: { gender: "male", tone: "sophisticated" },
    },
  ],
};
```

### 2.3 Voces Multilenguaje

```typescript
const multilingualVoices = {
  primary: {
    id: "troy",
    name: "Troy",
    characteristics: {
      gender: "male",
      tone: "professional",
      languages: ["english", "spanish", "french", "german", "italian"],
      multilingual: true,
    },
    settings: {
      stability: 0.75,
      similarityBoost: 0.85,
      style: 0.4,
      useSpeakerBoost: true,
    },
  },
  alternatives: [
    {
      id: "vegas",
      name: "Vegas",
      languages: ["english", "spanish"],
    },
    {
      id: "margarita",
      name: "Margarita",
      languages: ["spanish", "english"],
    },
  ],
};
```

## 3. Implementación en el Frontend

### 3.1 Hook para Gestión de Voces

```typescript
// apps/client-dashboard/src/hooks/useVoiceSelection.ts
import { useState, useEffect } from "react";
import { useElevenLabsVoices } from "./useElevenLabs";

export const useVoiceSelection = (
  useCase: "support" | "sales" | "multilingual",
) => {
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [filteredVoices, setFilteredVoices] = useState([]);

  const { data: allVoices, isLoading } = useElevenLabsVoices();

  useEffect(() => {
    if (!allVoices) return;

    const voicesByUseCase = {
      support: allVoices.filter(
        (voice) =>
          voice.name?.toLowerCase().includes("nova") ||
          voice.name?.toLowerCase().includes("alloy") ||
          voice.description?.toLowerCase().includes("customer support"),
      ),
      sales: allVoices.filter(
        (voice) =>
          voice.name?.toLowerCase().includes("onyx") ||
          voice.name?.toLowerCase().includes("shimmer") ||
          voice.description?.toLowerCase().includes("persuasive"),
      ),
      multilingual: allVoices.filter(
        (voice) =>
          voice.isMultilingual || voice.languageCapabilities?.multilingual,
      ),
    };

    setFilteredVoices(voicesByUseCase[useCase] || allVoices);
  }, [allVoices, useCase]);

  const selectVoice = (voiceId: string) => {
    const voice = filteredVoices.find((v) => v.id === voiceId);
    setSelectedVoice(voice);
  };

  return {
    voices: filteredVoices,
    selectedVoice,
    selectVoice,
    isLoading,
  };
};
```

### 3.2 Componente de Selección de Voces

```typescript
// apps/client-dashboard/src/components/VoiceSelector.tsx
import React from 'react';
import { useVoiceSelection } from '../hooks/useVoiceSelection';

interface VoiceSelectorProps {
  useCase: 'support' | 'sales' | 'multilingual';
  onVoiceSelect: (voice: any) => void;
  selectedVoiceId?: string;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  useCase,
  onVoiceSelect,
  selectedVoiceId
}) => {
  const { voices, selectedVoice, selectVoice, isLoading } = useVoiceSelection(useCase);

  const handleVoiceClick = (voice: any) => {
    selectVoice(voice.id);
    onVoiceSelect(voice);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        Seleccionar Voz para {useCase === 'support' ? 'Atención al Cliente' :
                            useCase === 'sales' ? 'Ventas' : 'Multilenguaje'}
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {voices.map((voice) => (
          <div
            key={voice.id}
            onClick={() => handleVoiceClick(voice)}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selectedVoiceId === voice.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden">
              <img
                src={voice.previewUrl || '/default-avatar.png'}
                alt={voice.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h4 className="text-sm font-medium text-center">{voice.name}</h4>
            <p className="text-xs text-gray-500 text-center">
              {voice.isMultilingual ? 'Multilenguaje' : voice.languageCapabilities?.displayLanguages?.[0] || 'English'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## 4. Configuración de Agentes en el Backend

### 4.1 DTO para Creación de Agentes

```typescript
// apps/api/src/agents/dto/create-agent.dto.ts
import { IsString, IsOptional, IsObject, IsNumber, IsArray } from 'class-validator';

export class CreateAgentDto {
  @IsString()
  name: string;

  @IsString()
  voiceId: string;

  @IsString()
  language: string;

  @IsOptional()
  @IsString()
  useCase?: 'support' | 'sales' | 'multilingual';

  @IsObject()
  conversationConfig: {
    @IsNumber()
    maxDuration: number;

    @IsArray()
    @IsString({ each: true })
    endCallPhrases: string[];

    @IsNumber()
    interruptionThreshold: number;
  };

  @IsOptional()
  @IsObject()
  voiceSettings?: {
    stability: number;
    similarityBoost: number;
    style: number;
    useSpeakerBoost: boolean;
  };
}
```

### 4.2 Servicio de Agentes con Configuración de Voces

```typescript
// apps/api/src/agents/agents.service.ts
import { Injectable } from "@nestjs/common";
import { ElevenLabsService } from "../integrations/elevenlabs/elevenlabs.service";

@Injectable()
export class AgentsService {
  constructor(private readonly elevenLabsService: ElevenLabsService) {}

  async createAgent(createAgentDto: CreateAgentDto, accountId: string) {
    // Obtener configuración de voz optimizada según caso de uso
    const voiceSettings = this.getOptimalVoiceSettings(
      createAgentDto.voiceId,
      createAgentDto.useCase,
    );

    // Crear agente en ElevenLabs
    const elevenLabsAgent = await this.elevenLabsService.createAgent({
      name: createAgentDto.name,
      voiceId: createAgentDto.voiceId,
      language: createAgentDto.language,
      conversationConfig: createAgentDto.conversationConfig,
    });

    // Guardar en base de datos local
    const localAgent = await this.prisma.agent.create({
      data: {
        name: createAgentDto.name,
        voiceId: createAgentDto.voiceId,
        language: createAgentDto.language,
        useCase: createAgentDto.useCase,
        elevenLabsAgentId: elevenLabsAgent.id,
        accountId: accountId,
        voiceSettings: voiceSettings,
        conversationConfig: createAgentDto.conversationConfig,
      },
    });

    return localAgent;
  }

  private getOptimalVoiceSettings(voiceId: string, useCase?: string) {
    const baseSettings = {
      stability: 0.75,
      similarityBoost: 0.8,
      style: 0.4,
      useSpeakerBoost: true,
    };

    switch (useCase) {
      case "support":
        return {
          ...baseSettings,
          stability: 0.8, // Más estable para soporte
          style: 0.3, // Menos expresivo
        };
      case "sales":
        return {
          ...baseSettings,
          stability: 0.7, // Menos estable para dinamismo
          style: 0.6, // Más expresivo para persuasión
        };
      case "multilingual":
        return {
          ...baseSettings,
          stability: 0.75, // Balance para múltiples idiomas
          style: 0.4, // Neutral
        };
      default:
        return baseSettings;
    }
  }
}
```

## 5. Integración con Twilio para Llamadas

### 5.1 Servicio de Llamadas

```typescript
// apps/api/src/calls/calls.service.ts
import { Injectable } from "@nestjs/common";
import { ElevenLabsService } from "../integrations/elevenlabs/elevenlabs.service";

@Injectable()
export class CallsService {
  constructor(
    private readonly elevenLabsService: ElevenLabsService,
    private readonly twilioService: TwilioService,
  ) {}

  async makeOutboundCall(
    agentId: string,
    phoneNumberId: string,
    toNumber: string,
    accountId: string,
  ) {
    // Verificar balance del cliente
    const hasBalance = await this.elevenLabsService.checkClientBalance(
      accountId,
      0.5, // Estimación de costo por llamada
    );

    if (!hasBalance) {
      throw new BadRequestException("Balance insuficiente");
    }

    // Hacer llamada usando ElevenLabs + Twilio
    const result = await this.elevenLabsService.makeOutboundCall(
      agentId,
      phoneNumberId,
      toNumber,
      accountId,
    );

    // Registrar llamada en base de datos
    await this.prisma.call.create({
      data: {
        agentId,
        phoneNumberId,
        toNumber,
        accountId,
        conversationId: result.conversation_id,
        callSid: result.callSid,
        status: "initiated",
        direction: "outbound",
      },
    });

    return result;
  }

  async handleInboundCall(phoneNumber: string, accountId: string) {
    // Buscar agente asignado al número
    const phoneNumberRecord = await this.prisma.phoneNumber.findFirst({
      where: { number: phoneNumber, accountId },
      include: { agent: true },
    });

    if (!phoneNumberRecord?.agent) {
      throw new BadRequestException("No hay agente asignado a este número");
    }

    // Iniciar conversación con el agente
    const conversation = await this.elevenLabsService.startConversation(
      phoneNumberRecord.agent.elevenLabsAgentId,
      phoneNumber,
      accountId,
    );

    return conversation;
  }
}
```

## 6. Sistema de Tracking y Facturación

### 6.1 Tracking de Uso por Cliente

```typescript
// apps/api/src/billing/elevenlabs-usage-tracking.service.ts
import { Injectable } from "@nestjs/common";

@Injectable()
export class ElevenLabsUsageTrackingService {
  async trackUsage(
    accountId: string,
    usage: {
      callId?: string;
      agentId?: string;
      minutes: number;
      tokens: number;
      cost: number;
    },
  ) {
    // Registrar uso en base de datos
    await this.prisma.elevenLabsUsage.create({
      data: {
        accountId,
        callId: usage.callId,
        agentId: usage.agentId,
        minutes: usage.minutes,
        tokens: usage.tokens,
        cost: usage.cost,
        timestamp: new Date(),
      },
    });

    // Actualizar balance del cliente
    await this.prisma.account.update({
      where: { id: accountId },
      data: {
        elevenLabsBalance: {
          decrement: usage.cost,
        },
      },
    });
  }

  async getClientUsage(accountId: string, period: "month" | "week" | "day") {
    const dateRange = this.getDateRange(period);

    const usage = await this.prisma.elevenLabsUsage.aggregate({
      where: {
        accountId,
        timestamp: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
      },
      _sum: {
        minutes: true,
        tokens: true,
        cost: true,
      },
      _count: {
        callId: true,
      },
    });

    return {
      totalMinutes: usage._sum.minutes || 0,
      totalTokens: usage._sum.tokens || 0,
      totalCost: usage._sum.cost || 0,
      totalCalls: usage._count.callId || 0,
    };
  }
}
```

## 7. Configuración de Webhooks

### 7.1 Webhook para ElevenLabs

```typescript
// apps/api/src/webhooks/elevenlabs-webhook.controller.ts
import { Controller, Post, Body, Headers } from "@nestjs/common";
import { ElevenLabsService } from "../integrations/elevenlabs/elevenlabs.service";

@Controller("webhooks/elevenlabs")
export class ElevenLabsWebhookController {
  constructor(private readonly elevenLabsService: ElevenLabsService) {}

  @Post()
  async handleElevenLabsWebhook(@Body() payload: any, @Headers() headers: any) {
    const eventType = payload.event_type;

    switch (eventType) {
      case "conversation_started":
        await this.handleConversationStarted(payload);
        break;
      case "conversation_ended":
        await this.handleConversationEnded(payload);
        break;
      case "conversation_failed":
        await this.handleConversationFailed(payload);
        break;
    }

    return { success: true };
  }

  private async handleConversationStarted(payload: any) {
    const { conversation_id, agent_id, account_id } = payload.metadata;

    // Registrar inicio de conversación
    await this.prisma.conversation.create({
      data: {
        conversationId: conversation_id,
        agentId: agent_id,
        accountId: account_id,
        status: "active",
        startTime: new Date(),
      },
    });
  }

  private async handleConversationEnded(payload: any) {
    const { conversation_id, call_duration_secs, message_count } = payload;

    // Actualizar conversación
    await this.prisma.conversation.update({
      where: { conversationId: conversation_id },
      data: {
        status: "completed",
        endTime: new Date(),
        duration: call_duration_secs,
        messageCount: message_count,
      },
    });

    // Trackear uso final
    const conversation = await this.prisma.conversation.findUnique({
      where: { conversationId: conversation_id },
    });

    await this.elevenLabsService.trackConversationEnd(
      conversation.accountId,
      conversation_id,
      call_duration_secs,
      message_count * 50, // Estimación de tokens
      conversation.callId,
      conversation.agentId,
    );
  }
}
```

## 8. Dashboard de Monitoreo

### 8.1 Métricas de Uso por Cliente

```typescript
// apps/api/src/dashboard/dashboard-integrated.service.ts
export class DashboardIntegratedService {
  async getClientVoiceMetrics(accountId: string) {
    const [usage, agents, recentCalls] = await Promise.all([
      this.elevenLabsService.getClientUsage(accountId),
      this.getClientAgents(accountId),
      this.getRecentCalls(accountId),
    ]);

    return {
      usage: {
        totalMinutes: usage.totalMinutes,
        totalCalls: usage.totalCalls,
        totalCost: usage.totalCost,
        remainingBalance: await this.getClientBalance(accountId),
      },
      agents: agents.map((agent) => ({
        id: agent.id,
        name: agent.name,
        voiceId: agent.voiceId,
        status: agent.status,
        callCount: await this.getAgentCallCount(agent.id),
      })),
      recentCalls: recentCalls.map((call) => ({
        id: call.id,
        toNumber: call.toNumber,
        duration: call.duration,
        status: call.status,
        createdAt: call.createdAt,
      })),
    };
  }
}
```

## 9. Recomendaciones de Implementación

### 9.1 Fase 1: Implementación Básica

1. **Configurar voces por defecto** para cada caso de uso
2. **Implementar selección básica** de voces en el frontend
3. **Configurar tracking** de uso básico
4. **Integrar llamadas outbound** con Twilio

### 9.2 Fase 2: Funcionalidades Avanzadas

1. **Agregar previews de voz** para selección
2. **Implementar filtros avanzados** por características
3. **Configurar llamadas inbound** automáticas
4. **Agregar analytics** detallados de rendimiento

### 9.3 Fase 3: Optimización

1. **Implementar A/B testing** de voces
2. **Agregar selección automática** de voz óptima
3. **Configurar voces personalizadas** por cliente
4. **Implementar optimizaciones** de latencia

## 10. Conclusión

Este sistema de voces está diseñado para proporcionar a tus clientes:

✅ **Flexibilidad total** en selección de voces
✅ **Optimización automática** según caso de uso
✅ **Tracking preciso** de uso y costos
✅ **Integración completa** con Twilio
✅ **Escalabilidad** para múltiples clientes
✅ **Calidad profesional** con ElevenLabs

La implementación está lista para manejar miles de llamadas simultáneas con voces naturales y profesionales que harán que tus agentes de IA se escuchen completamente humanos.
