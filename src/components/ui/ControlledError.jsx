import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Home, RefreshCw, ArrowLeft } from "lucide-react";

/*
CONTROLLED ERROR COMPONENT
Gate G0 requirement: ?tab=invalid → error UI controlled, never clone dashboard
Router ASCII-only + fallback seguro
*/

export default function ControlledError({ 
  error,
  onRetry,
  onGoHome,
  onGoBack,
  showFallback = true
}) {
  const getErrorIcon = () => {
    switch (error?.code) {
      case 'ASCII_VALIDATION_FAILED':
      case 'TAB_NOT_FOUND':
        return AlertTriangle;
      default:
        return AlertTriangle;
    }
  };

  const ErrorIcon = getErrorIcon();

  const getErrorSeverity = () => {
    switch (error?.code) {
      case 'INTERNAL_ROUTER_ERROR':
        return { color: 'bg-red-100 text-red-800', level: 'CRITICAL' };
      case 'ASCII_VALIDATION_FAILED':
        return { color: 'bg-orange-100 text-orange-800', level: 'INVALID INPUT' };
      case 'TAB_NOT_FOUND':
        return { color: 'bg-yellow-100 text-yellow-800', level: 'NOT FOUND' };
      default:
        return { color: 'bg-gray-100 text-gray-800', level: 'ERROR' };
    }
  };

  const severity = getErrorSeverity();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full" style={{ borderRadius: '16px' }}>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <ErrorIcon className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            Error de Navegación
            <Badge className={severity.color}>{severity.level}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error Details */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900 mb-2">
              {error?.title || 'Error de Ruta'}
            </p>
            <p className="text-sm text-gray-600 mb-3">
              {error?.message || 'Ha ocurrido un error inesperado en la navegación.'}
            </p>
            {error?.code && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs font-mono">
                  {error.code}
                </Badge>
                <span className="text-xs text-gray-500">
                  {error?.timestamp && new Date(error.timestamp).toLocaleString('es-ES')}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-2">
            {showFallback && error?.fallbackLabel && (
              <Button 
                onClick={onGoHome} 
                className="w-full"
                style={{ backgroundColor: '#4472C4', color: 'white' }}
              >
                <Home className="w-4 h-4 mr-2" />
                {error.fallbackLabel}
              </Button>
            )}
            
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={onGoBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <Button variant="outline" onClick={onRetry}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reintentar
              </Button>
            </div>
          </div>

          {/* Help Text */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Si el problema persiste, contacte al administrador del sistema.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Error ID: {error?.code}-{Date.now().toString().slice(-6)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}