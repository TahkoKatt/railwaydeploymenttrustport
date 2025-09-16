import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Plus, MoreHorizontal, Eye, Download } from 'lucide-react';

const mockBookingData = [
  {
    id: "bkg-001",
    booking_number: "MSC240828001",
    voyage: "425W",
    carrier: "MSC",
    service: "AEGEAN EXPRESS",
    vessel: "MSC BARCELONA",
    route: "Valencia → New York",
    containers: "2 x 40HC",
    etd: "30/8/2025",
    eta: "15/9/2025",
    si_reference: "SI-ES-20319",
    status: "confirmed",
  },
  {
    id: "bkg-002",
    booking_number: "PENDING-RFQ",
    voyage: "",
    carrier: "Multiple",
    service: "RFQ en curso",
    vessel: "",
    route: "Lima → Madrid",
    containers: "15 x Pallets",
    etd: "2/9/2025",
    eta: "TBD",
    si_reference: "SI-PE-90112",
    status: "quoting",
    offers: 3,
  },
  {
    id: "bkg-003",
    booking_number: "HAPAG456789",
    voyage: "156E",
    carrier: "Hapag-Lloyd",
    service: "AMERICA EXPRESS SERVICE",
    vessel: "HAMBURG EXPRESS",
    route: "Veracruz → Barcelona",
    containers: "8.5 x LCL",
    etd: "5/9/2025",
    eta: "18/9/2025",
    si_reference: "SI-MX-45678",
    status: "requested",
  },
];

const getStatusBadge = (status, offers) => {
    switch (status) {
        case 'confirmed':
            return <Badge className="bg-green-100 text-green-800 border-green-200">Confirmado</Badge>;
        case 'quoting':
            return (
                <div className="flex flex-col items-start">
                    <Badge className="bg-orange-100 text-orange-800 border-orange-200">Cotizando</Badge>
                    {offers && <span className="text-xs text-gray-500 mt-1">{offers} ofertas recibidas</span>}
                </div>
            );
        case 'requested':
            return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Solicitado</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

const RFQModal = ({ open, onOpenChange }) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>RFQ Spot Bidding - Nueva Cotizacion</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div>
                        <Label htmlFor="si-reference">S/I Reference</Label>
                        <Select>
                            <SelectTrigger id="si-reference">
                                <SelectValue placeholder="Seleccionar S/I..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="SI-ES-20319">SI-ES-20319</SelectItem>
                                <SelectItem value="SI-PE-90112">SI-PE-90112</SelectItem>
                                <SelectItem value="SI-MX-45678">SI-MX-45678</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="etd">ETD Preferido</Label>
                            <Input id="etd" type="date" placeholder="dd/mm/aaaa" />
                        </div>
                        <div>
                            <Label>Carriers para RFQ</Label>
                            <div className="space-y-2 pt-2">
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="msc" defaultChecked />
                                    <Label htmlFor="msc" className="font-normal">MSC</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="hapag" defaultChecked />
                                    <Label htmlFor="hapag" className="font-normal">Hapag-Lloyd</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="cma" />
                                    <Label htmlFor="cma" className="font-normal">CMA CGM</Label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button style={{ backgroundColor: '#4472C4', color: 'white' }} onClick={() => onOpenChange(false)}>
                        Enviar RFQ
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};


export default function BookingManagement() {
    const [showRFQModal, setShowRFQModal] = useState(false);

    return (
        <div style={{ backgroundColor: '#F1F0EC', minHeight: '100vh', padding: '24px' }}>
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
                        <p className="text-sm text-gray-500 mt-1">Reservas de espacio y gestion con navieras/aerolineas</p>
                    </div>
                    <Button onClick={() => setShowRFQModal(true)} style={{ backgroundColor: '#4472C4', color: 'white' }}>
                        <Plus className="w-4 h-4 mr-2" />
                        RFQ Spot Bidding
                    </Button>
                </div>

                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Buscar por booking, naviera, S/I..."
                            className="pl-10 bg-white"
                        />
                    </div>
                    <Select defaultValue="all">
                        <SelectTrigger className="w-40 bg-white">
                            <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            <SelectItem value="confirmed">Confirmado</SelectItem>
                            <SelectItem value="quoting">Cotizando</SelectItem>
                             <SelectItem value="requested">Solicitado</SelectItem>
                        </SelectContent>
                    </Select>
                     <Select defaultValue="all">
                        <SelectTrigger className="w-40 bg-white">
                            <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="msc">MSC</SelectItem>
                            <SelectItem value="hapag">Hapag-Lloyd</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Card className="bg-white shadow-sm" style={{ boxShadow: '0 8px 24px rgba(0,0,0,.08)', borderRadius: '16px' }}>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Gestion de Bookings ({mockBookingData.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Booking #</TableHead>
                                    <TableHead>Naviera / Servicio</TableHead>
                                    <TableHead>Ruta</TableHead>
                                    <TableHead>ETD/ETA</TableHead>
                                    <TableHead>S/I Ref</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockBookingData.map((booking) => (
                                    <TableRow key={booking.id}>
                                        <TableCell className="font-medium">
                                            <p>{booking.booking_number}</p>
                                            {booking.voyage && <p className="text-xs text-gray-500">{booking.voyage}</p>}
                                        </TableCell>
                                        <TableCell>
                                            <p className="font-medium">{booking.carrier}</p>
                                            <p className="text-xs text-gray-500">{booking.service}</p>
                                            {booking.vessel && <p className="text-xs text-blue-600">{booking.vessel}</p>}
                                        </TableCell>
                                        <TableCell>
                                            <p className="font-medium">{booking.route}</p>
                                            <p className="text-xs text-gray-500">{booking.containers}</p>
                                        </TableCell>
                                        <TableCell>
                                            <p className="text-sm">ETD: {booking.etd}</p>
                                            <p className="text-xs text-gray-500">ETA: {booking.eta}</p>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-blue-600 cursor-pointer hover:underline">{booking.si_reference}</span>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(booking.status, booking.offers)}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        Ver detalles
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Download className="w-4 h-4 mr-2" />
                                                        Descargar confirmacion
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

                <RFQModal open={showRFQModal} onOpenChange={setShowRFQModal} />
            </div>
        </div>
    );
}