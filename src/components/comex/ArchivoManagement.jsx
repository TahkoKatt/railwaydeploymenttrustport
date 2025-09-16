import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search, Plus, MoreHorizontal, Eye, Download, FileText, HardDrive, CheckCircle, Clock, Archive
} from 'lucide-react';

const kpiData = [
    { title: "Total Expedientes", value: "1,247", trend: "+89 este año", icon: FileText, color: "text-blue-600", bgColor: "bg-blue-100" },
    { title: "Tamaño Total", value: "15.8 GB", trend: "+21 GB este mes", icon: HardDrive, color: "text-green-600", bgColor: "bg-green-100" },
    { title: "Conformes", value: "93%", trend: "+0.8% vs anterior", icon: CheckCircle, color: "text-purple-600", bgColor: "bg-purple-100" },
    { title: "Accesos Mes", value: "347", trend: "+25 vs anterior", icon: Clock, color: "text-orange-600", bgColor: "bg-orange-100" },
];

const mockArchivoData = [
  {
    id: "archivo-001",
    codigo: "SI-ES-20319",
    cliente: "Textiles Barcelona SA",
    ruta: "Valencia, ES → New York, US",
    modo: "FCL",
    archivado: "1/8/2025 por System Auto-Archive",
    retencion: "7 años",
    hasta: "1/8/2032",
    acceso: "Restringido",
    compliance: "Conforme",
    valorTotal: "€18,750.00",
    documentos: 15,
    ubicacion: "Archive Server EU-West-1",
    tags: ["textiles", "usa_export", "fcl_container"],
    notas: "Standard export procedure completed successfully"
  },
  {
    id: "archivo-002",
    codigo: "SI-FR-18756",
    cliente: "European Electronics SAS",
    ruta: "Lyon, FR → Tokyo, JP",
    modo: "AIR",
    archivado: "15/7/2025 por Maria López",
    retencion: "10 años",
    hasta: "15/7/2035",
    acceso: "Público",
    compliance: "Conforme"
  }
];

const mockAuditoriaData = [
  {
    id: "audit-001",
    fechaHora: "15/8/2025, 12:20:00",
    usuario: "Ana García",
    expediente: "SI-ES-20319",
    accion: "VIEW DOCUMENTS",
    detalle: "Viewed commercial invoice and packing list",
    ip: "192.168.1.45",
    motivo: "Customer inquiry response"
  },
  {
    id: "audit-002",
    fechaHora: "20/8/2025, 11:30:00",
    usuario: "Carlos Ruiz",
    expediente: "SI-FR-18756",
    accion: "DOWNLOAD PDF",
    detalle: "Downloaded complete shipment file as PDF",
    ip: "192.168.1.32",
    motivo: "Audit preparation"
  },
  {
    id: "audit-003",
    fechaHora: "22/8/2025, 13:15:00",
    usuario: "Legal Department",
    expediente: "SI-IT-12890",
    accion: "COMPLIANCE REVIEW",
    detalle: "Reviewed compliance documentation",
    ip: "192.168.1.78",
    motivo: "Legal case preparation"
  }
];

const estadisticasData = {
  distribucionPorAño: [
    { año: "2022", cantidad: 324 },
    { año: "2023", cantidad: 378 },
    { año: "2024", cantidad: 456 },
    { año: "2025", cantidad: 89 }
  ],
  estadoCompliance: [
    { estado: "Conforme", cantidad: 1156, porcentaje: 93, color: "bg-green-500" },
    { estado: "Requiere Revisión", cantidad: 78, porcentaje: 6, color: "bg-yellow-500" },
    { estado: "No Conforme", cantidad: 13, porcentaje: 1, color: "bg-red-500" }
  ]
};

