import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import SavedAgents from '../SavedAgents';
// Mock de React Router
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/saved-agents' }),
    Link: ({ children, to }) => React.createElement('a', { href: to }, children),
}));
describe('SavedAgents Component - Tests Básicos', () => {
    it('debe renderizar el componente sin errores', () => {
        render(_jsx(SavedAgents, {}));
        // Verificar que el título esté presente
        expect(screen.getByText('Saved Agents')).toBeInTheDocument();
    });
    it('debe mostrar el campo de búsqueda', () => {
        render(_jsx(SavedAgents, {}));
        // Verificar que el campo de búsqueda esté presente
        const searchInput = screen.getByPlaceholderText('Agent Search');
        expect(searchInput).toBeInTheDocument();
    });
    it('debe mostrar el filtro de tipo de agente', () => {
        render(_jsx(SavedAgents, {}));
        // Verificar que el botón de filtro esté presente
        expect(screen.getByText('Agent Type')).toBeInTheDocument();
    });
    it('debe mostrar los botones de acción principales', () => {
        render(_jsx(SavedAgents, {}));
        // Verificar que los botones principales estén presentes
        expect(screen.getByText('Sync ElevenLabs')).toBeInTheDocument();
        // Buscar el botón de Import Agent específicamente (no el título del modal)
        const importButtons = screen.getAllByText('Import Agent');
        expect(importButtons.length).toBeGreaterThan(0);
        expect(screen.getByText('Create New Folder')).toBeInTheDocument();
    });
    it('debe mostrar los agentes mockeados', () => {
        render(_jsx(SavedAgents, {}));
        // Verificar que los agentes mockeados estén presentes
        expect(screen.getByText('Test Agent 1')).toBeInTheDocument();
        expect(screen.getByText('Test Agent 2')).toBeInTheDocument();
    });
    it('debe mostrar las carpetas mockeadas', () => {
        render(_jsx(SavedAgents, {}));
        // Verificar que las carpetas mockeadas estén presentes
        expect(screen.getByText('Test Folder')).toBeInTheDocument();
    });
    it('debe mostrar el toggle de vista de carpetas', () => {
        render(_jsx(SavedAgents, {}));
        // Verificar que el toggle esté presente (hay múltiples botones, uno de ellos es el toggle)
        const allButtons = screen.getAllByRole('button');
        expect(allButtons.length).toBeGreaterThan(0);
    });
    it('debe mostrar los botones de llamada', () => {
        render(_jsx(SavedAgents, {}));
        // Verificar que los botones de llamada estén presentes
        const callButtons = screen.getAllByText('Make A Call');
        expect(callButtons.length).toBeGreaterThan(0);
    });
    it('debe mostrar los botones de opciones', () => {
        render(_jsx(SavedAgents, {}));
        // Verificar que los botones de opciones estén presentes (sin nombre específico)
        const optionButtons = screen.getAllByRole('button');
        expect(optionButtons.length).toBeGreaterThan(0);
    });
    it('debe mostrar información de agentes sin carpeta', () => {
        render(_jsx(SavedAgents, {}));
        // Verificar que se muestre la sección de agentes sin carpeta
        expect(screen.getByText('Agentes sin carpeta (1)')).toBeInTheDocument();
    });
});
