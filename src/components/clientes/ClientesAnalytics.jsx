
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { leadsList } from '@/api/functions';
import { rmOpportunitiesList } from '@/api/functions';
import { clientesAnalyticsSeries } from '@/api/functions';
import { Loader2, TrendingUp, Users, DollarSign, Target, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const COLORS = ['#4472C4', '#DB2142', '#00A878', '#FFC857', '#6C7DF7'];

export default function ClientesAnalytics() {
  const [data, setData] = useState({
    leads: [],
    opportunities: [],
    series: null,
    funnel: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAnalytics = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [leadsRes, oppsRes, seriesRes] = await Promise.all([
        leadsList().catch(() => ({ data: { items: [] } })),
        rmOpportunitiesList().catch(() => ({ data: { items: [] } })),
        clientesAnalyticsSeries().catch(() => ({ data: { series: null } }))
      ]);

      const leads = leadsRes.data?.items || [];
      const opportunities = oppsRes.data?.items || [];
      const series = seriesRes.data?.series;

      // Calculate funnel data
      const funnelData = [
        { stage: 'Leads', count: leads.length, color: '#4472C4' },
        { stage: 'Calificados', count: leads.filter(l => l.status === 'qualified').length, color: '#00A878' },
        { stage: 'Convertidos', count: leads.filter(l => l.status === 'converted').length, color: '#DB2142' },
        { stage: 'Oportunidades', count: opportunities.length, color: '#FFC857' },
        { stage: 'Ganadas', count: opportunities.filter(o => o.stage === 'cierre_ganado').length, color: '#6C7DF7' }
      ];

      setData({
        leads,
        opportunities,
        series,
        funnel: funnelData
      });

    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Error al cargar analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    document.title = 'Analytics | Trustport';
    loadAnalytics();
  }, []);

  const summary = {
    totalLeads: data.leads.length,
    qualifiedLeads: data.leads.filter(l => l.status === 'qualified').length,
    convertedLeads: data.leads.filter(l => l.status === 'converted').length,
    totalOpportunities: data.opportunities.length,
    opportunityValue: data.opportunities.reduce((sum, o) => sum + (o.amount || 0), 0),
    wonOpportunities: data.opportunities.filter(o => o.stage === 'cierre_ganado').length
  };

  const conversionRate = summary.totalLeads > 0 ? ((summary.convertedLeads / summary.totalLeads) * 100).toFixed(1) : 0;
  const winRate = summary.totalOpportunities > 0 ? ((summary.wonOpportunities / summary.totalOpportunities) * 100).toFixed(1) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#4472C4]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight" style={{ color: "#1F2937" }}>Analytics</h1>
        <Button 
          onClick={() => loadAnalytics(true)}
          disabled={refreshing}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card style={{ borderRadius: '16px' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-[#4472C4]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalLeads}</div>
            <p className="text-xs text-gray-600">
              {summary.qualifiedLeads} calificados
            </p>
          </CardContent>
        </Card>

        <Card style={{ borderRadius: '16px' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversión</CardTitle>
            <Target className="h-4 w-4 text-[#00A878]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <p className="text-xs text-gray-600">
              {summary.convertedLeads} de {summary.totalLeads} leads
            </p>
          </CardContent>
        </Card>

        <Card style={{ borderRadius: '16px' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Oportunidades</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#FFC857]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalOpportunities}</div>
            <p className="text-xs text-gray-600">
              Win rate: {winRate}%
            </p>
          </CardContent>
        </Card>

        <Card style={{ borderRadius: '16px' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
            <DollarSign className="h-4 w-4 text-[#DB2142]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{summary.opportunityValue.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600">
              Total en pipeline
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel Chart */}
        <Card style={{ borderRadius: '16px' }}>
          <CardHeader>
            <CardTitle>Funnel de Conversión</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.funnel} layout="vertical">
                <XAxis type="number" />
                <YAxis type="category" dataKey="stage" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#4472C4" radius={[4, 4, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead Status Distribution */}
        <Card style={{ borderRadius: '16px' }}>
          <CardHeader>
            <CardTitle>Distribución por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Nuevos', value: data.leads.filter(l => l.status === 'new').length },
                    { name: 'Calificados', value: data.leads.filter(l => l.status === 'qualified').length },
                    { name: 'Convertidos', value: data.leads.filter(l => l.status === 'converted').length },
                    { name: 'Descartados', value: data.leads.filter(l => l.status === 'disqualified').length }
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data.leads.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Funnel Table */}
      <Card style={{ borderRadius: '16px' }}>
        <CardHeader>
          <CardTitle>Detalle del Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Etapa</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">% del Total</TableHead>
                <TableHead className="text-right">Conversión</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.funnel.map((stage, index) => {
                const percentage = summary.totalLeads > 0 ? ((stage.count / summary.totalLeads) * 100).toFixed(1) : 0;
                const prevStage = data.funnel[index - 1];
                const conversion = prevStage ? ((stage.count / prevStage.count) * 100).toFixed(1) : 100;
                
                return (
                  <TableRow key={stage.stage}>
                    <TableCell className="font-medium">
                      <Badge style={{ backgroundColor: stage.color, color: 'white' }}>
                        {stage.stage}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{stage.count}</TableCell>
                    <TableCell className="text-right">{percentage}%</TableCell>
                    <TableCell className="text-right">{conversion}%</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Time Series Chart (if available) */}
      {data.series && (
        <Card style={{ borderRadius: '16px' }}>
          <CardHeader>
            <CardTitle>Tendencia Temporal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.series}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="leads" stroke="#4472C4" strokeWidth={2} />
                <Line type="monotone" dataKey="opportunities" stroke="#DB2142" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
