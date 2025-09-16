
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Share2, CheckCircle, AlertTriangle, BarChart, FileText, Send } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';

// APIs
import { postventaCasesList } from '@/api/functions';
import { postventaCaseCreate } from '@/api/functions';
import { postventaShareLinkCreate } from '@/api/functions';
import { npsSurveysList, npsSurveyUpsert, npsResponsesList, npsResponseUpsert } from '@/api/functions';
import { cobranzaList } from '@/api/functions';
import { cobranzaPromiseUpsert } from '@/api/functions';
import { cobranzaReminderSend } from '@/api/functions';
import { npsTheme } from '@/api/functions';
import { npsSend } from '@/api/functions';
import { cobranzasStats } from '@/api/functions';

// Sub-componente KpiCard movido al principio
const KpiCard = ({ title, value, count }) => (
  <Card style={{ borderRadius: '16px' }}>
      <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
      </CardHeader>
      <CardContent>
          <p className="text-2xl font-bold">{value}</p>
          {count && <p className="text-xs text-gray-500">{count}</p>}
      </CardContent>
  </Card>
);

export default function ClientesPostventa() {
  const [activeTab, setActiveTab] = useState('soporte');
  
  // States para Soporte
  const [soporteItems, setSoporteItems] = useState([]);
  const [soporteLoading, setSoporteLoading] = useState(false);
  const [soporteQ, setSoporteQ] = useState('');
  const [soporteStatus, setSoporteStatus] = useState('pending');
  const [soporteNewOpen, setSoporteNewOpen] = useState(false);
  const [newCaseData, setNewCaseData] = useState({ related_id: '', notes: '' });

  // States para NPS
  const [npsLoading, setNpsLoading] = useState(false);
  const [npsSurveys, setNpsSurveys] = useState([]);
  const [npsResponses, setNpsResponses] = useState([]);
  const [npsClusters, setNpsClusters] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState('');
  
  // States para Cobranza
  const [cobranzaItems, setCobranzaItems] = useState([]);
  const [cobranzaLoading, setCobranzaLoading] = useState(false);
  const [cobranzaStats, setCobranzaStats] = useState(null);
  const [promiseModalOpen, setPromiseModalOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [promiseData, setPromiseData] = useState({ promise_date: '', promise_amount: '', note: '' });

  // Memos
  const npsData = useMemo(() => {
    const promoters = npsResponses.filter(r => r.score >= 9).length;
    const passives = npsResponses.filter(r => r.score >= 7 && r.score <= 8).length;
    const detractors = npsResponses.filter(r => r.score <= 6).length;
    const total = npsResponses.length;
    return {
        pieData: [
            { name: 'Detractores', value: detractors, color: '#DB2142' },
            { name: 'Neutrales', value: passives, color: '#FFC857' },
            { name: 'Promotores', value: promoters, color: '#00A878' },
        ],
        nps: total > 0 ? Math.round(((promoters / total) * 100) - ((detractors / total) * 100)) : 0,
    };
  }, [npsResponses]);

  const groupedInvoices = useMemo(() => {
    const overdue = cobranzaItems.filter(i => i.status === 'overdue');
    const dueNext7d = cobranzaItems.filter(i => i.status === 'sent' && new Date(i.due_date) > new Date() && new Date(i.due_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    const disputed = cobranzaItems.filter(i => i.status === 'disputed' || i.status === 'blocked');
    return { overdue, dueNext7d, disputed };
  }, [cobranzaItems]);

  const loadSoporte = useCallback(async () => {
    setSoporteLoading(true);
    try {
      const res = await postventaCasesList({ status: soporteStatus, q: soporteQ });
      setSoporteItems(res.data.items || []);
    } catch (e) {
      toast.error("Error al cargar casos de soporte.");
    } finally {
      setSoporteLoading(false);
    }
  }, [soporteStatus, soporteQ]);

  const loadNps = useCallback(async () => {
    setNpsLoading(true);
    try {
      const [surveysRes, responsesRes] = await Promise.all([
          npsSurveysList(),
          npsResponsesList({ survey_id: selectedSurvey || undefined })
      ]);
      setNpsSurveys(surveysRes.data.items || []);
      setNpsResponses(responsesRes.data.items || []);
      if(!selectedSurvey && surveysRes.data.items?.length > 0) {
        setSelectedSurvey(surveysRes.data.items[0].id);
      }
    } catch(e) {
      toast.error("Error al cargar datos de NPS.");
    } finally {
      setNpsLoading(false);
    }
  }, [selectedSurvey]);

  const loadCobranza = useCallback(async () => {
    setCobranzaLoading(true);
    try {
        const [listRes, statsRes] = await Promise.all([
            cobranzaList(),
            cobranzasStats()
        ]);
      setCobranzaItems(listRes.data.items || []);
      setCobranzaStats(statsRes.data);
    } catch(e) {
        toast.error("Error al cargar datos de cobranza.");
    } finally {
      setCobranzaLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = 'Postventa | Trustport';
    if (activeTab === 'soporte') loadSoporte();
    if (activeTab === 'nps') loadNps();
    if (activeTab === 'cobranza') loadCobranza();
  }, [activeTab, loadSoporte, loadNps, loadCobranza]);

  const handleCreateCase = async (e) => {
    e.preventDefault();
    if (!newCaseData.related_id || !newCaseData.notes) {
      toast.warning("Por favor, completa todos los campos.");
      return;
    }
    setSoporteLoading(true);
    try {
      await postventaCaseCreate(newCaseData);
      toast.success("Caso de soporte creado.");
      setSoporteNewOpen(false);
      setNewCaseData({ related_id: '', notes: '' });
      loadSoporte();
    } catch(e) {
      toast.error("Error al crear el caso.");
    } finally {
      setSoporteLoading(false);
    }
  };

  const shareCaseLink = async (caseItem) => {
    try {
      const res = await postventaShareLinkCreate({ activity_id: caseItem.id });
      navigator.clipboard.writeText(`${window.location.origin}${res.data.link}`);
      toast.success("Enlace copiado al portapapeles.");
    } catch (e) {
      toast.error("No se pudo generar el enlace.");
    }
  };

  const runNpsTheming = async () => {
    setNpsLoading(true);
    try {
        const res = await npsTheme({ survey_id: selectedSurvey });
        setNpsClusters(res.data.clusters || []);
        toast.success(`Análisis de IA completado. ${res.data.clusters?.length || 0} temas encontrados.`);
    } catch(e) {
        toast.error("Error al ejecutar el análisis de IA.");
    } finally {
        setNpsLoading(false);
    }
  };
  
  const handleSendNpsDigest = async () => {
    toast.info("Generando y emitiendo digest semanal...");
    // Esto sería una llamada a una función de backend
    // npsDigestWeekly({ recipients: ['tu@email.com'] })
    // y luego mostrar el markdown en un modal.
  };

  const handleOpenPromiseModal = (invoice) => {
    setCurrentInvoice(invoice);
    setPromiseData({ promise_date: '', promise_amount: invoice.amount, note: '' });
    setPromiseModalOpen(true);
  };
  
  const handleSavePromise = async (e) => {
    e.preventDefault();
    try {
        await cobranzaPromiseUpsert({
            invoice_id: currentInvoice.id,
            ...promiseData
        });
        toast.success("Promesa de pago registrada.");
        setPromiseModalOpen(false);
        loadCobranza();
    } catch(err) {
        toast.error("Error al registrar la promesa.");
    }
  };

  const handleSendReminder = async (invoiceId) => {
    try {
      await cobranzaReminderSend({ invoice_id: invoiceId, channel: 'email' });
      toast.success("Solicitud de recordatorio enviada.");
    } catch(err) {
      toast.error("Error al enviar recordatorio.");
    }
  };

  const renderSoporte = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input placeholder="Buscar por ID de cliente o notas..." value={soporteQ} onChange={e => setSoporteQ(e.target.value)} className="max-w-sm" />
        <select value={soporteStatus} onChange={e => setSoporteStatus(e.target.value)} className="p-2 border rounded-md">
          <option value="pending">Pendientes</option>
          <option value="completed">Completados</option>
          <option value="all">Todos</option>
        </select>
        <div className="flex-grow" />
        <Button onClick={() => setSoporteNewOpen(true)} style={{ backgroundColor: '#4472C4', color: 'white' }}>
          <Plus className="w-4 h-4 mr-2" />Nuevo Caso
        </Button>
      </div>

      <Card style={{ borderRadius: '16px' }}>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Caso</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Resumen</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>SLA</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {soporteLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center p-8"><Loader2 className="animate-spin inline-block" /></TableCell></TableRow>
              ) : soporteItems.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs">{item.id.slice(-8)}</TableCell>
                  <TableCell>{new Date(item.when).toLocaleDateString()}</TableCell>
                  <TableCell>{item.related_id}</TableCell>
                  <TableCell className="max-w-md truncate">{item.notes}</TableCell>
                  <TableCell><Badge variant={item.status === 'completed' ? 'default' : 'secondary'}>{item.status}</Badge></TableCell>
                  <TableCell>
                    {item.sla_due_at && item.status === 'pending' && (
                      new Date(item.sla_due_at) < new Date() ?
                      <Badge className="bg-red-100 text-red-700">Vencido</Badge> :
                      <Badge className="bg-green-100 text-green-700">En plazo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => shareCaseLink(item)}><Share2 className="w-4 h-4 mr-1" /> Compartir</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Nuevo Caso */}
      {soporteNewOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg" style={{ borderRadius: '16px' }}>
            <form onSubmit={handleCreateCase}>
              <CardHeader><CardTitle>Nuevo Caso de Soporte</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="ID de Cliente" value={newCaseData.related_id} onChange={e => setNewCaseData({...newCaseData, related_id: e.target.value})} />
                <Textarea placeholder="Describe el problema..." value={newCaseData.notes} onChange={e => setNewCaseData({...newCaseData, notes: e.target.value})} />
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="ghost" type="button" onClick={() => setSoporteNewOpen(false)}>Cancelar</Button>
                <Button type="submit" style={{ backgroundColor: '#4472C4', color: 'white' }}>Crear Caso</Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  );

  const renderNps = () => {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <select value={selectedSurvey} onChange={e => setSelectedSurvey(e.target.value)} className="p-2 border rounded-md">
                    {npsSurveys.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <Button variant="outline" onClick={runNpsTheming} disabled={npsLoading}>
                    {npsLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <BarChart className="w-4 h-4 mr-2"/>}
                    Analizar Temas (IA)
                </Button>
                 <div className="flex-grow" />
                 <Button onClick={handleSendNpsDigest} style={{ backgroundColor: '#4472C4', color: 'white' }}>
                    <Send className="w-4 h-4 mr-2"/> Enviar Digest Semanal
                 </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                <Card style={{ borderRadius: '16px' }}>
                    <CardHeader><CardTitle>Distribución NPS</CardTitle></CardHeader>
                    <CardContent className="relative h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={npsData.pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={60} fill="#8884d8" paddingAngle={5}>
                                    {npsData.pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
                            {npsData.nps}
                        </div>
                    </CardContent>
                </Card>
                <Card className="md:col-span-2" style={{ borderRadius: '16px' }}>
                    <CardHeader><CardTitle>Temas Principales (IA)</CardTitle></CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        {npsLoading ? <Loader2 className="animate-spin"/> :
                            npsClusters.length > 0 ? npsClusters.map(c => (
                                <Badge key={c.theme} className={`p-2 text-sm ${c.sentiment === 'positive' ? 'bg-green-100 text-green-800' : c.sentiment === 'negative' ? 'bg-red-100 text-red-800' : 'bg-gray-100'}`}>
                                    {c.theme} ({c.count})
                                </Badge>
                            )) : <p className="text-sm text-gray-500">Sin temas analizados. Haz click en "Analizar Temas".</p>
                        }
                    </CardContent>
                </Card>
            </div>
        </div>
    );
  };

  const renderCobranza = () => {
    return (
        <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
                <KpiCard title="Total Vencido" value={`€${(cobranzaStats?.overdue_sum || 0).toLocaleString()}`} count={`${cobranzaStats?.overdue_count || 0} facturas`} />
                <KpiCard title="Vence en 7 días" value={`${cobranzaStats?.due_7d_count || 0} facturas`} />
                <KpiCard title="En Disputa" value={`${cobranzaStats?.disputed_count || 0} facturas`} />
            </div>
            
            {Object.entries(groupedInvoices).map(([group, items]) => items.length > 0 && (
                <Card key={group} style={{ borderRadius: '16px' }}>
                    <CardHeader><CardTitle className="capitalize">{group === 'overdue' ? 'Vencidas' : group === 'dueNext7d' ? 'Vencen Próximamente' : 'En Disputa'}</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Factura #</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Vencimiento</TableHead>
                                <TableHead>Monto</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map(inv => (
                                    <TableRow key={inv.id}>
                                        <TableCell>{inv.id.slice(-8)}</TableCell>
                                        <TableCell>{inv.account_id /* idealmente un nombre */}</TableCell>
                                        <TableCell>{new Date(inv.due_date).toLocaleDateString()}</TableCell>
                                        <TableCell>€{inv.amount.toLocaleString()}</TableCell>
                                        <TableCell>
                                            {inv.promise_date ? <Badge className="bg-blue-100 text-blue-700">Promesa</Badge> : <Badge variant="destructive">{inv.status}</Badge>}
                                        </TableCell>
                                        <TableCell className="text-right flex gap-2 justify-end">
                                            <Button size="sm" variant="outline" onClick={() => handleSendReminder(inv.id)}>Recordatorio</Button>
                                            <Button size="sm" style={{backgroundColor:'#4472C4', color: 'white'}} onClick={() => handleOpenPromiseModal(inv)}>Promesa Pago</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            ))}

            {promiseModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-lg" style={{ borderRadius: '16px' }}>
                        <form onSubmit={handleSavePromise}>
                            <CardHeader><CardTitle>Registrar Promesa de Pago</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label>Fecha Promesa</label>
                                    <Input type="date" value={promiseData.promise_date} onChange={e => setPromiseData({...promiseData, promise_date: e.target.value})} required />
                                </div>
                                <div>
                                    <label>Monto Promesa</label>
                                    <Input type="number" value={promiseData.promise_amount} onChange={e => setPromiseData({...promiseData, promise_amount: e.target.value})} />
                                </div>
                                <Textarea placeholder="Nota (opcional)" value={promiseData.note} onChange={e => setPromiseData({...promiseData, note: e.target.value})} />
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2">
                                <Button type="button" variant="ghost" onClick={() => setPromiseModalOpen(false)}>Cancelar</Button>
                                <Button type="submit" style={{backgroundColor:'#4472C4', color: 'white'}}>Guardar Promesa</Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight" style={{ color: "#1F2937" }}>Postventa</h1>
        <div className="flex gap-1 bg-gray-200 p-1 rounded-lg">
          {['soporte', 'nps', 'cobranza'].map(tab => (
            <Button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                variant={activeTab === tab ? 'default' : 'ghost'}
                className="capitalize"
                style={activeTab === tab ? { backgroundColor: '#4472C4', color: 'white'} : {}}
            >
                {tab}
            </Button>
          ))}
        </div>
      </div>
      {activeTab === 'soporte' && renderSoporte()}
      {activeTab === 'nps' && renderNps()}
      {activeTab === 'cobranza' && renderCobranza()}
    </div>
  );
}
