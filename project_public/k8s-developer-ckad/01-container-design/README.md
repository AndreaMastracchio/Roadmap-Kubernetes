# Modulo 01: Container Design e Pattern

**Durata**: 3-4 ore  
**Peso CKAD**: 20% (Application Design and Build)

## Obiettivi di Apprendimento

Al termine di questo modulo sarai in grado di:
- Scrivere Dockerfile efficienti seguendo le best practices
- Implementare build multi-stage per immagini ottimizzate
- Utilizzare .dockerignore per ridurre il contesto di build
- Comprendere e applicare i pattern di container: Sidecar, Ambassador, Adapter
- Configurare init container per task di inizializzazione
- Gestire resource requests e limits nei container

---

## 1. Fondamenti dei Container

### 1.1 Cos'è un Container

Un container è un'unità esecutiva leggera che include il codice dell'applicazione e tutte le sue dipendenze. A differenza delle macchine virtuali, i container condividono il kernel del sistema operativo host, rendendoli molto più efficienti in termini di risorse.

**Caratteristiche principali**:
- **Isolamento**: Processi isolati tra loro
- **Portabilità**: Funziona identicamente in ogni ambiente
- **Efficienza**: Condivide risorse del kernel
- **Immutabilità**: L'immagine non cambia dopo la creazione

### 1.2 Immagini Container

Un'immagine è un template di sola lettura che contiene:
- Filesystem a strati (layers)
- Metadata di configurazione
- Manifest che descrive i layer

```bash
# Visualizzare i layer di un'immagine
docker history nginx:alpine

# Analizzare la dimensione
docker images nginx:alpine --format "Size: {{.Size}}"
```

---

## 2. Dockerfile e Best Practices

### 2.1 Struttura Base di un Dockerfile

Un Dockerfile è un file di testo che contiene istruzioni per costruire un'immagine container.

```dockerfile
# Dockerfile base
FROM ubuntu:22.04

# Installa dipendenze
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Imposta directory di lavoro
WORKDIR /app

# Copia file di dipendenze
COPY requirements.txt .

# Installa dipendenze Python
RUN pip install --no-cache-dir -r requirements.txt

# Copia codice sorgente
COPY . .

# Esponi porta
EXPOSE 8000

# Comando di avvio
CMD ["python3", "app.py"]
```

### 2.2 Best Practices per le Istruzioni

#### FROM - Scelta della Base Image

```dockerfile
# Scelte comuni per base images
FROM ubuntu:22.04        # Completa ma grande (~77MB)
FROM python:3.11-slim   # Più leggera (~150MB)
FROM python:3.11-alpine # Minimale (~50MB)
FROM scratch            # Vuota, solo per binari statici
```

**Linee guida**:
- Preferisci immagini ufficiali
- Specifica sempre il tag (evita `latest`)
- Per Go, compila staticamente e usa `scratch`
- Per Python/Node, `alpine` richiede spesso compilazioni

#### RUN - Esecuzione di Comandi

```dockerfile
# MALE: Troppi layer
RUN apt-get update
RUN apt-get install -y python3
RUN apt-get install -y pip

# BENE: Layer singolo con cleanup
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean
```

#### COPY vs ADD

```dockerfile
# COPY è preferito per file locali
COPY app.py /app/

# ADD ha funzionalità extra (URL, estrazione automatica)
# Ma è sconsigliato per file locali semplici
ADD https://example.com/file.tar.gz /tmp/
```

#### CMD vs ENTRYPOINT

```dockerfile
# CMD: Argomenti predefiniti, facilmente sovrascrivibili
FROM ubuntu
CMD ["echo", "Hello"]

# Override: docker run myimage echo "Custom"

# ENTRYPOINT: Comando fisso, argomenti aggiunti
FROM ubuntu
ENTRYPOINT ["echo"]
CMD ["Hello"]

# Override argomenti: docker run myimage "Custom"
```

Combinazione ottimale:
```dockerfile
ENTRYPOINT ["python3", "app.py"]
CMD ["--port", "8000"]
```

### 2.3 Ottimizzazione della Cache

Docker utilizza la cache per evitare di ricostruire layer non modificati. L'ordine delle istruzioni è cruciale.

```dockerfile
# BENE: Ordine ottimizzato
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["python", "app.py"]

# MALE: Cache inefficiente
FROM python:3.11-slim
WORKDIR /app
COPY . .
RUN pip install --no-cache-dir -r requirements.txt
CMD ["python", "app.py"]
```

La cache viene invalidata quando:
- Un'istruzione precedente cambia
- Il file copiato cambia (checksum)
- Si usa `--no-cache`

---

## 3. Build Multi-Stage

