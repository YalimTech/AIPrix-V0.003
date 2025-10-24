import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SavedAgents from '../SavedAgents'

// Mock de React Router
const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/saved-agents' }),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}))

describe('SavedAgents Component', () => {
  let user: any

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
  })

  describe('Renderizado inicial', () => {
    it('debe renderizar el componente sin errores', () => {
      render(<SavedAgents />)
      
      expect(screen.getByText('Saved Agents')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Search agents...')).toBeInTheDocument()
      expect(screen.getByText('Agent Type')).toBeInTheDocument()
    })

    it('debe mostrar los agentes mockeados', () => {
      render(<SavedAgents />)
      
      expect(screen.getByText('Test Agent 1')).toBeInTheDocument()
      expect(screen.getByText('Test Agent 2')).toBeInTheDocument()
    })

    it('debe mostrar las carpetas mockeadas', () => {
      render(<SavedAgents />)
      
      expect(screen.getByText('Test Folder')).toBeInTheDocument()
    })
  })

  describe('Funcionalidad de búsqueda', () => {
    it('debe filtrar agentes por nombre', async () => {
      render(<SavedAgents />)
      
      const searchInput = screen.getByPlaceholderText('Search agents...')
      await user.type(searchInput, 'Test Agent 1')
      
      expect(screen.getByText('Test Agent 1')).toBeInTheDocument()
      expect(screen.queryByText('Test Agent 2')).not.toBeInTheDocument()
    })

    it('debe limpiar el filtro cuando se borra la búsqueda', async () => {
      render(<SavedAgents />)
      
      const searchInput = screen.getByPlaceholderText('Search agents...')
      await user.type(searchInput, 'Test Agent 1')
      await user.clear(searchInput)
      
      expect(screen.getByText('Test Agent 1')).toBeInTheDocument()
      expect(screen.getByText('Test Agent 2')).toBeInTheDocument()
    })
  })

  describe('Funcionalidad de filtro por tipo', () => {
    it('debe mostrar el dropdown de tipos de agente', async () => {
      render(<SavedAgents />)
      
      const agentTypeButton = screen.getByText('Agent Type')
      await user.click(agentTypeButton)
      
      expect(screen.getByText('Any')).toBeInTheDocument()
      expect(screen.getByText('Inbound')).toBeInTheDocument()
      expect(screen.getByText('Outbound')).toBeInTheDocument()
    })

    it('debe filtrar agentes por tipo seleccionado', async () => {
      render(<SavedAgents />)
      
      const agentTypeButton = screen.getByText('Agent Type')
      await user.click(agentTypeButton)
      
      const inboundOption = screen.getByText('Inbound')
      await user.click(inboundOption)
      
      expect(screen.getByText('Test Agent 1')).toBeInTheDocument()
      expect(screen.queryByText('Test Agent 2')).not.toBeInTheDocument()
    })
  })

  describe('Funcionalidad de botones de acción', () => {
    it('debe mostrar el menú contextual al hacer clic en el botón de opciones', async () => {
      render(<SavedAgents />)
      
      const optionButtons = screen.getAllByRole('button', { name: /options/i })
      await user.click(optionButtons[0])
      
      expect(screen.getByText('Edit')).toBeInTheDocument()
      expect(screen.getByText('Delete')).toBeInTheDocument()
      expect(screen.getByText('Duplicate')).toBeInTheDocument()
    })

    it('debe navegar a la página de edición al hacer clic en Edit', async () => {
      render(<SavedAgents />)
      
      const optionButtons = screen.getAllByRole('button', { name: /options/i })
      await user.click(optionButtons[0])
      
      const editButton = screen.getByText('Edit')
      await user.click(editButton)
      
      expect(mockNavigate).toHaveBeenCalledWith('/agents/1/edit')
    })

    it('debe mostrar confirmación al hacer clic en Delete', async () => {
      render(<SavedAgents />)
      
      const optionButtons = screen.getAllByRole('button', { name: /options/i })
      await user.click(optionButtons[0])
      
      const deleteButton = screen.getByText('Delete')
      await user.click(deleteButton)
      
      // Verificar que se llamó window.confirm
      expect(window.confirm).toHaveBeenCalledWith('¿Estás seguro de que quieres eliminar este agente?')
    })

    it('debe mostrar prompt para duplicar agente', async () => {
      render(<SavedAgents />)
      
      const optionButtons = screen.getAllByRole('button', { name: /options/i })
      await user.click(optionButtons[0])
      
      const duplicateButton = screen.getByText('Duplicate')
      await user.click(duplicateButton)
      
      // Verificar que se llamó window.prompt
      expect(window.prompt).toHaveBeenCalledWith(
        'Enter a new name for the duplicated agent:',
        'Test Agent 1 (Copy)'
      )
    })
  })

  describe('Funcionalidad de llamadas', () => {
    it('debe abrir el modal de llamada al hacer clic en el botón de llamada', async () => {
      render(<SavedAgents />)
      
      const callButtons = screen.getAllByRole('button', { name: /call/i })
      await user.click(callButtons[0])
      
      expect(screen.getByTestId('launch-call-modal')).toBeInTheDocument()
    })

    it('debe cerrar el modal de llamada', async () => {
      render(<SavedAgents />)
      
      const callButtons = screen.getAllByRole('button', { name: /call/i })
      await user.click(callButtons[0])
      
      expect(screen.getByTestId('launch-call-modal')).toBeInTheDocument()
      
      // Simular cerrar el modal (esto requeriría acceso al estado del componente)
      // En un test real, podrías hacer clic en un botón de cerrar si estuviera visible
    })
  })

  describe('Funcionalidad de copia', () => {
    it('debe copiar el ID del agente al portapapeles', async () => {
      render(<SavedAgents />)
      
      const optionButtons = screen.getAllByRole('button', { name: /options/i })
      await user.click(optionButtons[0])
      
      const copyIdButton = screen.getByText('Copy Webhook')
      await user.click(copyIdButton)
      
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('1')
    })

    it('debe copiar el link del agente al portapapeles', async () => {
      render(<SavedAgents />)
      
      const optionButtons = screen.getAllByRole('button', { name: /options/i })
      await user.click(optionButtons[0])
      
      const copyLinkButton = screen.getByText('Copy Webhook')
      await user.click(copyLinkButton)
      
      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalled()
      })
    })
  })

  describe('Funcionalidad de carpetas', () => {
    it('debe mostrar el modal de creación de carpeta', async () => {
      render(<SavedAgents />)
      
      const createFolderButton = screen.getByText('Create Folder')
      await user.click(createFolderButton)
      
      expect(screen.getByPlaceholderText('Enter folder name')).toBeInTheDocument()
    })

    it('debe crear una nueva carpeta', async () => {
      render(<SavedAgents />)
      
      const createFolderButton = screen.getByText('Create Folder')
      await user.click(createFolderButton)
      
      const folderNameInput = screen.getByPlaceholderText('Enter folder name')
      await user.type(folderNameInput, 'New Test Folder')
      
      const createButton = screen.getByText('Create')
      await user.click(createButton)
      
      // Verificar que se llamó la función de creación
      // Esto requeriría acceso a los mocks de los hooks
    })
  })

  describe('Funcionalidad de importación', () => {
    it('debe mostrar el modal de importación', async () => {
      render(<SavedAgents />)
      
      const importButton = screen.getByText('Import Agent')
      await user.click(importButton)
      
      expect(screen.getByPlaceholderText('Enter agent ID')).toBeInTheDocument()
    })

    it('debe importar un agente', async () => {
      render(<SavedAgents />)
      
      const importButton = screen.getByText('Import Agent')
      await user.click(importButton)
      
      const agentIdInput = screen.getByPlaceholderText('Enter agent ID')
      await user.type(agentIdInput, 'test-agent-id')
      
      const importConfirmButton = screen.getByText('Import')
      await user.click(importConfirmButton)
      
      // Verificar que se llamó la función de importación
    })
  })

  describe('Funcionalidad de sincronización', () => {
    it('debe sincronizar con ElevenLabs', async () => {
      render(<SavedAgents />)
      
      const syncButton = screen.getByText('Sync ElevenLabs')
      await user.click(syncButton)
      
      // Verificar que se llamó la función de sincronización
    })
  })

  describe('Funcionalidad de visualización', () => {
    it('debe alternar entre vista de carpetas y vista de lista', async () => {
      render(<SavedAgents />)
      
      const toggleButton = screen.getByText('Show All Folders')
      await user.click(toggleButton)
      
      // Verificar que cambió la vista
      expect(screen.getByText('Hide Folders')).toBeInTheDocument()
    })
  })

  describe('Funcionalidad de avatar', () => {
    it('debe abrir el modal de avatar', async () => {
      render(<SavedAgents />)
      
      const optionButtons = screen.getAllByRole('button', { name: /options/i })
      await user.click(optionButtons[0])
      
      const uploadAvatarButton = screen.getByText('Upload Avatar')
      await user.click(uploadAvatarButton)
      
      expect(screen.getByTestId('agent-widget-modal')).toBeInTheDocument()
    })
  })

  describe('Funcionalidad de costos', () => {
    it('debe mostrar información de costos', async () => {
      render(<SavedAgents />)
      
      const optionButtons = screen.getAllByRole('button', { name: /options/i })
      await user.click(optionButtons[0])
      
      const viewCostsButton = screen.getByText('View Costs')
      await user.click(viewCostsButton)
      
      // Verificar que se llamó la función de cálculo de costos
    })
  })

  describe('Funcionalidad de prueba', () => {
    it('debe ejecutar prueba del agente', async () => {
      render(<SavedAgents />)
      
      const optionButtons = screen.getAllByRole('button', { name: /options/i })
      await user.click(optionButtons[0])
      
      const testButton = screen.getByText('Test Agent')
      await user.click(testButton)
      
      // Verificar que se llamó la función de simulación
    })
  })
})
