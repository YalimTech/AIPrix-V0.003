import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { UserIcon, BellIcon, ShieldCheckIcon, } from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, endpoints } from '../lib/api';
import { useAppStore } from '../store/appStore';
import Button from '../components/ui/Button';
const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);
    const queryClient = useQueryClient();
    const addNotification = useAppStore((state) => state.addNotification);
    // Fetch user profile
    const { data: profile, isLoading: profileLoading } = useQuery({
        queryKey: ['profile'],
        queryFn: () => apiClient.get(endpoints.settings.profile),
    });
    // Fetch notification settings
    const { data: notificationSettings, isLoading: notificationsLoading } = useQuery({
        queryKey: ['notification-settings'],
        queryFn: () => apiClient.get(endpoints.settings.notifications),
    });
    // Fetch security settings
    const { data: securitySettings, isLoading: securityLoading } = useQuery({
        queryKey: ['security-settings'],
        queryFn: () => apiClient.get(endpoints.settings.security),
    });
    const updateProfile = useMutation({
        mutationFn: (data) => apiClient.put(endpoints.settings.profile, data),
        onSuccess: () => {
            addNotification({
                type: 'success',
                title: 'Perfil actualizado',
                message: 'Tu perfil se ha actualizado exitosamente',
            });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            setIsEditing(false);
        },
        onError: (error) => {
            addNotification({
                type: 'error',
                title: 'Error al actualizar perfil',
                message: error.message || 'No se pudo actualizar el perfil',
            });
        },
    });
    const updateNotifications = useMutation({
        mutationFn: (data) => apiClient.put(endpoints.settings.notifications, data),
        onSuccess: () => {
            addNotification({
                type: 'success',
                title: 'Configuración actualizada',
                message: 'Las configuraciones de notificación se han actualizado',
            });
            queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
        },
        onError: (error) => {
            addNotification({
                type: 'error',
                title: 'Error al actualizar configuración',
                message: error.message || 'No se pudo actualizar la configuración',
            });
        },
    });
    const updateSecurity = useMutation({
        mutationFn: (data) => apiClient.put(endpoints.settings.security, data),
        onSuccess: () => {
            addNotification({
                type: 'success',
                title: 'Configuración de seguridad actualizada',
                message: 'La configuración de seguridad se ha actualizado',
            });
            queryClient.invalidateQueries({ queryKey: ['security-settings'] });
        },
        onError: (error) => {
            addNotification({
                type: 'error',
                title: 'Error al actualizar seguridad',
                message: error.message || 'No se pudo actualizar la configuración de seguridad',
            });
        },
    });
    const tabs = [
        { id: 'profile', name: 'Perfil', icon: UserIcon },
        { id: 'notifications', name: 'Notificaciones', icon: BellIcon },
        { id: 'security', name: 'Seguridad', icon: ShieldCheckIcon },
    ];
    const timezones = [
        'America/Mexico_City',
        'America/New_York',
        'America/Los_Angeles',
        'America/Chicago',
        'America/Denver',
        'Europe/London',
        'Europe/Madrid',
        'Europe/Paris',
        'Asia/Tokyo',
        'Australia/Sydney',
    ];
    const languages = [
        { code: 'es', name: 'Español' },
        { code: 'en', name: 'English' },
        { code: 'fr', name: 'Français' },
        { code: 'de', name: 'Deutsch' },
    ];
    if (profileLoading || notificationsLoading || securityLoading) {
        return (_jsx("div", { className: "p-6", children: _jsxs("div", { className: "animate-pulse", children: [_jsx("div", { className: "h-8 bg-gray-300 rounded w-1/3 mb-6" }), _jsx("div", { className: "h-64 bg-gray-300 rounded" })] }) }));
    }
    return (_jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Configuraci\u00F3n" }), _jsx("p", { className: "text-gray-600", children: "Gestiona tu perfil, notificaciones y configuraciones de seguridad" })] }), _jsx("div", { className: "border-b border-gray-200 mb-8", children: _jsx("nav", { className: "-mb-px flex space-x-8", children: tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (_jsxs("button", { onClick: () => setActiveTab(tab.id), className: `flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`, children: [_jsx(Icon, { className: "w-5 h-5" }), _jsx("span", { children: tab.name })] }, tab.id));
                    }) }) }), activeTab === 'profile' && profile && (_jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h2", { className: "text-lg font-medium text-gray-900", children: "Informaci\u00F3n del perfil" }), _jsx(Button, { onClick: () => setIsEditing(!isEditing), variant: isEditing ? 'outline' : 'primary', children: isEditing ? 'Cancelar' : 'Editar' })] }), _jsxs("form", { onSubmit: (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            const data = {
                                firstName: formData.get('firstName'),
                                lastName: formData.get('lastName'),
                                email: formData.get('email'),
                                phone: formData.get('phone'),
                                timezone: formData.get('timezone'),
                                language: formData.get('language'),
                                company: formData.get('company'),
                                position: formData.get('position'),
                            };
                            updateProfile.mutate(data);
                        }, className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Nombre" }), _jsx("input", { type: "text", name: "firstName", defaultValue: profile.firstName, disabled: !isEditing, className: "input-field", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Apellido" }), _jsx("input", { type: "text", name: "lastName", defaultValue: profile.lastName, disabled: !isEditing, className: "input-field", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Email" }), _jsx("input", { type: "email", name: "email", defaultValue: profile.email, disabled: !isEditing, className: "input-field", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Tel\u00E9fono" }), _jsx("input", { type: "tel", name: "phone", defaultValue: profile.phone || '', disabled: !isEditing, className: "input-field" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Zona horaria" }), _jsx("select", { name: "timezone", defaultValue: profile.timezone, disabled: !isEditing, className: "input-field", children: timezones.map((tz) => (_jsx("option", { value: tz, children: tz }, tz))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Idioma" }), _jsx("select", { name: "language", defaultValue: profile.language, disabled: !isEditing, className: "input-field", children: languages.map((lang) => (_jsx("option", { value: lang.code, children: lang.name }, lang.code))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Empresa" }), _jsx("input", { type: "text", name: "company", defaultValue: profile.company || '', disabled: !isEditing, className: "input-field" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Posici\u00F3n" }), _jsx("input", { type: "text", name: "position", defaultValue: profile.position || '', disabled: !isEditing, className: "input-field" })] })] }), isEditing && (_jsxs("div", { className: "flex justify-end space-x-3", children: [_jsx(Button, { type: "button", onClick: () => setIsEditing(false), variant: "outline", children: "Cancelar" }), _jsx(Button, { type: "submit", variant: "primary", isLoading: updateProfile.isPending, children: updateProfile.isPending ? 'Guardando...' : 'Guardar cambios' })] }))] })] })), activeTab === 'notifications' && notificationSettings && (_jsx("div", { className: "space-y-6", children: _jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-6", children: [_jsxs("h2", { className: "text-lg font-medium text-gray-900 mb-4 flex items-center", children: [_jsx(BellIcon, { className: "w-5 h-5 mr-2" }), "Configuraci\u00F3n de notificaciones"] }), _jsxs("form", { onSubmit: (e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                const data = {
                                    email: {
                                        enabled: formData.get('email.enabled') === 'on',
                                        campaigns: formData.get('email.campaigns') === 'on',
                                        calls: formData.get('email.calls') === 'on',
                                        billing: formData.get('email.billing') === 'on',
                                        system: formData.get('email.system') === 'on',
                                    },
                                    push: {
                                        enabled: formData.get('push.enabled') === 'on',
                                        campaigns: formData.get('push.campaigns') === 'on',
                                        calls: formData.get('push.calls') === 'on',
                                        billing: formData.get('push.billing') === 'on',
                                        system: formData.get('push.system') === 'on',
                                    },
                                    sms: {
                                        enabled: formData.get('sms.enabled') === 'on',
                                        campaigns: formData.get('sms.campaigns') === 'on',
                                        calls: formData.get('sms.calls') === 'on',
                                        billing: formData.get('sms.billing') === 'on',
                                    },
                                };
                                updateNotifications.mutate(data);
                            }, className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-md font-medium text-gray-900 mb-3", children: "Notificaciones por email" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", name: "email.enabled", defaultChecked: notificationSettings.email.enabled, className: "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" }), _jsx("span", { className: "ml-2 text-sm text-gray-700", children: "Habilitar notificaciones por email" })] }), notificationSettings.email.enabled && (_jsxs("div", { className: "ml-6 space-y-2", children: [_jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", name: "email.campaigns", defaultChecked: notificationSettings.email.campaigns, className: "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" }), _jsx("span", { className: "ml-2 text-sm text-gray-700", children: "Campa\u00F1as" })] }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", name: "email.calls", defaultChecked: notificationSettings.email.calls, className: "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" }), _jsx("span", { className: "ml-2 text-sm text-gray-700", children: "Llamadas" })] }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", name: "email.billing", defaultChecked: notificationSettings.email.billing, className: "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" }), _jsx("span", { className: "ml-2 text-sm text-gray-700", children: "Facturaci\u00F3n" })] }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", name: "email.system", defaultChecked: notificationSettings.email.system, className: "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" }), _jsx("span", { className: "ml-2 text-sm text-gray-700", children: "Sistema" })] })] }))] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-md font-medium text-gray-900 mb-3", children: "Notificaciones push" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", name: "push.enabled", defaultChecked: notificationSettings.push.enabled, className: "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" }), _jsx("span", { className: "ml-2 text-sm text-gray-700", children: "Habilitar notificaciones push" })] }), notificationSettings.push.enabled && (_jsxs("div", { className: "ml-6 space-y-2", children: [_jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", name: "push.campaigns", defaultChecked: notificationSettings.push.campaigns, className: "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" }), _jsx("span", { className: "ml-2 text-sm text-gray-700", children: "Campa\u00F1as" })] }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", name: "push.calls", defaultChecked: notificationSettings.push.calls, className: "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" }), _jsx("span", { className: "ml-2 text-sm text-gray-700", children: "Llamadas" })] }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", name: "push.billing", defaultChecked: notificationSettings.push.billing, className: "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" }), _jsx("span", { className: "ml-2 text-sm text-gray-700", children: "Facturaci\u00F3n" })] }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", name: "push.system", defaultChecked: notificationSettings.push.system, className: "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" }), _jsx("span", { className: "ml-2 text-sm text-gray-700", children: "Sistema" })] })] }))] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-md font-medium text-gray-900 mb-3", children: "Notificaciones por SMS" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", name: "sms.enabled", defaultChecked: notificationSettings.sms.enabled, className: "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" }), _jsx("span", { className: "ml-2 text-sm text-gray-700", children: "Habilitar notificaciones por SMS" })] }), notificationSettings.sms.enabled && (_jsxs("div", { className: "ml-6 space-y-2", children: [_jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", name: "sms.campaigns", defaultChecked: notificationSettings.sms.campaigns, className: "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" }), _jsx("span", { className: "ml-2 text-sm text-gray-700", children: "Campa\u00F1as" })] }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", name: "sms.calls", defaultChecked: notificationSettings.sms.calls, className: "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" }), _jsx("span", { className: "ml-2 text-sm text-gray-700", children: "Llamadas" })] }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", name: "sms.billing", defaultChecked: notificationSettings.sms.billing, className: "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" }), _jsx("span", { className: "ml-2 text-sm text-gray-700", children: "Facturaci\u00F3n" })] })] }))] })] }), _jsx("div", { className: "flex justify-end", children: _jsx(Button, { type: "submit", variant: "primary", isLoading: updateNotifications.isPending, children: updateNotifications.isPending ? 'Guardando...' : 'Guardar configuración' }) })] })] }) })), activeTab === 'security' && securitySettings && (_jsx("div", { className: "space-y-6", children: _jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-6", children: [_jsxs("h2", { className: "text-lg font-medium text-gray-900 mb-4 flex items-center", children: [_jsx(ShieldCheckIcon, { className: "w-5 h-5 mr-2" }), "Configuraci\u00F3n de seguridad"] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-md font-medium text-gray-900 mb-3", children: "Autenticaci\u00F3n de dos factores" }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { children: _jsx("p", { className: "text-sm text-gray-600", children: "Agrega una capa adicional de seguridad a tu cuenta" }) }), _jsx(Button, { variant: securitySettings.twoFactorEnabled ? 'outline' : 'primary', onClick: () => updateSecurity.mutate({
                                                        twoFactorEnabled: !securitySettings.twoFactorEnabled
                                                    }), children: securitySettings.twoFactorEnabled ? 'Desactivar' : 'Activar' })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-md font-medium text-gray-900 mb-3", children: "Notificaciones de inicio de sesi\u00F3n" }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { children: _jsx("p", { className: "text-sm text-gray-600", children: "Recibe notificaciones cuando alguien inicie sesi\u00F3n en tu cuenta" }) }), _jsx("label", { className: "flex items-center", children: _jsx("input", { type: "checkbox", checked: securitySettings.loginNotifications, onChange: (e) => updateSecurity.mutate({
                                                            loginNotifications: e.target.checked
                                                        }), className: "toggle-switch" }) })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-md font-medium text-gray-900 mb-3", children: "Tiempo de expiraci\u00F3n de sesi\u00F3n" }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("select", { value: securitySettings.sessionTimeout, onChange: (e) => updateSecurity.mutate({
                                                        sessionTimeout: parseInt(e.target.value)
                                                    }), className: "input-field", children: [_jsx("option", { value: 15, children: "15 minutos" }), _jsx("option", { value: 30, children: "30 minutos" }), _jsx("option", { value: 60, children: "1 hora" }), _jsx("option", { value: 120, children: "2 horas" }), _jsx("option", { value: 480, children: "8 horas" })] }), _jsx("p", { className: "text-sm text-gray-600", children: "Tiempo de inactividad antes de cerrar sesi\u00F3n autom\u00E1ticamente" })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-md font-medium text-gray-900 mb-3", children: "Informaci\u00F3n de contrase\u00F1a" }), _jsx("div", { className: "bg-gray-50 border border-gray-200 rounded-lg p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-900", children: "\u00DAltimo cambio de contrase\u00F1a" }), _jsx("p", { className: "text-sm text-gray-600", children: new Date(securitySettings.passwordLastChanged).toLocaleDateString('es-ES') })] }), _jsx(Button, { variant: "outline", size: "sm", children: "Cambiar contrase\u00F1a" })] }) })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-md font-medium text-gray-900 mb-3", children: "IPs permitidas" }), _jsxs("div", { className: "space-y-2", children: [securitySettings.allowedIPs.length > 0 ? (securitySettings.allowedIPs.map((ip, index) => (_jsxs("div", { className: "flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3", children: [_jsx("span", { className: "text-sm font-mono text-gray-900", children: ip }), _jsx(Button, { variant: "outline", size: "sm", children: "Eliminar" })] }, index)))) : (_jsx("p", { className: "text-sm text-gray-600", children: "No hay restricciones de IP configuradas" })), _jsx(Button, { variant: "outline", size: "sm", children: "Agregar IP" })] })] })] })] }) }))] }));
};
export default SettingsPage;