### 3.1 Concetto Base

Le build multi-stage permettono di usare immagini diverse per build e runtime, includendo solo il necessario nel risultato finale.

```dockerfile
# Stage 1: Build
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.* ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# Stage 2: Runtime
FROM alpine:3.18
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/main .
EXPOSE 8080
CMD ["./main"]
```

### 3.2 Esempi Multi-Stage per Linguaggi Comuni

#### Node.js

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

#### Java con Maven

```dockerfile
# Build stage
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### Python con ambiente virtuale

```dockerfile
# Build stage
FROM python:3.11-slim AS builder
WORKDIR /app
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Runtime stage
FROM python:3.11-slim
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
WORKDIR /app
COPY . .
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser
EXPOSE 8000
CMD ["gunicorn", "app:app"]
```

### 3.3 Distroless e Scratch

Per massima sicurezza e dimensioni minime:

```dockerfile
# Con Distroless (Google)
FROM gcr.io/distroless/static-debian11
COPY --from=builder /app/main /
CMD ["/main"]

# Con Scratch (completamente vuoto)
FROM scratch
COPY --from=builder /app/main /
CMD ["/main"]
```

**Limitazioni**:
- Nessuna shell (difficile debugging)
- Nessun package manager
- Richiede binari completamente statici

---

## 4. File .dockerignore

### 4.1 Scopo e Utilizzo

Il file `.dockerignore` esclude file dal contesto di build, riducendo tempo e dimensione.

```dockerignore
# Controllo versione
.git
.gitignore

# Dipendenze
node_modules
vendor
__pycache__
*.pyc
.venv

# IDE e editor
.idea
.vscode
*.swp
*~

# Build e artefatti
dist
build
target
*.o
*.pyc

# Documentazione
*.md
!README.md
docs/

# File sensibili
.env
.env.*
*.pem
*.key
secrets/

# Test e CI
test/
tests/
.github/
.gitlab-ci.yml

# File OS
.DS_Store
Thumbs.db
```

### 4.2 Benefici

1. **Build più veloci**: Meno file da trasferire
2. **Immagini più piccole**: No file non necessari
3. **Sicurezza**: Evita di includere secrets accidentalmente
4. **Cache migliore**: Contesto più stabile

---

## 5. Pattern di Container

### 5.1 Sidecar Pattern

Il sidecar è un container secondario che estende la funzionalità del container principale.

**Casi d'uso**:
- Log forwarding
- Metriche e monitoring
- Sincronizzazione file
- Proxy servizi

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: sidecar-demo
spec:
  containers:
  # Container principale
  - name: app
    image: nginx:alpine
    volumeMounts:
    - name: logs
      mountPath: /var/log/nginx
  
  # Sidecar per log forwarding
  - name: log-forwarder
    image: fluent/fluent-bit:latest
    volumeMounts:
    - name: logs
      mountPath: /var/log/nginx
      readOnly: true
  
  volumes:
  - name: logs
    emptyDir: {}
```

**Vantaggi**:
- Separazione delle responsabilità
- Container autonomi e riusabili
- Facilita manutenzione e aggiornamenti

### 5.2 Ambassador Pattern

L'ambassador nasconde la complessità delle connessioni a servizi esterni.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: ambassador-demo
spec:
  containers:
  # Applicazione principale (si connette a localhost)
  - name: app
    image: myapp:1.0
    env:
    - name: DB_HOST
      value: "localhost"
    - name: DB_PORT
      value: "5432"
  
  # Ambassador che inoltra al database reale
  - name: ambassador
    image: haproxy:2.8-alpine
    volumeMounts:
    - name: config
      mountPath: /usr/local/etc/haproxy
  
  volumes:
  - name: config
    configMap:
      name: haproxy-config
```

**Casi d'uso**:
- Connessione a database in ambienti diversi
- Service discovery semplificato
- Gestione di connessioni legacy

### 5.3 Adapter Pattern

L'adapter trasforma l'output del container principale in un formato standard.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: adapter-demo
spec:
  containers:
  # Container principale con output custom
  - name: app
    image: legacy-app:1.0
    volumeMounts:
    - name: logs
      mountPath: /var/log/app
  
  # Adapter che converte in JSON
  - name: adapter
    image: log-adapter:latest
    volumeMounts:
    - name: logs
      mountPath: /var/log/app
      readOnly: true
    - name: output
      mountPath: /var/log/output
  
  volumes:
  - name: logs
    emptyDir: {}
  - name: output
    emptyDir: {}
```

**Casi d'uso**:
- Normalizzazione log
- Conversione protocolli
- Integrazione con sistemi legacy

---

## 6. Init Container

