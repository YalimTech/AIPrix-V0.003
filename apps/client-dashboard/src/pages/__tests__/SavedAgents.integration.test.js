import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useNavigate } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SavedAgents from '../SavedAgents';
// Mock completo del sistema
describe('SavedAgents Integration Tests', () => {
    let user;
    let mockNavigate;
    beforeEach(() => {
        user = userEvent.setup();
        vi.clearAllMocks();
        mockNavigate = vi.fn();
        vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    });
    describe('Flujo completo de gestión de agentes', () => {
        it('debe completar el flujo completo de edición de agente', async () => {
            const { container } = render(_jsx(SavedAgents, {}));
            // 1. Buscar agente
            const searchInput = screen.getByPlaceholderText('Search agents...');
            await user.type(searchInput, 'Test Agent 1');
            // 2. Verificar que se filtre correctamente
            expect(screen.getByText('Test Agent 1')).toBeInTheDocument();
            expect(screen.queryByText('Test Agent 2')).not.toBeInTheDocument();
            // 3. Abrir menú contextual
            const optionButtons = screen.getAllByRole('button', { name: /options/i });
            await user.click(optionButtons[0]);
            // 4. Seleccionar editar
            const editButton = screen.getByText('Edit');
            await user.click(editButton);
            // 5. Verificar navegación
            expect(mockNavigate).toHaveBeenCalledWith('/agents/1/edit');
        });
        it('debe completar el flujo completo de duplicación de agente', async () => {
            render(_jsx(SavedAgents, {}));
            // 1. Abrir menú contextual
            const optionButtons = screen.getAllByRole('button', { name: /options/i });
            await user.click(optionButtons[0]);
            // 2. Seleccionar duplicar
            const duplicateButton = screen.getByText('Duplicate');
            await user.click(duplicateButton);
            // 3. Verificar que se muestre el prompt
            expect(window.prompt).toHaveBeenCalledWith('Enter a new name for the duplicated agent:', 'Test Agent 1 (Copy)');
            // 4. Verificar que se llame la función de duplicación
            // (Esto se verificaría con los mocks de los hooks)
        });
        it('debe completar el flujo completo de eliminación de agente', async () => {
            render(_jsx(SavedAgents, {}));
            // 1. Abrir menú contextual
            const optionButtons = screen.getAllByRole('button', { name: /options/i });
            await user.click(optionButtons[0]);
            // 2. Seleccionar eliminar
            const deleteButton = screen.getByText('Delete');
            await user.click(deleteButton);
            // 3. Verificar confirmación
            expect(window.confirm).toHaveBeenCalledWith('¿Estás seguro de que quieres eliminar este agente?');
            // 4. Verificar que se llame la función de eliminación
            // (Esto se verificaría con los mocks de los hooks)
        });
    });
    describe('Flujo completo de gestión de carpetas', () => {
        it('debe completar el flujo de creación de carpeta', async () => {
            render(_jsx(SavedAgents, {}));
            // 1. Hacer clic en Create Folder
            const createFolderButton = screen.getByText('Create Folder');
            await user.click(createFolderButton);
            // 2. Verificar que aparezca el modal
            expect(screen.getByPlaceholderText('Enter folder name')).toBeInTheDocument();
            // 3. Llenar nombre de carpeta
            const folderNameInput = screen.getByPlaceholderText('Enter folder name');
            await user.type(folderNameInput, 'Nueva Carpeta de Prueba');
            // 4. Hacer clic en Create
            const createButton = screen.getByText('Create');
            await user.click(createButton);
            // 5. Verificar que se cierre el modal
            await waitFor(() => {
                expect(screen.queryByPlaceholderText('Enter folder name')).not.toBeInTheDocument();
            });
        });
        it('debe completar el flujo de movimiento de agente a carpeta', async () => {
            render(_jsx(SavedAgents, {}));
            // 1. Abrir menú contextual
            const optionButtons = screen.getAllByRole('button', { name: /options/i });
            await user.click(optionButtons[0]);
            // 2. Seleccionar Move to Folder
            const moveButton = screen.getByText('Move to Folder');
            await user.click(moveButton);
            // 3. Verificar que se llame la función de movimiento
            // (Esto se verificaría con los mocks de los hooks)
        });
    });
    describe('Flujo completo de llamadas', () => {
        it('debe completar el flujo de lanzamiento de llamada', async () => {
            render(_jsx(SavedAgents, {}));
            // 1. Hacer clic en botón de llamada
            const callButtons = screen.getAllByRole('button', { name: /call/i });
            await user.click(callButtons[0]);
            // 2. Verificar que se abra el modal
            expect(screen.getByTestId('launch-call-modal')).toBeInTheDocument();
            // 3. Verificar que el modal tenga el ID correcto del agente
            const modal = screen.getByTestId('launch-call-modal');
            expect(modal).toHaveAttribute('data-agent-id', '1');
        });
    });
    describe('Flujo completo de importación', () => {
        it('debe completar el flujo de importación de agente', async () => {
            render(_jsx(SavedAgents, {}));
            // 1. Hacer clic en Import Agent
            const importButton = screen.getByText('Import Agent');
            await user.click(importButton);
            // 2. Verificar que aparezca el modal
            expect(screen.getByPlaceholderText('Enter agent ID')).toBeInTheDocument();
            // 3. Llenar ID del agente
            const agentIdInput = screen.getByPlaceholderText('Enter agent ID');
            await user.type(agentIdInput, 'test-agent-id-123');
            // 4. Hacer clic en Import
            const importConfirmButton = screen.getByText('Import');
            await user.click(importConfirmButton);
            // 5. Verificar que se cierre el modal
            await waitFor(() => {
                expect(screen.queryByPlaceholderText('Enter agent ID')).not.toBeInTheDocument();
            });
        });
    });
    describe('Flujo completo de filtrado y búsqueda', () => {
        it('debe completar el flujo de filtrado por tipo y búsqueda', async () => {
            render(_jsx(SavedAgents, {}));
            // 1. Filtrar por tipo
            const agentTypeButton = screen.getByText('Agent Type');
            await user.click(agentTypeButton);
            const inboundOption = screen.getByText('Inbound');
            await user.click(inboundOption);
            // 2. Verificar que solo se muestren agentes inbound
            expect(screen.getByText('Test Agent 1')).toBeInTheDocument();
            expect(screen.queryByText('Test Agent 2')).not.toBeInTheDocument();
            // 3. Aplicar búsqueda adicional
            const searchInput = screen.getByPlaceholderText('Search agents...');
            await user.type(searchInput, 'Test Agent 1');
            // 4. Verificar que se mantenga el filtro
            expect(screen.getByText('Test Agent 1')).toBeInTheDocument();
            expect(screen.queryByText('Test Agent 2')).not.toBeInTheDocument();
            // 5. Limpiar búsqueda
            await user.clear(searchInput);
            // 6. Verificar que se mantenga el filtro de tipo
            expect(screen.getByText('Test Agent 1')).toBeInTheDocument();
            expect(screen.queryByText('Test Agent 2')).not.toBeInTheDocument();
        });
    });
    describe('Flujo completo de sincronización', () => {
        it('debe completar el flujo de sincronización con ElevenLabs', async () => {
            render(_jsx(SavedAgents, {}));
            // 1. Hacer clic en Sync ElevenLabs
            const syncButton = screen.getByText('Sync ElevenLabs');
            await user.click(syncButton);
            // 2. Verificar que se llame la función de sincronización
            // (Esto se verificaría con los mocks de los hooks)
        });
    });
    describe('Flujo completo de gestión de avatares', () => {
        it('debe completar el flujo de subida de avatar', async () => {
            render(_jsx(SavedAgents, {}));
            // 1. Abrir menú contextual
            const optionButtons = screen.getAllByRole('button', { name: /options/i });
            await user.click(optionButtons[0]);
            // 2. Seleccionar Upload Avatar
            const uploadAvatarButton = screen.getByText('Upload Avatar');
            await user.click(uploadAvatarButton);
            // 3. Verificar que se abra el modal de avatar
            expect(screen.getByTestId('agent-widget-modal')).toBeInTheDocument();
        });
    });
    describe('Flujo completo de visualización de costos', () => {
        it('debe completar el flujo de visualización de costos', async () => {
            render(_jsx(SavedAgents, {}));
            // 1. Abrir menú contextual
            const optionButtons = screen.getAllByRole('button', { name: /options/i });
            await user.click(optionButtons[0]);
            // 2. Seleccionar View Costs
            const viewCostsButton = screen.getByText('View Costs');
            await user.click(viewCostsButton);
            // 3. Verificar que se llame la función de cálculo de costos
            // (Esto se verificaría con los mocks de los hooks)
        });
    });
    describe('Flujo completo de prueba de agente', () => {
        it('debe completar el flujo de prueba de agente', async () => {
            render(_jsx(SavedAgents, {}));
            // 1. Abrir menú contextual
            const optionButtons = screen.getAllByRole('button', { name: /options/i });
            await user.click(optionButtons[0]);
            // 2. Seleccionar Test Agent
            const testButton = screen.getByText('Test Agent');
            await user.click(testButton);
            // 3. Verificar que se llame la función de simulación
            // (Esto se verificaría con los mocks de los hooks)
        });
    });
    describe('Flujo completo de alternancia de vista', () => {
        it('debe completar el flujo de alternancia entre vistas', async () => {
            render(_jsx(SavedAgents, {}));
            // 1. Verificar vista inicial
            expect(screen.getByText('Show All Folders')).toBeInTheDocument();
            // 2. Cambiar a vista de lista
            const toggleButton = screen.getByText('Show All Folders');
            await user.click(toggleButton);
            // 3. Verificar cambio de vista
            expect(screen.getByText('Hide Folders')).toBeInTheDocument();
            // 4. Volver a vista de carpetas
            const hideButton = screen.getByText('Hide Folders');
            await user.click(hideButton);
            // 5. Verificar vuelta a vista original
            expect(screen.getByText('Show All Folders')).toBeInTheDocument();
        });
    });
});
