
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Mail, MessageSquare, Play, Pause, Plus, Edit, Users } from 'lucide-react';

const TRUSTPORT_COLORS = {
  primary: '#4472C4',
  success: '#00A878',
  warning: '#FFC857',
  danger: '#DA2242',
  textStrong: '#1F2937',
  textMuted: '#6B7280',
  surface: '#FFFFFF',
  mainBg: '#F1F0EC'
};

// AI Insights Panel
const AIInsightsPanel = () => {
  const insightCards = [
    { 
      id: 'microcopy_optimization', 
      icon: Edit, 
      title: 'Optimizar Micro-copy', 
      desc: 'IA sugiere mejoras en 3 emails para +15% open rate.', 
      cta: { label: 'Optimizar Copy', action: () => alert('Generar Micro-copy IA') } 
    },
    { 
      id: 'send_time_optimization', 
      icon: Zap, 
      title: 'Mejor Hora de Envío', 
      desc: 'Martes 10-11h tiene 35% más engagement para tu audiencia.', 
      cta: { label: 'Reprogramar', action: () => alert('Optimizar Horarios de Envío') } 
    },
    { 
      id: 'sequence_performance', 
      icon: MessageSquare, 
      title: 'Performance de Secuencias', 
      desc: 'Secuencia "Onboarding" tiene 65% completion. Optimizar paso 3.', 
      cta: { label: 'Analizar', action: () => alert('Analizar Performance') } 
    },
  ];

  return (
    <div className="mb-6">
      <Card style={{ borderRadius: '16px', boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" style={{ color: TRUSTPORT_COLORS.primary }} />
            <CardTitle className="text-lg font-semibold" style={{ color: TRUSTPORT_COLORS.textStrong, fontFamily: 'Montserrat' }}>
              AI Insights & Recomendaciones
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insightCards.map((card) => (
              <div key={card.id} className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: TRUSTPORT_COLORS.primary + '1A' }}>
                    <card.icon className="w-5 h-5" style={{ color: TRUSTPORT_COLORS.primary }} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm" style={{ color: TRUSTPORT_COLORS.textStrong, fontFamily: 'Montserrat' }}>
                      {card.title}
                    </h4>
                    <p className="text-xs" style={{ color: TRUSTPORT_COLORS.textMuted, fontFamily: 'Montserrat' }}>
                      {card.desc}
                    </p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  className="w-full" 
                  variant="outline"
                  onClick={card.cta.action}
                  style={{ borderColor: TRUSTPORT_COLORS.primary, color: TRUSTPORT_COLORS.primary, fontFamily: 'Montserrat' }}
                >
                  {card.cta.label}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function ClientesMarketing() {
  const [sequences, setSequences] = useState([
    {
      id: 1,
      name: 'Onboarding Nuevos Clientes',
      channel: 'email',
      status: 'active',
      subscribers: 45,
      openRate: 68,
      conversionRate: 12,
      steps: 5,
      description: 'Secuencia de bienvenida para nuevos clientes'
    },
    {
      id: 2,
      name: 'Follow-up Leads Calificados',
      channel: 'email',
      status: 'active', 
      subscribers: 23,
      openRate: 72,
      conversionRate: 18,
      steps: 3,
      description: 'Seguimiento automático de leads calificados'
    },
    {
      id: 3,
      name: 'Re-engagement WhatsApp',
      channel: 'whatsapp',
      status: 'paused',
      subscribers: 67,
      openRate: 85,
      conversionRate: 25,
      steps: 4,
      description: 'Reactivación de clientes inactivos via WhatsApp'
    }
  ]);

  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: 'Email Bienvenida',
      channel: 'email',
      subject: '¡Bienvenido a Trustport!',
      category: 'Onboarding',
      lastUsed: '2025-08-25'
    },
    {
      id: 2,
      name: 'WhatsApp Follow-up',
      channel: 'whatsapp',
      subject: 'Seguimiento de propuesta',
      category: 'Ventas',
      lastUsed: '2025-08-24'
    },
    {
      id: 3,
      name: 'Email Cotización',
      channel: 'email',
      subject: 'Su cotización está lista',
      category: 'Ventas',
      lastUsed: '2025-08-23'
    }
  ]);
  
  useEffect(() => {
    document.title = 'Marketing | Trustport';
  }, []);

  return (
    <div className="space-y-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <div className="mb-6">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight" style={{ color: TRUSTPORT_COLORS.textStrong }}>
          Marketing
        </h1>
        <p className="text-[14px]" style={{ color: TRUSTPORT_COLORS.textMuted }}>
          Gestión de secuencias y plantillas de marketing automatizado.
        </p>
      </div>
      {/* AI Insights Panel */}
      <AIInsightsPanel />

      {/* Marketing Sequences */}
      <Card style={{ borderRadius: '16px', boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold" style={{ color: TRUSTPORT_COLORS.textStrong }}>
              Secuencias de Marketing
            </CardTitle>
            <p className="text-sm" style={{ color: TRUSTPORT_COLORS.textMuted }}>
              Automatización de email y WhatsApp con micro-copy generado por IA
            </p>
          </div>
          <Button style={{ backgroundColor: TRUSTPORT_COLORS.primary }}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Secuencia
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sequences.map((sequence) => (
              <Card key={sequence.id} className="border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {sequence.channel === 'email' ? (
                          <Mail className="w-5 h-5 text-blue-500" />
                        ) : (
                          <MessageSquare className="w-5 h-5 text-green-500" />
                        )}
                        <h3 className="font-semibold">{sequence.name}</h3>
                      </div>
                      <Badge 
                        className={sequence.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {sequence.status === 'active' ? 'Activa' : 'Pausada'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        style={{ 
                          color: sequence.status === 'active' ? TRUSTPORT_COLORS.danger : TRUSTPORT_COLORS.success,
                          borderColor: sequence.status === 'active' ? TRUSTPORT_COLORS.danger : TRUSTPORT_COLORS.success
                        }}
                      >
                        {sequence.status === 'active' ? (
                          <>
                            <Pause className="w-4 h-4 mr-1" />
                            Pausar
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-1" />
                            Activar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{sequence.description}</p>
                  
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">Suscriptores</span>
                      </div>
                      <div className="font-semibold">{sequence.subscribers}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Open Rate</div>
                      <div className="font-semibold text-blue-600">{sequence.openRate}%</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Conversión</div>
                      <div className="font-semibold text-green-600">{sequence.conversionRate}%</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Pasos</div>
                      <div className="font-semibold">{sequence.steps}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Templates */}
      <Card style={{ borderRadius: '16px', boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold" style={{ color: TRUSTPORT_COLORS.textStrong }}>
              Plantillas
            </CardTitle>
            <p className="text-sm" style={{ color: TRUSTPORT_COLORS.textMuted }}>
              Plantillas de email y WhatsApp optimizadas con IA
            </p>
          </div>
          <Button style={{ backgroundColor: TRUSTPORT_COLORS.primary }}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Plantilla
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Nombre</th>
                  <th className="text-left py-3">Canal</th>
                  <th className="text-left py-3">Asunto</th>
                  <th className="text-left py-3">Categoría</th>
                  <th className="text-left py-3">Último Uso</th>
                  <th className="text-left py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((template) => (
                  <tr key={template.id} className="border-b hover:bg-gray-50">
                    <td className="py-3">{template.name}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {template.channel === 'email' ? (
                          <Mail className="w-4 h-4 text-blue-500" />
                        ) : (
                          <MessageSquare className="w-4 h-4 text-green-500" />
                        )}
                        <span className="capitalize">{template.channel}</span>
                      </div>
                    </td>
                    <td className="py-3">{template.subject}</td>
                    <td className="py-3">
                      <Badge variant="outline">{template.category}</Badge>
                    </td>
                    <td className="py-3 text-sm text-gray-500">{template.lastUsed}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          Usar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* AI Micro-copy Generator */}
      <Card style={{ borderRadius: '16px', boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" style={{ color: TRUSTPORT_COLORS.primary }} />
            <CardTitle className="text-xl font-semibold" style={{ color: TRUSTPORT_COLORS.textStrong }}>
              Generador de Micro-copy IA
            </CardTitle>
          </div>
          <p className="text-sm" style={{ color: TRUSTPORT_COLORS.textMuted }}>
            Genera y optimiza contenido para emails y mensajes usando inteligencia artificial
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Contenido</label>
                <select className="w-full p-2 border rounded-lg">
                  <option>Subject Line - Email</option>
                  <option>Mensaje Apertura - WhatsApp</option>
                  <option>CTA Button Text</option>
                  <option>Follow-up Message</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Audiencia</label>
                <select className="w-full p-2 border rounded-lg">
                  <option>Nuevos Clientes</option>
                  <option>Leads Calificados</option>
                  <option>Clientes Inactivos</option>
                  <option>Clientes VIP</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tono</label>
                <select className="w-full p-2 border rounded-lg">
                  <option>Profesional</option>
                  <option>Amigable</option>
                  <option>Urgente</option>
                  <option>Personalizado</option>
                </select>
              </div>
              <Button style={{ backgroundColor: TRUSTPORT_COLORS.primary }} className="w-full">
                <Zap className="w-4 h-4 mr-2" />
                Generar Contenido IA
              </Button>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Vista Previa</h4>
              <div className="bg-white p-3 rounded border">
                <p className="text-sm text-gray-600">
                  El contenido generado por IA aparecerá aquí...
                </p>
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm">Regenerar</Button>
                <Button variant="outline" size="sm">Copiar</Button>
                <Button variant="outline" size="sm">Guardar</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