### 6.1 Concetto Base

Gli init container vengono eseguiti sequenzialmente prima del container principale e devono completare con successo.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: init-demo
spec:
  initContainers:
  # Init 1: Setup database
  - name: init-db
    image: busybox:1.36
    command: ['sh', '-c', 'until nslookup db-service; do sleep 2; done']
  
  # Init 2: Migrazione
  - name: init-migration
    image: migrate:latest
    command: ['python', 'manage.py', 'migrate']
  
  containers:
  - name: app
    image: myapp:1.0
```

### 6.2 Caratteristiche

- Esecuzione sequenziale garantita
- Devono terminare con successo
- Non hanno readiness/liveness probes
- Possono avere volumi diversi dal container principale

### 6.3 Casi d'uso Comuni

```yaml
# 1. Attesa servizio dipendente
initContainers:
- name: wait-for-db
  image: busybox
  command: ['sh', '-c', 'until nc -z db-service 5432; do sleep 1; done']

# 2. Download asset
initContainers:
- name: download-assets
  image: busybox
  command: ['wget', '-O', '/data/config.json', 'https://example.com/config.json']
  volumeMounts:
  - name: data
    mountPath: /data

# 3. Setup permessi
initContainers:
- name: setup-permissions
  image: busybox
  command: ['chmod', '777', '/data']
  volumeMounts:
  - name: data
    mountPath: /data
```

---

## 7. Resource Management

### 7.1 Requests e Limits

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: resource-demo
spec:
  containers:
  - name: app
    image: nginx:alpine
    resources:
      # Requests: garantiti per la schedulazione
      requests:
        cpu: 100m      # 0.1 core
        memory: 128Mi  # 128 MiB
      # Limits: massimo utilizzabile
      limits:
        cpu: 500m      # 0.5 core
        memory: 256Mi  # 256 MiB
```

### 7.2 Unità di Misura

**CPU**:
- `1` = 1 CPU core (AWS vCPU, GCP Core)
- `100m` = 0.1 core (100 millicores)
- `0.5` = 500m

**Memoria**:
- `128Mi` = 128 MiB (2^20 bytes)
- `1Gi` = 1024 MiB
- `1G` = 1000 MB (decimale)

### 7.3 Comportamento con Limit

- **CPU**: Throttling (limita l'uso, non killa)
- **Memoria**: OOMKill (il container viene terminato)

---

## 8. Image Pull Policies

```yaml
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: app
    image: myimage:v1.0
    imagePullPolicy: Always  # Sempre pull
    # imagePullPolicy: IfNotPresent  # Pull se non presente
    # imagePullPolicy: Never  # Mai pull, solo locale
```

**Default**:
- `latest` tag → `Always`
- Specific tag → `IfNotPresent`

---

## 9. Best Practices di Sicurezza

### 9.1 Utente Non-Root

```dockerfile
# Nel Dockerfile
RUN useradd -m -r appuser && chown -R appuser:appuser /app
USER appuser

# Oppure nel Pod
securityContext:
  runAsUser: 1000
  runAsGroup: 3000
  fsGroup: 2000
```

### 9.2 Read-Only Filesystem

```yaml
securityContext:
  readOnlyRootFilesystem: true
  allowPrivilegeEscalation: false
```

### 9.3 Capabilities

```yaml
securityContext:
  capabilities:
    drop:
    - ALL
    add:
    - NET_BIND_SERVICE
```

---

## 10. Esercitazione Pratica

### Obiettivo
Creare un'applicazione completa con:
1. Dockerfile multi-stage
2. Pod con sidecar per log
3. Init container per setup
4. Resource limits appropriati

### Passi

1. **Crea il Dockerfile** multi-stage per un'app Python
2. **Costruisci l'immagine** con tag specifico
3. **Scrivi il Pod YAML** con tutti i componenti
4. **Verifica il funzionamento** con kubectl
5. **Analizza i log** del sidecar

---

## Riepilogo

| Concetto | Importanza CKAD | Note |
|----------|-----------------|------|
| Dockerfile basics | Alta | Fondamentale |
| Multi-stage builds | Alta | Ottimizzazione immagini |
| Init containers | Alta | Task di inizializzazione |
| Sidecar pattern | Media | Estensione funzionalità |
| Resource limits | Alta | Schedulazione e performance |
| Security context | Media | Best practice produzione |

---

## Risorse Aggiuntive

- [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Kubernetes Init Containers](https://kubernetes.io/docs/concepts/workloads/pods/init-containers/)
- [Container Patterns](https://kubernetes.io/blog/2015/06/the-distributed-system-toolkit-patterns/)
- [Resource Management](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/)
