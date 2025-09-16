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
  Search, Plus, MoreHorizontal, Eye, Download, FileText
} from 'lucide-react';

const mockDocsData = [
  {
    id: "doc-001",
    name: "Commercial Invoice #CI-2025-001",
    fileName: "CI-2025-001.pdf",
    expediente: "SI-ES-20319",
    tipo: "Factura Comercial",
    size: "245 KB",
    validationIA: 98,
    status: "Validado",
    ocrResult: {
      total_amount: "€15,250.00",
      currency: "EUR",
      invoice_date: "2025-08-20",
      items_count: 5
    }
  },
  {
    id: "doc-002",
    name: "Packing List - Textiles Barcelona",
    fileName: "PL-20319.pdf",
    expediente: "SI-ES-20319",
    tipo: "Lista de Empaque",
    size: "189 KB",
    validationIA: 100,
    status: "Validando",
     ocrResult: null
  },
  {
    id: "doc-003",
    name: "Certificate of Origin - Peru Chamber",
    fileName: "CO-PE-90112.pdf",
    expediente: "SI-PE-90112",
    tipo: "Certificado de Origen",
    size: "156 KB",
    validationIA: 65,
    status: "Error",
    ocrResult: null,
    problemas: "2 problemas"
  }
];

const DocumentDetailModal = ({ doc, isOpen, onClose }) => {
    if (!doc) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Detalle Documento - {doc.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-gray-500">Tipo de Documento</Label>
                            <p className="font-medium">{doc.tipo}</p>
                        </div>
                        <div>
                            <Label className="text-gray-500">Codigo de Expediente</Label>
                            <p className="font-medium">{doc.expediente}</p>
                        </div>
                    </div>
                     {doc.ocrResult && (
                        <div>
                            <Label className="text-gray-500">OCR Extraido</Label>
                            <pre className="bg-gray-900 text-white rounded-md p-4 text-sm mt-1 overflow-x-auto">
                                {JSON.stringify(doc.ocrResult, null, 2)}
                            </pre>
                        </div>
                    )}
                    <div>
                        <Label className="text-gray-500">Resultado de Validacion IA</Label>
                        <div className="bg-gray-50 p-3 rounded-md mt-1">
                            <p className="font-medium">Score: {doc.validationIA}%</p>
                            <p className="text-sm text-gray-600">Campos validados: amount, description, shipper, consignee</p>
                            <p className="text-sm text-gray-600">Confianza: high</p>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>Cerrar</Button>
                    <Button style={{ backgroundColor: '#4472C4', color: 'white' }}>
                        <Download className="w-4 h-4 mr-2" />
                        Descargar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const UploadDocumentModal = ({ isOpen, onClose }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Subir Nuevo Documento</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="expediente-code">Codigo de Expediente</Label>
                        <Input id="expediente-code" placeholder="Ej: SI-ES-20319" />
                    </div>
                    <div>
                        <Label htmlFor="doc-type">Tipo de Documento</Label>
                        <Select>
                            <SelectTrigger id="doc-type">
                                <SelectValue placeholder="Seleccionar tipo..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="factura">Factura Comercial</SelectItem>
                                <SelectItem value="empaque">Lista de Empaque</SelectItem>
                                <SelectItem value="origen">Certificado de Origen</SelectItem>
                                <SelectItem value="bl">BL/AWB</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                         <Label htmlFor="file-upload">Archivo</Label>
                        <Input id="file-upload" type="file" className="pt-2" />
                        <p className="text-xs text-gray-500 mt-1">Seleccionar archivo. Sin archivos seleccionados.</p>
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button style={{ backgroundColor: '#4472C4', color: 'white' }} onClick={onClose}>
                        Subir y Validar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};


export default function DocsManagement() {
    const [activeTab, setActiveTab] = useState('subidos');
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);

    const openDetailModal = (doc) => {
        setSelectedDoc(doc);
        setDetailModalOpen(true);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Validado': return <Badge className="bg-green-100 text-green-800 border-green-200">{status}</Badge>;
            case 'Validando': return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">{status}</Badge>;
            case 'Error': return <Badge className="bg-red-100 text-red-800 border-red-200">{status}</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };
    
    const getValidationProgressColor = (score) => {
        if (score >= 90) return "bg-green-500";
        if (score >= 70) return "bg-yellow-500";
        return "bg-red-500";
    }

    const renderSubidos = () => (
        <Card className="bg-white shadow-sm mt-6" style={{ borderRadius: '16px' }}>
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Documentos Comerciales ({mockDocsData.length})</CardTitle>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Documento</TableHead>
                            <TableHead>Expediente</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Tamaño</TableHead>
                            <TableHead>Validacion IA</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockDocsData.map((doc) => (
                            <TableRow key={doc.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-blue-600"/>
                                        <div>
                                            <p>{doc.name}</p>
                                            <p className="text-xs text-gray-500">{doc.fileName}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-blue-600 hover:underline cursor-pointer">{doc.expediente}</TableCell>
                                <TableCell>{doc.tipo}</TableCell>
                                <TableCell>{doc.size}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Progress value={doc.validationIA} className="w-24 h-2" indicatorClassName={getValidationProgressColor(doc.validationIA)}/>
                                        <span className="text-xs font-medium">{doc.validationIA}%</span>
                                    </div>
                                    {doc.problemas && <p className="text-xs text-red-600 mt-1">{doc.problemas}</p>}
                                </TableCell>
                                <TableCell>{getStatusBadge(doc.status)}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => openDetailModal(doc)}><Eye className="w-4 h-4 mr-2" />Ver documento</DropdownMenuItem>
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

    return (
        <div style={{ backgroundColor: '#F1F0EC', minHeight: '100vh', padding: '24px' }}>
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Gestion Documental</h1>
                        <p className="text-sm text-gray-500 mt-1">OCR, validacion y archivo de documentos comerciales</p>
                    </div>
                    <Button style={{ backgroundColor: '#4472C4', color: 'white' }} onClick={() => setUploadModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Subir Documentos
                    </Button>
                </div>
                
                <div className="mt-6 border-b">
                    <div className="flex gap-4">
                        <Button variant={activeTab === 'subidos' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('subidos')}>Subidos</Button>
                        <Button variant={activeTab === 'plantillas' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('plantillas')}>Plantillas</Button>
                        <Button variant={activeTab === 'archivo' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('archivo')}>Archivo</Button>
                    </div>
                </div>

                <div className="flex gap-4 my-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input placeholder="Buscar documentos..." className="pl-10 bg-white" />
                    </div>
                    <Select defaultValue="all"><SelectTrigger className="w-40 bg-white"><SelectValue placeholder="Todos los tipos" /></SelectTrigger></Select>
                    <Select defaultValue="all"><SelectTrigger className="w-40 bg-white"><SelectValue placeholder="Todos" /></SelectTrigger></Select>
                </div>

                {activeTab === 'subidos' && renderSubidos()}
                {activeTab === 'plantillas' && <p className="mt-4">Contenido de Plantillas.</p>}
                {activeTab === 'archivo' && <p className="mt-4">Contenido de Archivo.</p>}

                <DocumentDetailModal doc={selectedDoc} isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} />
                <UploadDocumentModal isOpen={uploadModalOpen} onClose={() => setUploadModalOpen(false)} />
            </div>
        </div>
    );
}