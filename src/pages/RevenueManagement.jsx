
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  DollarSign, TrendingUp, TrendingDown, Target, BarChart3,
  Users, FileText, Calculator, Eye, Edit, MoreHorizontal,
  Filter, Search, Download, Upload, Plus, CheckCircle2,
  Clock, AlertTriangle, ArrowUpDown, Send, Copy, Percent,
  Calendar as CalendarIcon, Link as LinkIcon, Check, X as XIcon, Trash2, ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle, AlertVariant } from "@/components/ui/alert"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from "sonner";

const StatCard = ({ title, value, icon: Icon, trend, suffix = '', bgColor }) => (
  <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
    <CardHeader className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[12px] font-medium text-gray-600" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {title}
          </p>
          <p className="text-[22px] font-semibold mt-1" style={{ fontFamily: 'Montserrat, sans-serif', color: '#000000' }}>
            {typeof value === 'number' ? value.toLocaleString('es-ES') : value}{suffix}
          </p>
        </div>
        <div className="p-2 rounded-lg" style={{ backgroundColor: bgColor + '20' }}>
          <Icon className="w-5 h-5" style={{ color: bgColor }} />
        </div>
      </div>
      {trend && (
        <div className="flex items-center mt-2 text-[12px] font-medium text-green-600">
          <TrendingUp className="w-3 h-3 mr-1" />
          {trend}
        </div>
      )}
    </CardHeader>
  </Card>
);

