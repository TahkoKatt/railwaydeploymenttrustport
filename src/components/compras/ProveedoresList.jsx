import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, Filter, Eye, Star, Building2, BadgeCheck, AlertTriangle, 
  Banknote, FileCheck2, TableIcon, UserPlus, Upload, Download,
  ClipboardCheck, FileSpreadsheet, Megaphone, MessageCircle, Ban,
  ChevronDown, ChevronUp, TrendingUp, Calendar, FileText, Shield
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";

const StatCard = ({ title, value, icon: Icon, colorToken, trend, suffix, prefix }) => {
  const colors = {
    success: "#00A878",
    info: "#6C7DF7", 
    warning: "#FFC857",
    danger: "#E63946",
    primary: "#4472C4"
  };

  const color = colors[colorToken] || colors.primary;

  return (
    <Card
      className="bg-white border transition-all hover:shadow-lg"
      style={{
        boxShadow: '0 8px 24px rgba(0,0,0,.08)',
        borderRadius: '16px',
        borderColor: '#E5E7EB'
      }}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[12px] font-medium" style={{ color: '#6B7280', fontFamily: 'Montserrat, sans-serif' }}>
              {title}
            </p>
            <p className="text-[22px] font-semibold mt-1" style={{ fontFamily: 'Montserrat, sans-serif', color: '#1F2937' }}>
              {prefix}{typeof value === 'number' ? value.toLocaleString('es-ES') : value}{suffix || ''}
            </p>
          </div>
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
            <Icon className="w-5 h-5" style={{ color: color }} />
          </div>
        </div>
        {trend && (
          <div className="flex items-center mt-2 text-[12px] font-medium" style={{ color: '#00A878' }}>
            <TrendingUp className="w-3 h-3 mr-1" />
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const StarRating = ({ score }) => {
  const fullStars = Math.floor(score);
  const hasHalfStar = score % 1 >= 0.5;
  
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= fullStars
              ? 'fill-yellow-400 text-yellow-400'
              : star === fullStars + 1 && hasHalfStar
              ? 'fill-yellow-200 text-yellow-400'
              : 'text-gray-300'
          }`}
        />
      ))}
      <span className="text-sm font-medium ml-1">{score.toFixed(1)}</span>
    </div>
  );
};

const getStatusBadge = (status) => {
  const configs = {
    "Activo": { color: "bg-green-100 text-green-800" },
    "Suspendido": { color: "bg-red-100 text-red-800" },
    "En Onboarding": { color: "bg-blue-100 text-blue-800" },
  };
  return configs[status] || configs["Activo"];
};

const getRiskBadge = (riskScore) => {
  if (riskScore <= 30) return { color: "bg-green-100 text-green-800", label: "Bajo" };
  if (riskScore <= 60) return { color: "bg-yellow-100 text-yellow-800", label: "Medio" };
  return { color: "bg-red-100 text-red-800", label: "Alto" };
};

export default function ProveedoresList() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [detailDrawer, setDetailDrawer] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    category: 'all',
    country: 'all',
    risk: 'all'
  });

  // Mock data según seed_data del patch
  useEffect(() => {
    loadSuppliersData();
  }, []);

  const loadSuppliersData = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockSuppliers = [
      {
        code: "S001",
        name: "Transportes SA",
        category: "Logística",
        country: "ES",
        currency: "EUR",
        status: "Activo",
        score: 4.7,
        on_time_90d: 94.2,
        spend_ytd: 235000,
        contracts_ok: 100,
        last_purchase: "2025-08-15",
        risk_score: 18,
        buyer: "Ana Gómez",
        contact: { name: "Marta Vidal", email: "marta@transportes-sa.es", phone: "+34 600 111 111" }
      },
      {
        code: "S002",
        name: "Global Logistics SL",
        category: "Logística",
        country: "PT",
        currency: "EUR",
        status: "Activo",
        score: 4.4,
        on_time_90d: 90.1,
        spend_ytd: 178300,
        contracts_ok: 92,
        last_purchase: "2025-08-26",
        risk_score: 24,
        buyer: "Ana Gómez"
      },
      {
        code: "S003",
        name: "ElectroParts Iberia",
        category: "Electrónicos",
        country: "ES",
        currency: "EUR",
        status: "Activo",
        score: 4.6,
        on_time_90d: 96.3,
        spend_ytd: 422000,
        contracts_ok: 88,
        last_purchase: "2025-08-28",
        risk_score: 21,
        buyer: "Luis Pérez",
        contact: { name: "Héctor Rivas", email: "hector@electroparts.es", phone: "+34 600 222 222" }
      },
      {
        code: "S006",
        name: "Tech Widgets Co.",
        category: "Componentes",
        country: "DE",
        currency: "EUR",
        status: "Activo",
        score: 4.8,
        on_time_90d: 97.5,
        spend_ytd: 510000,
        contracts_ok: 95,
        last_purchase: "2025-08-30",
        risk_score: 15,
        buyer: "Luis Pérez",
        contact: { name: "Sabine Koch", email: "sabine@techwidgets.de", phone: "+49 160 3333333" }
      },
      {
        code: "S008",
        name: "Textiles Andinos",
        category: "Textiles",
        country: "PE",
        currency: "USD",
        status: "En Onboarding",
        score: 3.9,
        on_time_90d: 0,
        spend_ytd: 0,
        contracts_ok: 0,
        last_purchase: null,
        risk_score: 30,
        buyer: "María Ortega"
      },
      {
        code: "S010",
        name: "Servicios Máquinas BCN",
        category: "MRO / Mantenimiento",
        country: "ES",
        currency: "EUR",
        status: "Suspendido",
        score: 3.2,
        on_time_90d: 72.4,
        spend_ytd: 42000,
        contracts_ok: 60,
        last_purchase: "2025-07-10",
        risk_score: 70,
        buyer: "Carlos Núñez"
      }
    ];

    setSuppliers(mockSuppliers);
    setLoading(false);
  };

  // KPIs calculados
  const kpis = {
    active: suppliers.filter(s => s.status === 'Activo').length,
    avg_score: suppliers.length > 0 ? (suppliers.reduce((sum, s) => sum + s.score, 0) / suppliers.length) : 0,
    otif_12m: suppliers.length > 0 ? (suppliers.reduce((sum, s) => sum + s.on_time_90d, 0) / suppliers.length) : 0,
    high_risk: suppliers.filter(s => s.risk_score > 60).length,
    spend_ytd: suppliers.reduce((sum, s) => sum + s.spend_ytd, 0),
    contracts_ok_pct: suppliers.length > 0 ? (suppliers.reduce((sum, s) => sum + s.contracts_ok, 0) / suppliers.length) : 0,
    tariff_coverage_pct: 85.2
  };

  // Filtrar proveedores
  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = !filters.search ||
      supplier.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      supplier.code.toLowerCase().includes(filters.search.toLowerCase()) ||
      supplier.category.toLowerCase().includes(filters.search.toLowerCase());

    const matchesStatus = filters.status === 'all' || supplier.status === filters.status;
    const matchesCategory = filters.category === 'all' || supplier.category === filters.category;
    const matchesCountry = filters.country === 'all' || supplier.country === filters.country;
    
    let matchesRisk = true;
    if (filters.risk !== 'all') {
      const riskLevel = supplier.risk_score <= 30 ? 'bajo' : supplier.risk_score <= 60 ? 'medio' : 'alto';
      matchesRisk = riskLevel === filters.risk;
    }

    return matchesSearch && matchesStatus && matchesCategory && matchesCountry && matchesRisk;
  });

  const handleSupplierAction = (action, supplier) => {
    switch(action) {
      case 'view':
        setDetailDrawer(supplier);
        break;
      case 'evaluate':
        toast.success(`Iniciando evaluación scorecard para ${supplier.name}`);
        break;
      case 'contracts':
        toast.success(`Abriendo contratos y tarifario de ${supplier.name}`);
        break;
      case 'invite_rfq':
        toast.success(`${supplier.name} invitado a RFQ actual`);
        break;
      case 'message':
        toast.success(`Abriendo chat con ${supplier.name}`);
        break;
      case 'block':
        const newStatus = supplier.status === 'Suspendido' ? 'Activo' : 'Suspendido';
        toast.success(`${supplier.name} ${newStatus.toLowerCase()}`);
        break;
      default:
        toast.info(`Acción ${action} en ${supplier.name}`);
    }
  };

  const handleBulkAction = (action) => {
    if (selectedSuppliers.length === 0) {
      toast.error('Selecciona al menos un proveedor');
      return;
    }
    
    switch(action) {
      case 'bulk_invite_rfq':
        toast.success(`${selectedSuppliers.length} proveedores invitados a RFQ`);
        break;
      case 'bulk_export':
        toast.success(`Exportando ${selectedSuppliers.length} proveedores`);
        break;
    }
    setSelectedSuppliers([]);
  };

  const renderSupplierDetail = () => {
    if (!detailDrawer) return null;

    return (
      <Sheet open={!!detailDrawer} onOpenChange={() => setDetailDrawer(null)}>
        <SheetContent className="w-[600px] sm:w-[800px]">
          <SheetHeader>
            <SheetTitle>{detailDrawer.name}</SheetTitle>
            <SheetDescription>
              {detailDrawer.code} • {detailDrawer.category} • {detailDrawer.country}
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6">
            <Tabs defaultValue="profile">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile">Perfil</TabsTrigger>
                <TabsTrigger value="documents">Documentos</TabsTrigger>
                <TabsTrigger value="evaluations">Evaluaciones</TabsTrigger>
                <TabsTrigger value="risk">Riesgo (IA)</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Datos Básicos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><strong>Código:</strong> {detailDrawer.code}</div>
                      <div><strong>Estado:</strong> 
                        <Badge className={`ml-2 ${getStatusBadge(detailDrawer.status).color}`}>
                          {detailDrawer.status}
                        </Badge>
                      </div>
                      <div><strong>Categoría:</strong> {detailDrawer.category}</div>
                      <div><strong>País:</strong> {detailDrawer.country}</div>
                      <div><strong>Moneda:</strong> {detailDrawer.currency}</div>
                      <div><strong>Comprador:</strong> {detailDrawer.buyer}</div>
                    </div>
                  </CardContent>
                </Card>

                {detailDrawer.contact && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Contacto Principal</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div><strong>Nombre:</strong> {detailDrawer.contact.name}</div>
                        <div><strong>Email:</strong> {detailDrawer.contact.email}</div>
                        <div><strong>Teléfono:</strong> {detailDrawer.contact.phone}</div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Métricas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><strong>Score:</strong> <StarRating score={detailDrawer.score} /></div>
                      <div><strong>On-time (90d):</strong> {detailDrawer.on_time_90d}%</div>
                      <div><strong>Spend YTD:</strong> €{detailDrawer.spend_ytd.toLocaleString('es-ES')}</div>
                      <div><strong>Contratos OK:</strong> {detailDrawer.contracts_ok}%</div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Documentos & Certificaciones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div>
                          <p className="font-medium">ISO 9001</p>
                          <p className="text-sm text-gray-600">Vence: 01/09/2026</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Vigente</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div>
                          <p className="font-medium">Seguro Responsabilidad Civil</p>
                          <p className="text-sm text-gray-600">Vence: 31/12/2025</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Vigente</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="evaluations" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Evaluación Q2 2025</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Calidad:</span>
                        <span className="font-medium">4.8/5.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Entrega:</span>
                        <span className="font-medium">4.6/5.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Servicio:</span>
                        <span className="font-medium">4.7/5.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cumplimiento:</span>
                        <span className="font-medium">4.9/5.0</span>
                      </div>
                      <hr />
                      <div className="flex justify-between font-semibold">
                        <span>Overall:</span>
                        <span>4.75/5.0</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="risk" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Análisis de Riesgo (IA)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Score de Riesgo:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{detailDrawer.risk_score}/100</span>
                          <Badge className={getRiskBadge(detailDrawer.risk_score).color}>
                            {getRiskBadge(detailDrawer.risk_score).label}
                          </Badge>
                        </div>
                      </div>
                      <Progress value={detailDrawer.risk_score} className="h-2" />
                      
                      <div className="space-y-2">
                        <h4 className="font-semibold">Señales Detectadas:</h4>
                        {detailDrawer.risk_score <= 30 ? (
                          <div className="flex items-center gap-2 text-green-700">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm">Documentos válidos y actualizados</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-yellow-700">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span className="text-sm">Revisión recomendada</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>
    );
  };

  return (
    <div className="space-y-6">
      {/* KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <StatCard
          title="Proveedores Activos"
          value={kpis.active}
          icon={Building2}
          colorToken="success"
          trend="+2 este mes"
        />
        <StatCard
          title="Score Promedio"
          value={kpis.avg_score.toFixed(1)}
          icon={Star}
          colorToken="info"
          trend="+0.3 vs anterior"
        />
        <StatCard
          title="OTIF 12m"
          value={kpis.otif_12m.toFixed(1)}
          suffix="%"
          icon={BadgeCheck}
          colorToken="warning"
          trend="-2.3%"
        />
        <StatCard
          title="Riesgos Altos"
          value={kpis.high_risk}
          icon={AlertTriangle}
          colorToken="danger"
          trend="-1 este mes"
        />
        <StatCard
          title="Spend YTD"
          value={Math.round(kpis.spend_ytd / 1000)}
          prefix="€"
          suffix="K"
          icon={Banknote}
          colorToken="primary"
          trend="+15% vs año"
        />
        <StatCard
          title="Contratos al día"
          value={kpis.contracts_ok_pct.toFixed(0)}
          suffix="%"
          icon={FileCheck2}
          colorToken="success"
          trend="Buena salud"
        />
        <StatCard
          title="Cobertura Tarifario"
          value={kpis.tariff_coverage_pct}
          suffix="%"
          icon={TableIcon}
          colorToken="info"
          trend="+5% este mes"
        />
      </div>

      {/* Filtros */}
      <Card style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="col-span-full lg:col-span-2 relative">
              <Search className="w-4 h-4 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Buscar proveedor, contacto, categoría..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-8"
              />
            </div>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Activo">Activo</SelectItem>
                <SelectItem value="Suspendido">Suspendido</SelectItem>
                <SelectItem value="En Onboarding">En Onboarding</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.category}
              onValueChange={(value) => setFilters({ ...filters, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="Logística">Logística</SelectItem>
                <SelectItem value="Electrónicos">Electrónicos</SelectItem>
                <SelectItem value="Componentes">Componentes</SelectItem>
                <SelectItem value="Textiles">Textiles</SelectItem>
                <SelectItem value="MRO / Mantenimiento">MRO / Mantenimiento</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.country}
              onValueChange={(value) => setFilters({ ...filters, country: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="País" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ES">España</SelectItem>
                <SelectItem value="PT">Portugal</SelectItem>
                <SelectItem value="DE">Alemania</SelectItem>
                <SelectItem value="PE">Perú</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.risk}
              onValueChange={(value) => setFilters({ ...filters, risk: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Riesgo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="bajo">Bajo</SelectItem>
                <SelectItem value="medio">Medio</SelectItem>
                <SelectItem value="alto">Alto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Acciones Masivas */}
      {selectedSuppliers.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedSuppliers.length} proveedor(es) seleccionado(s)
              </span>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleBulkAction('bulk_invite_rfq')}
                  style={{ backgroundColor: '#FFFFFF', color: '#4472C4', border: '2px solid #4472C4' }}
                  className="hover:bg-gray-50"
                  size="sm"
                >
                  <Megaphone className="w-4 h-4 mr-2" />
                  Invitar a RFQ
                </Button>
                <Button
                  onClick={() => handleBulkAction('bulk_export')}
                  style={{ backgroundColor: '#FFFFFF', color: '#4472C4', border: '2px solid #4472C4' }}
                  className="hover:bg-gray-50"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla de Proveedores */}
      <Card style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
        <CardHeader>
          <CardTitle>Directorio de Proveedores</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox 
                    checked={selectedSuppliers.length === filteredSuppliers.length && filteredSuppliers.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedSuppliers(filteredSuppliers.map(s => s.code));
                      } else {
                        setSelectedSuppliers([]);
                      }
                    }}
                  />
                </TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>País</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>On-time (90d)</TableHead>
                <TableHead>Spend YTD</TableHead>
                <TableHead>Contratos OK</TableHead>
                <TableHead>Última Compra</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-8 text-gray-500">
                    Sin proveedores con estos filtros. Modifica filtros o invita un proveedor.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSuppliers.map((supplier) => {
                  const statusConfig = getStatusBadge(supplier.status);
                  const isSelected = selectedSuppliers.includes(supplier.code);
                  
                  return (
                    <TableRow key={supplier.code} className={isSelected ? "bg-blue-50" : ""}>
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedSuppliers([...selectedSuppliers, supplier.code]);
                            } else {
                              setSelectedSuppliers(selectedSuppliers.filter(id => id !== supplier.code));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{supplier.code}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{supplier.name}</p>
                          {supplier.contact && (
                            <p className="text-xs text-gray-500">{supplier.contact.name}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{supplier.category}</TableCell>
                      <TableCell>{supplier.country}</TableCell>
                      <TableCell>
                        <StarRating score={supplier.score} />
                      </TableCell>
                      <TableCell className="text-right">{supplier.on_time_90d}%</TableCell>
                      <TableCell className="text-right">€{supplier.spend_ytd.toLocaleString('es-ES')}</TableCell>
                      <TableCell className="text-right">{supplier.contracts_ok}%</TableCell>
                      <TableCell>
                        {supplier.last_purchase ? new Date(supplier.last_purchase).toLocaleDateString('es-ES') : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig.color}>
                          {supplier.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSupplierAction('view', supplier)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <ChevronDown className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleSupplierAction('evaluate', supplier)}>
                                <ClipboardCheck className="mr-2 h-4 w-4" />
                                Evaluar (Scorecard)
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSupplierAction('contracts', supplier)}>
                                <FileSpreadsheet className="mr-2 h-4 w-4" />
                                Contratos/Tarifario
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSupplierAction('invite_rfq', supplier)}>
                                <Megaphone className="mr-2 h-4 w-4" />
                                Invitar a RFQ
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSupplierAction('message', supplier)}>
                                <MessageCircle className="mr-2 h-4 w-4" />
                                Mensajes
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleSupplierAction('block', supplier)}
                                className="text-red-600"
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                {supplier.status === 'Suspendido' ? 'Desbloquear' : 'Bloquear'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Drawer */}
      {renderSupplierDetail()}
    </div>
  );
}