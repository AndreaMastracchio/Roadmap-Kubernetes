# Modulo 10: Troubleshooting

**Durata stimata:** 4 ore  
**Peso CKAD:** Application Resources and Scheduling (20%)

## Obiettivi di Apprendimento

Al termine di questo modulo sarai in grado di:

- Applicare una metodologia sistematica di troubleshooting
- Diagnosticare problemi comuni delle applicazioni
- Risolvere problemi di networking e DNS
- Debuggare errori di permessi RBAC
- Analizzare problemi di risorse (OOM, CPU)
- Preparare informazioni per escalation

## Metodologia di Troubleshooting

Il debugging efficace segue un approccio sistematico. Non saltare ai fix: capire prima.

### Il Metodo分层 (Layered)

```
┌─────────────────────────────────────────┐
│  Layer 7: Applicazione (codice)          │
├─────────────────────────────────────────┤
│  Layer 6: Configurazione (env, secrets)  │
├─────────────────────────────────────────┤
│  Layer 5: Probes (health check)          │
├─────────────────────────────────────────┤
│  Layer 4: Container (immagine, cmd)      │
├─────────────────────────────────────────┤
│  Layer 3: Pod (stato, risorse)           │
├─────────────────────────────────────────┤
│  Layer 2: Service/Ingress (rete)         │
├─────────────────────────────────────────┤
│  Layer 1: DNS/Rete (connettività)        │
└─────────────────────────────────────────┘
```

### Workflow Standard

```bash
# 1. Identifica il problema
kubectl get pods -n <namespace>

# 2. Descrivi la risorsa problematica
kubectl describe <resource> <name>

# 3. Leggi i log
kubectl logs <pod> [-c <container>] [--previous]

# 4. Controlla gli eventi
kubectl get events --sort-by='.lastTimestamp'

# 5. Esegui comandi nel pod
kubectl exec -it <pod> -- <command>

# 6. Crea pod di test per isolare il problema
kubectl run test --image=busybox --rm -it -- <command>
```

## Problemi Comuni e Soluzioni

### Pod in Pending

**Sintomi:** Il pod non viene schedulato.

```bash
kubectl describe pod <name>

Events:
  Type     Reason            Age   From            Message
  ----     ------            ----  ----            -------
  Warning  FailedScheduling  10s   default-scheduler  0/3 nodes available: 3 Insufficient cpu.
```

**Cause comuni:**
1. Risorse insufficienti (CPU, memoria)
2. NodeSelector/NodeAffinity non soddisfatto
3. Taints senza tolerations
4. PVC non bindato
5. ResourceQuota esaurita

**Soluzione:**
```bash
# Verifica risorse nodo
kubectl describe nodes | grep -A5 "Allocated resources"

# Verifica vincoli
kubectl get pod <name> -o yaml | grep -A10 nodeSelector
kubectl describe node <node> | grep Taints

# Verifica PVC
kubectl get pvc
```

### CrashLoopBackOff

**Sintomi:** Il container crasha ripetutamente.

```bash
kubectl describe pod <name>

Events:
  Type     Reason     Age                From     Message
  ----     ------     ----               ----     -------
  Normal   Started    60s (x5 over 3m)  kubelet  Started container
  Normal   Killing    30s (x5 over 3m)  kubelet  Container failed, will restart
  Warning  BackOff    10s (x6 over 3m)  kubelet  Back-off restarting failed container

Last State:     Terminated
  Reason:       Error
  Exit Code:    1
```

**Cause comuni:**
1. Comando di avvio fallisce
2. Dipendenze non pronte (DB, API)
3. Configurazione errata
4. Probe fallisce immediatamente
5. Permessi insufficienti

**Soluzione:**
```bash
# Controlla log del container precedente
kubectl logs <pod> --previous --tail=100

# Esegui interattivamente per debug
kubectl run debug --image=<same-image> --rm -it -- sh

# Verifica variabili d'ambiente
kubectl exec <pod> -- env

# Controlla health probes
kubectl describe pod <pod> | grep -A10 "Liveness\\|Readiness"
```

### ImagePullBackOff / ErrImagePull

**Sintomi:** L'immagine non può essere scaricata.

```bash
kubectl describe pod <name>

Events:
  Type     Reason     Age   From     Message
  ----     ------     ----  ----     -------
  Normal   Pulling    60s   kubelet  Pulling image "myregistry.io/app:v1"
  Warning  Failed     55s   kubelet  Failed to pull image: rpc error: code = Unknown
  Warning  BackOff    40s   kubelet  Back-off pulling image
```

**Cause comuni:**
1. Nome immagine errato
2. Tag inesistente
3. Registry privato senza credenziali
4. Registry irraggiungibile
5. Limite rate del registry

**Soluzione:**
```bash
# Verifica nome immagine
kubectl get pod <name> -o jsonpath='{.spec.containers[*].image}'

# Per registry privato, aggiungi secret
kubectl create secret docker-registry regcred \
  --docker-server=<registry> \
  --docker-username=<user> \
  --docker-password=<pass>

# Verifica che il secret sia referenziato
kubectl describe pod <name> | grep -A3 "ImagePullSecrets"
```

### OOMKilled

**Sintomi:** Container terminato per memoria insufficiente.

