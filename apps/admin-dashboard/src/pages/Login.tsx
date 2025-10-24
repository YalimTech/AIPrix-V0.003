import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";

interface LoginFormData {
  email: string;
  password: string;
}

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginData, setLoginData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Simular llamada a API de admin
      const response = await fetch("/api/v1/auth/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        throw new Error("Credenciales inválidas");
      }

      const data = await response.json();

      // Guardar token de admin en localStorage
      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_data", JSON.stringify(data.admin));

      // Redirigir al dashboard de admin
      navigate("/admin");
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setLoginData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(""); // Limpiar error al escribir
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo y Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-red-600 rounded-lg flex items-center justify-center">
            <ShieldCheckIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Panel de Administración
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Acceso exclusivo para administradores del sistema
          </p>
        </div>

        {/* Formulario */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              Iniciar Sesión como Administrador
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Input
                label="Email de Administrador"
                type="email"
                placeholder="admin@prixagent.com"
                value={loginData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />

              <div className="relative">
                <Input
                  label="Contraseña"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Verificando..." : "Acceder como Administrador"}
              </Button>
            </form>

            {/* Enlaces adicionales */}
            <div className="mt-6 text-center space-y-2">
              <a href="/" className="text-sm text-gray-500 hover:text-gray-700">
                ← Volver al Dashboard de Cliente
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Información de seguridad */}
        <div className="text-center">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <LockClosedIcon className="h-4 w-4" />
              <span>Conexión segura y encriptada</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
