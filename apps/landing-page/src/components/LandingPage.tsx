import React from 'react';
import { 
  PhoneIcon, 
  ChatBubbleLeftRightIcon, 
  CogIcon, 
  ChartBarIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const LandingPage: React.FC = () => {
  const features = [
    {
      icon: PhoneIcon,
      title: 'Llamadas Automatizadas',
      description: 'Agentes de IA que realizan llamadas telefónicas de forma natural y profesional.'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Conversaciones Inteligentes',
      description: 'Comprende el contexto y responde de manera coherente a cualquier consulta.'
    },
    {
      icon: CogIcon,
      title: 'Fácil Configuración',
      description: 'Configura tu agente en minutos con nuestra interfaz intuitiva.'
    },
    {
      icon: ChartBarIcon,
      title: 'Analytics Avanzados',
      description: 'Monitorea el rendimiento y obtén insights valiosos de cada conversación.'
    }
  ];

  const benefits = [
    'Reduce costos operativos hasta un 80%',
    'Disponible 24/7 sin descansos',
    'Escalabilidad ilimitada',
    'Integración con CRM existentes',
    'Cumplimiento de normativas',
    'Soporte técnico especializado'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">PrixAgent</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="#features"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Características
              </a>
              <a
                href="#contact"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Contactar
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Agentes de IA Conversacional
              <span className="block text-blue-200">para tu Negocio</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Automatiza llamadas telefónicas con inteligencia artificial. 
              Tu agente virtual nunca duerme, nunca se cansa y siempre está disponible.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center"
              >
                Solicitar Demo
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </a>
              <a
                href="#features"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Ver Características
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir PrixAgent?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              La tecnología más avanzada en agentes conversacionales para transformar tu negocio.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Beneficios Inmediatos
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Transforma tu operación telefónica desde el primer día con resultados medibles.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">¿Listo para comenzar?</h3>
              <p className="mb-6">
                Únete a cientos de empresas que ya están automatizando sus llamadas con PrixAgent.
              </p>
              <a
                href="#contact"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center"
              >
                Solicitar Información
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¿Listo para Automatizar tus Llamadas?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Contacta con nuestro equipo de ventas para una demostración personalizada y descubre cómo PrixAgent puede transformar tu negocio.
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <a href="mailto:ventas@prixagent.com" className="text-blue-600 hover:text-blue-700">
                      ventas@prixagent.com
                    </a>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Teléfono</p>
                    <a href="tel:+1234567890" className="text-blue-600 hover:text-blue-700">
                      +1 (234) 567-890
                    </a>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Horario</p>
                    <p className="text-gray-700">Lunes a Viernes, 9:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Solicitar Demo</h3>
                <p className="text-gray-600 mb-4">
                  Completa el formulario y nos pondremos en contacto contigo en menos de 24 horas.
                </p>
                <a
                  href="mailto:ventas@prixagent.com?subject=Solicitud de Demo - PrixAgent&body=Hola, me interesa conocer más sobre PrixAgent y solicitar una demostración personalizada."
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center"
                >
                  Enviar Solicitud
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Comienza tu Transformación Digital Hoy
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            No esperes más. Automatiza tus llamadas y libera a tu equipo para tareas más estratégicas.
          </p>
          <a
            href="#contact"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center"
          >
            Contactar Ventas
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold text-gray-900">PrixAgent</h3>
              <p className="text-gray-600">Agentes de IA Conversacional</p>
            </div>
            <div className="flex space-x-6">
              <a href="#features" className="text-gray-500 hover:text-gray-700">
                Características
              </a>
              <a href="#contact" className="text-gray-500 hover:text-gray-700">
                Contacto
              </a>
              <a href="mailto:info@prixagent.com" className="text-gray-500 hover:text-gray-700">
                Soporte
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-gray-500">
            <p>&copy; 2024 PrixAgent. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
