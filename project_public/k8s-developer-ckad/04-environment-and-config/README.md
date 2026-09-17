# Modulo 04: Ambiente e Configurazione

**Durata**: 4-5 ore  
**Peso CKAD**: 20% (Application Deployment)

## Obiettivi di Apprendimento

Al termine di questo modulo sarai in grado di:
- Creare e utilizzare ConfigMaps per dati di configurazione
- Configurare variabili d'ambiente da ConfigMap e Secret
- Montare ConfigMap e Secret come volumi
- Utilizzare la Downward API per metadati del Pod
- Gestire resource requests, limits e QoS
- Implementare LimitRange e ResourceQuota

---

## 1. ConfigMaps

### 1.1 Creazione

```bash
# Da valori letterali
kubectl create configmap app-config \
  --from-literal=APP_ENV=production \
  --from-literal=DB_HOST=db.example.com

# Da file
kubectl create configmap nginx-config --from-file=nginx.conf

# Da directory
kubectl create configmap app-settings --from-file=./config/

# Da env file
kubectl create configmap env-config --from-env-file=config.env
```

### 1.2 YAML

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  DB_HOST: db.example.com
  DB_PORT: "5432"
  config.yaml: |
    database:
      host: db.example.com
      port: 5432
```

### 1.3 Utilizzo nei Pod

#### Come variabili d'ambiente

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: config-env-pod
spec:
  containers:
  - name: app
    image: nginx:alpine
    env:
    # Singola chiave
    - name: DATABASE_HOST
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: DB_HOST
    # Tutte le chiavi
    envFrom:
    - configMapRef:
        name: app-config
```

#### Come volume

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: config-volume-pod
spec:
  containers:
  - name: app
    image: nginx:alpine
    volumeMounts:
    - name: config
      mountPath: /etc/app
      readOnly: true
  volumes:
  - name: config
    configMap:
      name: app-config
      items:
      - key: config.yaml
        path: app.yaml
        mode: 0644
```

---

## 2. Variabili d'Ambiente

### 2.1 Tipi di Source

```yaml
spec:
  containers:
  - name: app
    env:
    # Valore diretto
    - name: APP_NAME
      value: "myapp"
    
    # Da ConfigMap
    - name: DB_HOST
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: DB_HOST
    
    # Da Secret
    - name: DB_PASSWORD
      valueFrom:
        secretKeyRef:
          name: db-secret
          key: password
    
    # Da campo Pod (Downward API)
    - name: POD_NAME
      valueFrom:
        fieldRef:
          fieldPath: metadata.name
```

### 2.2 envFrom

```yaml
spec:
  containers:
  - name: app
    envFrom:
    # ConfigMap intero
    - configMapRef:
        name: app-config
      prefix: CONFIG_
    
    # Secret intero
    - secretRef:
        name: app-secrets
    
    # Valori inline
    - configMapRef:
        name: override-config
```

---

## 3. Downward API

### 3.1 Variabili d'Ambiente

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: downward-env-pod
spec:
  containers:
  - name: app
    image: busybox
    command: ['sh', '-c', 'env && sleep 3600']
    env:
    - name: POD_NAME
      valueFrom:
        fieldRef:
          fieldPath: metadata.name
    - name: POD_NAMESPACE
      valueFrom:
        fieldRef:
          fieldPath: metadata.namespace
    - name: POD_IP
      valueFrom:
        fieldRef:
          fieldPath: status.podIP
    - name: NODE_NAME
      valueFrom:
        fieldRef:
          fieldPath: spec.nodeName
    - name: CPU_REQUEST
      valueFrom:
        resourceFieldRef:
          containerName: app
          resource: requests.cpu
```

### 3.2 Come Volume

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: downward-volume-pod
  labels:
    app: test
    env: dev
spec:
  containers:
  - name: app
    image: busybox
    command: ['sh', '-c', 'while true; do cat /etc/labels; sleep 5; done']
    volumeMounts:
    - name: podinfo
      mountPath: /etc
  volumes:
  - name: podinfo
    downwardAPI:
      items:
      - path: "labels"
        fieldRef:
          fieldPath: metadata.labels
      - path: "annotations"
        fieldRef:
          fieldPath: metadata.annotations
      - path: "cpu_limit"
        resourceFieldRef:
          containerName: app
          resource: limits.cpu
```

---

## 4. Resource Management

### 4.1 Requests e Limits

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: resource-pod
spec:
  containers:
  - name: app
    image: nginx:alpine
    resources:
      # Requests: garantiti per schedulazione
      requests:
        cpu: 100m        # 0.1 core
        memory: 128Mi    # 128 MiB
        ephemeral-storage: 1Gi
      # Limits: massimo utilizzabile
      limits:
        cpu: 500m        # 0.5 core
        memory: 256Mi    # 256 MiB
        ephemeral-storage: 2Gi
```

