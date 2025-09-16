import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  FileText, Download, Eye, Calendar, Clock, User, 
  MapPin, Truck, Phone, Mail, CheckCircle, AlertTriangle,
  MessageCircle, Upload, Send, X
} from "lucide-react";
import { toast } from "sonner";

const mockSelectedDocument = {
  id: "DOC-001",
  type: "albaran", 
  reference: "ALB-2025-001234",
  client: "Mercadona Valencia",
  driver: "María Ortega",
  vehicle: "1234ABC",
  route: "Ruta Valencia Centro",
  deliveryDate: "26/08/2025",
  deliveryTime: "14:30",
  status: "delivered",
  signedBy: "Juan García",
  signatureTime: "26/08/2025 14:35",
  documents: [
    { name: "Albarán original", type: "pdf", size: "2.3 MB" },
    { name: "Firma digital", type: "pdf", size: "1.1 MB" }
  ],
  issues: [],
  timeline: [
    { time: "26/08/2025 09:00", event: "Documento creado", type: "info" },
    { time: "26/08/2025 09:15", event: "Asignado a ruta", type: "info" },
    { time: "26/08/2025 14:30", event: "Llegada a destino", type: "info" },
    { time: "26/08/2025 14:35", event: "Documento firmado por Juan García", type: "success" }
  ]
};

const mockQuickActions = [
  "Firmar automáticamente",
  "Reenviar POD al cliente", 
  "Marcar como incidencia",
  "Solicitar firma pendiente",
  "Compartir enlace de descarga"
];

const mockConversations = [
  { sender: "María Ortega", message: "Todo correcto, llegando en 15 min", time: "14:20" },
  { sender: "Operador", message: "Perfecto, cliente notificado", time: "14:22" }
];

