# Modulo 07: Osservabilità e Debugging

**Durata stimata:** 3 ore  
**Peso CKAD:** Application Resources and Scheduling (20%)

## Obiettivi di Apprendimento

Al termine di questo modulo sarai in grado di:

- Visualizzare e analizzare i log dei container con kubectl logs
- Monitorare le risorse con kubectl top
- Diagnosticare problemi comuni (CrashLoopBackOff, ImagePullBackOff, OOMKilled)
- Utilizzare container ephemeral per debugging
- Analizzare gli eventi Kubernetes
- Implementare strategie di logging efficaci

## Introduzione all'Osservabilità

L'osservabilità in Kubernetes comprende tre pilastri: logs, metriche e traces. Per l'esame CKAD, ti concentri principalmente su logs e metriche di base, essenziali per diagnosticare problemi applicativi.

### I Tre Pilastri

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     LOGS        │    │    METRICS      │    │    TRACES       │
│                 │    │                 │    │                 │
│ kubectl logs    │    │ kubectl top     │    │ (non CKAD)      │
│ stdout/stderr   │    │ Metrics Server  │    │                 │
│ aggregazione    │    │ CPU/Memory      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Gestione dei Logs

### Visualizzazione Base

Il comando principale per i log è `kubectl logs`:

```bash
# Log di un pod singolo
kubectl logs <pod-name>

# Log di un container specifico (pod multi-container)
kubectl logs <pod-name> -c <container-name>

# Ultimi N righe
kubectl logs <pod-name> --tail=100

# Seguire i log in tempo reale
kubectl logs <pod-name> -f
kubectl logs <pod-name> --follow
```

### Logs con Filtro Temporale

```bash
# Log dell'ultima ora
kubectl logs <pod-name> --since=1h

# Log degli ultimi 10 minuti
kubectl logs <pod-name> --since=10m

# Log da un timestamp specifico (ISO 8601)
kubectl logs <pod-name> --since-time=2024-01-15T10:00:00Z
```

### Logs con Timestamp

```bash
# Aggiunge timestamp Kubernetes a ogni riga
kubectl logs <pod-name> --timestamps

# Output esempio:
# 2024-01-15T10:30:45.123456789Z stderr F Starting application...
```

### Logs di Container Precedenti

Quando un container crasha e viene riavviato:

```bash
# Log del container precedente
kubectl logs <pod-name> --previous

# Utile per capire perché è crashato
kubectl logs <pod-name> --previous --tail=50
```

### Logs da Deployment

```bash
# Log di tutti i pod di un deployment
kubectl logs deployment/<name>

# Con label selector
kubectl logs -l app=myapp

# Tutti i container
kubectl logs deployment/<name> --all-containers
```

## Monitoraggio Risorse

### kubectl top

Richiede il Metrics Server installato:

```bash
# Verifica se è disponibile
kubectl get pods -n kube-system | grep metrics-server

# Utilizzo pod
kubectl top pods

# Utilizzo nodi
kubectl top nodes

# Ordina per memoria
kubectl top pods --sort-by=memory

# Ordina per CPU
kubectl top pods --sort-by=cpu
```

### Interpretare l'Output

```bash
NAME                         CPU(cores)   MEMORY(bytes)
my-app-7d8f9c-abc12          50m          128Mi
my-app-7d8f9c-def34          45m          120Mi

# CPU in millicores (1 core = 1000m)
# Memoria in bytes (Mi = Mebibytes)
```

## Diagnosi Problemi Comuni

### CrashLoopBackOff

**Sintomi:** Il container crasha ripetutamente.

```bash
# Verifica lo stato
kubectl get pods -w

NAME    READY   STATUS             RESTARTS   AGE
app     0/1     CrashLoopBackOff   5          5m

# Diagnosi
kubectl describe pod <name>

Events:
  Type     Reason     Age                From     Message
  ----     ------     ----               ----     -------
  Normal   Started    60s (x5 over 3m)   kubelet  Started container app
  Normal   Killing    30s (x5 over 3m)   kubelet  Container app failed, will restart
  Warning  BackOff    10s (x6 over 3m)   kubelet  Back-off restarting failed container

# Controlla i log precedenti
kubectl logs <name> --previous
```