// Cotizaciones (NUEVA VERSIÓN COMPLETA BASADA EN IMÁGENES)
const CotizacionesComponent = () => {
  const [activeTab, setActiveTab] = useState('workbench'); // Changed default to 'workbench'

  const KpiCard = ({ title, value, trend, trendColor, icon: Icon, iconBgColor }) => (
    <Card className="bg-white/80 shadow-sm" style={{ backdropFilter: 'blur(10px)', borderRadius: '1rem' }}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-gray-500 font-medium">{title}</p>
          <div className={`p-1.5 rounded-md ${iconBgColor}`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
        </div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className={`text-xs font-semibold ${trendColor}`}>{trend}</p>
      </CardContent>
    </Card>
  );

  const renderBuscadorTab = () => (
    <div className="space-y-6">
      <Card className="bg-white shadow-lg" style={{ borderRadius: '16px' }}>
        <CardHeader>
          <CardTitle>Buscar Tarifas por Ruta y Servicio</CardTitle>
          <CardDescription>Busca tarifas por ruta y servicio. Si eliges una, podrás enviarla al Cotizador con un click, conservar todos los parámetros y comparar alternativas.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Columna Izquierda */}
          <div className="space-y-6">
            <h3 className="font-semibold text-gray-700">Ruta</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Origen *</label>
                <Input placeholder="Puerto/Ciudad/Código" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Destino *</label>
                <Input placeholder="Puerto/Ciudad/Código" className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Incoterm *</label>
                <Select defaultValue="fob">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fob">FOB</SelectItem>
                    <SelectItem value="cif">CIF</SelectItem>
                    <SelectItem value="exw">EXW</SelectItem>
                    <SelectItem value="dap">DAP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Fecha salida *</label>
                <Input type="date" placeholder="dd/mm/aaaa" className="mt-1" />
              </div>
            </div>
          </div>
          {/* Columna Derecha */}
          <div className="space-y-6">
            <h3 className="font-semibold text-gray-700">Carga y Comercial</h3>
            <div>
              <label className="text-sm font-medium text-gray-600">Modo</label>
              <div className="flex gap-2 mt-2">
                {["LCL", "AÉREO", "FTL", "LTL"].map(mode => (
                  <Button key={mode} variant="outline" className="flex-1">{mode}</Button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="text-sm font-medium text-gray-600">Peso total</label>
              <div className="relative mt-1">
                <Input type="number" defaultValue="0" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">kg</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Margen objetivo (%) *</label>
              <div className="relative mt-1">
                <Input type="number" defaultValue="18" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">%</span>
              </div>
            </div>
          </div>
           <div>
              <label className="text-sm font-medium text-gray-600">Moneda *</label>
              <Select defaultValue="usd">
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD</SelectItem>
                  <SelectItem value="eur">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
         <CardFooter className="flex justify-end pt-6">
            <Button size="lg" style={{backgroundColor: "#4472C4", color: 'white'}} onClick={() => setActiveTab('cotizador')}>
                <Search className="w-4 h-4 mr-2" />
                Buscar y Enviar a Cotizador
            </Button>
        </CardFooter>
      </Card>

      {/* Resultados de Búsqueda */}
      <Card className="bg-white shadow-lg" style={{ borderRadius: '16px' }}>
        <CardHeader>
          <CardTitle>Resultados de Búsqueda</CardTitle>
          <CardDescription>3 tarifas encontradas</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proveedor</TableHead>
                <TableHead>Servicio</TableHead>
                <TableHead>Origen</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>TT</TableHead>
                <TableHead>Validez</TableHead>
                <TableHead>Costo Total</TableHead>
                <TableHead>Precio Sugerido</TableHead>
                <TableHead>Margen %</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">OceanX</TableCell>
                <TableCell>FCL 40'</TableCell>
                <TableCell>CNSHA</TableCell>
                <TableCell>PECLL</TableCell>
                <TableCell>28 días</TableCell>
                <TableCell>2025-09-30</TableCell>
                <TableCell>$7,800.00</TableCell>
                <TableCell>$9,500.00</TableCell>
                <TableCell><Badge className="bg-yellow-100 text-yellow-800">17.9%</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" style={{backgroundColor: "#4472C4", color: 'white'}}>
                      <ArrowRight className="w-4 h-4 mr-1" />Al Cotizador
                    </Button>
                    <Button size="sm" variant="outline">Comparar</Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">SkyAir</TableCell>
                <TableCell>Aéreo</TableCell>
                <TableCell>PELIM</TableCell>
                <TableCell>USLAX</TableCell>
                <TableCell>3 días</TableCell>
                <TableCell>2025-09-15</TableCell>
                <TableCell>$1,200.00</TableCell>
                <TableCell>$1,500.00</TableCell>
                <TableCell><Badge className="bg-green-100 text-green-800">20%</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" style={{backgroundColor: "#4472C4", color: 'white'}}>
                      <ArrowRight className="w-4 h-4 mr-1" />Al Cotizador
                    </Button>
                    <Button size="sm" variant="outline">Comparar</Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">CargoLink</TableCell>
                <TableCell>LCL</TableCell>
                <TableCell>DEHAM</TableCell>
                <TableCell>USLAX</TableCell>
                <TableCell>18 días</TableCell>
                <TableCell>2025-10-15</TableCell>
                <TableCell>$450.00</TableCell>
                <TableCell>$580.00</TableCell>
                <TableCell><Badge className="bg-green-100 text-green-800">22.4%</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" style={{backgroundColor: "#4472C4", color: 'white'}}>
                      <ArrowRight className="w-4 h-4 mr-1" />Al Cotizador
                    </Button>
                    <Button size="sm" variant="outline">Comparar</Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderCotizadorTab = () => (
    <div className="space-y-6">
      <Card className="bg-white shadow-lg" style={{ borderRadius: '16px' }}>
        <CardHeader>
          <CardTitle>Resumen de Cotización</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div><p className="text-sm text-gray-500">Nº Cotización</p><p className="font-semibold">Q-2025-00123</p></div>
            <div><p className="text-sm text-gray-500">Cliente</p><p className="font-semibold">ACME Logistics</p></div>
            <div><p className="text-sm text-gray-500">Ruta</p><p className="font-semibold">CNSHA → PECLL</p></div>
            <div><p className="text-sm text-gray-500">Estado</p><Badge variant="outline" className="border-yellow-400 text-yellow-600">Borrador</Badge></div>
            <div><p className="text-sm text-gray-500">Moneda</p><p className="font-semibold">USD</p></div>
            <div><p className="text-sm text-gray-500">Fecha</p><p className="font-semibold">2025-09-02</p></div>
            <div><p className="text-sm text-gray-500">Validez</p><p className="font-semibold">2025-09-30</p></div>
            <div><p className="text-sm text-gray-500">Margen</p><Badge className="bg-green-100 text-green-800">21.7%</Badge></div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-lg" style={{ borderRadius: '16px' }}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Líneas de Cotización</CardTitle>
          <Button variant="outline"><Plus className="w-4 h-4 mr-2"/>Agregar Línea</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Concepto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Unidad</TableHead>
                <TableHead>Cant.</TableHead>
                <TableHead>Costo Unit.</TableHead>
                <TableHead>Precio Unit.</TableHead>
                <TableHead>Moneda</TableHead>
                <TableHead>Costo</TableHead>
                <TableHead>Venta</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { concept: "Flete marítimo 40' ST", type: "Freight", unit: "ctr", qty: 1, costU: 7000, priceU: 8700, currency: "USD", costT: "7,000.00", saleT: "8,700.00" },
                { concept: "BL & Documentación", type: "Gastos Origen", unit: "job", qty: 1, costU: 80, priceU: 120, currency: "USD", costT: "80.00", saleT: "120.00" },
                { concept: "Handling destino", type: "Gastos Destino", unit: "job", qty: 1, costU: 220, priceU: 350, currency: "USD", costT: "220.00", saleT: "350.00" },
                { concept: "Transporte local destino", type: "Transporte", unit: "viaje", qty: 1, costU: 500, priceU: 790, currency: "USD", costT: "500.00", saleT: "790.00" }
              ].map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.concept}</TableCell>
                  <TableCell>
                    <Select defaultValue={item.type}>
                      <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Freight">Freight</SelectItem>
                        <SelectItem value="Gastos Origen">Gastos Origen</SelectItem>
                        <SelectItem value="Gastos Destino">Gastos Destino</SelectItem>
                        <SelectItem value="Transporte">Transporte</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>{item.qty}</TableCell>
                  <TableCell>${item.costU.toLocaleString()}</TableCell>
                  <TableCell>${item.priceU.toLocaleString()}</TableCell>
                  <TableCell>{item.currency}</TableCell>
                  <TableCell>${item.costT}</TableCell>
                  <TableCell>${item.saleT}</TableCell>
                  <TableCell><Button variant="ghost" size="icon" className="text-gray-500"><Trash2 className="w-4 h-4"/></Button></TableCell>
                </TableRow>
              ))}
              <TableRow className="border-t-2 border-gray-300 font-bold">
                <TableCell colSpan={7}>TOTALES</TableCell>
                <TableCell>$7,800.00</TableCell>
                <TableCell>$9,960.00</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Totales y Control de Margen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white shadow-lg" style={{ borderRadius: '16px' }}>
          <CardHeader>
            <CardTitle>Totales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Costo Total:</span>
              <span className="font-semibold">$7,800.00</span>
            </div>
            <div className="flex justify-between">
              <span>Venta Total:</span>
              <span className="font-semibold">$9,960.00</span>
            </div>
            <div className="flex justify-between">
              <span>Profit:</span>
              <span className="font-semibold text-green-600">$2,160.00</span>
            </div>
            <div className="flex justify-between border-t pt-4">
              <span className="font-bold">Margen:</span>
              <span className="font-bold text-green-600 text-lg">21.7%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg" style={{ borderRadius: '16px' }}>
          <CardHeader>
            <CardTitle>Control de Margen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">Margen Objetivo (%)</label>
              <Input type="number" defaultValue="18" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="auto-pricing" defaultChecked />
              <label htmlFor="auto-pricing" className="text-sm text-gray-600">Auto-pricing habilitado</label>
            </div>
            <Button className="w-full" style={{backgroundColor: "#4472C4", color: 'white'}}>
              Ajustar a Margen Objetivo
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Acciones */}
      <Card className="bg-white shadow-lg" style={{ borderRadius: '16px' }}>
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-3">
              <Button variant="outline" style={{borderColor: "#4472C4", color: "#4472C4"}}>
                <FileText className="w-4 h-4 mr-2" />
                Vista Previa PDF
              </Button>
              <Button variant="outline" style={{borderColor: "#4472C4", color: "#4472C4"}}>
                Guardar Cambios
              </Button>
            </div>
            <Button size="lg" style={{backgroundColor: "#4472C4", color: 'white'}}>
              <Send className="w-4 h-4 mr-2" />
              Enviar a Cliente
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderClonacionTab = () => (
     <Card className="bg-white shadow-lg" style={{ borderRadius: '16px' }}>
        <CardHeader>
          <CardTitle>Clonar Cotización</CardTitle>
          <CardDescription>Parte de una cotización existente, ajusta parámetros y recalcula con tarifas vigentes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Input placeholder="Buscar por cliente"/>
            <Input placeholder="Buscar por ruta"/>
            <Select>
              <SelectTrigger><SelectValue placeholder="Todos los servicios"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="fcl">FCL</SelectItem>
                <SelectItem value="lcl">LCL</SelectItem>
                <SelectItem value="air">Aéreo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Table>
             <TableHeader>
              <TableRow>
                <TableHead>Nº Cotización</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Ruta</TableHead>
                <TableHead>Servicio</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                {id: "Q-2025-00118", client: "Express Logistics", route: "DEHAM → PECLL", service: "LCL", amount: "$6,200.00", date: "2025-08-20"},
                {id: "Q-2025-00115", client: "Global Shippers Inc.", route: "CNSHA → USLAX", service: "FCL", amount: "$8,500.00", date: "2025-08-15"}
              ].map(item => (
                 <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell>{item.client}</TableCell>
                    <TableCell>{item.route}</TableCell>
                    <TableCell>{item.service}</TableCell>
                    <TableCell>{item.amount}</TableCell>
                    <TableCell>{item.date}</TableCell>
                    <TableCell><Button style={{backgroundColor: "#4472C4", color: 'white'}}><Copy className="w-4 h-4 mr-2"/>Clonar</Button></TableCell>
                 </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
     </Card>
  );
  
  const renderPerdidasTab = () => (
    <div className="space-y-6">
      <Card className="bg-white shadow-lg" style={{ borderRadius: '16px' }}>
        <CardHeader>
          <CardTitle>Registrar Cotización Perdida</CardTitle>
          <CardDescription>Registra motivos de pérdida para análisis de competitividad y mejora de tarifas.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div>
            <label className="text-sm font-medium text-gray-600">Número Cotización *</label>
            <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Seleccionar cotización"/></SelectTrigger><SelectContent /></Select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Competidor</label>
            <Input placeholder="Nombre del competidor" className="mt-1"/>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Motivo Principal *</label>
            <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Seleccionar motivo"/></SelectTrigger><SelectContent /></Select>
          </div>
          <div>
              <label className="text-sm font-medium text-gray-600">Diferencia precio (%)</label>
              <div className="relative mt-1">
                <Input type="number" defaultValue="0" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">%</span>
              </div>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-600">Comentarios adicionales</label>
            <Textarea placeholder="Detalles sobre la pérdida de la cotización..." className="mt-1"/>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end pt-6">
          <Button size="lg" style={{backgroundColor: "#DB2142", color: 'white'}}>
              <XIcon className="w-4 h-4 mr-2" />
              Registrar Pérdida
          </Button>
      </CardFooter>
      </Card>

      {/* Historial de Cotizaciones Perdidas */}
      <Card className="bg-white shadow-lg" style={{ borderRadius: '16px' }}>
        <CardHeader>
          <CardTitle>Historial de Cotizaciones Perdidas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Nº Cotización</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Ruta</TableHead>
                <TableHead>Venta Total</TableHead>
                <TableHead>Competidor</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Comentarios</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>2025-08-15</TableCell>
                <TableCell className="font-medium">Q-2025-00115</TableCell>
                <TableCell>Global Shippers Inc.</TableCell>
                <TableCell>CNSHA → USLAX</TableCell>
                <TableCell>$8,500.00</TableCell>
                <TableCell>Maersk</TableCell>
                <TableCell><Badge className="bg-red-100 text-red-800">Precio</Badge></TableCell>
                <TableCell>Cliente eligió opción 15% más barata</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2025-08-20</TableCell>
                <TableCell className="font-medium">Q-2025-00118</TableCell>
                <TableCell>Express Logistics</TableCell>
                <TableCell>DEHAM → PECLL</TableCell>
                <TableCell>$6,200.00</TableCell>
                <TableCell>DHL</TableCell>
                <TableCell><Badge className="bg-orange-100 text-orange-800">Tiempo/lead time</Badge></TableCell>
                <TableCell>Requerían entrega en 10 días, ofrecimo...</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
  
  const renderCierresTab = () => (
     <Card className="bg-white shadow-lg" style={{ borderRadius: '16px' }}>
        <CardHeader>
          <CardTitle>Cierres</CardTitle>
          <CardDescription>Registro de cotizaciones cerradas y su estado de producción/facturación para análisis y control.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Input placeholder="Cliente"/>
            <Input placeholder="Ruta"/>
            <Input type="date" placeholder="dd/mm/aaaa"/>
            <Select><SelectTrigger><SelectValue placeholder="Estado Producción"/></SelectTrigger><SelectContent /></Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha Cot.</TableHead>
                <TableHead># Cotización</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Servicio</TableHead>
                <TableHead>Ruta</TableHead>
                <TableHead>Venta Total</TableHead>
                <TableHead>Costo Total</TableHead>
                <TableHead>Profit</TableHead>
                <TableHead>Margen %</TableHead>
                <TableHead>Producción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
               {[
                    { date: '2025-09-02', id: 'Q-2025-00123', client: 'ACME Logistics', service: 'FCL', route: 'CNSHA → PECLL', sale: 12500, cost: 9800, profit: 2700, margin: 21.6, status: 'En Producción'},
                    { date: '2025-08-28', id: 'Q-2025-00121', client: 'MegaCorp International', service: 'LCL', route: 'DEHAM → USLAX', sale: 5800, cost: 4200, profit: 1600, margin: 27.6, status: 'Finalizada'},
               ].map(item => (
                    <TableRow key={item.id}>
                        <TableCell>{item.date}</TableCell>
                        <TableCell className="font-medium">{item.id}</TableCell>
                        <TableCell>{item.client}</TableCell>
                        <TableCell>{item.service}</TableCell>
                        <TableCell>{item.route}</TableCell>
                        <TableCell>${item.sale.toLocaleString()}</TableCell>
                        <TableCell>${item.cost.toLocaleString()}</TableCell>
                        <TableCell className="text-green-600 font-semibold">${item.profit.toLocaleString()}</TableCell>
                        <TableCell><Badge className="bg-green-100 text-green-800">{item.margin}%</Badge></TableCell>
                        <TableCell><Badge className={item.status === 'Finalizada' ? 'bg-gray-200 text-gray-800' : 'bg-blue-100 text-blue-800'}>{item.status}</Badge></TableCell>
                    </TableRow>
               ))}
            </TableBody>
          </Table>
          <div className="grid grid-cols-4 gap-4 mt-6 pt-4 border-t">
              <div className="font-bold">Total Ventas: ${ (12500+5800).toLocaleString() }</div>
              <div className="font-bold">Total Costos: ${ (9800+4200).toLocaleString() }</div>
              <div className="font-bold text-green-600">Profit Total: ${ (2700+1600).toLocaleString() }</div>
              <div className="font-bold">Margen Promedio: { ((2700+1600)/(12500+5800)*100).toFixed(1) }%</div>
          </div>
        </CardContent>
     </Card>
  );

  const renderAprobacionesTab = () => (
     <Card className="bg-white shadow-lg" style={{ borderRadius: '16px' }}>
        <CardHeader>
          <CardTitle>Aprobaciones de Margen</CardTitle>
          <CardDescription>Revisa, aprueba o rechaza cotizaciones bajo el umbral mínimo de margen (15%).</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead># Cotización</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Margen Actual</TableHead>
                <TableHead>Objetivo</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>2025-09-01</TableCell>
                <TableCell className="font-medium">Q-2025-00125</TableCell>
                <TableCell>StartUp Logistics</TableCell>
                <TableCell><Badge className="bg-red-100 text-red-800">12.5%</Badge></TableCell>
                <TableCell>18.0%</TableCell>
                <TableCell>carlos.ruiz</TableCell>
                <TableCell><Badge variant="outline" className="border-yellow-400 text-yellow-600">Pendiente</Badge></TableCell>
                <TableCell className="flex gap-2">
                  <Button size="sm" style={{backgroundColor: '#4472C4', color: 'white'}}><Check className="w-4 h-4 mr-1"/>Aprobar</Button>
                  <Button size="sm" variant="destructive"><XIcon className="w-4 h-4 mr-1"/>Rechazar</Button>
                  <Button size="sm" variant="outline"><Edit className="w-4 h-4 mr-1"/>Pedir Cambios</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
     </Card>
  );

  // NUEVA PESTAÑA: Workbench que sigue el patrón estándar
  const renderWorkbenchTab = () => {
    const CotizacionesWorkbench = React.lazy(() => import('@/components/rm/cotizaciones/CotizacionesWorkbench'));
    return (
      <React.Suspense fallback={<div>Cargando Workbench...</div>}>
        <CotizacionesWorkbench />
      </React.Suspense>
    );
  };

  return (
    <div className="space-y-6">
      {/* HEADER y KPIs han sido movidos a CotizacionesWorkbench */}
      
      {/* Pestañas de Navegación */}
       <div className="bg-gray-100 p-1 rounded-lg flex gap-1 w-fit">
          {[
              {id: "workbench", label: "Workbench"},
              {id: "buscador", label: "Buscador Tarifas"},
              {id: "cotizador", label: "Cotizador"},
              {id: "clonacion", label: "Clonación"},
              {id: "cotizaciones_perdidas", label: "Cotizaciones Perdidas"},
              {id: "cierres", label: "Cierres"},
              {id: "aprobaciones", label: "Aprobaciones"}
          ].map(tab => (
              <Button 
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'ghost'}
                  onClick={() => setActiveTab(tab.id)}
                  className="h-9 px-4 text-sm"
                  style={activeTab === tab.id ? {backgroundColor: '#4472C4', color: 'white', fontWeight: 600} : {color: '#374151', fontWeight: 500}}
              >
                  {tab.label}
              </Button>
          ))}
      </div>

      {/* Contenido de la pestaña activa */}
      <div>
        {activeTab === 'workbench' && renderWorkbenchTab()}
        {activeTab === 'buscador' && renderBuscadorTab()}
        {activeTab === 'cotizador' && renderCotizadorTab()}
        {activeTab === 'clonacion' && renderClonacionTab()}
        {activeTab === 'cotizaciones_perdidas' && renderPerdidasTab()}
        {activeTab === 'cierres' && renderCierresTab()}
        {activeTab === 'aprobaciones' && renderAprobacionesTab()}
      </div>
    </div>
  );
};

