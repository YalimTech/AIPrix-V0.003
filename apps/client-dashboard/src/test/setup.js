import '@testing-library/jest-dom';
import React from 'react';
import { vi } from 'vitest';
// Mock de React Router
vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/saved-agents' }),
    Link: ({ children, to }) => React.createElement('a', { href: to }, children),
}));
// Mock de los hooks de agentes
vi.mock('../hooks/useAgents', () => ({
    useAgents: () => ({
        data: [
            {
                id: '1',
                name: 'Test Agent 1',
                type: 'inbound',
                folderId: null,
                description: 'Test agent description',
                status: 'active'
            },
            {
                id: '2',
                name: 'Test Agent 2',
                type: 'outbound',
                folderId: 'folder-1',
                description: 'Test agent 2 description',
                status: 'active'
            }
        ],
        isLoading: false,
        error: null
    }),
    useDeleteAgent: () => ({
        mutateAsync: vi.fn().mockResolvedValue({}),
        isLoading: false
    }),
    useDuplicateAgent: () => ({
        mutateAsync: vi.fn().mockResolvedValue({}),
        isLoading: false
    }),
    useSyncElevenLabsAgents: () => ({
        mutateAsync: vi.fn().mockResolvedValue({}),
        isLoading: false
    }),
    useImportElevenLabsAgent: () => ({
        mutateAsync: vi.fn().mockResolvedValue({}),
        isLoading: false
    }),
    useAgentDiagnostics: () => ({
        data: null,
        refetch: vi.fn()
    })
}));
// Mock de los hooks de carpetas
vi.mock('../hooks/useFolders', () => ({
    useFolders: () => ({
        data: [
            {
                id: 'folder-1',
                name: 'Test Folder',
                agents: []
            }
        ],
        isLoading: false
    }),
    useCreateFolder: () => ({
        mutateAsync: vi.fn().mockResolvedValue({}),
        isLoading: false
    }),
    useDeleteFolder: () => ({
        mutateAsync: vi.fn().mockResolvedValue({}),
        isLoading: false
    }),
    useMoveAgentsToFolder: () => ({
        mutateAsync: vi.fn().mockResolvedValue({}),
        isLoading: false
    })
}));
// Mock de los hooks de ElevenLabs
vi.mock('../hooks/useElevenLabs', () => ({
    useElevenLabsOutboundCall: () => ({
        mutateAsync: vi.fn().mockResolvedValue({}),
        isLoading: false
    }),
    useGetAgentLink: () => ({
        mutateAsync: vi.fn().mockResolvedValue({ agent_id: 'test-id', token: 'test-token' }),
        isLoading: false
    }),
    useSimulateConversation: () => ({
        mutateAsync: vi.fn().mockResolvedValue({}),
        isLoading: false
    }),
    useCalculateLLMUsage: () => ({
        mutateAsync: vi.fn().mockResolvedValue({}),
        isLoading: false
    })
}));
// Mock del store
vi.mock('../store/appStore', () => ({
    useAppStore: () => ({
        addNotification: vi.fn()
    })
}));
// Mock de los componentes modales
vi.mock('../components/modals/AgentWidgetModal', () => ({
    default: ({ isOpen, onClose, children }) => isOpen ? React.createElement('div', { 'data-testid': 'agent-widget-modal' }, children) : null
}));
vi.mock('../components/modals/LaunchCallModal', () => ({
    default: ({ isOpen, onClose, onLaunch, agentId }) => isOpen ? React.createElement('div', { 'data-testid': 'launch-call-modal', 'data-agent-id': agentId }) : null
}));
// Mock de navigator.clipboard
Object.assign(navigator, {
    clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined)
    }
});
// Mock de window.confirm
Object.assign(window, {
    confirm: vi.fn().mockReturnValue(true),
    prompt: vi.fn().mockReturnValue('Test Agent Copy')
});