const ArchivoDetailModal = ({ archivo, isOpen, onClose }) => {
    if (!archivo) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Detalles del Expediente Archivado</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-6">
                        {/* Información del Expediente */}
                        <div>
                            <h3 className="font-semibold mb-3 text-base">Información del Expediente</h3>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <Label className="text-gray-500">Código:</Label>
                                    <p className="font-medium">{archivo.codigo}</p>
                                </div>
                                <div>
                                    <Label className="text-gray-500">Cliente:</Label>
                                    <p className="font-medium">{archivo.cliente}</p>
                                </div>
                                <div>
                                    <Label className="text-gray-500">Modo:</Label>
                                    <p className="font-medium">{archivo.modo}</p>
                                </div>
                                <div>
                                    <Label className="text-gray-500">Origen:</Label>
                                    <p className="font-medium">Valencia, ES</p>
                                </div>
                                <div>
                                    <Label className="text-gray-500">Destino:</Label>
                                    <p className="font-medium">New York, US</p>
                                </div>
                                <div>
                                    <Label className="text-gray-500">Valor Total:</Label>
                                    <p className="font-medium">{archivo.valorTotal}</p>
                                </div>
                            </div>
                        </div>

                        {/* Información de Archivo */}
                        <div>
                            <h3 className="font-semibold mb-3 text-base">Información de Archivo</h3>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <Label className="text-gray-500">Archivado:</Label>
                                    <p className="font-medium">{archivo.archivado}</p>
                                </div>
                                <div>
                                    <Label className="text-gray-500">Por:</Label>
                                    <p className="font-medium">System Auto-Archive</p>
                                </div>
                                <div>
                                    <Label className="text-gray-500">Retención:</Label>
                                    <p className="font-medium text-green-600">{archivo.retencion}</p>
                                </div>
                                <div>
                                    <Label className="text-gray-500">Hasta:</Label>
                                    <p className="font-medium">{archivo.hasta}</p>
                                </div>
                                <div>
                                    <Label className="text-gray-500">Documentos:</Label>
                                    <p className="font-medium">{archivo.documentos}</p>
                                </div>
                                <div>
                                    <Label className="text-gray-500">Ubicación:</Label>
                                    <p className="font-medium">{archivo.ubicacion}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    {archivo.tags && (
                        <div>
                            <Label className="text-gray-500 text-sm">Tags</Label>
                            <div className="flex gap-2 mt-1">
                                {archivo.tags.map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Notas */}
                    {archivo.notas && (
                        <div>
                            <Label className="text-gray-500 text-sm">Notas</Label>
                            <div className="bg-gray-50 p-3 rounded-md mt-1">
                                <p className="text-sm">{archivo.notas}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={onClose}>Cerrar</Button>
                        <Button style={{ backgroundColor: '#4472C4', color: 'white' }}>
                            <Download className="w-4 h-4 mr-2" />
                            Descargar PDF
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default function ArchivoManagement() {
    const [activeTab, setActiveTab] = useState('expedientes');
    const [selectedArchive, setSelectedArchive] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const openDetailModal = (archivo) => {
        setSelectedArchive(archivo);
        setShowDetailModal(true);
    };

    const getAccessBadge = (acceso) => {
        switch(acceso) {
            case 'Público':
                return <Badge className="bg-green-100 text-green-800 border-green-200">{acceso}</Badge>;
            case 'Restringido':
                return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">{acceso}</Badge>;
            default:
                return <Badge variant="outline">{acceso}</Badge>;
        }
    };

    const getComplianceBadge = (compliance) => {
        switch(compliance) {
            case 'Conforme':
                return <Badge className="bg-green-100 text-green-800 border-green-200">{compliance}</Badge>;
            default:
                return <Badge variant="outline">{compliance}</Badge>;
        }
    };

    const getRetentionBadge = (retencion) => {
        return <Badge variant="outline" className="text-blue-600 border-blue-200">{retencion}</Badge>;
    };

    const renderExpedientes = () => (
        <Card className="bg-white shadow-sm" style={{ borderRadius: '16px' }}>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-semibold">Expedientes Archivados</CardTitle>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                            <Search className="w-4 h-4 mr-2" />
                            Búsqueda Avanzada
                        </Button>
                        <Button variant="outline" size="sm">
                            <Archive className="w-4 h-4 mr-2" />
                            Exportar (0)
                        </Button>
                    </div>
                </div>
                <div className="flex gap-2 pt-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input placeholder="Buscar expedientes..." className="pl-10 bg-gray-50" />
                    </div>
                    <Select defaultValue="todos-años">
                        <SelectTrigger className="w-40 bg-gray-50">
                            <SelectValue placeholder="Todos los años" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos-años">Todos los años</SelectItem>
                            <SelectItem value="2025">2025</SelectItem>
                            <SelectItem value="2024">2024</SelectItem>
                            <SelectItem value="2023">2023</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select defaultValue="todos-modos">
                        <SelectTrigger className="w-40 bg-gray-50">
                            <SelectValue placeholder="Todos los modos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos-modos">Todos los modos</SelectItem>
                            <SelectItem value="FCL">FCL</SelectItem>
                            <SelectItem value="AIR">AIR</SelectItem>
                            <SelectItem value="LCL">LCL</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select defaultValue="todos-periodos">
                        <SelectTrigger className="w-40 bg-gray-50">
                            <SelectValue placeholder="Todos los períodos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos-periodos">Todos los períodos</SelectItem>
                            <SelectItem value="7-años">7 años</SelectItem>
                            <SelectItem value="10-años">10 años</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select defaultValue="todos-estados">
                        <SelectTrigger className="w-40 bg-gray-50">
                            <SelectValue placeholder="Todos los estados" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos-estados">Todos los estados</SelectItem>
                            <SelectItem value="conforme">Conforme</SelectItem>
                            <SelectItem value="revision">Requiere Revisión</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-4">
                                <input type="checkbox" />
                            </TableHead>
                            <TableHead>Código Expediente</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Ruta</TableHead>
                            <TableHead>Modo</TableHead>
                            <TableHead>Archivado</TableHead>
                            <TableHead>Retención</TableHead>
                            <TableHead>Acceso</TableHead>
                            <TableHead>Compliance</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockArchivoData.map((archivo) => (
                            <TableRow key={archivo.id}>
                                <TableCell>
                                    <input type="checkbox" />
                                </TableCell>
                                <TableCell className="font-medium text-blue-600">{archivo.codigo}</TableCell>
                                <TableCell>{archivo.cliente}</TableCell>
                                <TableCell>{archivo.ruta}</TableCell>
                                <TableCell>{archivo.modo}</TableCell>
                                <TableCell>
                                    <div className="text-sm">
                                        <p>{archivo.archivado.split(' por ')[0]}</p>
                                        <p className="text-gray-500">{archivo.archivado.split(' por ')[1]}</p>
                                    </div>
                                </TableCell>
                                <TableCell>{getRetentionBadge(archivo.retencion)}</TableCell>
                                <TableCell>{getAccessBadge(archivo.acceso)}</TableCell>
                                <TableCell>{getComplianceBadge(archivo.compliance)}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => openDetailModal(archivo)}>
                                                <Eye className="w-4 h-4 mr-2" />
                                                Ver Detalles
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Download className="w-4 h-4 mr-2" />
                                                Descargar PDF
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <FileText className="w-4 h-4 mr-2" />
                                                Ver Documentos
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Clock className="w-4 h-4 mr-2" />
                                                Historial Accesos
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
    );

    const renderAuditoria = () => (
        <Card className="bg-white shadow-sm" style={{ borderRadius: '16px' }}>
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Auditoría de Accesos</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha/Hora</TableHead>
                            <TableHead>Usuario</TableHead>
                            <TableHead>Expediente</TableHead>
                            <TableHead>Acción</TableHead>
                            <TableHead>IP</TableHead>
                            <TableHead>Motivo</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockAuditoriaData.map((audit) => (
                            <TableRow key={audit.id}>
                                <TableCell className="font-medium">{audit.fechaHora}</TableCell>
                                <TableCell>{audit.usuario}</TableCell>
                                <TableCell className="text-blue-600">{audit.expediente}</TableCell>
                                <TableCell>
                                    <div>
                                        <p className="font-medium">{audit.accion}</p>
                                        <p className="text-sm text-gray-500">{audit.detalle}</p>
                                    </div>
                                </TableCell>
                                <TableCell>{audit.ip}</TableCell>
                                <TableCell>{audit.motivo}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );

    const renderEstadisticas = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribución por Año */}
            <Card className="bg-white shadow-sm" style={{ borderRadius: '16px' }}>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Distribución por Año</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {estadisticasData.distribucionPorAño.map((item) => (
                            <div key={item.año} className="flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1">
                                    <span className="font-medium w-12">{item.año}</span>
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-blue-500 h-2 rounded-full"
                                            style={{ width: `${(item.cantidad / 456) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <span className="font-semibold text-sm w-12 text-right">{item.cantidad}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Estado de Compliance */}
            <Card className="bg-white shadow-sm" style={{ borderRadius: '16px' }}>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Estado de Compliance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {estadisticasData.estadoCompliance.map((item) => (
                            <div key={item.estado} className="flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                                        <span className="font-medium">{item.estado}</span>
                                    </div>
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div 
                                            className={`h-2 rounded-full ${item.color}`}
                                            style={{ width: `${item.porcentaje}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="font-semibold text-sm">{item.cantidad} ({item.porcentaje}%)</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <div style={{ backgroundColor: '#F1F0EC', minHeight: '100vh', padding: '24px' }}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Archivo Digital</h1>
                        <p className="text-sm text-gray-500 mt-1">Archivo inmutable y retención documental legal</p>
                    </div>
                    <Button style={{ backgroundColor: '#4472C4', color: 'white' }}>
                        <Archive className="w-4 h-4 mr-2" />
                        Sellar y Exportar
                    </Button>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    {kpiData.map(kpi => {
                        const Icon = kpi.icon;
                        return (
                            <Card key={kpi.title} className="bg-white shadow-sm" style={{ borderRadius: '16px' }}>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                                    <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                                        <Icon className={`w-4 h-4 ${kpi.color}`} />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{kpi.value}</div>
                                    <p className="text-xs text-gray-500">{kpi.trend}</p>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                {/* Tabs */}
                <div className="border-b mb-6">
                    <div className="flex gap-4">
                        <Button 
                            variant={activeTab === 'expedientes' ? 'default' : 'ghost'} 
                            onClick={() => setActiveTab('expedientes')}
                            style={activeTab === 'expedientes' ? { backgroundColor: '#4472C4', color: 'white' } : {}}
                        >
                            Expedientes
                        </Button>
                        <Button 
                            variant={activeTab === 'auditoria' ? 'default' : 'ghost'} 
                            onClick={() => setActiveTab('auditoria')}
                            style={activeTab === 'auditoria' ? { backgroundColor: '#4472C4', color: 'white' } : {}}
                        >
                            Auditoría
                        </Button>
                        <Button 
                            variant={activeTab === 'estadisticas' ? 'default' : 'ghost'} 
                            onClick={() => setActiveTab('estadisticas')}
                            style={activeTab === 'estadisticas' ? { backgroundColor: '#4472C4', color: 'white' } : {}}
                        >
                            Estadísticas
                        </Button>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'expedientes' && renderExpedientes()}
                {activeTab === 'auditoria' && renderAuditoria()}
                {activeTab === 'estadisticas' && renderEstadisticas()}

                {/* Modal */}
                <ArchivoDetailModal
                    archivo={selectedArchive}
                    isOpen={showDetailModal}
                    onClose={() => setShowDetailModal(false)}
                />
            </div>
        </div>
    );
}