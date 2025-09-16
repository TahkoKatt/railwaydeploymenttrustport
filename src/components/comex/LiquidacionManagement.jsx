import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search, Plus, MoreHorizontal, Eye, Download, FileText, CheckCircle, Clock, AlertCircle
} from 'lucide-react';

const mockLiquidacionData = [
  {
    id: "liq-001",
    expediente: "SI-ES-20319",
    codigo: "SETT-2025-001",
    cliente: "Textiles Barcelona SA",
    ingresos: 18750.00,
    costos: 12340.50,
    margen: 6409.50,
    margenPct: 34.2,
    estado: "Pendiente Aprobación",
    vencimiento: "26/9/2025",
    currency: "€",
    desglose: {
      ingresos: [
        { concepto: "Freight Charge", monto: 15000.00 },
        { concepto: "Documentation Fee", monto: 250.00 },
        { concepto: "Handling Surcharge", monto: 500.00 },
        { concepto: "Fuel Adjustment", monto: 1500.00 },
        { concepto: "Security Fee", monto: 1500.00 }
      ],
      costos: [
        { concepto: "Freight", proveedor: "MSC", monto: 3170.00 },
        { concepto: "THC Origin", proveedor: "Valencia Terminal", monto: 450.00 },
        { concepto: "Documentation", proveedor: "Docs Express", monto: 125.00 },
        { concepto: "Customs Clearance", proveedor: "Customs Agent", monto: 275.00 },
        { concepto: "Delivery", proveedor: "Local Transport", monto: 340.50 },
        { concepto: "Insurance", proveedor: "Marine Insurance Co", monto: 187.50 },
        { concepto: "Bank Charges", proveedor: "BBVA", monto: 45.00 },
        { concepto: "Agent Commission", proveedor: "NY Agent", monto: 750.00, nota: "@10%" }
      ]
    },
    workflow: {
      operaciones: { status: "completed", fecha: "25/8/2025, 18:30:00", responsable: "Ana García" },
      finanzas: { status: "pending", fecha: null, responsable: null },
      gerente: { status: "pending", fecha: null, responsable: null }
    },
    notas: "Pending final delivery confirmation for local transport costs"
  },
  {
    id: "liq-002",
    expediente: "SI-PE-90112", 
    codigo: "SETT-2025-002",
    cliente: "European Coffee SL",
    ingresos: 12500.00,
    costos: 8750.25,
    margen: 3749.75,
    margenPct: 30.0,
    estado: "Aprobado",
    vencimiento: "27/9/2025",
    currency: "€"
  },
  {
    id: "liq-003",
    expediente: "SI-MX-45678",
    codigo: "SETT-2025-003", 
    cliente: "Decoración Europa SL",
    ingresos: 8500.00,
    costos: 7200.00,
    margen: 1300.00,
    margenPct: 15.3,
    estado: "Bloqueado",
    vencimiento: "27/9/2025",
    currency: "€",
    nota: "Customs hold - additional permits required"
  }
];