export default function PODDetailsPanel() {
  const [selectedDocument] = useState(mockSelectedDocument);
  const [newMessage, setNewMessage] = useState("");

  // Configuración de estados según JSON
  const statusConfig = {
    pending: { bg: "#F3F4F6", color: "#374151", label: "Pendiente" },
    delivered: { bg: "rgba(16,185,129,0.12)", color: "#10B981", label: "Entregado" },
    late: { bg: "rgba(219,33,66,0.12)", color: "#DB2142", label: "Retrasado" },
    issue: { bg: "rgba(245,158,11,0.12)", color: "#F59E0B", label: "Incidencia" }
  };

  // Configuración de timeline según JSON
  const timelineConfig = {
    info: { icon: Clock, color: "#6B7280" },
    success: { icon: CheckCircle, color: "#10B981" },
    warning: { icon: AlertTriangle, color: "#F59E0B" },
    error: { icon: X, color: "#DB2142" }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      toast.success("Mensaje enviado");
      setNewMessage("");
    }
  };

  const handleQuickAction = (action) => {
    toast.success(`Ejecutando: ${action}`);
  };

  const config = statusConfig[selectedDocument.status];

  return (
    <div className="space-y-4 sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto">
      {/* Card de información principal */}
      <Card style={{ 
        borderRadius: '12px', 
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        minHeight: '220px'
      }}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle style={{ fontSize: '18px', fontWeight: 600 }}>
                {selectedDocument.reference}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {selectedDocument.type === 'albaran' ? 'Albarán' : 
                 selectedDocument.type === 'cmr' ? 'CMR' : 
                 selectedDocument.type === 'factura' ? 'Factura' : 'POD'}
              </p>
            </div>
            <Badge style={{ 
              backgroundColor: config.bg,
              color: config.color,
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 500
            }}>
              {config.label}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Información del cliente y conductor */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <div>
                <p className="font-medium">Cliente</p>
                <p className="text-gray-600">{selectedDocument.client}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-gray-400" />
              <div>
                <p className="font-medium">Conductor</p>
                <p className="text-gray-600">{selectedDocument.driver}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="font-medium">Fecha entrega</p>
                <p className="text-gray-600">{selectedDocument.deliveryDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <div>
                <p className="font-medium">Hora entrega</p>
                <p className="text-gray-600">{selectedDocument.deliveryTime}</p>
              </div>
            </div>
          </div>

          {selectedDocument.signedBy && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <div>
                <p className="font-medium">Firmado por</p>
                <p className="text-gray-600">{selectedDocument.signedBy} - {selectedDocument.signatureTime}</p>
              </div>
            </div>
          )}

          {/* Acciones principales */}
          <div className="flex gap-2 pt-2">
            <Button 
              size="sm"
              style={{
                backgroundColor: "#4472C4",
                color: "#FFFFFF",
                height: "32px",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: 500
              }}
              onClick={() => toast.success("Visualizando documento")}
            >
              <Eye className="w-4 h-4 mr-1" />
              Ver
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              style={{
                height: "32px",
                borderRadius: "12px",
                borderColor: "#4472C4",
                color: "#4472C4"
              }}
              onClick={() => toast.success("Descargando documento")}
            >
              <Download className="w-4 h-4 mr-1" />
              Descargar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Card de documentos */}
      <Card style={{ 
        borderRadius: '12px', 
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        maxHeight: '320px'
      }}>
        <CardHeader className="pb-3">
          <CardTitle style={{ fontSize: '16px', fontWeight: 600 }}>Documentos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3" style={{ maxHeight: '240px', overflowY: 'auto' }}>
          {selectedDocument.documents.map((doc, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">{doc.name}</p>
                  <p className="text-xs text-gray-500">{doc.type.toUpperCase()} • {doc.size}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost">
                  <Eye className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Download className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
          
          <Button 
            variant="outline" 
            className="w-full border-dashed"
            onClick={() => toast.success("Subiendo documento adicional")}
            style={{ borderRadius: '8px' }}
          >
            <Upload className="w-4 h-4 mr-2" />
            Añadir documento
          </Button>
        </CardContent>
      </Card>

      {/* Card de comunicaciones */}
      <Card style={{ 
        borderRadius: '12px', 
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        minHeight: '128px'
      }}>
        <CardHeader className="pb-3">
          <CardTitle style={{ fontSize: '16px', fontWeight: 600 }}>Chat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Respuestas rápidas */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Respuestas rápidas</p>
            <div className="flex flex-wrap gap-2">
              {mockQuickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action)}
                  className="px-3 py-1 text-xs rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
                  style={{ 
                    backgroundColor: 'rgba(68,114,196,0.08)',
                    color: '#4472C4',
                    border: '1px solid rgba(68,114,196,0.2)'
                  }}
                >
                  {action}
                </button>
              ))}
            </div>
          </div>

          {/* Conversaciones */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Conversaciones activas</p>
            {mockConversations.map((conv, index) => (
              <div key={index} className="text-sm">
                <p><strong>{conv.sender}:</strong> {conv.message}</p>
                <p className="text-xs text-gray-500">{conv.time}</p>
              </div>
            ))}
          </div>

          {/* Input para nuevo mensaje */}
          <div className="flex gap-2">
            <Input
              placeholder="Escribir mensaje..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              style={{
                backgroundColor: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '14px'
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button 
              size="sm" 
              onClick={handleSendMessage}
              style={{
                backgroundColor: "#4472C4",
                borderRadius: '8px'
              }}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card style={{ 
        borderRadius: '12px', 
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        minHeight: '128px'
      }}>
        <CardHeader className="pb-3">
          <CardTitle style={{ fontSize: '16px', fontWeight: 600 }}>Historial</CardTitle>
        </CardHeader>
        <CardContent style={{ overflowY: 'auto' }}>
          <div className="space-y-4">
            {selectedDocument.timeline.map((event, index) => {
              const timelineType = timelineConfig[event.type];
              const IconComponent = timelineType.icon;
              
              return (
                <div key={index} className="flex gap-3">
                  <div 
                    className="flex-shrink-0 mt-1 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${timelineType.color}20` }}
                  >
                    <IconComponent 
                      className="w-3 h-3" 
                      style={{ color: timelineType.color }}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{event.event}</p>
                    <p className="text-xs text-gray-500">{event.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}