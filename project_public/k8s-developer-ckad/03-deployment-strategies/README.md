# Modulo 03: Strategie di Deployment

**Durata**: 4-5 ore  
**Peso CKAD**: 20% (Application Deployment)

## Obiettivi di Apprendimento

Al termine di questo modulo sarai in grado di:
- Creare e gestire Deployment con strategie di rollout
- Implementare rollback e gestire la cronologia delle revisioni
- Utilizzare DaemonSet per agent di sistema
- Configurare StatefulSet per applicazioni stateful
- Creare Job e CronJob per workload batch
- Comprendere e implementare strategie Blue-Green e Canary

---

## 1. Deployment

### 1.1 Concetto Base

Un Deployment fornisce aggiornamenti dichiarativi per Pod e ReplicaSet. Definisci lo stato desiderato e il controller sincronizza lo stato attuale.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: nginx
        image: nginx:alpine
        ports:
        - containerPort: 80
```

### 1.2 Comandi Essenziali

```bash
# Creazione
kubectl create deployment nginx --image=nginx:alpine --replicas=3

# Scalare
kubectl scale deployment nginx --replicas=5

# Aggiornare immagine
kubectl set image deployment/nginx nginx=nginx:1.25-alpine

# Stato rollout
kubectl rollout status deployment/nginx

# Cronologia
kubectl rollout history deployment/nginx
kubectl rollout history deployment/nginx --revision=2

# Rollback
kubectl rollout undo deployment/nginx
kubectl rollout undo deployment/nginx --to-revision=3

# Pausa e resume
kubectl rollout pause deployment/nginx
kubectl rollout resume deployment/nginx

# Restart (forza rollout)
kubectl rollout restart deployment/nginx
```

### 1.3 Strategie di Update

#### RollingUpdate (Default)

```yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1          # Max Pod extra durante update
      maxUnavailable: 0    # Max Pod non disponibili
```

**Comportamento**:
- Crea nuovi Pod gradualmente
- Termina vecchi Pod solo quando nuovi sono Ready
- Default: 25% maxSurge, 25% maxUnavailable

#### Recreate

```yaml
spec:
  strategy:
    type: Recreate
```

**Comportamento**:
- Termina tutti i Pod vecchi
- Crea tutti i nuovi Pod
- **Causa downtime**

---

## 2. ReplicaSet

### 2.1 Ruolo nel Deployment

ReplicaSet mantiene il numero desiderato di Pod. I Deployment gestiscono i ReplicaSet.

```yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: nginx
        image: nginx:alpine
```

### 2.2 Differenze con Deployment

| Caratteristica | ReplicaSet | Deployment |
|----------------|------------|------------|
| Scalare | Sì | Sì (tramite RS) |
| Rolling Update | No | Sì |
| Rollback | No | Sì |
| Cronologia | No | Sì |
| Use case | Rare | Standard |

---

## 3. DaemonSet

### 3.1 Quando Usarlo

DaemonSet garantisce una copia di Pod su ogni nodo (o subset).

**Casi d'uso**:
- Log collection (Fluentd, Filebeat)
- Monitoring (Prometheus Node Exporter)
- Network plugin (Cilium, Calico)
- Storage daemon

### 3.2 Configurazione

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: log-agent
spec:
  selector:
    matchLabels:
      app: log-agent
  template:
    metadata:
      labels:
        app: log-agent
    spec:
      containers:
      - name: fluent-bit
        image: fluent/fluent-bit:1.9
        volumeMounts:
        - name: varlog
          mountPath: /var/log
      volumes:
      - name: varlog
        hostPath:
          path: /var/log
      tolerations:
      - key: node-role.kubernetes.io/control-plane
        effect: NoSchedule
```

### 3.3 Node Selector e Affinity

```yaml
spec:
  template:
    spec:
      nodeSelector:
        type: worker
      # oppure
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
            - matchExpressions:
              - key: kubernetes.io/os
                operator: In
                values:
                - linux
```

---

## 4. StatefulSet

### 4.1 Caratteristiche Uniche

