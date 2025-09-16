import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search, Plus, MoreHorizontal, Eye, Download, Send, FileText, CheckCheck, Clock, Filter as FilterIcon, Ship, Plane, Anchor
} from 'lucide-react';

const kpiData = [
    { title: "Documentos Activos", value: "2", trend: "+3 esta semana", icon: FileText, color: "text-blue-600", bgColor: "bg-blue-100" },
    { title: "Telex Releases", value: "1", subtext: "67% del total", icon: Send, color: "text-green-600", bgColor: "bg-green-100" },
    { title: "AWB Confirmados", value: "1", subtext: "100% procesados", icon: CheckCheck, color: "text-purple-600", bgColor: "bg-purple-100" },
    { title: "Tiempo Emision Avg", value: "2.4h", trend: "-0.6h optimizado", icon: Clock, color: "text-orange-600", bgColor: "bg-orange-100" },
];

const mockBlAwbData = [
  {
    id: "bl-001",
    documento: "MSCUVLC240828001",
    tipo: "BL Original",
    expediente: "SI-ES-20319",
    carrier: "MSC",
    vuelo: "MSC BARCELONA / V425W",
    ruta: "Valencia, Spain → New York, USA",
    estado: "Emitido",
    emision: "28/8/2025",
    responsable: "Ana Garcia"
  },
  {
    id: "awb-001",
    documento: "045-12345678",
    tipo: "AWB",
    house: "045-12345678-01",
    expediente: "SI-PE-90112",
    carrier: "LATAM Cargo",
    vuelo: "LA2458 / B767-300F",
    ruta: "Lima, Peru → Madrid, Spain",
    estado: "Confirmado",
    emision: "26/8/2025",
    responsable: "Carlos Ruiz"
  },
   {
    id: "bl-002",
    documento: "HAPLLOYV25001234",
    tipo: "BL Telex",
    expediente: "SI-MX-45678",
    carrier: "Hapag-Lloyd",
    vuelo: "HAMBURG EXPRESS / 156E",
    ruta: "Veracruz, Mexico → Barcelona, Spain",
    estado: "Borrador",
    emision: "27/8/2025",
    responsable: "Maria"
  },
];

