import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
  category: 'navigation' | 'actions' | 'system';
}

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const { addNotification } = useAppStore();

  const shortcuts: KeyboardShortcut[] = [
    // Navigation shortcuts
    {
      key: '1',
      ctrlKey: true,
      action: () => navigate('/dashboard'),
      description: 'Ir al Dashboard',
      category: 'navigation',
    },
    {
      key: '2',
      ctrlKey: true,
      action: () => navigate('/agents'),
      description: 'Ir a Agentes',
      category: 'navigation',
    },
    {
      key: '3',
      ctrlKey: true,
      action: () => navigate('/campaigns'),
      description: 'Ir a Campañas',
      category: 'navigation',
    },
    {
      key: '4',
      ctrlKey: true,
      action: () => navigate('/contacts'),
      description: 'Ir a Contactos',
      category: 'navigation',
    },
    {
      key: '5',
      ctrlKey: true,
      action: () => navigate('/call-logs'),
      description: 'Ir a Registro de Llamadas',
      category: 'navigation',
    },
    {
      key: '6',
      ctrlKey: true,
      action: () => navigate('/integrations'),
      description: 'Ir a Integraciones',
      category: 'navigation',
    },
    {
      key: '7',
      ctrlKey: true,
      action: () => navigate('/billing'),
      description: 'Ir a Facturación',
      category: 'navigation',
    },
    {
      key: '8',
      ctrlKey: true,
      action: () => navigate('/settings'),
      description: 'Ir a Configuración',
      category: 'navigation',
    },

    // Action shortcuts
    {
      key: 'n',
      ctrlKey: true,
      action: () => {
        // Trigger new contact modal or navigate to contacts
        navigate('/contacts');
        addNotification({
          type: 'info',
          title: 'Acceso rápido',
          message: 'Usa el botón "Agregar Contacto" para crear un nuevo contacto',
        });
      },
      description: 'Nuevo Contacto',
      category: 'actions',
    },
    {
      key: 'c',
      ctrlKey: true,
      action: () => {
        // Trigger new campaign modal or navigate to campaigns
        navigate('/campaigns');
        addNotification({
          type: 'info',
          title: 'Acceso rápido',
          message: 'Usa el botón "Nueva Campaña" para crear una nueva campaña',
        });
      },
      description: 'Nueva Campaña',
      category: 'actions',
    },
    {
      key: 'a',
      ctrlKey: true,
      action: () => {
        // Trigger new agent modal or navigate to agents
        navigate('/agents');
        addNotification({
          type: 'info',
          title: 'Acceso rápido',
          message: 'Usa el botón "Crear Agente" para crear un nuevo agente',
        });
      },
      description: 'Nuevo Agente',
      category: 'actions',
    },
    {
      key: 'p',
      ctrlKey: true,
      action: () => navigate('/buy-number'),
      description: 'Comprar Número Telefónico',
      category: 'actions',
    },

    // System shortcuts
    {
      key: '?',
      action: () => {
        showShortcutsHelp();
      },
      description: 'Mostrar ayuda de atajos',
      category: 'system',
    },
    {
      key: 'k',
      ctrlKey: true,
      action: () => {
        // Open command palette (if implemented)
        addNotification({
          type: 'info',
          title: 'Paleta de comandos',
          message: 'Esta funcionalidad estará disponible próximamente',
        });
      },
      description: 'Abrir paleta de comandos',
      category: 'system',
    },
    {
      key: 'f',
      ctrlKey: true,
      action: () => {
        // Focus search or filter
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="buscar" i], input[placeholder*="search" i]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        } else {
          addNotification({
            type: 'info',
            title: 'Buscar',
            message: 'No hay campo de búsqueda disponible en esta página',
          });
        }
      },
      description: 'Buscar',
      category: 'system',
    },
    {
      key: 'Escape',
      action: () => {
        // Close modals or clear selections
        const modal = document.querySelector('[role="dialog"], .modal-overlay, .modal-content');
        if (modal) {
          const closeButton = modal.querySelector('button[aria-label*="close" i], button[aria-label*="cerrar" i], .close-button');
          if (closeButton) {
            (closeButton as HTMLButtonElement).click();
          }
        }
      },
      description: 'Cerrar modal/selección',
      category: 'system',
    },
    {
      key: 'r',
      ctrlKey: true,
      action: () => {
        // Refresh current page data
        window.location.reload();
      },
      description: 'Recargar página',
      category: 'system',
    },
  ];

  const showShortcutsHelp = () => {
    const navigationShortcuts = shortcuts.filter(s => s.category === 'navigation');
    const actionShortcuts = shortcuts.filter(s => s.category === 'actions');
    const systemShortcuts = shortcuts.filter(s => s.category === 'system');

    const helpMessage = `
🏠 Navegación:
${navigationShortcuts.map(s => `Ctrl+${s.key}: ${s.description}`).join('\n')}

⚡ Acciones:
${actionShortcuts.map(s => `Ctrl+${s.key}: ${s.description}`).join('\n')}

🔧 Sistema:
${systemShortcuts.map(s => `${s.key}: ${s.description}`).join('\n')}
    `.trim();

    addNotification({
      type: 'info',
      title: 'Atajos de teclado disponibles',
      message: helpMessage,
    });
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts if user is typing in an input
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.contentEditable === 'true' ||
      target.isContentEditable
    ) {
      return;
    }

    // Find matching shortcut
    const matchingShortcut = shortcuts.find(shortcut => {
      const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase();
      const ctrlMatch = !!shortcut.ctrlKey === event.ctrlKey;
      const shiftMatch = !!shortcut.shiftKey === event.shiftKey;
      const altMatch = !!shortcut.altKey === event.altKey;
      const metaMatch = !!shortcut.metaKey === event.metaKey;

      return keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch;
    });

    if (matchingShortcut) {
      event.preventDefault();
      event.stopPropagation();
      
      try {
        matchingShortcut.action();
      } catch (error) {
        console.error('Error executing keyboard shortcut:', error);
        addNotification({
          type: 'error',
          title: 'Error en atajo de teclado',
          message: 'No se pudo ejecutar la acción del atajo',
        });
      }
    }
  }, [shortcuts, addNotification]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const getShortcutsForCategory = (category: KeyboardShortcut['category']) => {
    return shortcuts.filter(shortcut => shortcut.category === category);
  };

  const getAllShortcuts = () => shortcuts;

  return {
    shortcuts: getAllShortcuts(),
    navigationShortcuts: getShortcutsForCategory('navigation'),
    actionShortcuts: getShortcutsForCategory('actions'),
    systemShortcuts: getShortcutsForCategory('system'),
    showHelp: showShortcutsHelp,
  };
};
