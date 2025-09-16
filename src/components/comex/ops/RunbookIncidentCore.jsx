import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, Users } from 'lucide-react';

const runbookContent = `
# RUNBOOK: COMEX Core Incident Response

**Alert ID:** sev1_comex_core_outage  
**Trigger:** http_success_rate < 95% for 5 minutes  
**Severity:** SEV1 (Critical)  
**Response Time:** Immediate  
**Last Updated:** 2025-01-27  

## 🚨 Immediate Actions (First 5 Minutes)

### 1. Acknowledge Alert
- [ ] Acknowledge alert in monitoring system
- [ ] Post incident channel: #incident-comex-core
- [ ] Page backup on-call if primary doesn't respond in 2 minutes

### 2. Initial Assessment (MTTD < 3 minutes)
# Quick health check
curl -f https://app.trustport.ai/api/health
curl -f https://app.trustport.ai/comex/si

# Check error rates by endpoint
kubectl logs -l app=comex-core --tail=100 | grep ERROR

# Check resource utilization  
kubectl top pods -l app=comex-core

Expected outcomes:
- [ ] Health endpoint returns 200 OK
- [ ] Recent error logs identified
- [ ] Resource constraints ruled out

### 3. Quick Mitigation Attempts (if obvious cause)
Common fixes to try first:
- [ ] **Route Duplication Bug:** Restart frontend pods
- [ ] **Database Timeout:** Check connection pool
- [ ] **Memory Leak:** Check memory usage

## 📋 Investigation Playbook

### Step 1: Service Status Check
# Check deployment health
kubectl get deployments -l app=comex
kubectl describe deployment comex-core

# Check ingress and load balancer
kubectl get ingress comex-ingress
kubectl describe ingress comex-ingress

### Step 2: Database Connectivity
# Test database connection
kubectl exec -it deployment/comex-core -- pg_isready -h postgres-primary
kubectl logs -l app=postgres-primary --tail=50

### Step 3: External Dependencies
# Check carrier APIs status
curl -f https://api.maersk.com/health
curl -f https://api.msc.com/health

# Check payment gateway
curl -f https://api.stripe.com/health

### Step 4: Recent Changes
- [ ] Check last 24h deployments
- [ ] Review recent PRs in #comex-releases channel
- [ ] Check feature flags

## 🔧 Common Resolution Steps

### Issue: Route Duplication (Historical Bug)
**Symptoms:** Dashboard components showing wrong content between tabs

# Immediate fix
kubectl delete pods -l app=comex-frontend
kubectl rollout status deployment/comex-frontend

# Verify fix - check 3 tabs load correctly
curl -s https://app.trustport.ai/comex/si
curl -s https://app.trustport.ai/comex/bl-awb  
curl -s https://app.trustport.ai/comex/liquidacion

### Issue: Database Connection Pool Exhaustion
# Check active connections
kubectl exec -it postgres-primary -- psql -c "SELECT count(*) FROM pg_stat_activity;"

# Increase pool size temporarily
kubectl patch deployment comex-core

### Issue: Memory/CPU Constraints
# Scale up resources
kubectl patch deployment comex-core

# Scale horizontally
kubectl scale deployment comex-core --replicas=5

## 📞 Escalation Matrix

**Level 1 (0-15 min):** On-call SRE
- Alice Smith: +34-600-xxx-xxx
- Bob Johnson: +34-600-xxx-yyy  

**Level 2 (15-30 min):** Engineering Lead
- Charlie Brown: +34-600-xxx-zzz

**Level 3 (30+ min):** Engineering Manager + VP Engineering
- Emergency escalation: Slack @channel in #exec-alerts

## ✅ Resolution Checklist

After resolving:
- [ ] All health checks passing
- [ ] Error rate < 1% for 10 minutes
- [ ] Manual smoke test: SI creation, booking, document upload
- [ ] Feature flags restored to pre-incident state
- [ ] Performance metrics back to baseline (p95 < 800ms)

## 📝 Post-Incident Actions

### Immediate (within 2 hours)
- [ ] Update incident channel with resolution summary
- [ ] Update status page
- [ ] Notify customer success team

### Follow-up (within 24 hours)  
- [ ] Schedule post-mortem meeting
- [ ] Create JIRA tickets for action items
- [ ] Update runbook if new information learned
- [ ] Review error budget impact

### Post-Mortem Template
## Incident Summary
- **Start:** [timestamp]
- **End:** [timestamp] 
- **Duration:** [duration]
- **Impact:** [users affected, $ impact]

## Root Cause
[Technical cause]

## Timeline
[Key events with timestamps]

## Action Items
- [ ] [Preventive measure 1] - Owner: X - Due: Y
- [ ] [Monitoring improvement] - Owner: X - Due: Y

---
**Next Review:** 2025-04-27  
**Runbook Owner:** SRE Team  
**Emergency Contact:** sre-oncall@trustport.ai
`;

export default function RunbookIncidentCore() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          Runbook: COMEX Core Incident Response
        </CardTitle>
        <Badge variant="destructive">SEV1 - Critical</Badge>
        <Badge variant="secondary">/ops/runbooks/incident_core_outage.md</Badge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="p-3 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-red-600" />
              <span className="font-semibold text-sm">MTTD Target</span>
            </div>
            <div className="text-lg font-bold text-red-600">< 3 min</div>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <span className="font-semibold text-sm">Response Time</span>
            </div>
            <div className="text-lg font-bold text-orange-600">Immediate</div>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-sm">Escalation</span>
            </div>
            <div className="text-lg font-bold text-blue-600">3 Levels</div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-sm">SLA Target</span>
            </div>
            <div className="text-lg font-bold text-green-600">< 30 min</div>
          </div>
        </div>
        
        <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-auto max-h-96">
          {runbookContent.trim()}
        </pre>
      </CardContent>
    </Card>
  );
}