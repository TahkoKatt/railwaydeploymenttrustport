// components/srm/telemetry/AiLogPanel.jsx
import { readAiLogs, clearAiLogs } from '@/components/srm/telemetry/aiLogger';

export default function AiLogPanel() {
  const logs = readAiLogs().slice().reverse();
  
  return (
    <div className="card" style={{ padding:12, marginTop:12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
        <strong>AI Logs (local)</strong>
        <button className="btn-primary" onClick={clearAiLogs}>Limpiar</button>
      </div>
      <div style={{ maxHeight:240, overflow:'auto', fontSize:12 }}>
        {logs.map((l,i)=>(
          <div key={i} style={{ borderTop:'1px solid #E5E7EB', padding:'6px 0' }}>
            <b>{l.action}</b> · persona:{l.persona} · tab:{l.tab} · {l.ok?'ok':'error'} · {l.latency_ms}ms · {new Date(l.ts).toLocaleString()}
          </div>
        ))}
        {!logs.length && <div style={{ color:'#6B7280' }}>Sin eventos.</div>}
      </div>
    </div>
  );
}