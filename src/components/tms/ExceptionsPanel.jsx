import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Clock, Route, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const exceptionData = [
  {
    icon: Clock,
    color: "text-yellow-500",
    title: "Retrasos > 30 min",
    value: "4 envíos",
    description: "Ruta BCN-MAD, Ruta SEV-VAL...",
  },
  {
    icon: Route,
    color: "text-orange-500",
    title: "Desvíos críticos",
    value: "2 envíos",
    description: "Vehículo V-002 desviado 5km.",
  },
  {
    icon: AlertTriangle,
    color: "text-red-500",
    title: "Incidencias POD",
    value: "1 incidencia",
    description: "Falta firma en entrega E-456.",
  },
   {
    icon: CheckCircle,
    color: "text-green-500",
    title: "Entregas en riesgo",
    value: "5 entregas",
    description: "ETA podría superar el SLA.",
  },
];

const ExceptionItem = ({ icon: Icon, color, title, value, description }) => (
  <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50">
    <Icon className={`w-5 h-5 mt-1 flex-shrink-0 ${color}`} />
    <div className="flex-1">
      <div className="flex justify-between items-center">
        <p className="font-semibold text-sm">{title}</p>
        <p className="font-medium text-sm text-gray-800">{value}</p>
      </div>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
      <Button variant="link" size="sm" className="h-auto p-0 mt-1 text-xs">
        Ver detalles
      </Button>
    </div>
  </div>
);

export default function ExceptionsPanel() {
  return (
    <Card className="bg-white shadow-sm h-full flex flex-col" style={{ boxShadow: 'var(--shadow)', borderRadius: 'var(--radius)' }}>
      <CardHeader>
        <CardTitle className="text-[18px] font-semibold">
          Excepciones y Alertas
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 flex-1">
        <div className="space-y-2">
          {exceptionData.map((item, index) => (
            <ExceptionItem key={index} {...item} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}