- **Nomi stabili**: Pod con ordinal (db-0, db-1, db-2)
- **Storage dedicato**: Ogni Pod ha il proprio PVC
- **Avvio ordinato**: Sequenziale (0 → 1 → 2)
- **Network stabile**: DNS: db-0.service.ns.svc.cluster.local

### 4.2 Configurazione Completa

```yaml
apiVersion: v1
kind: Service
metadata:
  name: db-headless
spec:
  clusterIP: None  # Headless
  selector:
    app: db
  ports:
  - port: 5432
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: db
spec:
  serviceName: db-headless
  replicas: 3
  selector:
    matchLabels:
      app: db
  template:
    metadata:
      labels:
        app: db
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_PASSWORD
          value: "secret"
        volumeMounts:
        - name: data
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 10Gi
```

### 4.3 Ordine di Avvio

```
1. db-0 viene creato → PVC db-data-db-0 → Ready
2. db-1 viene creato → PVC db-data-db-1 → Ready
3. db-2 viene creato → PVC db-data-db-2 → Ready
```

---

## 5. Job

### 5.1 Concetto

Job esegue un task a tempo determinato fino al completamento.

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: data-import
spec:
  backoffLimit: 4          # Max retry
  activeDeadlineSeconds: 600  # Timeout totale
  completions: 1          # Quante volte completare
  parallelism: 1          # Quanti Pod paralleli
  template:
    spec:
      containers:
      - name: importer
        image: python:3.11-slim
        command: ["python", "import_data.py"]
      restartPolicy: OnFailure  # Never o OnFailure
```

### 5.2 Tipi di Job

#### Job Singolo

```yaml
spec:
  completions: 1
  parallelism: 1
```

#### Job Parallelo con Conteggio Fisso

```yaml
spec:
  completions: 5      # 5 Pod devono completare
  parallelism: 2      # 2 Pod girano insieme
```

#### Job Parallelo Singolo

```yaml
spec:
  completions: null  # Completa quando un Pod finisce
  parallelism: 3     # 3 Pod girano insieme
```

### 5.3 Gestione Fallimenti

```yaml
spec:
  backoffLimit: 6        # Max 6 retry (default)
  activeDeadlineSeconds: 3600  # 1 ora max
```

---

## 6. CronJob

### 6.1 Configurazione

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: daily-backup
spec:
  schedule: "0 2 * * *"    # Ogni giorno alle 2:00
  concurrencyPolicy: Forbid  # Allow, Forbid, Replace
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 1
  startingDeadlineSeconds: 300
  suspend: false
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: backup:latest
            command: ["backup.sh"]
          restartPolicy: OnFailure
```

### 6.2 Formato Cron

```
┌───────────── minuti (0 - 59)
│ ┌───────────── ore (0 - 23)
│ │ ┌───────────── giorno del mese (1 - 31)
│ │ │ ┌───────────── mese (1 - 12)
│ │ │ │ ┌───────────── giorno della settimana (0 - 6, 0=Domenica)
│ │ │ │ │
* * * * *
```

**Esempi**:
- `*/15 * * * *` - Ogni 15 minuti
- `0 * * * *` - Ogni ora
- `0 0 * * 0` - Ogni domenica a mezzanotte
- `0 0 1 * *` - Primo del mese

### 6.3 ConcurrencyPolicy

| Valore | Comportamento |
|--------|---------------|
| Allow | Permette Job concorrenti |
| Forbid | Impedisce Job concorrenti |
| Replace | Sostituisce il Job esistente |

---

## 7. Strategie di Deployment Avanzate

### 7.1 Blue-Green Deployment

**Concetto**: Due ambienti identici, switch istantaneo.

```yaml
# Blue deployment (versione corrente)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-blue
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
      version: blue
  template:
    metadata:
      labels:
        app: myapp
        version: blue
    spec:
      containers:
      - name: app
        image: myapp:v1
---
# Green deployment (nuova versione)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-green
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
      version: green
  template:
    metadata:
      labels:
        app: myapp
        version: green
    spec:
      containers:
      - name: app
        image: myapp:v2
---
# Service (inizialmente punta a blue)
apiVersion: v1
kind: Service
metadata:
  name: myapp
spec:
  selector:
    app: myapp
    version: blue  # Cambia in 'green' per switchare
  ports:
  - port: 80
```