**Cause comuni:**
- Comando di avvio fallisce
- Dipendenze non pronte
- Configurazione errata
- Probe fallisce immediatamente

**Soluzione:**
```yaml
# Aggiungi debugging al comando
command: ["/bin/sh", "-c"]
args: ["echo 'Starting...' && <original-command>"]
```

### ImagePullBackOff

**Sintomi:** L'immagine non può essere scaricata.

```bash
kubectl describe pod <name>

Events:
  Type     Reason     Age   From     Message
  ----     ------     ----  ----     -------
  Normal   Pulling    60s   kubelet  Pulling image "myregistry.io/app:v1"
  Warning  Failed     55s   kubelet  Failed to pull image: rpc error: code = NotFound
  Warning  BackOff    40s   kubelet  Back-off pulling image
```

**Cause comuni:**
- Nome immagine errato
- Tag inesistente
- Registry privato senza credenziali
- Registry irraggiungibile

**Soluzione per registry privato:**
```bash
# Crea secret con credenziali
kubectl create secret docker-registry regcred \
  --docker-server=myregistry.io \
  --docker-username=user \
  --docker-password=pass

# Aggiungi al pod
spec:
  imagePullSecrets:
  - name: regcred
```

### OOMKilled

**Sintomi:** Il container viene terminato per memoria insufficiente.

```bash
kubectl describe pod <name>

Last State:     Terminated
  Reason:       OOMKilled
  Exit Code:    137
```

**Causa:** Il processo usa più memoria del limit.

**Soluzione:**
```yaml
resources:
  requests:
    memory: "256Mi"
  limits:
    memory: "512Mi"  # Aumenta il limit
```

### Pending

**Sintomi:** Il pod rimane in stato Pending.

```bash
kubectl describe pod <name>

Events:
  Type     Reason            Age   From            Message
  ----     ------            ----  ----            -------
  Warning  FailedScheduling  60s   default-scheduler  0/3 nodes available: 3 Insufficient cpu.
```

**Cause comuni:**
- Risorse insufficienti (CPU, memoria)
- NodeSelector/NodeAffinity non soddisfatto
- Taints/Tolerations non compatibili
- PVC non può essere montato

## Container Ephemeral

I container ephemeral sono container temporanei aggiunti a un pod esistente per debugging.

### Creazione con kubectl debug

```bash
# Container interattivo per debug
kubectl debug <pod-name> -it --image=busybox

# Con nome specifico
kubectl debug <pod-name> -it --image=busybox --container=debugger

# Con strumenti di rete
kubectl debug <pod-name> -it --image=nicolaka/netshoot

# Copia del pod per debug sicuro
kubectl debug <pod-name> -it --image=busybox --copy-to=debug-copy
```

### Esempio Pratico

```bash
# Pod esistente senza shell
kubectl run minimal --image=gcr.io/google-containers/pause

# Aggiungi container debug
kubectl debug minimal -it --image=busybox

# Nel container ephemeral:
/ # ps aux
/ # ls /proc/1/root/etc/hostname
/ # curl http://localhost:8080/health
```

### Casi d'Uso

1. **Debug di immagini minimali** - Container distroless non hanno shell
2. **Test di rete** - Verifica connettività interna
3. **Ispezione filesystem** - Vedi file del container originale
4. **Strumenti non installati** - Usa strumenti non presenti nell'immagine

## Eventi Kubernetes

### Visualizzazione Eventi

```bash
# Tutti gli eventi del namespace
kubectl get events

# Eventi di una risorsa specifica
kubectl get events --field-selector involvedObject.name=<name>

# Eventi warning
kubectl get events --field-selector type=Warning

# Ordinati per tempo
kubectl get events --sort-by='.lastTimestamp'

# Formato dettagliato
kubectl describe events
```

### Interpretare gli Eventi

