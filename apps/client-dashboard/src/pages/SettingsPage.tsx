import React, { useState } from 'react';
import { 
  UserIcon, 
  BellIcon, 
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, endpoints } from '../lib/api';
import { useAppStore } from '../store/appStore';
import Button from '../components/ui/Button';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  timezone: string;
  language: string;
  company?: string;
  position?: string;
}

interface NotificationSettings {
  email: {
    enabled: boolean;
    campaigns: boolean;
    calls: boolean;
    billing: boolean;
    system: boolean;
  };
  push: {
    enabled: boolean;
    campaigns: boolean;
    calls: boolean;
    billing: boolean;
    system: boolean;
  };
  sms: {
    enabled: boolean;
    campaigns: boolean;
    calls: boolean;
    billing: boolean;
  };
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginNotifications: boolean;
  sessionTimeout: number;
  allowedIPs: string[];
  passwordLastChanged: Date;
}

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  
  const queryClient = useQueryClient();
  const addNotification = useAppStore((state) => state.addNotification);

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => apiClient.get<UserProfile>(endpoints.settings.profile),
  });

  // Fetch notification settings
  const { data: notificationSettings, isLoading: notificationsLoading } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: () => apiClient.get<NotificationSettings>(endpoints.settings.notifications),
  });

  // Fetch security settings
  const { data: securitySettings, isLoading: securityLoading } = useQuery({
    queryKey: ['security-settings'],
    queryFn: () => apiClient.get<SecuritySettings>(endpoints.settings.security),
  });

  const updateProfile = useMutation({
    mutationFn: (data: Partial<UserProfile>) => 
      apiClient.put(endpoints.settings.profile, data),
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: 'Perfil actualizado',
        message: 'Tu perfil se ha actualizado exitosamente',
      });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Error al actualizar perfil',
        message: error.message || 'No se pudo actualizar el perfil',
      });
    },
  });

  const updateNotifications = useMutation({
    mutationFn: (data: NotificationSettings) => 
      apiClient.put(endpoints.settings.notifications, data),
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: 'Configuración actualizada',
        message: 'Las configuraciones de notificación se han actualizado',
      });
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Error al actualizar configuración',
        message: error.message || 'No se pudo actualizar la configuración',
      });
    },
  });

  const updateSecurity = useMutation({
    mutationFn: (data: Partial<SecuritySettings>) => 
      apiClient.put(endpoints.settings.security, data),
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: 'Configuración de seguridad actualizada',
        message: 'La configuración de seguridad se ha actualizado',
      });
      queryClient.invalidateQueries({ queryKey: ['security-settings'] });
    },
    onError: (error: any) => {
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
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Configuración</h1>
        <p className="text-gray-600">
          Gestiona tu perfil, notificaciones y configuraciones de seguridad
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && profile && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">Información del perfil</h2>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? 'outline' : 'primary'}
            >
              {isEditing ? 'Cancelar' : 'Editar'}
            </Button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data: Partial<UserProfile> = {
                firstName: formData.get('firstName') as string,
                lastName: formData.get('lastName') as string,
                email: formData.get('email') as string,
                phone: formData.get('phone') as string,
                timezone: formData.get('timezone') as string,
                language: formData.get('language') as string,
                company: formData.get('company') as string,
                position: formData.get('position') as string,
              };
              updateProfile.mutate(data);
            }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  name="firstName"
                  defaultValue={profile.firstName}
                  disabled={!isEditing}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido
                </label>
                <input
                  type="text"
                  name="lastName"
                  defaultValue={profile.lastName}
                  disabled={!isEditing}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={profile.email}
                  disabled={!isEditing}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={profile.phone || ''}
                  disabled={!isEditing}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zona horaria
                </label>
                <select
                  name="timezone"
                  defaultValue={profile.timezone}
                  disabled={!isEditing}
                  className="input-field"
                >
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Idioma
                </label>
                <select
                  name="language"
                  defaultValue={profile.language}
                  disabled={!isEditing}
                  className="input-field"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Empresa
                </label>
                <input
                  type="text"
                  name="company"
                  defaultValue={profile.company || ''}
                  disabled={!isEditing}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Posición
                </label>
                <input
                  type="text"
                  name="position"
                  defaultValue={profile.position || ''}
                  disabled={!isEditing}
                  className="input-field"
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={updateProfile.isPending}
                >
                  {updateProfile.isPending ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && notificationSettings && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <BellIcon className="w-5 h-5 mr-2" />
              Configuración de notificaciones
            </h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data: NotificationSettings = {
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
              }}
              className="space-y-6"
            >
              {/* Email Notifications */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3">Notificaciones por email</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="email.enabled"
                      defaultChecked={notificationSettings.email.enabled}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Habilitar notificaciones por email</span>
                  </label>
                  
                  {notificationSettings.email.enabled && (
                    <div className="ml-6 space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="email.campaigns"
                          defaultChecked={notificationSettings.email.campaigns}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Campañas</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="email.calls"
                          defaultChecked={notificationSettings.email.calls}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Llamadas</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="email.billing"
                          defaultChecked={notificationSettings.email.billing}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Facturación</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="email.system"
                          defaultChecked={notificationSettings.email.system}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Sistema</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Push Notifications */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3">Notificaciones push</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="push.enabled"
                      defaultChecked={notificationSettings.push.enabled}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Habilitar notificaciones push</span>
                  </label>
                  
                  {notificationSettings.push.enabled && (
                    <div className="ml-6 space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="push.campaigns"
                          defaultChecked={notificationSettings.push.campaigns}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Campañas</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="push.calls"
                          defaultChecked={notificationSettings.push.calls}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Llamadas</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="push.billing"
                          defaultChecked={notificationSettings.push.billing}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Facturación</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="push.system"
                          defaultChecked={notificationSettings.push.system}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Sistema</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* SMS Notifications */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3">Notificaciones por SMS</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="sms.enabled"
                      defaultChecked={notificationSettings.sms.enabled}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Habilitar notificaciones por SMS</span>
                  </label>
                  
                  {notificationSettings.sms.enabled && (
                    <div className="ml-6 space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="sms.campaigns"
                          defaultChecked={notificationSettings.sms.campaigns}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Campañas</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="sms.calls"
                          defaultChecked={notificationSettings.sms.calls}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Llamadas</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="sms.billing"
                          defaultChecked={notificationSettings.sms.billing}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Facturación</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={updateNotifications.isPending}
                >
                  {updateNotifications.isPending ? 'Guardando...' : 'Guardar configuración'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && securitySettings && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <ShieldCheckIcon className="w-5 h-5 mr-2" />
              Configuración de seguridad
            </h2>

            <div className="space-y-6">
              {/* Two Factor Authentication */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3">Autenticación de dos factores</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      Agrega una capa adicional de seguridad a tu cuenta
                    </p>
                  </div>
                  <Button
                    variant={securitySettings.twoFactorEnabled ? 'outline' : 'primary'}
                    onClick={() => updateSecurity.mutate({ 
                      twoFactorEnabled: !securitySettings.twoFactorEnabled 
                    })}
                  >
                    {securitySettings.twoFactorEnabled ? 'Desactivar' : 'Activar'}
                  </Button>
                </div>
              </div>

              {/* Login Notifications */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3">Notificaciones de inicio de sesión</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      Recibe notificaciones cuando alguien inicie sesión en tu cuenta
                    </p>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={securitySettings.loginNotifications}
                      onChange={(e) => updateSecurity.mutate({ 
                        loginNotifications: e.target.checked 
                      })}
                      className="toggle-switch"
                    />
                  </label>
                </div>
              </div>

              {/* Session Timeout */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3">Tiempo de expiración de sesión</h3>
                <div className="flex items-center space-x-4">
                  <select
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => updateSecurity.mutate({ 
                      sessionTimeout: parseInt(e.target.value) 
                    })}
                    className="input-field"
                  >
                    <option value={15}>15 minutos</option>
                    <option value={30}>30 minutos</option>
                    <option value={60}>1 hora</option>
                    <option value={120}>2 horas</option>
                    <option value={480}>8 horas</option>
                  </select>
                  <p className="text-sm text-gray-600">
                    Tiempo de inactividad antes de cerrar sesión automáticamente
                  </p>
                </div>
              </div>

              {/* Password Information */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3">Información de contraseña</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Último cambio de contraseña</p>
                      <p className="text-sm text-gray-600">
                        {new Date(securitySettings.passwordLastChanged).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Cambiar contraseña
                    </Button>
                  </div>
                </div>
              </div>

              {/* Allowed IPs */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3">IPs permitidas</h3>
                <div className="space-y-2">
                  {securitySettings.allowedIPs.length > 0 ? (
                    securitySettings.allowedIPs.map((ip, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <span className="text-sm font-mono text-gray-900">{ip}</span>
                        <Button variant="outline" size="sm">
                          Eliminar
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-600">No hay restricciones de IP configuradas</p>
                  )}
                  <Button variant="outline" size="sm">
                    Agregar IP
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
