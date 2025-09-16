import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, AlertTriangle, MapPin, X } from 'lucide-react';

const mockTrackingData = [
  {
    id: "track-001",
    expediente: "SI-ES-20319",
    vessel: "MSC BARCELONA",
    progress: 65,
    status: "En Transito",
    location: "Mediterranean Sea",
    eta: "15/9/2025",
    alerts: [
      {
        type: "warning",
        message: "Possible 2-hour delay due to weather conditions in Mediterranean",
        severity: "low",
        created: "9/4/2025, 10:00:00"
      }
    ],
    milestones: [
      {
        id: 1,
        name: "Cargo Ready",
        status: "completed",
        date: "27/8/2025, 10:30:00",
        location: "Valencia Port",
        delay: "-0.5h",
        note: "Cargo delivered 30 min early"
      },
      {
        id: 2,
        name: "Gate In",
        status: "completed", 
        date: "28/8/2025, 15:45:00",
        location: "Valencia Terminal",
        delay: "-0.25h",
        note: "Smooth gate-in process"
      },
      {
        id: 3,
        name: "Vessel Departure",
        status: "completed",
        date: "30/8/2025, 16:15:00",
        location: "Valencia Port",
        delay: "+0.25h",
        note: "Minor delay due to port traffic"
      },
      {
        id: 4,
        name: "Vessel Arrival",
        status: "pending",
        date: "15/9/2025, 10:00:00",
        location: "New York Port",
        delay: "",
        note: "On schedule"
      },
      {
        id: 5,
        name: "Container Discharge",
        status: "pending",
        date: "16/9/2025, 12:00:00",
        location: "New York Terminal",
        delay: "",
        note: "Pending vessel arrival"
      }
    ]
  },
  {
    id: "track-002",
    expediente: "SI-PE-90112",
    vessel: "Flight IB-6428",
    progress: 85,
    status: "Retenido Aduana",
    location: "Madrid Airport",
    eta: "30/8/2025",
    alerts: [
      {
        type: "urgent",
        message: "URGENT: Customs requires Certificate of Origin with proper signatures",
        severity: "high",
        created: "29/8/2025, 14:30:00"
      }
    ],
    milestones: [
      {
        id: 1,
        name: "Cargo Ready",
        status: "completed",
        date: "26/8/2025, 08:00:00",
        location: "Lima Airport",
        delay: "",
        note: "On time"
      },
      {
        id: 2,
        name: "Flight Departure",
        status: "completed",
        date: "28/8/2025, 01:30:00",
        location: "Lima Airport",
        delay: "",
        note: "Departed on schedule"
      },
      {
        id: 3,
        name: "Flight Arrival",
        status: "completed",
        date: "28/8/2025, 16:15:00",
        location: "Madrid Airport",
        delay: "",
        note: "Arrived on time"
      },
      {
        id: 4,
        name: "Customs Clearance",
        status: "blocked",
        date: "29/8/2025, 09:00:00",
        location: "Madrid Customs",
        delay: "+24h",
        note: "Documentation issue"
      }
    ]
  }
];

