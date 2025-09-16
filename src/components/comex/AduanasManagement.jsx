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
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search, Plus, MoreHorizontal, Eye, Download, FileText, ArrowUp, ArrowDown
} from 'lucide-react';

const mockAduanasData = [
  {
    id: "aduana-001",
    expediente: "SI-ES-20319",
    mrn: "25ES00001000001234",
    dua: "ES250001/2025",
    tipo: "Exportación",
    regimen: "4000",
    canal: "Verde",
    estado: "Aceptada",
    valor: "€15,250",
    declarante: {
      name: "Textiles Barcelona SA",
      eori: "ES1234567890123",
      address: "Calle Mayor 123, Barcelona"
    },
    mercancias: [
      {
        codigoHS: "6204.62.31",
        descripcion: "Women's trousers of cotton",
        cantidad: "1,200 Number",
        valor: "€15,250"
      }
    ],
    clasificacionIA: {
      confianza: 98.5,
      hsCode: "6204.62.31",
      verificado: "AI_Agent_HS"
    }
  },
  {
    id: "aduana-002", 
    expediente: "SI-PE-90112",
    mrn: "25ES00001000001235",
    dua: "ES250002/2025",
    tipo: "Importación",
    regimen: "0100",
    canal: "Amarillo",
    estado: "En Examen",
    valor: "€18,750",
    aranceles: "+€125.5 aranceles",
    declarante: {
      name: "European Coffee Imports SL",
      eori: "ES9876543210987",
      address: "Gran Via 321, Madrid"
    }
  },
  {
    id: "aduana-003",
    expediente: "SI-MX-45678", 
    mrn: "25ES00001000001236",
    dua: "ES250003/2025",
    tipo: "Exportación",
    regimen: "4000",
    canal: "Rojo",
    estado: "Rechazada",
    valor: "€45,000"
  }
];