**Vantaggi**:
- Zero downtime
- Rollback istantaneo
- Test completo in produzione

**Svantaggi**:
- Doppio uso risorse
- Costo aumentato

### 7.2 Canary Deployment

**Concetto**: Esponi gradualmente gli utenti alla nuova versione.

```yaml
# Stable (90% traffico)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-stable
spec:
  replicas: 9
  selector:
    matchLabels:
      app: api
      track: stable
  template:
    metadata:
      labels:
        app: api
        track: stable
    spec:
      containers:
      - name: api
        image: api:v1
---
# Canary (10% traffico)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-canary
spec:
  replicas: 1
  selector:
    matchLabels:
      app: api
      track: canary
  template:
    metadata:
      labels:
        app: api
        track: canary
    spec:
      containers:
      - name: api
        image: api:v2
---
# Service bilancia per label comuni
apiVersion: v1
kind: Service
metadata:
  name: api
spec:
  selector:
    app: api
  ports:
  - port: 8080
```

**Implementazione avanzata** con Service Mesh:
- Istio: Traffic splitting
- Linkerd: Traffic split
- NGINX Ingress: Canary annotations

---

## 8. Rollback e Recovery

### 8.1 Gestione Cronologia

```bash
# Vedi tutte le revisioni
kubectl rollout history deployment/web-app

# Dettagli revisione specifica
kubectl rollout history deployment/web-app --revision=2

# Rollback alla precedente
kubectl rollout undo deployment/web-app

# Rollback a revisione specifica
kubectl rollout undo deployment/web-app --to-revision=5
```

### 8.2 Limitare Cronologia

```yaml
spec:
  revisionHistoryLimit: 10  # Default
```

### 8.3 Annotazioni per Tracciamento

```yaml
metadata:
  annotations:
    kubernetes.io/change-cause: "Update to v1.2.3 for security fix"
```

---

## 9. Troubleshooting Deployment

### 9.1 Problemi Comuni

```bash
# Deployment bloccato
kubectl rollout status deployment/web-app --timeout=30s
kubectl describe deployment web-app

# Pod non partono
kubectl get events --sort-by='.lastTimestamp'
kubectl describe pod <pod-name>

# ImagePullBackOff
kubectl get pod <pod-name> -o jsonpath='{.status.containerStatuses[0].state.waiting}'

# Rollback fallito
kubectl rollout history deployment/web-app
kubectl rollout undo deployment/web-app --to-revision=N
```

### 9.2 Debug Avanzato

```bash
# Controlla ReplicaSet
kubectl get rs -l app=web-app

# Controlla eventi
kubectl get events --field-selector involvedObject.name=web-app

# Controlla Pod template hash
kubectl get pods -l app=web-app -o jsonpath='{.items[*].metadata.ownerReferences[0].name}'
```

---

## 10. Esercitazione Pratica

### Scenario
Implementare una strategia di deployment completa per un'applicazione web con:
1. Zero downtime per aggiornamenti
2. Rollback automatico in caso di errori
3. Canary testing per nuove versioni

### Passi

1. Crea deployment base con probes
2. Configura rolling update parameters
3. Implementa canary deployment
4. Testa rollback
5. Documenta procedure

---

## Riepilogo

| Controller | Use Case | Note |
|------------|----------|------|
| Deployment | App stateless | Standard |
| StatefulSet | App stateful | Database, Queue |
| DaemonSet | Per-node agents | Logging, Monitoring |
| Job | Batch task | One-off |
| CronJob | Scheduled task | Recurring |

---

## Risorse Aggiuntive

- [Deployment Strategies](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [StatefulSet Basics](https://kubernetes.io/docs/tutorials/stateful-application/basic-statefulset/)
- [Jobs](https://kubernetes.io/docs/concepts/workloads/controllers/job/)
- [CronJobs](https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/)