const TrackingDetailModal = ({ tracking, isOpen, onClose }) => {
    if (!tracking) return null;

    const getMilestoneIcon = (status) => {
        switch(status) {
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'pending':
                return <Clock className="w-5 h-5 text-gray-400" />;
            case 'blocked':
                return <AlertTriangle className="w-5 h-5 text-red-500" />;
            default:
                return <Clock className="w-5 h-5 text-gray-400" />;
        }
    };

    const getDelayColor = (delay) => {
        if (!delay) return 'text-gray-500';
        if (delay.startsWith('-')) return 'text-green-600';
        if (delay.startsWith('+')) return 'text-red-600';
        return 'text-gray-500';
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle>Tracking - {tracking.expediente}</DialogTitle>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-3 gap-4 py-4">
                    <div>
                        <p className="text-sm text-gray-500">Estado Actual</p>
                        <p className="font-medium">{tracking.status}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Ubicacion</p>
                        <p className="font-medium">{tracking.location}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Progreso</p>
                        <p className="font-medium">{tracking.progress}%</p>
                    </div>
                </div>

                <div className="mt-6">
                    <h3 className="font-semibold mb-4">Timeline de Milestones</h3>
                    <div className="space-y-4">
                        {tracking.milestones.map((milestone, index) => (
                            <div key={milestone.id} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    {getMilestoneIcon(milestone.status)}
                                    {index < tracking.milestones.length - 1 && (
                                        <div className="w-px h-12 bg-gray-200 mt-2"></div>
                                    )}
                                </div>
                                <div className="flex-1 pb-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-medium">{milestone.name}</h4>
                                            <p className="text-sm text-gray-500">{milestone.location}</p>
                                            <p className="text-sm text-gray-600 mt-1">{milestone.note}</p>
                                        </div>
                                        <div className="text-right text-sm">
                                            <p className="text-gray-700">{milestone.date.split(',')[0]}</p>
                                            <p className="text-gray-500">{milestone.date.split(',')[1]}</p>
                                            {milestone.delay && (
                                                <p className={`font-medium ${getDelayColor(milestone.delay)}`}>
                                                    {milestone.delay}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {tracking.alerts && tracking.alerts.length > 0 && (
                    <div className="mt-6">
                        <h3 className="font-semibold mb-4 text-red-600">Alertas</h3>
                        {tracking.alerts.map((alert, index) => (
                            <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="font-medium text-red-800">{alert.message}</p>
                                        <p className="text-sm text-red-600 mt-1">
                                            Severidad: {alert.severity} | Creado: {alert.created}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex justify-end mt-6">
                    <Button variant="outline" onClick={onClose}>Cerrar</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default function TrackingManagement() {
    const [activeTab, setActiveTab] = useState('activos');
    const [selectedTracking, setSelectedTracking] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const handleViewDetail = (tracking) => {
        setSelectedTracking(tracking);
        setShowDetailModal(true);
    };

    const getStatusBadge = (status) => {
        const configs = {
            'En Transito': { bg: 'bg-blue-100', text: 'text-blue-800' },
            'Retenido Aduana': { bg: 'bg-red-100', text: 'text-red-800' },
            'Completado': { bg: 'bg-green-100', text: 'text-green-800' }
        };
        const config = configs[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };
        return <Badge className={`${config.bg} ${config.text} border-0`}>{status}</Badge>;
    };

    const getAlertIcon = (alert) => {
        return alert.type === 'urgent' 
            ? <AlertTriangle className="w-4 h-4 text-red-500" />
            : <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    };

    return (
        <div style={{ backgroundColor: '#F1F0EC', minHeight: '100vh', padding: '24px' }}>
            <div className="max-w-7xl mx-auto">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tracking y Hitos</h1>
                    <p className="text-sm text-gray-500 mt-1">Seguimiento en tiempo real y gestion de milestones</p>
                </div>

                <div className="mt-6 border-b">
                    <div className="flex gap-4">
                        <Button variant={activeTab === 'activos' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('activos')}>
                            Activos
                        </Button>
                        <Button variant={activeTab === 'completados' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('completados')}>
                            Completados
                        </Button>
                        <Button variant={activeTab === 'alertas' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('alertas')}>
                            Alertas
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    {/* Seguimientos Activos */}
                    <Card className="bg-white shadow-sm" style={{ borderRadius: '16px' }}>
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Seguimientos Activos</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {mockTrackingData.map((tracking) => (
                                <div 
                                    key={tracking.id} 
                                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                                    onClick={() => handleViewDetail(tracking)}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-semibold text-blue-600">{tracking.expediente}</h3>
                                            <p className="text-sm text-gray-600">{tracking.vessel}</p>
                                        </div>
                                        {getStatusBadge(tracking.status)}
                                    </div>

                                    <div className="mb-3">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Progreso</span>
                                            <span className="font-medium">{tracking.progress}%</span>
                                        </div>
                                        <Progress value={tracking.progress} className="h-2" />
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                        <MapPin className="w-4 h-4 text-red-500" />
                                        <span>{tracking.location}</span>
                                        <span className="ml-auto">ETA: {tracking.eta}</span>
                                    </div>

                                    {tracking.alerts && tracking.alerts.map((alert, index) => (
                                        <div key={index} className="bg-yellow-50 border-l-4 border-yellow-400 p-2 mt-2">
                                            <div className="flex items-center gap-2">
                                                {getAlertIcon(alert)}
                                                <p className="text-sm text-yellow-800">{alert.message}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Mapa de Seguimiento */}
                    <Card className="bg-white shadow-sm" style={{ borderRadius: '16px' }}>
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Mapa de Seguimiento</CardTitle>
                        </CardHeader>
                        <CardContent className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MapPin className="w-8 h-8 text-blue-600" />
                                </div>
                                <h3 className="font-semibold text-gray-700 mb-2">Mapa Interactivo</h3>
                                <p className="text-sm text-gray-500">Seguimiento en tiempo real de rutas maritimas y aereas</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <TrackingDetailModal
                    tracking={selectedTracking}
                    isOpen={showDetailModal}
                    onClose={() => setShowDetailModal(false)}
                />
            </div>
        </div>
    );
}