const LiquidacionDetailModal = ({ liquidacion, isOpen, onClose }) => {
    if (!liquidacion) return null;

    const getWorkflowIcon = (status) => {
        switch(status) {
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'pending':
                return <Clock className="w-5 h-5 text-yellow-500" />;
            default:
                return <AlertCircle className="w-5 h-5 text-gray-400" />;
        }
    };

    const getWorkflowText = (step) => {
        if (step.status === 'completed') {
            return `${step.responsable} • ${step.fecha}`;
        }
        return step.status === 'pending' ? 'Pendiente' : 'No iniciado';
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div>
                                <h2 className="text-lg font-semibold">Expediente</h2>
                                <p className="text-blue-600 font-medium">{liquidacion.expediente}</p>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold">Cliente</h2>
                                <p className="font-medium">{liquidacion.cliente}</p>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold">Margen</h2>
                                <p className="text-green-600 font-bold text-lg">
                                    {liquidacion.currency}{liquidacion.margen?.toLocaleString()} ({liquidacion.margenPct}%)
                                </p>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold">Estado</h2>
                                <Badge className="bg-yellow-100 text-yellow-800">{liquidacion.estado}</Badge>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-4">
                    {/* Ingresos */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">
                            Ingresos ({liquidacion.currency}{liquidacion.ingresos?.toLocaleString()})
                        </h3>
                        {liquidacion.desglose?.ingresos && (
                            <div className="space-y-3">
                                {liquidacion.desglose.ingresos.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-gray-700">{item.concepto}</span>
                                        <span className="font-semibold">{liquidacion.currency}{item.monto.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Costos */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">
                            Costos ({liquidacion.currency}{liquidacion.costos?.toLocaleString()})
                        </h3>
                        {liquidacion.desglose?.costos && (
                            <div className="space-y-3">
                                {liquidacion.desglose.costos.map((item, index) => (
                                    <div key={index} className="py-2 border-b border-gray-100">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                                                <span className="font-medium">{item.concepto}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-semibold">{liquidacion.currency}{item.monto.toLocaleString()}</span>
                                                {item.nota && <span className="text-xs text-gray-500 ml-1">{item.nota}</span>}
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 ml-4">{item.proveedor}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Workflow de Aprobación */}
                {liquidacion.workflow && (
                    <div className="mt-6 border-t pt-6">
                        <h3 className="text-lg font-semibold mb-4">Workflow de Aprobación</h3>
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-3">
                                {getWorkflowIcon(liquidacion.workflow.operaciones.status)}
                                <div>
                                    <p className="font-medium">Revisión Operaciones</p>
                                    <p className="text-xs text-gray-500">
                                        {getWorkflowText(liquidacion.workflow.operaciones)}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                {getWorkflowIcon(liquidacion.workflow.finanzas.status)}
                                <div>
                                    <p className="font-medium">Revisión Finanzas</p>
                                    <p className="text-xs text-gray-500">
                                        {getWorkflowText(liquidacion.workflow.finanzas)}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                {getWorkflowIcon(liquidacion.workflow.gerente.status)}
                                <div>
                                    <p className="font-medium">Aprobación Gerente</p>
                                    <p className="text-xs text-gray-500">
                                        {getWorkflowText(liquidacion.workflow.gerente)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Notas */}
                {liquidacion.notas && (
                    <div className="mt-6 border-t pt-6">
                        <h3 className="text-lg font-semibold mb-2">Notas</h3>
                        <div className="bg-gray-50 p-3 rounded-md">
                            <p className="text-sm">{liquidacion.notas}</p>
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-3 mt-6 border-t pt-4">
                    <Button variant="outline" onClick={onClose}>Cerrar</Button>
                    <Button style={{ backgroundColor: '#4472C4', color: 'white' }}>
                        <Download className="w-4 h-4 mr-2" />
                        Exportar PDF
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const CreateLiquidacionModal = ({ isOpen, onClose, onCreate }) => {
    const [expediente, setExpediente] = useState('');
    const [cliente, setCliente] = useState('');
    const [ingresos, setIngresos] = useState('');
    const [costos, setCostos] = useState('');

    const handleCreate = () => {
        if (!expediente || !cliente || !ingresos || !costos) {
            alert('Por favor complete todos los campos');
            return;
        }

        const nuevaLiquidacion = {
            id: `liq-${Date.now()}`,
            expediente,
            cliente,
            ingresos: parseFloat(ingresos),
            costos: parseFloat(costos),
            margen: parseFloat(ingresos) - parseFloat(costos),
            margenPct: ((parseFloat(ingresos) - parseFloat(costos)) / parseFloat(ingresos) * 100),
            estado: "Borrador",
            vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES'),
            currency: "€"
        };

        onCreate(nuevaLiquidacion);
        
        // Reset form
        setExpediente('');
        setCliente('');
        setIngresos('');
        setCostos('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Crear Nueva Liquidación</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="expediente">Código de Expediente</Label>
                        <Input
                            id="expediente"
                            placeholder="Ej: SI-ES-20319"
                            value={expediente}
                            onChange={(e) => setExpediente(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="cliente">Cliente</Label>
                        <Input
                            id="cliente"
                            placeholder="Nombre del cliente"
                            value={cliente}
                            onChange={(e) => setCliente(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="ingresos">Ingresos Totales (€)</Label>
                        <Input
                            id="ingresos"
                            type="number"
                            placeholder="0.00"
                            value={ingresos}
                            onChange={(e) => setIngresos(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="costos">Costos Totales (€)</Label>
                        <Input
                            id="costos"
                            type="number"
                            placeholder="0.00"
                            value={costos}
                            onChange={(e) => setCostos(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button 
                        onClick={handleCreate}
                        style={{ backgroundColor: '#4472C4', color: 'white' }}
                    >
                        Crear Liquidación
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default function LiquidacionManagement() {
    const [activeTab, setActiveTab] = useState('pendientes');
    const [selectedLiquidacion, setSelectedLiquidacion] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [liquidaciones, setLiquidaciones] = useState(mockLiquidacionData);

    const getEstadoBadge = (estado) => {
        const configs = {
            'Pendiente Aprobación': 'bg-yellow-100 text-yellow-800',
            'Aprobado': 'bg-green-100 text-green-800',
            'Bloqueado': 'bg-red-100 text-red-800',
            'Borrador': 'bg-gray-100 text-gray-800'
        };
        return <Badge className={configs[estado] || 'bg-gray-100 text-gray-800'}>{estado}</Badge>;
    };

    const getMargenColor = (margenPct) => {
        if (margenPct >= 30) return 'text-green-600';
        if (margenPct >= 20) return 'text-yellow-600';
        return 'text-red-600';
    };

    const handleViewLiquidacion = (liquidacion) => {
        setSelectedLiquidacion(liquidacion);
        setShowDetailModal(true);
    };

    const handleAprobarLiquidacion = (liquidacion) => {
        const updatedLiquidaciones = liquidaciones.map(liq => 
            liq.id === liquidacion.id 
                ? { ...liq, estado: 'Aprobado' }
                : liq
        );
        setLiquidaciones(updatedLiquidaciones);
    };

    const handleCreateLiquidacion = (nuevaLiquidacion) => {
        setLiquidaciones([...liquidaciones, nuevaLiquidacion]);
    };

    const filteredLiquidaciones = liquidaciones.filter(liq => {
        if (activeTab === 'pendientes') return liq.estado === 'Pendiente Aprobación' || liq.estado === 'Borrador';
        if (activeTab === 'aprobadas') return liq.estado === 'Aprobado';
        if (activeTab === 'facturadas') return liq.estado === 'Facturado';
        return true;
    });

    return (
        <div style={{ backgroundColor: '#F1F0EC', minHeight: '100vh', padding: '24px' }}>
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Liquidación y Settlement</h1>
                        <p className="text-sm text-gray-500 mt-1">Conciliación de costos, márgenes y facturación final</p>
                    </div>
                    <Button 
                        onClick={() => setShowCreateModal(true)}
                        style={{ backgroundColor: '#4472C4', color: 'white' }}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva Liquidación
                    </Button>
                </div>

                <div className="mt-6 border-b">
                    <div className="flex gap-4">
                        {['pendientes', 'aprobadas', 'facturadas', 'analytics'].map(tab => (
                            <Button
                                key={tab}
                                variant={activeTab === tab ? 'secondary' : 'ghost'}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab === 'pendientes' && 'Pendientes'}
                                {tab === 'aprobadas' && 'Aprobadas'}
                                {tab === 'facturadas' && 'Facturadas'}
                                {tab === 'analytics' && 'Analytics'}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-4 mt-6 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Buscar por expediente, liquidación, cliente..."
                            className="pl-10 bg-white"
                        />
                    </div>
                    <Select defaultValue="todos">
                        <SelectTrigger className="w-32 bg-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="pendiente">Pendiente</SelectItem>
                            <SelectItem value="aprobado">Aprobado</SelectItem>
                            <SelectItem value="bloqueado">Bloqueado</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select defaultValue="todos">
                        <SelectTrigger className="w-32 bg-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="eur">EUR</SelectItem>
                            <SelectItem value="usd">USD</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Card className="bg-white shadow-sm" style={{ borderRadius: '16px' }}>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">
                            Liquidaciones y Settlement ({filteredLiquidaciones.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Expediente</TableHead>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead>Ingresos</TableHead>
                                    <TableHead>Costos</TableHead>
                                    <TableHead>Margen</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Vencimiento</TableHead>
                                    <TableHead>Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLiquidaciones.map((liquidacion) => (
                                    <TableRow key={liquidacion.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium text-blue-600 hover:underline cursor-pointer">
                                                    {liquidacion.expediente}
                                                </p>
                                                <p className="text-xs text-gray-500">{liquidacion.codigo}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{liquidacion.cliente}</TableCell>
                                        <TableCell>
                                            <p className="font-medium">
                                                {liquidacion.currency}{liquidacion.ingresos?.toLocaleString()}
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2 h-2 bg-red-400 rounded-full" />
                                                    <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                                                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                                                </div>
                                                <span className="font-medium">
                                                    {liquidacion.currency}{liquidacion.costos?.toLocaleString()}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className={`font-bold ${getMargenColor(liquidacion.margenPct)}`}>
                                                    {liquidacion.currency}{liquidacion.margen?.toLocaleString()}
                                                </p>
                                                <p className={`text-xs ${getMargenColor(liquidacion.margenPct)}`}>
                                                    {liquidacion.margenPct?.toFixed(1)}%
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getEstadoBadge(liquidacion.estado)}
                                            {liquidacion.nota && (
                                                <p className="text-xs text-red-500 mt-1">{liquidacion.nota}</p>
                                            )}
                                        </TableCell>
                                        <TableCell>{liquidacion.vencimiento}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleViewLiquidacion(liquidacion)}>
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        Ver liquidación
                                                    </DropdownMenuItem>
                                                    {liquidacion.estado === 'Pendiente Aprobación' && (
                                                        <DropdownMenuItem onClick={() => handleAprobarLiquidacion(liquidacion)}>
                                                            <CheckCircle className="w-4 h-4 mr-2" />
                                                            Aprobar liquidación
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem>
                                                        <Download className="w-4 h-4 mr-2" />
                                                        Exportar PDF
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Placeholder para otras pestañas */}
                {activeTab === 'analytics' && (
                    <Card className="mt-6 p-6">
                        <h2 className="text-xl font-semibold mb-4">Analytics de Liquidación</h2>
                        <p className="text-gray-600">Análisis de márgenes, tendencias y rentabilidad por ruta.</p>
                    </Card>
                )}

                <LiquidacionDetailModal
                    liquidacion={selectedLiquidacion}
                    isOpen={showDetailModal}
                    onClose={() => setShowDetailModal(false)}
                />

                <CreateLiquidacionModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onCreate={handleCreateLiquidacion}
                />
            </div>
        </div>
    );
}