
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { leadsList } from '@/api/functions';
import { 
  Plus, Search, Eye, Edit3, MoreHorizontal, User, AlertTriangle, 
  Zap, TrendingUp, Target, Clock
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
const AIInsightsPanel = () => {
  const insightCards = [
    { 
      id: 'lead_scoring', 
      icon: Target, 
      title: 'Lead Scoring Alto', 
      desc: '8 leads con score >80 requieren contacto inmediato.', 
      cta: { label: 'Contactar Leads', action: () => alert('Contactar Leads de Alto Score') } 
    },
    { 
      id: 'conversion_optimization', 
      icon: TrendingUp, 
      title: 'Optimizar Conversión', 
      desc: 'Sector Textil tiene tasa 45% mayor. Enfocar prospección.', 
      cta: { label: 'Ver Sectores', action: () => alert('Ver Análisis por Sector') } 
    },
    { 
      id: 'follow_up_automation', 
      icon: Clock, 
      title: 'Follow-up Automático', 
      desc: '12 leads sin actividad en 5 días. Activar secuencia.', 
      cta: { label: 'Activar Secuencia', action: () => alert('Activar Secuencia de Follow-up') } 
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

export default function ClientesLeads() {
  const [activeView, setActiveView] = useState('leads');
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Gestión de Leads | Trustport';
    loadLeads();
  }, []);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const res = await leadsList();
      setLeads(res.data?.items || []);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const mockLeads = [
    {
      id: 1,
      company: 'Textil France SARL',
      country: 'Francia',
      potential: 28500,
      stage: 'Nuevo',
      probability: 60,
      owner: 'María López',
      nextAction: 'Envío cotización 29/8/2025',
      avatar: 'ML'
    },
    {
      id: 2,
      company: 'FoodTech Peru SAC',
      country: 'Perú',
      potential: 45000,
      stage: 'Calificado',
      probability: 75,
      owner: 'Ana García',
      nextAction: 'Presentación técnica 30/8/2025',
      avatar: 'A'
    },
    {
      id: 3,
      company: 'German Auto Parts GmbH',
      country: 'Alemania',
      potential: 67200,
      stage: 'Propuesta',
      probability: 85,
      owner: 'Carlos Ruiz',
      nextAction: 'Revisión contrato 28/8/2025',
      avatar: 'C'
    },
    {
      id: 4,
      company: 'Milano Fashion House SRL',
      country: 'Italia',
      potential: 52000,
      stage: 'Nuevo',
      probability: 50,
      owner: 'Ana García',
      nextAction: 'Demo técnico 31/8/2025',
      avatar: 'A'
    }
  ];

  const getStageColor = (stage) => {
    switch (stage) {
      case 'Nuevo': return 'bg-blue-100 text-blue-800';
      case 'Calificado': return 'bg-purple-100 text-purple-800';
      case 'Propuesta': return 'bg-orange-100 text-orange-800';
      case 'Negociación': return 'bg-yellow-100 text-yellow-800';
      case 'Cierre': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProbabilityColor = (probability) => {
    if (probability >= 80) return 'text-green-600';
    if (probability >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight" style={{ color: TRUSTPORT_COLORS.textStrong }}>
          Gestión de Leads
        </h1>
        <p className="text-[14px]" style={{ color: TRUSTPORT_COLORS.textMuted }}>
          Captura, calificación y seguimiento de nuevos prospectos comerciales.
        </p>
      </div>

      {/* AI Insights Panel */}
      <AIInsightsPanel />

      {/* View Selector */}
      <div className="flex space-x-4 mb-6">
        <Button
          variant={activeView === 'leads' ? 'default' : 'outline'}
          onClick={() => setActiveView('leads')}
          style={{ 
            backgroundColor: activeView === 'leads' ? TRUSTPORT_COLORS.primary : 'transparent',
            borderColor: TRUSTPORT_COLORS.primary,
            color: activeView === 'leads' ? 'white' : TRUSTPORT_COLORS.primary
          }}
        >
          Leads
        </Button>
        <Button
          variant={activeView === 'pipeline' ? 'default' : 'outline'}
          onClick={() => setActiveView('pipeline')}
          style={{ 
            backgroundColor: activeView === 'pipeline' ? TRUSTPORT_COLORS.primary : 'transparent',
            borderColor: TRUSTPORT_COLORS.primary,
            color: activeView === 'pipeline' ? 'white' : TRUSTPORT_COLORS.primary
          }}
        >
          Pipeline
        </Button>
      </div>

      {activeView === 'leads' ? (
        <Card style={{ borderRadius: '16px', boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Lista de Leads</CardTitle>
            <Button style={{ backgroundColor: TRUSTPORT_COLORS.primary }}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Lead
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <Input 
                placeholder="Buscar leads..." 
                className="flex-1"
                style={{ borderRadius: '8px' }}
              />
              <Select defaultValue="todos">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="nuevo">Nuevo</SelectItem>
                  <SelectItem value="calificado">Calificado</SelectItem>
                  <SelectItem value="propuesta">Propuesta</SelectItem>
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
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Empresa</th>
                    <th className="text-left py-3 px-4">País</th>
                    <th className="text-left py-3 px-4">Monto Potencial</th>
                    <th className="text-left py-3 px-4">Etapa</th>
                    <th className="text-left py-3 px-4">Probabilidad</th>
                    <th className="text-left py-3 px-4">Propietario</th>
                    <th className="text-left py-3 px-4">Próxima Acción</th>
                    <th className="text-left py-3 px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {mockLeads.map((lead) => (
                    <tr key={lead.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">{lead.company}</td>
                      <td className="py-4 px-4">{lead.country}</td>
                      <td className="py-4 px-4">€{lead.potential.toLocaleString()}</td>
                      <td className="py-4 px-4">
                        <Badge className={getStageColor(lead.stage)}>
                          {lead.stage}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <span className={getProbabilityColor(lead.probability)}>
                          {lead.probability}%
                        </span>
                      </td>
                      <td className="py-4 px-4">{lead.owner}</td>
                      <td className="py-4 px-4 text-sm">{lead.nextAction}</td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
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
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-5 gap-6">
            {/* Pipeline columns */}
            {['Nuevo', 'Calificado', 'Propuesta', 'Negociación', 'Cierre'].map((stage, index) => {
              const stageLeads = mockLeads.filter(lead => lead.stage === stage);
              const stageCounts = { 'Nuevo': 2, 'Calificado': 1, 'Propuesta': 1, 'Negociación': 0, 'Cierre': 0 };
              
              return (
                <Card key={stage} style={{ borderRadius: '16px', minHeight: '500px' }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{stage}</CardTitle>
                      <Badge variant="secondary">{stageCounts[stage] || 0}/{stageCounts[stage] || 0}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {stageLeads.map((lead) => (
                      <Card key={lead.id} className="p-4 border-2 border-red-200">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm">{lead.company}</h4>
                          <p className="text-sm text-gray-600">{lead.country}</p>
                          <div className="text-lg font-bold">€{lead.potential.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">
                            Próximo: {lead.nextAction.split(' ').slice(0, 2).join(' ')} {lead.nextAction.split(' ').slice(-1)[0]}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center">
                              {lead.avatar}
                            </div>
                            <span className="text-xs">{lead.owner}</span>
                            <span className="text-xs text-green-600 ml-auto">{lead.probability}%</span>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1 text-xs">
                              Actividad
                            </Button>
                            <Button size="sm" className="flex-1 text-xs" style={{ backgroundColor: TRUSTPORT_COLORS.primary }}>
                              {stage === 'Nuevo' ? 'Seguimiento' : 'Ganar'}
                            </Button>
                          </div>
                          <Button variant="ghost" size="sm" className="w-full">
                            <Eye className="w-3 h-3 mr-1" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
