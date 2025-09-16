import React from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Home, Truck, FileText, MessageSquare, DollarSign, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

// Component Stubs - to be implemented in subsequent tickets
const PortalHome = () => <Card><CardHeader><CardTitle>Portal Home</CardTitle></CardHeader><CardContent>Dashboard with persona-aware KPIs and alerts.</CardContent></Card>;
const ShipmentList = () => <Card><CardHeader><CardTitle>My Shipments</CardTitle></CardHeader><CardContent>List of active and past shipments.</CardContent></Card>;
const DocumentCenter = () => <Card><CardHeader><CardTitle>Document Center</CardTitle></CardHeader><CardContent>Upload and manage documents.</CardContent></Card>;
const CaseCenter = () => <Card><CardHeader><CardTitle>Case Center</CardTitle></CardHeader><CardContent>View and manage support tickets.</CardContent></Card>;
const BillingCenter = () => <Card><CardHeader><CardTitle>Billing</CardTitle></CardHeader><CardContent>View invoices and make payments.</CardContent></Card>;
const PortalSettings = () => <Card><CardHeader><CardTitle>Settings</CardTitle></CardHeader><CardContent>Manage profile and notifications.</CardContent></Card>;

const views = {
  home: { component: PortalHome, label: "Home", icon: Home },
  shipments: { component: ShipmentList, label: "Shipments", icon: Truck },
  docs: { component: DocumentCenter, label: "Documents", icon: FileText },
  cases: { component: CaseCenter, label: "Cases", icon: MessageSquare },
  billing: { component: BillingCenter, label: "Billing", icon: DollarSign },
  settings: { component: PortalSettings, label: "Settings", icon: Settings },
};

export default function PortalPage() {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const view = urlParams.get('view') || 'home';

  const CurrentView = views[view]?.component || (() => (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle /> Invalid View
        </CardTitle>
      </CardHeader>
      <CardContent>
        The requested view '{view}' does not exist. Please select a valid section.
      </CardContent>
    </Card>
  ));
  
  // NOTE: This is a simplified shell for external users. 
  // The main app layout is not used here.
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#F1F0EC", fontFamily: 'Montserrat, sans-serif' }}>
      <nav className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-4 border-b border-gray-200">
          <h1 className="text-xl font-bold">Trustport Portal</h1>
        </div>
        <div className="flex-1 p-2 space-y-1">
          {Object.entries(views).map(([key, { label, icon: Icon }]) => (
            <a 
              key={key} 
              href={`/Portal?view=${key}`} 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                view === key ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </a>
          ))}
        </div>
        <div className="p-4 border-t border-gray-200">
           <Button variant="outline" className="w-full">Log Out</Button>
        </div>
      </nav>
      <main className="flex-1 p-6">
        <CurrentView />
      </main>
    </div>
  );
}