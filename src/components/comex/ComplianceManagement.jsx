import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search, Plus, MoreHorizontal, Eye, ShieldCheck, UserCheck, X
} from 'lucide-react';

const mockComplianceData = [
  {
    id: "comp-001",
    expediente: "SI-ES-20319",
    tipoCheck: "Dual Use",
    icon: ShieldCheck,
    score: 15,
    nivelRiesgo: "Bajo",
    estado: "Aprobado",
    ultimoCheck: "25/8/2025 18:00",
    details: {
      tipo: "dual_use",
      resultado: "No dual-use items detected",
      recomendaciones: "Standard export procedures apply",
      entidades: ["Shipper: cleared", "Consignee: cleared", "Products: cleared"]
    }
  },
  {
    id: "comp-002",
    expediente: "SI-PE-90112",
    tipoCheck: "Sanciones",
    icon: UserCheck,
    score: 68,
    nivelRiesgo: "Medio",
    estado: "Marcado",
    ultimoCheck: "26/8/2025 12:30",
    details: {
      tipo: "sanciones",
      resultado: "Potential match found for Consignee on OFAC list.",
      recomendaciones: "Manual review required before proceeding. Escalate to compliance officer.",
      entidades: ["Shipper: cleared", "Consignee: potential match", "Products: cleared"]
    }
  },
  {
    id: "comp-003",
    expediente: "SI-MX-45678",
    tipoCheck: "Bienes Restringidos",
    icon: ShieldCheck,
    score: 85,
    nivelRiesgo: "Alto",
    estado: "Bloqueado",
    ultimoCheck: "26/8/2025 16:15",
     details: {
      tipo: "bienes_restringidos",
      resultado: "Restricted items 'handicrafts-wood' detected in cargo description for destination country.",
      recomendaciones: "Shipment blocked. Remove restricted items or obtain specific license.",
      entidades: ["Shipper: cleared", "Consignee: cleared", "Products: restricted items found"]
    }
  }
];

const ComplianceDetailModal = ({ data, isOpen, onClose }) => {
    if (!data) return null;
    
    const riskLevelConfig = {
        'Bajo': 'bg-green-100 text-green-800',
        'Medio': 'bg-yellow-100 text-yellow-800',
        'Alto': 'bg-red-100 text-red-800',
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Detalle Compliance - {data.expediente}</DialogTitle>
                     <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={onClose}><X className="w-4 h-4" /></Button>
                </DialogHeader>
                <div className="space-y-4 py-4 text-sm">
                    <div className="flex justify-between">
                        <div>
                            <p className="text-gray-500">Tipo de Check</p>
                            <p className="font-medium">{data.details.tipo}</p>
                        </div>
                         <div>
                            <p className="text-gray-500">Nivel de Riesgo</p>
                            <Badge className={riskLevelConfig[data.nivelRiesgo]}>{data.nivelRiesgo}</Badge>
                        </div>
                    </div>
                     <div>
                        <p className="text-gray-500">Resultado</p>
                        <p className="font-medium">{data.details.resultado}</p>
                    </div>
                     <div>
                        <p className="text-gray-500">Recomendaciones</p>
                        <p className="font-medium">{data.details.recomendaciones}</p>
                    </div>
                     <div>
                        <p className="text-gray-500">Entidades Revisadas</p>
                        <ul className="list-disc list-inside font-medium bg-gray-50 p-3 rounded-md mt-1">
                            {data.details.entidades.map((e, i) => <li key={i}>{e}</li>)}
                        </ul>
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button variant="outline" onClick={onClose}>Cerrar</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default function ComplianceManagement() {
    const [activeTab, setActiveTab] = useState('Screening');
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedCompliance, setSelectedCompliance] = useState(null);

    const openDetailModal = (item) => {
        setSelectedCompliance(item);
        setDetailModalOpen(true);
    };

    const getRiskBadge = (level) => {
        switch(level) {
            case 'Bajo': return <Badge className="bg-green-100 text-green-800">{level}</Badge>;
            case 'Medio': return <Badge className="bg-yellow-100 text-yellow-800">{level}</Badge>;
            case 'Alto': return <Badge className="bg-red-100 text-red-800">{level}</Badge>;
            default: return <Badge variant="outline">{level}</Badge>;
        }
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'Aprobado': return <Badge variant="outline" className="text-green-600 border-green-300">{status}</Badge>;
            case 'Marcado': return <Badge variant="outline" className="text-yellow-600 border-yellow-300">{status}</Badge>;
            case 'Bloqueado': return <Badge variant="outline" className="text-red-600 border-red-300">{status}</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };
    
    const getScoreColor = (score) => {
        if (score <= 33) return "bg-green-500";
        if (score <= 66) return "bg-yellow-500";
        return "bg-red-500";
    };

    return (
        <div style={{ backgroundColor: '#F1F0EC', minHeight: '100vh', padding: '24px' }}>
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Compliance y Screening</h1>
                        <p className="text-sm text-gray-500 mt-1">Verificacion normativa y control de exportaciones</p>
                    </div>
                    <Button style={{ backgroundColor: '#4472C4', color: 'white' }}>
                        <Plus className="w-4 h-4 mr-2" />
                        Ejecutar Screening
                    </Button>
                </div>

                <div className="mt-6 border-b">
                    <div className="flex gap-4">
                        {['Screening', 'Dual Use', 'Sanciones', 'Reportes'].map(tab => (
                            <Button
                                key={tab}
                                variant={activeTab === tab ? 'secondary' : 'ghost'}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-4 my-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input placeholder="Buscar por expediente..." className="pl-10 bg-white" />
                    </div>
                    <Select defaultValue="all"><SelectTrigger className="w-40 bg-white"><SelectValue placeholder="Todos" /></SelectTrigger></Select>
                    <Select defaultValue="all"><SelectTrigger className="w-40 bg-white"><SelectValue placeholder="Todos" /></SelectTrigger></Select>
                </div>
                
                <Card className="bg-white shadow-sm" style={{ borderRadius: '16px' }}>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Screening de Compliance ({mockComplianceData.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Expediente</TableHead>
                                    <TableHead>Tipo Check</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead>Nivel Riesgo</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Ultimo Check</TableHead>
                                    <TableHead>Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockComplianceData.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <TableRow key={item.id}>
                                            <TableCell className="text-blue-600 hover:underline cursor-pointer font-medium">{item.expediente}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Icon className="w-4 h-4 text-gray-500" />
                                                    <span>{item.tipoCheck}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Progress value={item.score} className="w-24 h-2" indicatorClassName={getScoreColor(item.score)} />
                                                    <span className="text-xs font-medium">{item.score}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getRiskBadge(item.nivelRiesgo)}</TableCell>
                                            <TableCell>{getStatusBadge(item.estado)}</TableCell>
                                            <TableCell>{item.ultimoCheck}</TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => openDetailModal(item)}><Eye className="w-4 h-4 mr-2" />Ver Detalle</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                
                <ComplianceDetailModal data={selectedCompliance} isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} />
            </div>
        </div>
    );
}