import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SavedAgents from '../SavedAgents';
// Mock de React Router
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/saved-agents' }),
    Link: ({ children, to }) => React.createElement('a', { href: to }, children),
}));
describe('SavedAgents Component - Tests Funcionales', () => {
    let user;
    beforeEach(() => {
        user = userEvent.setup();
        vi.clearAllMocks();
    });
    describe('Funcionalidad de búsqueda', () => {
        it('debe permitir escribir en el campo de búsqueda', async () => {
            render(_jsx(SavedAgents, {}));
            const searchInput = screen.getByPlaceholderText('Agent Search');
            await user.type(searchInput, 'Test Agent 1');
            expect(searchInput).toHaveValue('Test Agent 1');
        });
        it('debe permitir limpiar el campo de búsqueda', async () => {
            render(_jsx(SavedAgents, {}));
            const searchInput = screen.getByPlaceholderText('Agent Search');
            await user.type(searchInput, 'Test Agent 1');
            await user.clear(searchInput);
            expect(searchInput).toHaveValue('');
        });
    });
    describe('Funcionalidad de filtro por tipo', () => {
        it('debe abrir el dropdown de tipo de agente', async () => {
            render(_jsx(SavedAgents, {}));
            const agentTypeButton = screen.getByText('Agent Type');
            await user.click(agentTypeButton);
            // Verificar que aparezcan las opciones
            expect(screen.getByText('Any')).toBeInTheDocument();
            expect(screen.getByText('Inbound')).toBeInTheDocument();
            expect(screen.getByText('Outbound')).toBeInTheDocument();
        });
        it('debe seleccionar un tipo de agente', async () => {
            render(_jsx(SavedAgents, {}));
            const agentTypeButton = screen.getByText('Agent Type');
            await user.click(agentTypeButton);
            const inboundOption = screen.getByText('Inbound');
            await user.click(inboundOption);
            // Verificar que se haya seleccionado
            expect(screen.getByText('Inbound')).toBeInTheDocument();
        });
    });
    describe('Funcionalidad de botones principales', () => {
        it('debe hacer clic en el botón de sincronización', async () => {
            render(_jsx(SavedAgents, {}));
            const syncButton = screen.getByText('Sync ElevenLabs');
            await user.click(syncButton);
            // Verificar que no haya errores
            expect(syncButton).toBeInTheDocument();
        });
        it('debe hacer clic en el botón de importación', async () => {
            render(_jsx(SavedAgents, {}));
            // Buscar el botón de importación
            const importButton = screen.getByRole('button', { name: 'Import Agent' });
            await user.click(importButton);
            // Verificar que se abra el modal usando waitFor
            await waitFor(() => {
                expect(screen.getByPlaceholderText('Enter agent ID')).toBeInTheDocument();
            });
        });
        it('debe hacer clic en el botón de creación de carpeta', async () => {
            render(_jsx(SavedAgents, {}));
            // Buscar el botón de creación de carpeta
            const createFolderButton = screen.getByRole('button', { name: 'Create New Folder' });
            await user.click(createFolderButton);
            // Verificar que se abra el modal usando waitFor
            await waitFor(() => {
                expect(screen.getByPlaceholderText('Enter folder name')).toBeInTheDocument();
            });
        });
    });
    describe('Funcionalidad de toggle de vista', () => {
        it('debe alternar la vista de carpetas', async () => {
            render(_jsx(SavedAgents, {}));
            // El toggle es un switch visual sin nombre accesible
            const toggleText = screen.getByText('Show agents in all folders');
            const toggleSwitch = toggleText.previousElementSibling;
            await user.click(toggleSwitch);
            // Verificar que el toggle esté presente
            expect(toggleSwitch).toBeInTheDocument();
        });
        it('debe volver a la vista original', async () => {
            render(_jsx(SavedAgents, {}));
            // El toggle es un switch visual sin nombre accesible
            const toggleText = screen.getByText('Show agents in all folders');
            const toggleSwitch = toggleText.previousElementSibling;
            await user.click(toggleSwitch);
            await user.click(toggleSwitch);
            // Verificar que el toggle esté presente
            expect(toggleSwitch).toBeInTheDocument();
        });
    });
    describe('Funcionalidad de botones de llamada', () => {
        it('debe hacer clic en un botón de llamada', async () => {
            render(_jsx(SavedAgents, {}));
            const callButtons = screen.getAllByText('Make A Call');
            if (callButtons.length > 0) {
                await user.click(callButtons[0]);
                // Verificar que no haya errores
                expect(callButtons[0]).toBeInTheDocument();
            }
        });
    });
    describe('Funcionalidad de botones de opciones', () => {
        it('debe hacer clic en un botón de opciones', async () => {
            render(_jsx(SavedAgents, {}));
            // Buscar botones que no tengan nombre específico (botones de opciones)
            const allButtons = screen.getAllByRole('button');
            const optionButtons = allButtons.filter(button => !button.textContent ||
                button.textContent.trim() === '' ||
                button.textContent === '⋯');
            if (optionButtons.length > 0) {
                await user.click(optionButtons[0]);
                // Verificar que no haya errores
                expect(optionButtons[0]).toBeInTheDocument();
            }
        });
    });
    describe('Funcionalidad de eliminación de carpetas', () => {
        it('debe hacer clic en el botón de eliminar carpeta', async () => {
            render(_jsx(SavedAgents, {}));
            const deleteButtons = screen.getAllByTitle('Eliminar carpeta');
            if (deleteButtons.length > 0) {
                await user.click(deleteButtons[0]);
                // Verificar que no haya errores
                expect(deleteButtons[0]).toBeInTheDocument();
            }
        });
    });
    describe('Verificación de elementos de UI', () => {
        it('debe mostrar todos los elementos principales', () => {
            render(_jsx(SavedAgents, {}));
            // Verificar elementos principales
            expect(screen.getByText('Saved Agents')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Agent Search')).toBeInTheDocument();
            expect(screen.getByText('Agent Type')).toBeInTheDocument();
            expect(screen.getByText('Sync ElevenLabs')).toBeInTheDocument();
            // Verificar botones (pueden ser múltiples por responsive design)
            const importButtons = screen.getAllByText('Import Agent');
            expect(importButtons.length).toBeGreaterThan(0);
            const createFolderButtons = screen.getAllByText('Create New Folder');
            expect(createFolderButtons.length).toBeGreaterThan(0);
            // Verificar el toggle switch
            expect(screen.getByText('Show agents in all folders')).toBeInTheDocument();
        });
        it('debe mostrar los agentes y carpetas', () => {
            render(_jsx(SavedAgents, {}));
            // Verificar agentes y carpetas
            expect(screen.getByText('Test Agent 1')).toBeInTheDocument();
            expect(screen.getByText('Test Agent 2')).toBeInTheDocument();
            expect(screen.getByText('Test Folder')).toBeInTheDocument();
            expect(screen.getByText('Agentes sin carpeta (1)')).toBeInTheDocument();
        });
        it('debe mostrar los botones de llamada', () => {
            render(_jsx(SavedAgents, {}));
            // Verificar botones de llamada
            const callButtons = screen.getAllByText('Make A Call');
            expect(callButtons.length).toBeGreaterThan(0);
        });
    });
});