```bash
kubectl describe pod <name>

Last State:     Terminated
  Reason:       OOMKilled
  Exit Code:    137
```

**Exit code 137 = 128 + 9 (SIGKILL)**

**Soluzione:**
```bash
# Controlla memory limit
kubectl get pod <name> -o jsonpath='{.spec.containers[*].resources.limits.memory}'

# Aumenta il limit
kubectl set resources deployment/<name> --limits=memory=512Mi

# Verifica memory usage
kubectl top pods
```

### Service Non Raggiungibile

**Sintomi:** Il Service non risponde.

```bash
# 1. Verifica che il Service esista
kubectl get svc <name>

# 2. Controlla gli Endpoints
kubectl get endpoints <name>

# 3. Se vuoto, verifica il selector
kubectl describe svc <name> | grep Selector
kubectl get pods -l <selector-label>

# 4. Testa dal cluster
kubectl run test --image=busybox --rm -it -- wget -qO- <service-name>:<port>
```

### DNS Non Risolve

**Sintomi:** I nomi non vengono risolti.

```bash
# Verifica CoreDNS
kubectl get pods -n kube-system -l k8s-app=kube-dns

# Test DNS
kubectl run test --image=busybox --rm -it -- nslookup kubernetes

# Controlla ConfigMap CoreDNS
kubectl get configmap coredns -n kube-system -o yaml

# Verifica resolv.conf del pod
kubectl exec <pod> -- cat /etc/resolv.conf
```

### NetworkPolicy Blocca

**Sintomi:** Traffico rifiutato.

```bash
# Lista NetworkPolicy
kubectl get networkpolicy -A

# Descrivi la policy
kubectl describe networkpolicy <name>

# Test con pod che matcha/non matcha
kubectl run test-allowed --image=busybox --labels="role=allowed" --rm -it -- wget <service>
kubectl run test-denied --image=busybox --labels="role=denied" --rm -it -- wget <service>
```

## RBAC Debugging

### Verificare Permessi

```bash
# Per l'utente corrente
kubectl auth can-i list pods

# Per un ServiceAccount
kubectl auth can-i list pods --as=system:serviceaccount:default:my-sa

# Lista tutti i permessi
kubectl auth can-i --list --as=system:serviceaccount:default:my-sa
```

### Creare Permessi

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods
subjects:
- kind: ServiceAccount
  name: my-sa
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

## Debugging Avanzato

### Container Ephemeral

Per debuggare pod inesistenti o senza shell:

```bash
# Aggiungi container di debug
kubectl debug <pod> -it --image=busybox --target=<container>

# Crea copia del pod per debug sicuro
kubectl debug <pod> -it --copy-to=debug-copy --image=busybox
```

### Analisi Filesystem

```bash
# Copia file dal pod
kubectl cp <pod>:/path/to/file ./local-file

# Ispeziona filesystem
kubectl exec <pod> -- find / -name "*.log" 2>/dev/null
```

### Network Debugging

```bash
# Da dentro il pod
kubectl exec <pod> -- netstat -tlnp
kubectl exec <pod> -- curl -v http://localhost:8080/health
kubectl exec <pod> -- nslookup kubernetes.default

# Con ephemeral container
kubectl debug <pod> -it --image=nicolaka/netshoot -- curl -v <target>
```

## Preparare Ticket di Supporto

Informazioni essenziali per escalation:

```bash
# 1. Contesto
kubectl version -o yaml
kubectl cluster-info
kubectl get nodes

# 2. Risorsa problematica
kubectl describe <resource> <name> > describe.txt
kubectl get <resource> <name> -o yaml > resource.yaml

# 3. Log
kubectl logs <pod> --tail=500 --timestamps > logs.txt
kubectl logs <pod> --previous > previous-logs.txt 2>/dev/null || echo "No previous logs"

# 4. Eventi
kubectl get events --sort-by='.lastTimestamp' > events.txt

# 5. Dati aggiuntivi
kubectl top pods >> support-data.txt
kubectl get pods -o wide >> support-data.txt
```

## Best Practices

### Troubleshooting

1. **Non presumere, verifica** - Usa comandi per confermare ipotesi
2. **Parti dal basso** - Layer di rete prima dell'applicazione
3. **Isola le variabili** - Un cambiamento alla volta
4. **Documenta** - Tieni traccia di cosa hai provato
5. **Usa pod minimali** - busybox, curlimages per test

### Prevenzione

1. **Health probes** - Liveness e readiness appropriati
2. **Resource limits** - Evita OOMKilled
3. **ConfigMap/Secret** - Non hardcoded
4. **RBAC minimale** - Least privilege
5. **NetworkPolicy** - Default deny dove appropriato

## Esercitazione Pratica

Per consolidare le conoscenze:

1. Crea uno scenario con 5 problemi diversi
2. Risolvi ogni problema documentando il workflow
3. Prepara un runbook per futuri reference
4. Simula escalation con ticket completo
5. Testa recovery procedure

## Conclusione

Il troubleshooting è competenza critica per CKAD e produzione. In questo modulo hai imparato:

- Metodologia sistematica di debug
- Risoluzione problemi comuni
- Debugging RBAC e networking
- Preparazione escalation efficace

Congratulazioni per aver completato tutti i 10 moduli del corso CKAD!