const BlDetailModal = ({ isOpen, onClose, data }) => {
    if (!data) return null;
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Detalles del Bill of Lading</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 p-4 text-sm">
                    {/* Columna Izquierda */}
                    <div>
                        <h3 className="font-semibold mb-2 text-base">Informacion del Documento</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <div><Label>Numero:</Label><p className="font-medium">{data.documento}</p></div>
                            <div><Label>Tipo:</Label><p><Badge variant="outline">{data.tipo}</Badge></p></div>
                            <div><Label>Carrier:</Label><p className="font-medium">{data.carrier}</p></div>
                            <div><Label>Vessel/Flight:</Label><p className="font-medium">{data.vuelo}</p></div>
                            <div><Label>Estado:</Label><p><Badge className="bg-blue-100 text-blue-800">{data.estado}</Badge></p></div>
                            <div><Label>Emision:</Label><p className="font-medium">{data.emision}, 16:30:00</p></div>
                        </div>
                    </div>
                    {/* Columna Derecha */}
                    <div>
                        <h3 className="font-semibold mb-2 text-base">Ruta & Carga</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <div><Label>Origen:</Label><p className="font-medium">Valencia, Spain (ESVLC)</p></div>
                            <div><Label>Destino:</Label><p className="font-medium">New York, USA (USNYC)</p></div>
                            <div><Label>Recogida:</Label><p className="font-medium">Barcelona Factory</p></div>
                            <div><Label>Entrega:</Label><p className="font-medium">New York Warehouse</p></div>
                            <div><Label>Peso Total:</Label><p className="font-medium">24500 kg</p></div>
                            <div><Label>Paquetes:</Label><p className="font-medium">240</p></div>
                        </div>
                    </div>
                    {/* Seccion Parties */}
                    <div className="col-span-2 grid grid-cols-3 gap-4 border-t pt-4 mt-2">
                        <div><h4 className="font-semibold">Shipper</h4><p>Textiles Barcelona SA</p><p className="text-gray-500 text-xs">Calle Mayor 123, 08001 Barcelona, España</p><p className="text-blue-600 text-xs">ana.garcia@textiles.com</p></div>
                        <div><h4 className="font-semibold">Consignee</h4><p>American Imports LLC</p><p className="text-gray-500 text-xs">456 Fifth Avenue, New York, NY 10018, USA</p><p className="text-blue-600 text-xs">john.smith@americanimports.com</p></div>
                        <div><h4 className="font-semibold">Notify Party</h4><p>NYC Logistics Services</p><p className="text-gray-500 text-xs">789 Manhattan Street, New York, NY 10019, USA</p><p className="text-blue-600 text-xs">support@nyclogistics.com</p></div>
                    </div>
                </div>
                {/* Container/ULD */}
                <div className="p-4">
                    <h3 className="font-semibold text-base mb-2">Container/ULD #1</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-4 gap-4">
                            <div><Label>Numero:</Label><p className="font-medium">MSCU1234567</p></div>
                            <div><Label>Sello:</Label><p className="font-medium">SL789456</p></div>
                            <div><Label>Tipo:</Label><p className="font-medium">40HC</p></div>
                            <div><Label>Peso:</Label><p className="font-medium">24500 kg</p></div>
                            <div className="col-span-4"><Label>Descripcion:</Label><p className="font-medium">Women's clothing and accessories</p></div>
                        </div>
                    </div>
                </div>
                {/* Cargos y Terminos */}
                 <div className="p-4">
                    <h3 className="font-semibold text-base mb-2">Cargos & Terminos de Pago</h3>
                     <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-3 gap-4">
                            <div><Label>Flete:</Label><p className="font-medium">EUR 3,170</p></div>
                            <div><Label>Terminos:</Label><p className="font-medium">PREPAID</p></div>
                            <div><Label>Prepagado:</Label><p className="font-medium">Si</p></div>
                        </div>
                    </div>
                </div>
                 {/* Instrucciones */}
                 <div className="p-4">
                    <h3 className="font-semibold text-base mb-2">Instrucciones Especiales</h3>
                     <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <p className="font-medium">Handle with care - fragile items inside</p>
                    </div>
                </div>

                <div className="flex justify-end gap-3 p-4">
                    <Button variant="outline" onClick={onClose}>Cerrar</Button>
                    <Button style={{ backgroundColor: '#4472C4', color: 'white' }}>
                        <Download className="w-4 h-4 mr-2" />
                        Descargar PDF
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const TrackingModal = ({ isOpen, onClose, data }) => {
    const trackingEvents = [
        { status: 'completed', text: 'Original Bill of Lading issued', location: 'Valencia, Spain', time: '28/8/2025, 16:30:00' },
        { status: 'completed', text: 'Vessel departed from port of loading', location: 'Valencia, Spain', time: '30/8/2025, 10:00:00' },
        { status: 'pending', text: 'Vessel arrived at port of discharge', location: 'New York, USA', time: '15/9/2025, 14:00:00' },
    ];
    
    if (!data) return null;
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Seguimiento de {data.documento}</DialogTitle>
                </DialogHeader>
                <div className="p-4 space-y-6">
                    {trackingEvents.map((event, index) => (
                        <div key={index} className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${event.status === 'completed' ? 'bg-blue-600' : 'border-2 border-gray-400'}`}>
                                    {event.status === 'completed' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                </div>
                                {index < trackingEvents.length - 1 && <div className="w-px h-full bg-gray-300"></div>}
                            </div>
                            <div>
                                <p className="font-medium">{event.text}</p>
                                <p className="text-sm text-gray-500">{event.location}</p>
                            </div>
                            <p className="text-sm text-gray-500 ml-auto">{event.time}</p>
                        </div>
                    ))}
                </div>
                 <div className="flex justify-end p-4">
                    <Button variant="outline" onClick={onClose}>Cerrar</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function BlAwbManagement() {
    const [activeTab, setActiveTab] = useState('activos');
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [trackingModalOpen, setTrackingModalOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);

    const openDetailModal = (doc) => {
        setSelectedDocument(doc);
        setDetailModalOpen(true);
    };

     const openTrackingModal = (doc) => {
        setSelectedDocument(doc);
        setTrackingModalOpen(true);
    };

    const getStatusBadge = (estado) => {
        switch (estado) {
            case 'Emitido': return <Badge className="bg-blue-100 text-blue-800 border-blue-200">{estado}</Badge>;
            case 'Confirmado': return <Badge className="bg-green-100 text-green-800 border-green-200">{estado}</Badge>;
            case 'Borrador': return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{estado}</Badge>;
            case 'Telex Release': return <Badge className="bg-purple-100 text-purple-800 border-purple-200">{estado}</Badge>;
            default: return <Badge variant="outline">{estado}</Badge>;
        }
    };
    
    const getTypeBadge = (tipo) => {
        switch (tipo) {
            case 'BL Original': return <Badge variant="secondary">{tipo}</Badge>;
            case 'AWB': return <Badge variant="secondary" className="bg-purple-100 text-purple-800">{tipo}</Badge>;
            case 'BL Telex': return <Badge variant="secondary" className="bg-teal-100 text-teal-800">{tipo}</Badge>;
            default: return <Badge variant="secondary">{tipo}</Badge>;
        }
    }

    const renderActivos = () => (
        <Card className="bg-white shadow-sm mt-6" style={{ borderRadius: '16px' }}>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-semibold">BL/AWB Activos</CardTitle>
                    <Button style={{ backgroundColor: '#4472C4', color: 'white' }}><Plus className="w-4 h-4 mr-2" />Crear BL/AWB</Button>
                </div>
                <div className="flex gap-2 pt-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input placeholder="Buscar documentos..." className="pl-10 bg-gray-50" />
                    </div>
                    <Select><SelectTrigger className="w-40 bg-gray-50"><SelectValue placeholder="Todos los tipos" /></SelectTrigger></Select>
                    <Select><SelectTrigger className="w-40 bg-gray-50"><SelectValue placeholder="Todos los estados" /></SelectTrigger></Select>
                    <Select><SelectTrigger className="w-40 bg-gray-50"><SelectValue placeholder="Todos los carriers" /></SelectTrigger></Select>
                    <Button variant="outline"><FilterIcon className="w-4 h-4 mr-2" />Mas Filtros</Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Documento</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Expediente</TableHead>
                            <TableHead>Carrier/Vuelo</TableHead>
                            <TableHead>Ruta</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Emision</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockBlAwbData.map((doc) => (
                            <TableRow key={doc.id}>
                                <TableCell className="font-medium">{doc.documento}</TableCell>
                                <TableCell>{getTypeBadge(doc.tipo)}</TableCell>
                                <TableCell className="text-blue-600 hover:underline cursor-pointer">{doc.expediente}</TableCell>
                                <TableCell>
                                    <p className="font-medium">{doc.carrier}</p>
                                    <p className="text-xs text-gray-500">{doc.vuelo}</p>
                                </TableCell>
                                <TableCell>{doc.ruta}</TableCell>
                                <TableCell>{getStatusBadge(doc.estado)}</TableCell>
                                <TableCell>
                                    <p>{doc.emision}</p>
                                    <p className="text-xs text-gray-500">{doc.responsable}</p>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => openDetailModal(doc)}><Eye className="w-4 h-4 mr-2" />Ver Detalles</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => openTrackingModal(doc)}><Send className="w-4 h-4 mr-2" />Tracking</DropdownMenuItem>
                                            <DropdownMenuItem><Download className="w-4 h-4 mr-2" />Descargar</DropdownMenuItem>
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

    const renderSeguimiento = () => {
        const trackingData = [
            { id: 'bl-001', doc: 'MSCUVLC240828001', si: 'SI-ES-20319', carrier: 'MSC', estado: 'Emitido', events: [
                { text: 'Original Bill of Lading issued', location: 'Valencia, Spain', time: '28/8/2025, 16:30:00', completed: true },
                { text: 'Vessel departed from port of loading', location: 'Valencia, Spain', time: '30/8/2025, 10:00:00', completed: true },
                { text: 'Vessel arrived at port of discharge', location: 'New York, USA', time: '15/9/2025, 14:00:00', completed: false },
            ]},
            { id: 'awb-001', doc: '045-12345678', si: 'SI-PE-90112', carrier: 'LATAM Cargo', estado: 'Confirmado', events: [
                { text: 'Air Waybill issued and confirmed', location: 'Lima, Peru', time: '26/8/2025, 18:45:00', completed: true },
                { text: 'Flight departed - LA2458', location: 'Lima, Peru', time: '28/8/2025, 0:30:00', completed: true },
                { text: 'Flight arrived at Madrid-Barajas', location: 'Madrid, Spain', time: '28/8/2025, 16:15:00', completed: true },
            ]},
        ];

        return (
            <Card className="bg-white shadow-sm mt-6" style={{ borderRadius: '16px' }}>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Seguimiento en Tiempo Real</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                    {trackingData.map(item => (
                        <div key={item.id}>
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="font-semibold">{item.doc}</h3>
                                    <p className="text-sm text-gray-500">{item.si} - {item.carrier}</p>
                                </div>
                                {getStatusBadge(item.estado)}
                            </div>
                            <div className="pl-2">
                                {item.events.map((event, index) => (
                                     <div key={index} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${event.completed ? 'bg-blue-600' : 'border-2 border-gray-400'}`}>
                                                {event.completed && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                            </div>
                                            {index < item.events.length - 1 && <div className="w-px h-10 bg-gray-300"></div>}
                                        </div>
                                        <div className="flex-1 pb-8">
                                            <p className="font-medium text-sm">{event.text}</p>
                                            <p className="text-xs text-gray-500">{event.location}</p>
                                        </div>
                                        <p className="text-xs text-gray-500">{event.time}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        )
    };

    const renderPlantillas = () => {
        const templates = [
            { icon: Ship, title: "BL Original Maritimo", description: "Plantilla estandar para conocimiento de embarque original" },
            { icon: Send, title: "BL Telex Release", description: "Plantilla para telex release sin original fisico" },
            { icon: Plane, title: "Air Waybill", description: "Plantilla estandar para guia aerea IATA" },
            { icon: Anchor, title: "Sea Waybill", description: "Plantilla para waybill maritimo no negociable" },
        ];
        return (
             <Card className="bg-white shadow-sm mt-6" style={{ borderRadius: '16px' }}>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Plantillas de Documentos</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {templates.map(template => {
                        const Icon = template.icon;
                        return (
                            <Card key={template.title} className="text-center p-6 flex flex-col items-center justify-between">
                                <Icon className="w-10 h-10 text-blue-600 mb-4" />
                                <h3 className="font-semibold">{template.title}</h3>
                                <p className="text-xs text-gray-500 mt-2 mb-4 flex-grow">{template.description}</p>
                                <Button variant="outline" style={{borderColor: '#4472C4', color: '#4472C4'}}>Usar Plantilla</Button>
                            </Card>
                        )
                    })}
                </CardContent>
            </Card>
        )
    };

    return (
        <div style={{ backgroundColor: '#F1F0EC', minHeight: '100vh', padding: '24px' }}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Bill of Lading / Air Waybill</h1>
                    <p className="text-sm text-gray-500 mt-1">Emision y gestion de conocimientos de embarque</p>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-6">
                    {kpiData.map(kpi => {
                        const Icon = kpi.icon;
                        return (
                             <Card key={kpi.title} className="bg-white shadow-sm" style={{ borderRadius: '16px' }}>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                                    <div className={`p-2 rounded-lg ${kpi.bgColor}`}><Icon className={`w-4 h-4 ${kpi.color}`} /></div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{kpi.value}</div>
                                    <p className="text-xs text-gray-500">{kpi.trend || kpi.subtext}</p>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                {/* Tabs */}
                <div className="border-b">
                    <div className="flex gap-4">
                        <Button variant={activeTab === 'activos' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('activos')}>Activos</Button>
                        <Button variant={activeTab === 'seguimiento' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('seguimiento')}>Seguimiento</Button>
                        <Button variant={activeTab === 'rendidos' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('rendidos')}>Rendidos</Button>
                        <Button variant={activeTab === 'plantillas' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('plantillas')}>Plantillas</Button>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'activos' && renderActivos()}
                {activeTab === 'seguimiento' && renderSeguimiento()}
                {activeTab === 'plantillas' && renderPlantillas()}
                {activeTab === 'rendidos' && <p className="mt-4">Contenido de Documentos Rendidos.</p>}

                <BlDetailModal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} data={selectedDocument} />
                <TrackingModal isOpen={trackingModalOpen} onClose={() => setTrackingModalOpen(false)} data={selectedDocument} />
            </div>
        </div>
    );
}