### 4.2 Unità di Misura

**CPU**:
- `1` = 1 CPU core
- `100m` = 100 millicores = 0.1 core
- `0.5` = 500m = mezzo core

**Memoria**:
- `128Mi` = 128 MiB (2^20 bytes)
- `1Gi` = 1024 MiB
- `1G` = 1000 MB (decimale)

### 4.3 Comportamento Runtime

| Risorsa | Oltre Request | Oltre Limit |
|---------|---------------|-------------|
| CPU | Throttling | Throttling |
| Memoria | Eviction possibile | OOMKilled |
| Storage | - | Eviction |

---

## 5. QoS Classes

### 5.1 Determinazione Automatica

| QoS Class | Criterio | Priorità Eviction |
|-----------|----------|-------------------|
| Guaranteed | Requests == Limits (tutte le risorse, tutti i container) | Minore |
| Burstable | Almeno un request o limit definito | Media |
| BestEffort | Nessuna risorsa specificata | Maggiore |

```bash
# Verifica QoS
kubectl get pod <pod> -o jsonpath='{.status.qosClass}'
```

---

## 6. LimitRange

### 6.1 Scopo

Impone default e limiti per namespace:
- Default resources per Pod/Container
- Min/Max resources
- Min/Max storage request
- Limit ratio (request/limit)

### 6.2 Configurazione

```yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: cpu-mem-limit-range
spec:
  limits:
  - type: Container
    # Defaults (se non specificato)
    default:
      cpu: 200m
      memory: 256Mi
    defaultRequest:
      cpu: 50m
      memory: 64Mi
    # Minimi
    min:
      cpu: 10m
      memory: 16Mi
    # Massimi
    max:
      cpu: 1
      memory: 1Gi
    # Ratio max request/limit
    maxLimitRequestRatio:
      cpu: 5
      memory: 2
  - type: PersistentVolumeClaim
    min:
      storage: 1Gi
    max:
      storage: 10Gi
```

---

## 7. ResourceQuota

### 7.1 Scopo

Limita consumo totale di risorse per namespace:
- Conteggio oggetti (Pod, Service, PVC, ecc.)
- Somma risorse (CPU, memoria, storage)
- Somma risorse per QoS class

### 7.2 Configurazione

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: compute-quota
spec:
  hard:
    # Conteggio oggetti
    pods: 10
    services: 5
    persistentvolumeclaims: 5
    
    # Requests totali
    requests.cpu: 2
    requests.memory: 2Gi
    requests.storage: 10Gi
    
    # Limits totali
    limits.cpu: 4
    limits.memory: 4Gi
    
    # Per QoS class
    count/pods: 50
```

### 7.3 Scope

```yaml
spec:
  hard:
    pods: 10
  scopeSelector:
    matchExpressions:
    - operator: In
      scopeName: PriorityClass
      values: [high-priority]
```

---

## 8. Pod Priority

### 8.1 PriorityClass

```yaml
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
  name: high-priority
value: 1000000
globalDefault: false
preemptionPolicy: PreemptLowerPriority  # PreemptLowerPriority, Never
description: "Critical workloads"
```

### 8.2 Utilizzo

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: critical-pod
spec:
  priorityClassName: high-priority
  containers:
  - name: app
    image: nginx
```

---

## 9. Esercitazione Pratica

### Scenario
Configurare un'applicazione con:
1. Configurazione da ConfigMap
2. Secrets per credenziali
3. Resource limits appropriati
4. LimitRange per default
5. ResourceQuota per limiti namespace

### Passi

1. Crea namespace 'production'
2. Configura LimitRange
3. Configura ResourceQuota
4. Crea ConfigMaps e Secrets
5. Deploy Pod con tutte le configurazioni

---

## Riepilogo

| Risorsa | Scopo | Ambito |
|---------|-------|--------|
| ConfigMap | Dati configurazione | Pod/Namespace |
| LimitRange | Default e limiti per oggetto | Namespace |
| ResourceQuota | Limiti totali namespace | Namespace |
| PriorityClass | Preemption | Cluster |

---

## Risorse Aggiuntive

- [ConfigMaps](https://kubernetes.io/docs/concepts/configuration/configmap/)
- [Resource Management](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/)
- [LimitRange](https://kubernetes.io/docs/concepts/policy/limit-range/)
- [ResourceQuota](https://kubernetes.io/docs/concepts/policy/resource-quotas/)
