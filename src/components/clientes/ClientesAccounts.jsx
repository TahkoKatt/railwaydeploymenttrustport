
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { clientesList } from '@/api/functions';
import { contactosList } from '@/api/functions';
import { 
  Users, Plus, Filter, Search, MoreHorizontal, AlertTriangle, 
  Zap, Tag, TrendingUp, Clock, Eye
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

// AI Insights Panel Component
const AIInsightsPanel = () => {
  const insightCards = [
    { 
      id: 'health_score_risk', 
      icon: AlertTriangle, 
      title: 'Health Score Crítico', 
      desc: '3 clientes con Health Score bajo requieren atención inmediata.', 
      cta: { label: 'Revisar Cuentas', action: () => alert('Revisar Cuentas en Riesgo') } 
    },
    { 
      id: 'upsell_opportunity', 
      icon: TrendingUp, 
      title: 'Oportunidad Up-sell', 
      desc: '5 clientes con potencial de expansión detectados por IA.', 
      cta: { label: 'Ver Oportunidades', action: () => alert('Ver Oportunidades Up-sell') } 
    },
    { 
      id: 'overdue_follow_up', 
      icon: Clock, 
      title: 'Follow-ups Vencidos', 
      desc: '7 cuentas sin actividad en +30 días necesitan seguimiento.', 
      cta: { label: 'Programar Follow-up', action: () => alert('Programar Follow-up') } 
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

export default function ClientesAccounts() {
  const [activeTab, setActiveTab] = useState('cuentas');
  const [accounts, setAccounts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    sector: 'all',
    country: 'all'
  });

  useEffect(() => {
    document.title = 'Gestión de Cuentas | Trustport';
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [accountsRes, contactsRes] = await Promise.all([
        clientesList(),
        contactosList()
      ]);
      
      setAccounts(accountsRes.data?.items || []);
      setContacts(contactsRes.data?.items || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthScoreColor = (score) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-500';
    if (score >= 4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getHealthScoreText = (score) => {
    if (score >= 8) return `${score}/10`;
    if (score >= 6) return `${score}/10`;
    if (score >= 4) return `${score}/10`;
    return `${score}/10`;
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
       <div className="mb-6">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight" style={{ color: TRUSTPORT_COLORS.textStrong }}>
          Gestión de Cuentas
        </h1>
        <p className="text-[14px] text-gray-600">Maestro de clientes y contactos.</p>
      </div>

      {/* AI Insights Panel */}
      <AIInsightsPanel />

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <Button
          variant={activeTab === 'cuentas' ? 'default' : 'outline'}
          onClick={() => setActiveTab('cuentas')}
          style={{ 
            backgroundColor: activeTab === 'cuentas' ? TRUSTPORT_COLORS.primary : 'transparent',
            borderColor: TRUSTPORT_COLORS.primary,
            color: activeTab === 'cuentas' ? 'white' : TRUSTPORT_COLORS.primary
          }}
        >
          Cuentas
        </Button>
        <Button
          variant={activeTab === 'contactos' ? 'default' : 'outline'}
          onClick={() => setActiveTab('contactos')}
          style={{ 
            backgroundColor: activeTab === 'contactos' ? TRUSTPORT_COLORS.primary : 'transparent',
            borderColor: TRUSTPORT_COLORS.primary,
            color: activeTab === 'contactos' ? 'white' : TRUSTPORT_COLORS.primary
          }}
        >
          Contactos
        </Button>
      </div>

      {/* Content */}
      {activeTab === 'cuentas' ? (
        <Card style={{ borderRadius: '16px', boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle className="text-xl font-semibold" style={{ color: TRUSTPORT_COLORS.textStrong }}>
                Cuentas
              </CardTitle>
              <div className="flex items-center gap-2">
                <Select value="all">
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Todas las cuentas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las cuentas</SelectItem>
                    <SelectItem value="active">Activas</SelectItem>
                    <SelectItem value="inactive">Inactivas</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
              </div>
            </div>
            <Button style={{ backgroundColor: TRUSTPORT_COLORS.primary }}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Cuenta
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cuenta</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>País</TableHead>
                  <TableHead>DSO</TableHead>
                  <TableHead>Health Score</TableHead>
                  <TableHead>AR Pendiente</TableHead>
                  <TableHead>Últ. actividad</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Credit Hold</TableHead>
                  <TableHead>Oportunidades</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.slice(0, 10).map((account, index) => (
                  <TableRow key={account.id || index}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
                          {account.name?.charAt(0)?.toUpperCase() || 'T'}
                        </div>
                        <div>
                          <div className="font-medium">{account.name || `Textiles Barcelona SA`}</div>
                          <div className="text-sm text-gray-500">Cliente</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>Textil</TableCell>
                    <TableCell>España</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">25d</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getHealthScoreColor(8.5)}`}></div>
                        8.5/10
                      </div>
                    </TableCell>
                    <TableCell>€15,430.5</TableCell>
                    <TableCell>hace 3d</TableCell>
                    <TableCell>Ana García</TableCell>
                    <TableCell>
                      <Badge variant="outline">2</Badge>
                    </TableCell>
                    <TableCell>€45,000</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card style={{ borderRadius: '16px', boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-semibold" style={{ color: TRUSTPORT_COLORS.textStrong }}>
              Contactos
            </CardTitle>
            <Button style={{ backgroundColor: TRUSTPORT_COLORS.primary }}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Contacto
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <Input 
                placeholder="Buscar contactos..." 
                className="flex-1"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
              <Select value="all">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Todas las Cuentas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las Cuentas</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">Limpiar</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Cuenta</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Idioma</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Últ. interacción</TableHead>
                  <TableHead>NPS</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.slice(0, 5).map((contact, index) => (
                  <TableRow key={contact.id || index}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                        Ana García Martín
                      </div>
                    </TableCell>
                    <TableCell>Textiles Barcelona SA</TableCell>
                    <TableCell>ana.garcia@textiles.com</TableCell>
                    <TableCell>+34 93 123 4567</TableCell>
                    <TableCell>Directora Compras</TableCell>
                    <TableCell>Español</TableCell>
                    <TableCell>Ana García</TableCell>
                    <TableCell>
                      <Badge className="bg-blue-100 text-blue-800">✓ Sí</Badge>
                    </TableCell>
                    <TableCell>hace 2d</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">9/10</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