const DashboardComponent = () => (
  <div className="space-y-6">
     {/* HEADER */}
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-[28px] font-bold" style={{ fontFamily: 'Montserrat, sans-serif', color: '#000000' }}>
          Revenue Management
        </h1>
        <p className="text-[14px] font-medium" style={{ color: '#6B7280', fontFamily: 'Montserrat, sans-serif' }}>
          Gestión inteligente de revenue y oportunidades comerciales
        </p>
      </div>
    </div>
    {/* KPI Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Revenue YTD" value="€2.4M" icon={DollarSign} bgColor="#00A878" trend="+12% vs anterior" />
      <StatCard title="Oportunidades Activas" value="47" icon={Target} bgColor="#4472C4" trend="+3 esta semana" />
      <StatCard title="Cotizaciones Pendientes" value="23" icon={FileText} bgColor="#FFC857" trend="SLA en verde" />
      <StatCard title="Margen Promedio" value="28.5" suffix="%" icon={TrendingUp} bgColor="#DB2142" trend="+2.1pp mejor" />
    </div>

    {/* Charts and content */}
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="bg-white shadow-sm" style={{ borderRadius: '16px' }}>
        <CardHeader>
          <CardTitle>Pipeline Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <p>Gráfico de pipeline de revenue</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm" style={{ borderRadius: '16px' }}>
        <CardHeader>
          <CardTitle>Top Oportunidades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { client: "Naviera Global", value: "€185K", stage: "Negociación" },
              { client: "Logística Express", value: "€142K", stage: "Propuesta" },
              { client: "Import Solutions", value: "€98K", stage: "Calificado" }
            ].map((opp, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{opp.client}</p>
                  <p className="text-sm text-gray-500">{opp.stage}</p>
                </div>
                <span className="font-semibold">{opp.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

const OportunidadesComponent = () => {
  const oportunidadesData = [
    {
      id: "OPP-001",
      cliente: "Naviera Global",
      monto: 185000,
      etapa: "Negociación",
      probabilidad: 80,
      propietario: "Ana García",
      fecha_cierre: "15/09/2025"
    },
    {
      id: "OPP-002",
      cliente: "Logística Express",
      monto: 142000,
      etapa: "Propuesta",
      probabilidad: 65,
      propietario: "Carlos Ruiz",
      fecha_cierre: "28/09/2025"
    },
    {
      id: "OPP-003",
      cliente: "Import Solutions",
      monto: 98000,
      etapa: "Calificado",
      probabilidad: 45,
      propietario: "María López",
      fecha_cierre: "12/10/2025"
    },
    {
      id: "OPP-004",
      cliente: "Distribuciones del Sur",
      monto: 75000,
      etapa: "Nuevo",
      probabilidad: 25,
      propietario: "Ana García",
      fecha_cierre: "20/10/2025"
    }
  ];

  const etapaColorMap = {
    "Nuevo": "bg-blue-100 text-blue-800",
    "Calificado": "bg-purple-100 text-purple-800",
    "Propuesta": "bg-yellow-100 text-yellow-800",
    "Negociación": "bg-orange-100 text-orange-800",
    "Cierre": "bg-green-100 text-green-800"
  };

  return (
    <div className="space-y-6">
       {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-[28px] font-bold" style={{ fontFamily: 'Montserrat, sans-serif', color: '#000000' }}>
            Gestión de Oportunidades
          </h1>
          <p className="text-[14px] font-medium" style={{ color: '#6B7280', fontFamily: 'Montserrat, sans-serif' }}>
            Pipeline comercial y seguimiento de oportunidades
          </p>
        </div>
      </div>
      {/* Pipeline y Forecast Cards */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pipeline por Etapa */}
        <Card className="bg-white shadow-sm" style={{ borderRadius: '16px' }}>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold">Pipeline por Etapa</CardTitle>
              <Select defaultValue="Q4 2025">
                <SelectTrigger className="w-24 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Q4 2025">Q4 2025</SelectItem>
                  <SelectItem value="Q3 2025">Q3 2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium">Nuevo</span>
                  <span className="text-xs text-gray-500">12 oportunidades</span>
                </div>
                <span className="font-semibold">€180k</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span className="text-sm font-medium">Calificado</span>
                  <span className="text-xs text-gray-500">18 oportunidades</span>
                </div>
                <span className="font-semibold">€420k</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span className="text-sm font-medium">Propuesta</span>
                  <span className="text-xs text-gray-500">9 oportunidades</span>
                </div>
                <span className="font-semibold">€380k</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <span className="text-sm font-medium">Negociación</span>
                <span className="text-xs text-gray-500">8 oportunidades</span>
              </div>
              <span className="font-semibold">€250k</span>
            </div>
          </CardContent>
        </Card>

        {/* Forecast vs Objetivo */}
        <Card className="bg-white shadow-sm" style={{ borderRadius: '16px' }}>
          <CardHeader className="pb-3">
            <div>
              <CardTitle className="text-lg font-semibold">Forecast vs Objetivo</CardTitle>
              <p className="text-xs text-gray-500 mt-1">Período: Q4 2025</p>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm font-medium">Forecast (IA)</span>
                  <p className="text-xs text-gray-500">86.7% del objetivo</p>
                </div>
                <span className="font-semibold">€847k</span>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm font-medium">Pipeline Weighted</span>
                  <p className="text-xs text-gray-500">69.2% del objetivo</p>
                </div>
                <span className="font-semibold">€692k</span>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Objetivo Q4 2025</span>
                  <span className="font-bold text-green-600 text-lg">€1.0M</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="bg-white shadow-sm" style={{ borderRadius: '16px' }}>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Buscar oportunidades..." className="pl-10 w-[300px]" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Etapa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="nuevo">Nuevo</SelectItem>
                <SelectItem value="calificado">Calificado</SelectItem>
                <SelectItem value="propuesta">Propuesta</SelectItem>
                <SelectItem value="negociacion">Negociación</SelectItem>
                <SelectItem value="cierre">Cierre</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Propietario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ana">Ana García</SelectItem>
                <SelectItem value="carlos">Carlos Ruiz</SelectItem>
                <SelectItem value="maria">María López</SelectItem>
              </SelectContent>
            </Select>
            <Button className="text-white ml-auto" style={{ backgroundColor: '#4472C4' }}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Oportunidad
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Oportunidades */}
      <Card className="bg-white shadow-sm" style={{ borderRadius: '16px' }}>
        <CardHeader>
          <CardTitle>Pipeline de Oportunidades</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Etapa</TableHead>
                <TableHead>Probabilidad</TableHead>
                <TableHead>Propietario</TableHead>
                <TableHead>Fecha Cierre</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {oportunidadesData.map((opp) => (
                <TableRow key={opp.id}>
                  <TableCell className="font-medium">{opp.cliente}</TableCell>
                  <TableCell>€{opp.monto.toLocaleString('es-ES')}</TableCell>
                  <TableCell>
                    <Badge className={etapaColorMap[opp.etapa] || 'bg-gray-100 text-gray-800'}>
                      {opp.etapa}
                    </Badge>
                  </TableCell>
                  <TableCell>{opp.probabilidad}%</TableCell>
                  <TableCell>{opp.propietario}</TableCell>
                  <TableCell>{opp.fecha_cierre}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const ForecastingComponent = () => (
  <div className="space-y-6">
     {/* HEADER */}
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-[28px] font-bold" style={{ fontFamily: 'Montserrat, sans-serif', color: '#000000' }}>
          Forecasting de Revenue
        </h1>
        <p className="text-[14px] font-medium" style={{ color: '#6B7280', fontFamily: 'Montserrat, sans-serif' }}>
          Análisis predictivo y proyecciones de ventas
        </p>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard title="Forecast Q4" value="€890K" icon={TrendingUp} bgColor="#4472C4" trend="+15% vs Q3" />
      <StatCard title="Pipeline Weighted" value="€1.2M" icon={Target} bgColor="#00A878" trend="Confianza 85%" />
      <StatCard title="Win Rate" value="34.2" suffix="%" icon={Calculator} bgColor="#FFC857" trend="+5.1pp mejor" />
    </div>

    <Card className="bg-white shadow-sm" style={{ borderRadius: '16px' }}>
      <CardHeader>
        <CardTitle>Revenue Forecasting</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <p>Módulo de forecasting - Predicciones y análisis predictivo</p>
        </div>
      </CardContent>
    </Card>
  </div>
);

const renderContent = (tab) => {
  switch (tab) {
    case 'dashboard':
      return <DashboardComponent />;
    case 'oportunidades':
      return <OportunidadesComponent />;
    case 'cotizaciones':
      return <CotizacionesComponent />;
    case 'tarifario':
      // Redirect canónico: Revenue › Tarifario → SRM › tarifario
      const qs = new URLSearchParams(window.location.search);
      const persona =
        qs.get('persona') ||
        (localStorage && localStorage.getItem('persona')) ||
        'comerciante';

      window.location.assign(`/SRM?tab=tarifario&persona=${persona}`);
      return null; // no renderizar nada aquí
    case 'forecasting':
      return <ForecastingComponent />;
    default:
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            La pestaña seleccionada no es válida.
          </AlertDescription>
        </Alert>
      );
  }
};

export default function RevenueManagement() {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const tab = urlParams.get('tab') || 'dashboard';

  return (
    <div className="space-y-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      {renderContent(tab)}
    </div>
  );
}
