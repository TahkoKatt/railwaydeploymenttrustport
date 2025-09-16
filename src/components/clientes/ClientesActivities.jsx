
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { activitiesList } from '@/api/functions';
import { 
  MessageCircle, Calendar, CheckSquare, Mail, Phone, Plus,
  Zap, Clock, AlertTriangle, Bot, User
} from 'lucide-react';

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
const AIInsightsPanel = ({ activeTab }) => {
  const getInsights = () => {
    switch (activeTab) {
      case 'conversaciones':
        return [
          { id: 'smart_reply', icon: Bot, title: 'Respuesta Inteligente', desc: '3 mensajes pueden responderse automáticamente con IA.', cta: 'Generar Respuestas' },
          { id: 'rfq_parser', icon: AlertTriangle, title: 'RFQ Detectada', desc: 'Documento de cotización detectado en WhatsApp Ana García.', cta: 'Procesar RFQ' },
          { id: 'sentiment_alert', icon: MessageCircle, title: 'Sentimiento Negativo', desc: '2 conversaciones requieren escalación a supervisor.', cta: 'Escalar' }
        ];
      case 'tareas':
        return [
          { id: 'priority_tasks', icon: Clock, title: 'Tareas de Alta Prioridad', desc: '5 tareas vencen hoy. Reasignar o extender plazo.', cta: 'Reasignar' },
          { id: 'auto_assign', icon: User, title: 'Asignación Automática', desc: 'IA sugiere asignar 3 tareas según expertise del equipo.', cta: 'Asignar' },
          { id: 'task_dependency', icon: CheckSquare, title: 'Dependencias', desc: '2 tareas bloqueadas esperando aprobación externa.', cta: 'Gestionar' }
        ];
      default:
        return [
          { id: 'sla_breach', icon: AlertTriangle, title: 'SLA en Riesgo', desc: '4 actividades próximas a vencer SLA en 2h.', cta: 'Ver SLA' },
          { id: 'follow_up', icon: Clock, title: 'Follow-up Automático', desc: '7 clientes sin contacto en 48h. Activar secuencia.', cta: 'Activar' },
          { id: 'activity_insights', icon: Bot, title: 'Patrón de Actividad', desc: 'Martes 10-12h es el mejor momento para llamadas.', cta: 'Optimizar' }
        ];
    }
  };

  const insights = getInsights();

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
            {insights.map((card) => (
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
                  onClick={() => alert(card.cta)}
                  style={{ borderColor: TRUSTPORT_COLORS.primary, color: TRUSTPORT_COLORS.primary, fontFamily: 'Montserrat' }}
                >
                  {card.cta}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function ClientesActivities() {
  const [activeTab, setActiveTab] = useState('conversaciones');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Actividades | Trustport';
  }, []);

  const tabs = [
    { id: 'conversaciones', label: 'Conversaciones', icon: MessageCircle },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'tareas', label: 'Tareas', icon: CheckSquare },
    { id: 'emails', label: 'Emails/Llamadas', icon: Mail }
  ];

  const getSLABadge = (sla) => {
    if (sla === 'ok') return <Badge className="bg-green-100 text-green-800">OK</Badge>;
    if (sla === 'warning') return <Badge className="bg-yellow-100 text-yellow-800">⚠ 2h</Badge>;
    if (sla === 'breach') return <Badge className="bg-red-100 text-red-800">Vencido</Badge>;
    return <Badge className="bg-gray-100 text-gray-800">-</Badge>;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'conversaciones':
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center gap-4 mb-4">
                <Select defaultValue="todos">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="todos">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="todos">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="todos">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                  </SelectContent>
                </Select>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" />
                  Con Oportunidad abierta
                </label>
              </div>

              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-green-100 text-green-800">WhatsApp</Badge>
                      <Badge className="bg-blue-100 text-blue-800">-1h</Badge>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">En curso</Badge>
                  </div>
                  <h4 className="font-semibold">Ana García Martín</h4>
                  <p className="text-sm text-gray-600">Textiles Barcelona SA</p>
                  <p className="text-sm mt-2">Consulta sobre estado de envío X123</p>
                  <p className="text-xs text-gray-500 mt-1">Hola Ana, ¿puedes decirme el estado de mi envío? Es el X123. Gracias</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="text-sm">
                      <span className="text-gray-500">Owner: Ana García</span><br/>
                      <span className="text-gray-500">Intent: Consulta</span><br/>
                      <span className="text-gray-500">Neutral</span>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-blue-100 text-blue-800">Email</Badge>
                      <Badge className="bg-yellow-100 text-yellow-800">5h</Badge>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Esperando cliente</Badge>
                  </div>
                  <h4 className="font-semibold">John Smith</h4>
                  <p className="text-sm text-gray-600">European Coffee SL</p>
                  <p className="text-sm mt-2">Propuesta de servicio de logística</p>
                  <p className="text-xs text-gray-500 mt-1">Estimado John, adjunto nuestra propuesta de servicio de logística para su consideración.</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="text-sm">
                      <span className="text-gray-500">Owner: Carlos Ruiz</span><br/>
                      <span className="text-gray-500">Intent: Ventas</span><br/>
                      <span className="text-gray-500">Positivo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'tareas':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Tareas</CardTitle>
                  <Button style={{ backgroundColor: TRUSTPORT_COLORS.primary }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Tarea
                  </Button>
                </div>
                <p className="text-sm text-gray-600">Planifica y ejecuta con prioridades, vencimientos y relación con cuentas u oportunidades.</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <Select defaultValue="todos">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="todos">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="todas">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="date" placeholder="dd/mm/aaaa" />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3">Fecha/Hora</th>
                        <th className="text-left py-3">Tipo</th>
                        <th className="text-left py-3">Título</th>
                        <th className="text-left py-3">Relacionado</th>
                        <th className="text-left py-3">Owner</th>
                        <th className="text-left py-3">Estado</th>
                        <th className="text-left py-3">Prioridad</th>
                        <th className="text-left py-3">Recordatorio</th>
                        <th className="text-left py-3">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3">28/8/2025, 11:00:00</td>
                        <td className="py-3">Revisión</td>
                        <td className="py-3">Revisar docs de Tech Innovations</td>
                        <td className="py-3">Cuenta acc-003</td>
                        <td className="py-3">María López</td>
                        <td className="py-3">
                          <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
                        </td>
                        <td className="py-3">
                          <Badge className="bg-red-100 text-red-800">Alta</Badge>
                        </td>
                        <td className="py-3">✓</td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">Marcar Hecho</Button>
                            <Button variant="outline" size="sm">Reasignar</Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3">27/8/2025, 13:00:00</td>
                        <td className="py-3">Llamada</td>
                        <td className="py-3">Llamar a Elena Ramos</td>
                        <td className="py-3">Contacto cont-004</td>
                        <td className="py-3">Ana García</td>
                        <td className="py-3">
                          <Badge className="bg-blue-100 text-blue-800">En curso</Badge>
                        </td>
                        <td className="py-3">
                          <Badge className="bg-yellow-100 text-yellow-800">Media</Badge>
                        </td>
                        <td className="py-3">✓</td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">Marcar Hecho</Button>
                            <Button variant="outline" size="sm">Reasignar</Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3">26/8/2025, 17:00:00</td>
                        <td className="py-3">Preparación</td>
                        <td className="py-3">Preparar presentación FoodTech</td>
                        <td className="py-3">Oportunidad opp-001</td>
                        <td className="py-3">Ana García</td>
                        <td className="py-3">
                          <Badge className="bg-green-100 text-green-800">Hecho</Badge>
                        </td>
                        <td className="py-3">
                          <Badge className="bg-red-100 text-red-800">Alta</Badge>
                        </td>
                        <td className="py-3">—</td>
                        <td className="py-3">
                          <Button variant="outline" size="sm">Reasignar</Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'agenda':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Agenda</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline">Semana</Button>
                    <Button variant="outline">Mes</Button>
                    <Button style={{ backgroundColor: TRUSTPORT_COLORS.primary }}>Programar Cita</Button>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Calendario semanal de reuniones, demos y seguimientos. Sincronizado en modo stub con Google Calendar.</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Agosto 2025</h3>
                  <div className="flex gap-2">
                    <Button variant="outline">← Anterior</Button>
                    <Button variant="outline">Siguiente →</Button>
                  </div>
                </div>

                <div className="grid grid-cols-8 gap-0 border">
                  <div className="p-2 bg-gray-50 font-medium text-sm">Hora</div>
                  {['Lun 26', 'Mar 27', 'Mié 28', 'Jue 29', 'Vie 30', 'Sáb 31', 'Dom 1'].map(day => (
                    <div key={day} className="p-2 bg-gray-50 font-medium text-sm text-center border-l">
                      {day}
                    </div>
                  ))}
                  
                  {[8, 9, 10, 11, 12, 13, 14].map(hour => (
                    <React.Fragment key={hour}>
                      <div className="p-2 text-sm text-gray-600 border-t">{hour}:00</div>
                      {Array(7).fill(null).map((_, dayIndex) => (
                        <div key={dayIndex} className="p-2 border-t border-l min-h-[60px] relative">
                          {hour === 10 && dayIndex === 2 && (
                            <div className="bg-blue-100 text-blue-800 p-1 rounded text-xs">
                              Demo Producto...<br/>
                              <span className="text-xs">Ana García</span>
                            </div>
                          )}
                          {hour === 14 && dayIndex === 4 && (
                            <div className="bg-green-100 text-green-800 p-1 rounded text-xs">
                              Follow-up Prop...<br/>
                              <span className="text-xs">Ana García</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'emails':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Emails y Llamadas</CardTitle>
                <p className="text-sm text-gray-600">Consulta de hilos de correo y registro de llamadas. Envío en modo stub y logging unificado.</p>
              </CardHeader>
              <CardContent>
                <div className="flex gap-8">
                  <div className="w-1/3">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Hilos de Email</CardTitle>
                        <Select defaultValue="todos">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input placeholder="Relacionado a" />
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="p-3 border rounded cursor-pointer hover:bg-gray-50">
                          <div className="font-medium text-sm">Ana García &lt;ana.garcia@textiles.com&gt;</div>
                          <div className="text-xs text-gray-500">Re: Estado de envío X123</div>
                          <div className="text-xs text-gray-500">Contacto Ana García</div>
                          <Badge className="bg-green-100 text-green-800 text-xs mt-1">Respondido</Badge>
                        </div>
                        
                        <div className="p-3 border rounded cursor-pointer hover:bg-gray-50">
                          <div className="font-medium text-sm">Carlos Ruiz &lt;carlos.ruiz@yourcompany.com&gt;</div>
                          <div className="text-xs text-gray-500">Nueva propuesta para European Coffee</div>
                          <div className="text-xs text-gray-500">Oportunidad OPP-002</div>
                          <Badge className="bg-yellow-100 text-yellow-800 text-xs mt-1">Pendiente</Badge>
                        </div>
                        
                        <div className="p-3 border rounded cursor-pointer hover:bg-gray-50">
                          <div className="font-medium text-sm">Klaus Weber &lt;klaus@techinnovations.de&gt;</div>
                          <div className="text-xs text-gray-500">API Integration Error</div>
                          <div className="text-xs text-gray-500">-</div>
                          <Badge className="bg-red-100 text-red-800 text-xs mt-1">API Integration Error</Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="mt-4">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-base">Registrar Llamada</CardTitle>
                        <Button style={{ backgroundColor: TRUSTPORT_COLORS.primary }}>
                          <Phone className="w-4 h-4 mr-2" />
                          Nueva Llamada
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600">
                          Registra llamadas realizadas para mantener un seguimiento completo de las comunicaciones con clientes.
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="w-2/3">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Selecciona un hilo de email</CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center justify-center h-64 text-gray-400">
                        <div className="text-center">
                          <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                          <p>Selecciona un hilo de email para ver los detalles</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight" style={{ color: TRUSTPORT_COLORS.textStrong }}>
          Actividades
        </h1>
        <p className="text-[14px]" style={{ color: TRUSTPORT_COLORS.textMuted }}>
          Inbox omnicanal con triage de IA, asignación, SLA y handoff a humano.
        </p>
      </div>

      {/* AI Insights Panel */}
      <AIInsightsPanel activeTab={activeTab} />

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'outline'}
            onClick={() => setActiveTab(tab.id)}
            style={{ 
              backgroundColor: activeTab === tab.id ? TRUSTPORT_COLORS.primary : 'transparent',
              borderColor: TRUSTPORT_COLORS.primary,
              color: activeTab === tab.id ? 'white' : TRUSTPORT_COLORS.primary
            }}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
}
