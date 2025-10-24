import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tenantData: CreateAccountData) => void;
}

interface CreateAccountData {
  name: string;
  slug: string;
  email: string;
  phone?: string;
  timezone: string;
  subscriptionPlan: string;
  billingEmail?: string;
}

const CreateAccountModal: React.FC<CreateAccountModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<CreateAccountData>({
    name: "",
    slug: "",
    email: "",
    phone: "",
    timezone: "UTC",
    subscriptionPlan: "basic",
    billingEmail: "",
  });

  const [errors, setErrors] = useState<Partial<CreateAccountData>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-generate slug from name
    if (name === "name") {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setFormData((prev) => ({
        ...prev,
        slug: slug,
      }));
    }

    // Clear error when user starts typing
    if (errors[name as keyof CreateAccountData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateAccountData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "El slug es requerido";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug =
        "El slug solo puede contener letras minúsculas, números y guiones";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El email no es válido";
    }

    if (
      formData.billingEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.billingEmail)
    ) {
      newErrors.billingEmail = "El email de facturación no es válido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
      setFormData({
        name: "",
        slug: "",
        email: "",
        phone: "",
        timezone: "UTC",
        subscriptionPlan: "basic",
        billingEmail: "",
      });
      setErrors({});
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Crear Nuevo Account
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Empresa *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-red-500 focus:border-red-500 ${
                    errors.name ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Ej: TechCorp Solutions"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-red-500 focus:border-red-500 ${
                    errors.slug ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="techcorp-solutions"
                />
                {errors.slug && (
                  <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Se genera automáticamente desde el nombre
                </p>
              </div>

              {/* Plan de Suscripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan de Suscripción *
                </label>
                <select
                  name="subscriptionPlan"
                  value={formData.subscriptionPlan}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                >
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Principal *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-red-500 focus:border-red-500 ${
                    errors.email ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="admin@techcorp.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              {/* Zona Horaria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zona Horaria
                </label>
                <select
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="America/Los_Angeles">
                    America/Los_Angeles
                  </option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="Europe/Madrid">Europe/Madrid</option>
                  <option value="America/Mexico_City">
                    America/Mexico_City
                  </option>
                </select>
              </div>

              {/* Email de Facturación */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email de Facturación
                </label>
                <input
                  type="email"
                  name="billingEmail"
                  value={formData.billingEmail}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-red-500 focus:border-red-500 ${
                    errors.billingEmail ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="billing@techcorp.com"
                />
                {errors.billingEmail && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.billingEmail}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Si no se especifica, se usará el email principal
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Crear Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAccountModal;
