// components/srm/perf/PerfPanel.jsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function pct(arr, q) {
  if (!arr.length) return 0;
  const a = [...arr].sort((x,y)=>x-y);
  const i = Math.ceil(q * a.length) - 1;
  return Math.round(a[Math.max(0,i)]);
}
function readSamples() {
  try {
    const raw = JSON.parse(localStorage.getItem('srm_tab_times') || '[]');
    return raw.map(r => typeof r === 'number' ? r : r.dt).filter(Number.isFinite);
  } catch { return []; }
}
export default function PerfPanel() {
  const xs = readSamples();
  const p50 = pct(xs, 0.50);
  const p95 = pct(xs, 0.95);
  return (
    <Card className="mt-4">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">SRM Perf</CardTitle>
            <Button size="sm" onClick={()=>{ localStorage.removeItem('srm_tab_times'); location.reload(); }}>Reset</Button>
        </CardHeader>
        <CardContent>
            <div className="text-sm text-muted-foreground">
                P50: {p50} ms · P95: {p95} ms · muestras: {xs.length}
            </div>
        </CardContent>
    </Card>
  );
}