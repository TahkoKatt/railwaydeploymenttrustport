
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, Check, Clock, MapPin, FileText, CheckCircle, Thermometer, 
  Scale, Scan, Package2, AlertTriangle, Printer, Truck
} from "lucide-react";
import { toast } from "sonner";

// Wizard steps según base44 spec
const wizardSteps = [
  { key: "plan", title: "Planificacion", icon: Calendar, description: "Crear recepcion y agendar cita" },
  { key: "scan", title: "Verificacion", icon: Scan, description: "Escanear y validar productos" }, 
  { key: "qc", title: "QC/FEFO", icon: CheckCircle, description: "Control calidad y FEFO" },
  { key: "close", title: "Finalizacion", icon: FileText, description: "GR y cierre" }
];

// Tokens Trustport aplicados
const TRUSTPORT_TOKENS = {
  colors: {
    primary: '#4472C4',
    secondary: '#DB2142',
    green: '#00A878',
    yellow: '#FFC857'
  },
  fonts: { primary: 'Montserrat, sans-serif' },
  shadow: '0 8px 24px rgba(0,0,0,.08)',
  radius: '16px'
};

export default function RecepcionesWizard() {
  // Estado base según spec
  const [currentStep, setCurrentStep] = useState('plan');
  const [selectedPersona] = useState(() => localStorage.getItem('selectedPersona') || 'comerciante');
  
  // Filtros top según layout spec
  const [filters, setFilters] = useState({
    warehouse_id: 'MAD-01',
    owner_id: null,
    status: 'programado'
  });

  // Estado del receipt
  const [receiptData, setReceiptData] = useState({
    id: 'REC-001',
    asnRef: 'ASN-00045',
    supplierId: 'sup_123',
    dockId: 'dock_01',
    expectedDate: '',
    lines: [
      { sku: 'PROD-001', description: 'Monitor Samsung 24"', ordered_qty: 100, received_qty: 0, lot: null, serial: null, expiry_date: null, gross_kg: 0 },
      { sku: 'PROD-002', description: 'Teclado Logitech MX', ordered_qty: 50, received_qty: 0, lot: null, serial: null, expiry_date: null, gross_kg: 0 }
    ]
  });

  // Persona overlays según spec
  const getPersonaConfig = () => {
    const configs = {
      comerciante: {
        default_filters: { status: 'programado' },
        quick_actions: ['post_gr'],
        qc_required: true,
        fefo: true
      },
      operador: {
        default_filters: { status: 'en_anden' }, 
        quick_actions: ['print_sscc', 'create_putaway'],
        crossdock_enabled: true
      }
    };
    return configs[selectedPersona] || configs.comerciante;
  };

  const personaConfig = getPersonaConfig();

  // Simular datos de sensores para QC
  const [temperatureReadings] = useState([
    { sensor: 'Sensor 01', temperature: 4.5, status: 'OK' },
    { sensor: 'Sensor 02', temperature: 4.8, status: 'OK' },
    { sensor: 'Sensor 03', temperature: 5.2, status: 'Warning' }
  ]);

  // Handlers para acciones API según spec
  const handleScan = async (lineIndex, scanData) => {
    try {
      // POST /wms/receipts/{id}/scan con Idempotency-Key
      console.log('[WMS-API] Scanning:', { receiptId: receiptData.id, scanData });
      
      // Log para QA
      console.log('[WMS-EVT] product_scanned:', {
        barcode: receiptData.lines[lineIndex].sku, // Assuming scanData.sku maps to the line's sku
        barcode_match: true,
        qty: scanData.qty
      });
      
      const updatedLines = [...receiptData.lines];
      updatedLines[lineIndex] = { 
        ...updatedLines[lineIndex], 
        received_qty: scanData.qty,
        lot: scanData.lot,
        serial: scanData.serial,
        expiry_date: scanData.expiry_date
      };
      
      setReceiptData({ ...receiptData, lines: updatedLines });
      
      // Emitir evento para QA
      console.log('[WMS-EVT] wms.receiving.line.verified.v1:', {
        receipt_id: receiptData.id,
        line: updatedLines[lineIndex]
      });
      
      toast.success(`Escaneado: ${scanData.qty} unidades de ${updatedLines[lineIndex].description}`);
    } catch (error) {
      toast.error('Error en escaneo');
    }
  };

  const handleWeigh = async (lineIndex, weightData) => {
    try {
      // POST /wms/receipts/{id}/weigh
      console.log('[WMS-API] Weighing:', { receiptId: receiptData.id, weightData });
      
      const updatedLines = [...receiptData.lines];
      updatedLines[lineIndex].gross_kg = weightData.gross_kg;
      setReceiptData({ ...receiptData, lines: updatedLines });
      toast.success(`Pesado: ${weightData.gross_kg} kg`);
    } catch (error) {
      toast.error('Error en pesado');
    }
  };

  const handlePostGR = async () => {
    try {
      // POST /wms/receipts/{id}/postGR con Idempotency-Key
      console.log('[WMS-API] Posting GR:', receiptData.id);
      
      // Evento para QA
      console.log('[WMS-EVT] wms.receiving.created.v1:', {
        receipt_id: receiptData.id,
        status: 'gr_posted'
      });
      
      toast.success('Goods Receipt posteado exitosamente');
      // Emitir evento: wms.goods.receipt.posted.v1
    } catch (error) {
      toast.error('Error posting GR');
    }
  };

  const handleCreatePutaway = async () => {
    try {
      // POST /wms/putaway/tasks?receipt_id={id}
      console.log('[WMS-API] Creating putaway tasks:', receiptData.id);
      toast.success('Tareas de putaway creadas');
      // Emitir evento: wms.putaway.task.created.v1
    } catch (error) {
      toast.error('Error creando putaway');
    }
  };

  const handlePrintSSCC = async () => {
    try {
      // POST /wms/labels/print con template ZPL
      console.log('[WMS-API] Printing SSCC labels');
      toast.success('Etiquetas SSCC enviadas a impresora');
    } catch (error) {
      toast.error('Error imprimiendo etiquetas');
    }
  };

  // Navegación de wizard
  const getStepIndex = (step) => wizardSteps.findIndex(s => s.key === step);
  
  const handleNext = () => {
    const currentIndex = getStepIndex(currentStep);
    if (currentIndex < wizardSteps.length - 1) {
      const nextStep = wizardSteps[currentIndex + 1];
      setCurrentStep(nextStep.key);
      toast.success(`Paso ${nextStep.title} iniciado`);
    }
  };

  const handlePrevious = () => {
    const currentIndex = getStepIndex(currentStep);
    if (currentIndex > 0) {
      const prevStep = wizardSteps[currentIndex - 1];
      setCurrentStep(prevStep.key);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch(currentStep) {
      case 'plan':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="asnRef">Referencia ASN</Label>
                <Input 
                  id="asnRef"
                  value={receiptData.asnRef}
                  onChange={(e) => setReceiptData({...receiptData, asnRef: e.target.value})}
                  placeholder="ASN-00045"
                />
              </div>
              <div>
                <Label htmlFor="supplier">Proveedor</Label>
                <Select value={receiptData.supplierId} onValueChange={(value) => setReceiptData({...receiptData, supplierId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sup_123">Proveedor A</SelectItem>
                    <SelectItem value="sup_456">Proveedor B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dock">Muelle</Label>
                <Select value={receiptData.dockId} onValueChange={(value) => setReceiptData({...receiptData, dockId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar muelle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dock_01">Muelle 1</SelectItem>
                    <SelectItem value="dock_02">Muelle 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="expectedDate">Fecha esperada</Label>
                <Input 
                  id="expectedDate"
                  type="datetime-local"
                  value={receiptData.expectedDate}
                  onChange={(e) => setReceiptData({...receiptData, expectedDate: e.target.value})}
                />
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-[16px]">Productos Esperados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {receiptData.lines.map((line, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{line.description}</p>
                        <p className="text-sm text-gray-500">SKU: {line.sku}</p>
                      </div>
                      <Badge>{line.ordered_qty} Unidades</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'scan':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-[16px] flex items-center gap-2">
                    <Scan className="w-5 h-5" />
                    Verificación por Escaneo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {receiptData.lines.map((line, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium">{line.description}</span>
                        <Badge className={line.received_qty > 0 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}>
                          {line.received_qty > 0 ? 'Verificado' : 'Pendiente'}
                        </Badge>
                      </div>
                      <div className="text-sm space-y-2">
                        <div className="grid grid-cols-2 gap-4">
                          <p>Esperado: {line.ordered_qty} Unidades</p>
                          <p>Recibido: {line.received_qty} Unidades</p>
                        </div>
                        {line.lot && <p>Lote: {line.lot}</p>}
                        {line.expiry_date && <p>Vencimiento: {line.expiry_date}</p>}
                        {line.gross_kg > 0 && <p>Peso: {line.gross_kg} kg</p>}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button 
                          size="sm" 
                          onClick={() => handleScan(index, { sku: line.sku, qty: line.ordered_qty, lot: 'L-2412-A', expiry_date: '2026-12-31' })}
                          style={{ backgroundColor: TRUSTPORT_TOKENS.colors.primary }}
                        >
                          <Scan className="w-4 h-4 mr-2" />
                          Escanear
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleWeigh(index, { gross_kg: Math.round(line.ordered_qty * 0.5) })}
                        >
                          <Scale className="w-4 h-4 mr-2" />
                          Pesar
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'qc':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-[16px]">Control de Calidad</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {receiptData.lines.map((line, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{line.description}</span>
                        <Badge className={line.received_qty > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}>
                          {line.received_qty > 0 ? 'QC OK' : 'Pendiente'}
                        </Badge>
                      </div>
                      <div className="text-sm space-y-1">
                        <p>Lote: {line.lot || 'Sin asignar'}</p>
                        <p>Vencimiento: {line.expiry_date || 'N/A'}</p>
                        {personaConfig.fefo && (
                          <p className="text-green-600 font-medium">✓ FEFO validado</p>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {personaConfig.qc_required && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[16px] flex items-center gap-2">
                      <Thermometer className="w-4 h-4" />
                      Cadena de Frío
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {temperatureReadings.map((reading, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm">{reading.sensor}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{reading.temperature}°C</span>
                            <Badge className={reading.status === 'OK' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}>
                              {reading.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        );

      case 'close':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-[16px]">Finalización y GR</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">ASN:</span>
                      <span className="ml-2 font-medium">{receiptData.asnRef}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Estado:</span>
                      <span className="ml-2 font-medium">{filters.status}</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-3">Resumen de Recepción</h4>
                    <div className="space-y-2">
                      {receiptData.lines.map((line, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm">{line.description}</span>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-600">{line.received_qty} recibido</Badge>
                            {line.gross_kg > 0 && <Badge variant="outline">{line.gross_kg} kg</Badge>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />

                  {/* Acciones según persona */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {personaConfig.quick_actions.includes('post_gr') && (
                      <Button 
                        onClick={handlePostGR}
                        className="bg-green-600 hover:bg-green-700"
                        style={{ fontFamily: TRUSTPORT_TOKENS.fonts.primary }}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Postear GR
                      </Button>
                    )}
                    
                    {personaConfig.quick_actions.includes('create_putaway') && (
                      <Button 
                        onClick={handleCreatePutaway}
                        variant="outline"
                        style={{ fontFamily: TRUSTPORT_TOKENS.fonts.primary }}
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        Crear Putaway
                      </Button>
                    )}
                    
                    {personaConfig.quick_actions.includes('print_sscc') && (
                      <Button 
                        onClick={handlePrintSSCC}
                        variant="outline" 
                        style={{ fontFamily: TRUSTPORT_TOKENS.fonts.primary }}
                      >
                        <Printer className="w-4 h-4 mr-2" />
                        Imprimir SSCC
                      </Button>
                    )}
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
    <div className="space-y-6">
      {/* Top Filters según layout spec */}
      <Card className="bg-white shadow-sm" style={{ boxShadow: TRUSTPORT_TOKENS.shadow, borderRadius: TRUSTPORT_TOKENS.radius }}>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <Select value={filters.warehouse_id} onValueChange={(value) => setFilters({...filters, warehouse_id: value})}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Almacén" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MAD-01">Madrid 01</SelectItem>
                <SelectItem value="BCN-01">Barcelona 01</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.owner_id || 'all'} onValueChange={(value) => setFilters({...filters, owner_id: value === 'all' ? null : value})}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ACME">ACME Corp</SelectItem>
                <SelectItem value="BETA">Beta Inc</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              {['programado', 'en_anden', 'verificando', 'qc', 'gr_listo', 'cerrado'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilters({...filters, status})}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    filters.status === status
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stepper */}
      <Card className="bg-white shadow-sm" style={{ boxShadow: TRUSTPORT_TOKENS.shadow, borderRadius: TRUSTPORT_TOKENS.radius }}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {wizardSteps.map((step, index) => {
              const isActive = currentStep === step.key;
              const isCompleted = getStepIndex(currentStep) > index;
              const Icon = step.icon;
              
              return (
                <div key={step.key} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    isCompleted ? 'bg-green-500 text-white' :
                    isActive ? 'text-white' : 'bg-gray-200 text-gray-600'
                  }`} style={isActive ? { backgroundColor: TRUSTPORT_TOKENS.colors.primary } : {}}>
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-600'}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                  {index < wizardSteps.length - 1 && (
                    <div className={`mx-4 h-px w-12 ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Contenido del paso */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-9">
          <Card className="bg-white shadow-sm" style={{ boxShadow: TRUSTPORT_TOKENS.shadow, borderRadius: TRUSTPORT_TOKENS.radius }}>
            <CardHeader>
              <CardTitle className="text-[18px] font-semibold" style={{ fontFamily: TRUSTPORT_TOKENS.fonts.primary }}>
                {wizardSteps.find(s => s.key === currentStep)?.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderStepContent()}
            </CardContent>
          </Card>
        </div>

        {/* Timeline lateral */}
        <div className="col-span-12 lg:col-span-3">
          <Card className="bg-white shadow-sm" style={{ boxShadow: TRUSTPORT_TOKENS.shadow, borderRadius: TRUSTPORT_TOKENS.radius }}>
            <CardHeader>
              <CardTitle className="text-[16px] font-semibold">Actividad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-2 bg-green-50 rounded">
                <Clock className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">ASN creado</p>
                  <p className="text-xs text-green-600">14:15</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 bg-blue-50 rounded">
                <Truck className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Vehículo llegó</p>
                  <p className="text-xs text-blue-600">14:30</p>
                </div>
              </div>
              {currentStep !== 'plan' && (
                <div className="flex items-center gap-3 p-2 bg-purple-50 rounded">
                  <Scan className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-purple-800">Verificación iniciada</p>
                    <p className="text-xs text-purple-600">14:35</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={getStepIndex(currentStep) === 0}
        >
          Anterior
        </Button>
        
        <div className="flex gap-3">
          {getStepIndex(currentStep) < wizardSteps.length - 1 ? (
            <Button 
              onClick={handleNext}
              className="text-white"
              style={{ backgroundColor: TRUSTPORT_TOKENS.colors.primary }}
            >
              Siguiente
            </Button>
          ) : (
            <Button 
              onClick={() => toast.success('Recepción finalizada')}
              className="text-white"
              style={{ backgroundColor: TRUSTPORT_TOKENS.colors.green }}
            >
              Finalizar Recepción
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
