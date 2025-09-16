import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Grid, Move, RotateCcw, Save, Eye, Play, RefreshCw, Layers } from "lucide-react";
import { toast } from "sonner";

export default function UbicacionesEditor() {
  const [layoutMode, setLayoutMode] = useState('view'); // view, edit, simulate
  const [selectedZone, setSelectedZone] = useState(null);
  const [layoutVersion, setLayoutVersion] = useState('draft');

  const zones = [
    { id: 'receiving', name: 'Recepción', color: '#10B981', capacity: 100, occupied: 75 },
    { id: 'picking', name: 'Picking', color: '#4472C4', capacity: 200, occupied: 150 },
    { id: 'storage', name: 'Almacenaje', color: '#F59E0B', capacity: 500, occupied: 380 },
    { id: 'shipping', name: 'Expedición', color: '#DB2142', capacity: 80, occupied: 45 }
  ];

  const slottingCandidates = [
    { locationId: 'LOC-A-01', score: 0.92, reason: 'Cercano al muelle, alta rotación' },
    { locationId: 'LOC-A-15', score: 0.85, reason: 'Capacidad adecuada, zona picking' },
    { locationId: 'LOC-B-05', score: 0.78, reason: 'Disponible, compatible con producto' }
  ];

  const handleLayoutAction = (action) => {
    const actions = {
      save: () => {
        setLayoutVersion('simulated');
        toast.success('Layout guardado para simulación');
      },
      simulate: () => {
        setLayoutVersion('approved');
        toast.success('Simulación completada - Layout aprobado');
      },
      apply: () => {
        setLayoutVersion('applied');
        toast.success('Layout aplicado exitosamente');
      },
      rollback: () => {
        setLayoutVersion('draft');
        toast.success('Layout revertido a versión anterior');
      }
    };
    actions[action]?.();
  };

  const getVersionBadge = (version) => {
    const configs = {
      draft: { bg: 'bg-gray-100', color: 'text-gray-600', label: 'Borrador' },
      simulated: { bg: 'bg-blue-100', color: 'text-blue-600', label: 'Simulado' },
      approved: { bg: 'bg-green-100', color: 'text-green-600', label: 'Aprobado' },
      applied: { bg: 'bg-purple-100', color: 'text-purple-600', label: 'Aplicado' },
      rolled_back: { bg: 'bg-red-100', color: 'text-red-600', label: 'Revertido' }
    };
    return configs[version] || configs.draft;
  };

  const versionConfig = getVersionBadge(layoutVersion);

  return (
    <div className="space-y-6">
      {/* Toolbar de Layout */}
      <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge className={`${versionConfig.bg} ${versionConfig.color}`}>
                Versión: {versionConfig.label}
              </Badge>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant={layoutMode === 'view' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setLayoutMode('view')}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver
                </Button>
                <Button 
                  variant={layoutMode === 'edit' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setLayoutMode('edit')}
                >
                  <Move className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button 
                  variant={layoutMode === 'simulate' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setLayoutMode('simulate')}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Simular
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Grid className="w-4 h-4 mr-2" />
                Cuadrícula
              </Button>
              <Button variant="outline" size="sm">
                <Layers className="w-4 h-4 mr-2" />
                Capas
              </Button>
              <Button variant="outline" size="sm">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-12 gap-6">
        {/* Editor Visual Canvas */}
        <div className="col-span-12 lg:col-span-8">
          <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
            <CardHeader>
              <CardTitle className="text-[18px] font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Editor de Layout
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-4">
                {/* Simulación visual del canvas con zonas arrastrables */}
                <div className="grid grid-cols-4 gap-4 h-full">
                  {zones.map((zone) => (
                    <div 
                      key={zone.id}
                      className={`rounded-lg p-4 border-2 cursor-move transition-all hover:shadow-lg ${
                        selectedZone === zone.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: `${zone.color}20` }}
                      onClick={() => setSelectedZone(zone.id)}
                    >
                      <div className="text-center">
                        <div 
                          className="w-12 h-12 rounded-lg mx-auto mb-2 flex items-center justify-center"
                          style={{ backgroundColor: zone.color }}
                        >
                          <span className="text-white font-bold text-xs">
                            {zone.name.charAt(0)}
                          </span>
                        </div>
                        <p className="text-xs font-medium">{zone.name}</p>
                        <p className="text-xs text-gray-500">
                          {zone.occupied}/{zone.capacity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {layoutMode === 'edit' && (
                  <div className="mt-4 text-center text-gray-500">
                    <p className="text-sm">Arrastra y suelta las zonas para reorganizar el layout</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel de Propiedades y Optimización */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          {/* Propiedades de Zona */}
          <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
            <CardHeader>
              <CardTitle className="text-[16px] font-semibold">
                {selectedZone ? `Zona: ${zones.find(z => z.id === selectedZone)?.name}` : 'Propiedades'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedZone ? (
                <div className="space-y-4">
                  {(() => {
                    const zone = zones.find(z => z.id === selectedZone);
                    return (
                      <>
                        <div>
                          <Label>Capacidad Total</Label>
                          <Input value={zone?.capacity} className="mt-1" />
                        </div>
                        <div>
                          <Label>Ocupación Actual</Label>
                          <Input value={zone?.occupied} className="mt-1" />
                        </div>
                        <div>
                          <Label>Tipo de Zona</Label>
                          <Input value={zone?.name} className="mt-1" />
                        </div>
                        <div>
                          <Label>Utilización</Label>
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full"
                                style={{ 
                                  width: `${(zone?.occupied / zone?.capacity * 100)}%`,
                                  backgroundColor: zone?.color
                                }}
                              />
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {((zone?.occupied / zone?.capacity) * 100).toFixed(1)}% ocupado
                            </p>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Selecciona una zona para ver sus propiedades</p>
              )}
            </CardContent>
          </Card>

          {/* Reglas de Slotting */}
          <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
            <CardHeader>
              <CardTitle className="text-[16px] font-semibold">Vista Previa Slotting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <Label>Producto: Monitor Samsung 24"</Label>
                  <p className="text-gray-500">50 Cajas | Rotación: A</p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Candidatos sugeridos:</p>
                  {slottingCandidates.map((candidate, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded border">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium">{candidate.locationId}</p>
                          <p className="text-xs text-gray-600">{candidate.reason}</p>
                        </div>
                        <Badge 
                          className={index === 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}
                        >
                          {Math.round(candidate.score * 100)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mapa de Calor */}
          <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
            <CardHeader>
              <CardTitle className="text-[16px] font-semibold">Mapa de Calor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-24 bg-gradient-to-r from-green-200 via-yellow-200 to-red-200 rounded-lg flex items-center justify-center">
                <p className="text-sm text-gray-700">Densidad de ocupación por zona</p>
              </div>
              <div className="mt-3 flex justify-between text-xs text-gray-600">
                <span>Baja</span>
                <span>Media</span>
                <span>Alta</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Acciones de Versionado */}
      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Cargar Plantilla
          </Button>
        </div>
        
        <div className="flex gap-2">
          {layoutVersion === 'draft' && (
            <Button onClick={() => handleLayoutAction('save')} style={{ backgroundColor: '#4472C4' }}>
              <Save className="w-4 h-4 mr-2" />
              Guardar para Simulación
            </Button>
          )}
          
          {layoutVersion === 'simulated' && (
            <Button onClick={() => handleLayoutAction('simulate')} className="bg-green-600 hover:bg-green-700">
              <Play className="w-4 h-4 mr-2" />
              Aprobar Layout
            </Button>
          )}
          
          {layoutVersion === 'approved' && (
            <Button onClick={() => handleLayoutAction('apply')} className="bg-purple-600 hover:bg-purple-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Aplicar Layout
            </Button>
          )}
          
          {layoutVersion === 'applied' && (
            <Button onClick={() => handleLayoutAction('rollback')} variant="destructive">
              <RotateCcw className="w-4 h-4 mr-2" />
              Rollback
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}