const DeclaracionModal = ({ data, isOpen, onClose }) => {
    if (!data) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Declaración Aduanera - {data.expediente}</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    {/* Header info */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Label className="text-gray-500">MRN</Label>
                            <p className="font-medium">{data.mrn}</p>
                        </div>
                        <div>
                            <Label className="text-gray-500">DUA</Label>
                            <p className="font-medium">{data.dua}</p>
                        </div>
                        <div>
                            <Label className="text-gray-500">Régimen Aduanero</Label>
                            <p className="font-medium">{data.regimen}</p>
                        </div>
                    </div>

                    {/* Declarante */}
                    {data.declarante && (
                        <div>
                            <Label className="text-gray-500 text-sm">Declarante</Label>
                            <div className="bg-gray-50 p-4 rounded-md mt-1">
                                <p className="font-semibold">{data.declarante.name}</p>
                                <p className="text-sm text-gray-600">EORI: {data.declarante.eori}</p>
                                <p className="text-sm text-gray-600">{data.declarante.address}</p>
                            </div>
                        </div>
                    )}

                    {/* Mercancías */}
                    {data.mercancias && (
                        <div>
                            <Label className="text-gray-500 text-sm">Mercancías Declaradas</Label>
                            <div className="mt-2">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Código HS</TableHead>
                                            <TableHead>Descripción</TableHead>
                                            <TableHead>Cantidad</TableHead>
                                            <TableHead>Valor</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.mercancias.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-mono">{item.codigoHS}</TableCell>
                                                <TableCell>{item.descripcion}</TableCell>
                                                <TableCell>{item.cantidad}</TableCell>
                                                <TableCell className="font-medium">{item.valor}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}

                    {/* Clasificación IA */}
                    {data.clasificacionIA && (
                        <div>
                            <Label className="text-gray-500 text-sm">Clasificación IA</Label>
                            <div className="bg-blue-50 p-4 rounded-md mt-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <Progress value={data.clasificacionIA.confianza} className="flex-1 h-2" />
                                    <span className="text-sm font-medium">{data.clasificacionIA.confianza}% confianza</span>
                                </div>
                                <p className="text-sm">HS sugerido: {data.clasificacionIA.hsCode}</p>
                                <p className="text-sm">Verificado por: {data.clasificacionIA.verificado}</p>
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>Cerrar</Button>
                    <Button style={{ backgroundColor: '#4472C4', color: 'white' }}>
                        <Download className="w-4 h-4 mr-2" />
                        Descargar DUA
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const ClasificadorHS = () => {
    const [descripcion, setDescripcion] = useState('');
    const [paisOrigen, setPaisOrigen] = useState('');
    const [valorUnitario, setValorUnitario] = useState('');
    const [clasificando, setClasificando] = useState(false);
    const [resultado, setResultado] = useState(null);

    const handleClasificar = async () => {
        if (!descripcion.trim()) return;
        
        setClasificando(true);
        
        // Simular clasificación con IA
        setTimeout(() => {
            setResultado({
                hsCode: "6204.62.31",
                descripcion: "Women's trousers of cotton",
                confianza: 94.2,
                restricciones: ["No restrictions found"],
                aranceles: "12% + €2.5/kg"
            });
            setClasificando(false);
        }, 2000);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Clasificador HS con IA</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="descripcion">Descripción del producto</Label>
                        <Textarea
                            id="descripcion"
                            placeholder="Describe el producto con el máximo detalle posible: material, uso, características técnicas..."
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            rows={4}
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="pais">País de origen</Label>
                            <Input
                                id="pais"
                                placeholder="Ej: ES, CN, DE..."
                                value={paisOrigen}
                                onChange={(e) => setPaisOrigen(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="valor">Valor unitario (€)</Label>
                            <Input
                                id="valor"
                                placeholder="0.00"
                                value={valorUnitario}
                                onChange={(e) => setValorUnitario(e.target.value)}
                            />
                        </div>
                    </div>

                    <Button 
                        onClick={handleClasificar}
                        disabled={!descripcion.trim() || clasificando}
                        style={{ backgroundColor: '#4472C4', color: 'white' }}
                        className="w-full"
                    >
                        {clasificando ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Clasificando...
                            </>
                        ) : (
                            <>🤖 Clasificar con IA</>
                        )}
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Resultados de Clasificación</CardTitle>
                </CardHeader>
                <CardContent>
                    {!resultado ? (
                        <div className="text-gray-500 text-sm space-y-2">
                            <p>• Introduce la descripción del producto</p>
                            <p>• La IA analizará y sugerirá códigos HS</p>
                            <p>• Se mostrarán múltiples opciones con confianza</p>
                            <p>• Incluye aranceles aplicables por país</p>
                            <p>• Verificación automática de restricciones</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold">Código HS Recomendado</h4>
                                    <Badge className="bg-green-100 text-green-800">
                                        {resultado.confianza}% confianza
                                    </Badge>
                                </div>
                                <p className="text-lg font-mono font-bold text-green-700">
                                    {resultado.hsCode}
                                </p>
                                <p className="text-sm text-gray-700 mt-1">
                                    {resultado.descripcion}
                                </p>
                            </div>
                            
                            <div>
                                <Label className="text-gray-500 text-sm">Aranceles aplicables</Label>
                                <p className="font-medium">{resultado.aranceles}</p>
                            </div>
                            
                            <div>
                                <Label className="text-gray-500 text-sm">Restricciones</Label>
                                <p className="font-medium text-green-600">
                                    {resultado.restricciones.join(', ')}
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default function AduanasManagement() {
    const [activeTab, setActiveTab] = useState('declaraciones');
    const [selectedDeclaracion, setSelectedDeclaracion] = useState(null);
    const [showDeclaracionModal, setShowDeclaracionModal] = useState(false);

    const getEstadoBadge = (estado) => {
        const configs = {
            'Aceptada': 'bg-green-100 text-green-800',
            'En Examen': 'bg-yellow-100 text-yellow-800', 
            'Rechazada': 'bg-red-100 text-red-800'
        };
        return <Badge className={configs[estado] || 'bg-gray-100 text-gray-800'}>{estado}</Badge>;
    };

    const getCanalBadge = (canal) => {
        const configs = {
            'Verde': 'bg-green-100 text-green-800',
            'Amarillo': 'bg-yellow-100 text-yellow-800',
            'Rojo': 'bg-red-100 text-red-800'
        };
        return <Badge className={configs[canal] || 'bg-gray-100 text-gray-800'}>{canal}</Badge>;
    };

    const getTipoIcon = (tipo) => {
        return tipo === 'Exportación' 
            ? <ArrowUp className="w-4 h-4 text-blue-600" />
            : <ArrowDown className="w-4 h-4 text-green-600" />;
    };

    const handleViewDeclaracion = (declaracion) => {
        setSelectedDeclaracion(declaracion);
        setShowDeclaracionModal(true);
    };

    const renderDeclaraciones = () => (
        <Card className="bg-white shadow-sm" style={{ borderRadius: '16px' }}>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-semibold">
                        Declaraciones Aduaneras ({mockAduanasData.length})
                    </CardTitle>
                    <Button style={{ backgroundColor: '#4472C4', color: 'white' }}>
                        <Plus className="w-4 h-4 mr-2" />
                        Clasificar HS (IA)
                    </Button>
                </div>
                <div className="flex gap-4 mt-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Buscar por expediente, MRN, DUA..."
                            className="pl-10 bg-gray-50"
                        />
                    </div>
                    <Select defaultValue="todos">
                        <SelectTrigger className="w-32 bg-gray-50">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="exportacion">Exportación</SelectItem>
                            <SelectItem value="importacion">Importación</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select defaultValue="todos">
                        <SelectTrigger className="w-32 bg-gray-50">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="aceptada">Aceptada</SelectItem>
                            <SelectItem value="en_examen">En Examen</SelectItem>
                            <SelectItem value="rechazada">Rechazada</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select defaultValue="todos">
                        <SelectTrigger className="w-32 bg-gray-50">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="verde">Verde</SelectItem>
                            <SelectItem value="amarillo">Amarillo</SelectItem>
                            <SelectItem value="rojo">Rojo</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Expediente</TableHead>
                            <TableHead>MRN / DUA</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Régimen</TableHead>
                            <TableHead>Canal</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockAduanasData.map((declaracion) => (
                            <TableRow key={declaracion.id}>
                                <TableCell className="font-medium text-blue-600 hover:underline cursor-pointer">
                                    {declaracion.expediente}
                                </TableCell>
                                <TableCell>
                                    <div>
                                        <p className="font-medium">{declaracion.mrn}</p>
                                        <p className="text-xs text-gray-500">{declaracion.dua}</p>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {getTipoIcon(declaracion.tipo)}
                                        <span>{declaracion.tipo}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{declaracion.regimen}</TableCell>
                                <TableCell>{getCanalBadge(declaracion.canal)}</TableCell>
                                <TableCell>{getEstadoBadge(declaracion.estado)}</TableCell>
                                <TableCell>
                                    <div>
                                        <p className="font-medium">{declaracion.valor}</p>
                                        {declaracion.aranceles && (
                                            <p className="text-xs text-gray-500">{declaracion.aranceles}</p>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleViewDeclaracion(declaracion)}>
                                                <Eye className="w-4 h-4 mr-2" />
                                                Ver detalles
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Download className="w-4 h-4 mr-2" />
                                                Descargar DUA
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

    return (
        <div style={{ backgroundColor: '#F1F0EC', minHeight: '100vh', padding: '24px' }}>
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Gestión Aduanera</h1>
                        <p className="text-sm text-gray-500 mt-1">Clasificación HS, DUA/MRN y despacho aduanero con IA</p>
                    </div>
                    <Button style={{ backgroundColor: '#4472C4', color: 'white' }}>
                        <FileText className="w-4 h-4 mr-2" />
                        Clasificar HS (IA)
                    </Button>
                </div>

                <div className="mt-6 border-b">
                    <div className="flex gap-4">
                        {['declaraciones', 'clasificador-hs', 'aranceles', 'intrastat'].map(tab => (
                            <Button
                                key={tab}
                                variant={activeTab === tab ? 'secondary' : 'ghost'}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab === 'declaraciones' && 'Declaraciones'}
                                {tab === 'clasificador-hs' && 'Clasificador HS'}
                                {tab === 'aranceles' && 'Aranceles'}
                                {tab === 'intrastat' && 'Intrastat'}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="mt-6">
                    {activeTab === 'declaraciones' && renderDeclaraciones()}
                    {activeTab === 'clasificador-hs' && <ClasificadorHS />}
                    {activeTab === 'aranceles' && (
                        <Card className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Gestión de Aranceles</h2>
                            <p className="text-gray-600">Consulta de aranceles y derechos aplicables.</p>
                        </Card>
                    )}
                    {activeTab === 'intrastat' && (
                        <Card className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Declaraciones Intrastat</h2>
                            <p className="text-gray-600">Gestión de declaraciones estadísticas intracomunitarias.</p>
                        </Card>
                    )}
                </div>

                <DeclaracionModal
                    data={selectedDeclaracion}
                    isOpen={showDeclaracionModal}
                    onClose={() => setShowDeclaracionModal(false)}
                />
            </div>
        </div>
    );
}