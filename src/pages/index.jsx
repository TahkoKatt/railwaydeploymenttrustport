import Layout from "./Layout.jsx";

import COMEX from "./COMEX";

import Finanzas from "./Finanzas";

import Dashboard from "./Dashboard";

import SRM from "./SRM";

import Compras from "./Compras";

import WMS from "./WMS";

import TMS from "./TMS";

import CRM from "./CRM";

import RevenueManagement from "./RevenueManagement";

import ComprasRC from "./ComprasRC";

import PostRCCompras from "./PostRCCompras";

import Clientes from "./Clientes";

import rm from "./rm";

import Portal from "./Portal";

import Fin from "./Fin";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    COMEX: COMEX,
    
    Finanzas: Finanzas,
    
    Dashboard: Dashboard,
    
    SRM: SRM,
    
    Compras: Compras,
    
    WMS: WMS,
    
    TMS: TMS,
    
    CRM: CRM,
    
    RevenueManagement: RevenueManagement,
    
    ComprasRC: ComprasRC,
    
    PostRCCompras: PostRCCompras,
    
    Clientes: Clientes,
    
    rm: rm,
    
    Portal: Portal,
    
    Fin: Fin,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<COMEX />} />
                
                
                <Route path="/COMEX" element={<COMEX />} />
                
                <Route path="/Finanzas" element={<Finanzas />} />
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/SRM" element={<SRM />} />
                
                <Route path="/Compras" element={<Compras />} />
                
                <Route path="/WMS" element={<WMS />} />
                
                <Route path="/TMS" element={<TMS />} />
                
                <Route path="/CRM" element={<CRM />} />
                
                <Route path="/RevenueManagement" element={<RevenueManagement />} />
                
                <Route path="/ComprasRC" element={<ComprasRC />} />
                
                <Route path="/PostRCCompras" element={<PostRCCompras />} />
                
                <Route path="/Clientes" element={<Clientes />} />
                
                <Route path="/rm" element={<rm />} />
                
                <Route path="/Portal" element={<Portal />} />
                
                <Route path="/Fin" element={<Fin />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}