```bash
kubectl get events -o wide

LAST SEEN   TYPE      REASON    OBJECT         MESSAGE
2m          Normal    Pulled    pod/nginx       Successfully pulled image
2m          Normal    Created   pod/nginx       Created container nginx
2m          Normal    Started   pod/nginx       Started container nginx
1m          Warning   BackOff   pod/nginx       Back-off restarting failed container
```

**Tipi di eventi:**
- **Normal** - Operazioni riuscite
- **Warning** - Problemi o fallimenti

**Reason comuni:**
- `Scheduled` - Pod schedulato
- `Pulled` - Immagine scaricata
- `Started` - Container avviato
- `Killing` - Container terminato
- `FailedScheduling` - Scheduling fallito
- `BackOff` - Restart backoff

## Strategie di Logging

### Logging Strutturato

```python
# Buona pratica: JSON logging
import json
import logging
import logger

def json_formatter(record):
    return json.dumps({
        "timestamp": record.created,
        "level": record.levelname,
        "message": record.getMessage(),
        "service": "myapp",
        "version": "1.0"
    })

logger.setFormatter(json_formatter)
```

### Logs Multi-Container

```bash
# Log combinati con prefix
kubectl logs <pod> --prefix --all-containers

# Output:
# [app-1] Log message from app1
# [app-2] Log message from app2
```

### Log Aggregation (Overview)

In produzione, i log vengono aggregati con stack come:
- ELK (Elasticsearch, Logstash, Kibana)
- EFK (Elasticsearch, Fluentd, Kibana)
- Loki + Grafana

Per CKAD, sapere che kubectl logs legge da stdout/stderr dei container.

## Esecuzione Comandi nei Pod

### kubectl exec

```bash
# Singolo comando
kubectl exec <pod> -- <command>

# Esempio
kubectl exec nginx -- ls /etc/nginx

# Shell interattiva
kubectl exec -it <pod> -- sh
kubectl exec -it <pod> -- bash

# Container specifico
kubectl exec -it <pod> -c <container> -- sh
```

### kubectl run (Debug)

```bash
# Pod temporaneo per test
kubectl run -it --rm debug --image=busybox -- sh

# Test DNS
kubectl run -it --rm debug --image=busybox -- nslookup kubernetes

# Test HTTP
kubectl run -it --rm debug --image=curlimages/curl -- curl http://my-service
```

## Best Practices

### Debugging Workflow

1. **Verifica stato:** `kubectl get pods`
2. **Descrivi il pod:** `kubectl describe pod <name>`
3. **Controlla eventi:** `kubectl get events`
4. **Leggi i log:** `kubectl logs <pod>`
5. **Se crashato:** `kubectl logs <pod> --previous`
6. **Esegui comandi:** `kubectl exec -it <pod> -- sh`
7. **Se necessario:** `kubectl debug <pod> -it --image=busybox`

### Logging Best Practices

1. **Scrivi su stdout/stderr** - Non file locali
2. **Log strutturati** - JSON per parsing automatico
3. **Livelli appropriati** - DEBUG, INFO, WARN, ERROR
4. **Context sufficiente** - request_id, user_id
5. **Non loggare secrets** - Mai password o token nei log

### Comandi Utili per l'Esame

```bash
# Workflow rapido per pod problematico
kubectl get pods -o wide
kubectl describe pod <name>
kubectl logs <name> --previous --tail=50
kubectl get events --sort-by='.lastTimestamp' | head -20

# Test connettività
kubectl run test --image=busybox --rm -it -- wget -qO- http://service-name

# Copia file
kubectl cp <pod>:/path/file ./local-file
```

## Esercitazione Pratica

Per consolidare le conoscenze:

1. Crea un deployment con vari problemi (immagine errata, OOM, crash)
2. Diagnostica ogni problema sistematicamente
3. Usa ephemeral container per debug
4. Analizza gli eventi per capire la sequenza dei fatti
5. Pratica i comandi finché diventano automatici

## Conclusione

L'osservabilità è fondamentale per il debugging efficace. In questo modulo hai imparato:

- A visualizzare e filtrare i log
- A monitorare le risorse con kubectl top
- A diagnosticare problemi comuni
- A usare container ephemeral per debug avanzato

Nel prossimo modulo affronteremo il networking dei servizi.
