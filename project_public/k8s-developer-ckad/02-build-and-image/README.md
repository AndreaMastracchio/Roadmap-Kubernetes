# Modulo 02: Build e Gestione Immagini

**Durata**: 3-4 ore  
**Peso CKAD**: 20% (Application Design and Build)

## Obiettivi di Apprendimento

Al termine di questo modulo sarai in grado di:
- Costruire immagini Docker con docker build
- Ottimizzare build sfruttando il layer caching
- Taggare e gestire versioni delle immagini
- Interagire con registri container pubblici e privati
- Configurare imagePullPolicy appropriato
- Usare container temporanei per debug

---

## 1. Processo di Build Docker

### 1.1 Comando docker build

Il comando `docker build` crea un'immagine da un Dockerfile e un contesto di build.

```bash
# Build base
docker build -t myapp:v1.0 .

# Build con Dockerfile specifico
docker build -t myapp:v1.0 -f Dockerfile.prod .

# Build con argomenti
docker build --build-arg VERSION=1.0 -t myapp:v1.0 .

# Build senza cache
docker build --no-cache -t myapp:v1.0 .
```

### 1.2 Contesto di Build

Il contesto è l'insieme di file accessibili durante la build:

```bash
# Contesto = directory corrente
docker build -t myapp .

# Contesto = directory specifica
docker build -t myapp /path/to/context

# Contesto da Git repository
docker build -t myapp https://github.com/user/repo.git#branch

# Contesto da stdin (senza Dockerfile)
echo -e "FROM alpine\nRUN echo 'Hello'" | docker build -t minimal -
```

### 1.3 Flag Comuni

| Flag | Scopo | Esempio |
|------|-------|---------|
| `-t` | Tag immagine | `-t myapp:v1` |
| `-f` | Dockerfile alternativo | `-f Dockerfile.prod` |
| `--build-arg` | Passa ARG | `--build-arg VERSION=1.0` |
| `--no-cache` | Disabilita cache | `--no-cache` |
| `--platform` | Piattaforma target | `--platform linux/amd64` |
| `--target` | Stage specifico | `--target builder` |

---

## 2. Layer Caching

### 2.1 Come Funziona la Cache

Docker salva ogni layer e lo riutilizza se:
- L'istruzione non è cambiata
- I file di input (per COPY/ADD) non sono cambiati
- I layer precedenti sono stati usati dalla cache

```dockerfile
# Bene: Cache efficiente
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci                 # Cache fino a qui se package.json non cambia
COPY . .                   # Nuovo layer se codice cambia
RUN npm run build
CMD ["npm", "start"]

# Male: Cache inefficiente
FROM node:18-alpine
WORKDIR /app
COPY . .                   # Invalidate cache se QUALSIASI file cambia
RUN npm ci                 # Ricostruito ogni volta
RUN npm run build
CMD ["npm", "start"]
```

### 2.2 Strategie di Ottimizzazione

1. **Ordina le istruzioni** dalla meno frequente alla più frequente
2. **Minimizza i layer** combinando RUN correlate
3. **Usa .dockerignore** per ridurre invalidazioni
4. **Separa dipendenze** dal codice sorgente

```dockerfile
# Ottimizzazione completa
FROM python:3.11-slim

# Layer 1: Dipendenze di sistema (cambia raramente)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Layer 2: Dipendenze Python (cambia occasionalmente)
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Layer 3: Codice sorgente (cambia frequentemente)
COPY . .

# Layer 4: Configurazione (cambia occasionalmente)
ARG ENV=production
ENV APP_ENV=$ENV

CMD ["gunicorn", "app:app"]
```

---

## 3. Tagging e Versioning

### 3.1 Convenzioni di Tag

```bash
# Tag semantici (raccomandato per produzione)
myapp:v1.2.3
myapp:1.2.3

# Tag descrittivi
myapp:latest           # Ultima versione (evitare in produzione)
myapp:stable           # Versione stabile
myapp:alpine           # Variante base image

# Tag con registry
docker.io/username/myapp:v1.2.3
gcr.io/project-id/myapp:v1.2.3
registry.example.com/team/myapp:v1.2.3

# Tag multipli
docker tag myapp:v1.2.3 myapp:latest
docker tag myapp:v1.2.3 myapp:v1.2
docker tag myapp:v1.2.3 myapp:v1
```

### 3.2 Best Practices per Tagging

1. **Produzione**: Usa tag semantici immutabili
2. **Staging**: Usa branch name + commit SHA
3. **Sviluppo**: Usa tag temporanei o untagged
4. **Evita**: `:latest` per deploy prod

```bash
# Esempio CI/CD tagging
VERSION=$(git describe --tags --always)
docker build -t myapp:${VERSION} .
docker tag myapp:${VERSION} registry.example.com/myapp:${VERSION}
docker push registry.example.com/myapp:${VERSION}
```

---

## 4. Container Registries

### 4.1 Registri Comuni

| Registro | URL | Note |
|----------|-----|------|
| Docker Hub | docker.io | Default, pubblico gratuito |
| GitHub Container | ghcr.io | Integrazione GitHub |
| Google Container | gcr.io | GKE nativo |
| Amazon ECR | <account>.dkr.ecr.<region>.amazonaws.com | AWS nativo |
| Harbor | harbor.example.com | Enterprise, self-hosted |

### 4.2 Autenticazione

```bash
# Docker Hub
docker login

# Registry privato
docker login registry.example.com -u username -p password

# Con file di credenziali
cat ~/.docker/config.json

# Kubernetes Secret per registry privato
kubectl create secret docker-registry my-registry \
  --docker-server=registry.example.com \
  --docker-username=admin \
  --docker-password=password \
  --docker-email=admin@example.com

# Usare il Secret nel Pod
apiVersion: v1
kind: Pod
metadata:
  name: private-pod
spec:
  containers:
  - name: app
    image: registry.example.com/myapp:v1
  imagePullSecrets:
  - name: my-registry
```

### 4.3 Push e Pull

```bash
# Push immagine
docker push registry.example.com/myapp:v1

# Pull immagine
docker pull registry.example.com/myapp:v1

# Pull con platform specifica
docker pull --platform linux/arm64 registry.example.com/myapp:v1
```

---

## 5. Image Pull Policy

### 5.1 Valori Disponibili

```yaml
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: app
    image: myapp:v1.0
    
    # Always: Scarica sempre l'immagine
    imagePullPolicy: Always
    
    # IfNotPresent: Scarica solo se non presente (default per tag specifici)
    imagePullPolicy: IfNotPresent
    
    # Never: Non scarica mai, usa solo locale
    imagePullPolicy: Never
```

### 5.2 Comportamento Default

- Tag `:latest` o assente → `Always`
- Tag specifico → `IfNotPresent`
- Image digest (SHA256) → `IfNotPresent`

### 5.3 Quando Usare Quale

| Policy | Quando Usare |
|--------|--------------|
| `Always` | Tag `:latest`, ambienti dev/staging |
| `IfNotPresent` | Tag specifici, ambienti prod con registry stabile |
| `Never` | Solo immagini locali, air-gapped environments |

---

## 6. Container Ephemerali per Debug

### 6.1 kubectl debug

```bash
# Aggiunge container temporaneo a un Pod esistente
kubectl debug -it pod-name --image=busybox:1.36

# Con target specifico
kubectl debug -it pod-name --image=busybox:1.36 --target=container-name

# Crea una copia del Pod per debug
kubectl debug pod-name --image=busybox:1.36 --copy-to=debug-pod

# Copia con cambiamenti
kubectl debug pod-name --copy-to=debug-pod \
  --image=busybox:1.36 \
  --container=main-container \
  -- sh
```

### 6.2 Esempi Pratici

```bash
# Debug rete
kubectl debug -it nginx-pod --image=nicolaka/netshoot

# Debug filesystem
kubectl debug -it nginx-pod --image=busybox:1.36 --target=nginx

# Debug con strace
kubectl debug -it nginx-pod --image=alpine --target=nginx
# apk add strace && strace -p 1
```

### 6.3 Debug di Pod Falliti

```bash
# Crea copia del Pod fallito per investigare
kubectl debug failing-pod --copy-to=debug-pod --image=busybox:1.36

# Esegui investigazione
kubectl logs debug-pod -c debug-container
kubectl describe pod debug-pod
```

---

## 7. Ottimizzazione Dimensioni Immagini

### 7.1 Tecniche Base

```dockerfile
# 1. Usa base image minimali
FROM alpine:3.18      # ~5MB
# oppure
FROM python:3.11-slim # ~150MB vs python:3.11 ~1GB

# 2. Pulisci cache package manager
RUN apt-get update && apt-get install -y \
    package1 \
    package2 \
    && rm -rf /var/lib/apt/lists/*

# 3. Combina RUN correlate
RUN apk add --no-cache \
    curl \
    jq \
    && rm -rf /tmp/*

# 4. Usa .dockerignore
# .dockerignore:
# node_modules
# *.log
# .git
```

### 7.2 Confronto Dimensioni

```bash
# Base image grandi
python:3.11          # ~1.0GB
node:18              # ~900MB

# Base image slim
python:3.11-slim     # ~150MB
node:18-slim         # ~200MB

# Base image alpine
python:3.11-alpine   # ~50MB
node:18-alpine       # ~180MB

# Scratch/distroless
static binary        # 5-20MB
```

---

## 8. Analisi Immagini

### 8.1 Comandi Utili

```bash
# Lista immagini
docker images
docker images --filter "dangling=false"
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

# Storico layer
docker history myapp:v1
docker history --no-trunc myapp:v1
docker history --format "{{.CreatedBy}}" myapp:v1

# Ispezione dettagliata
docker inspect myapp:v1
docker inspect --format '{{.Config.Entrypoint}}' myapp:v1
docker inspect --format '{{range .Config.Env}}{{println .}}{{end}}' myapp:v1
```

### 8.2 Export e Import

```bash
# Salva immagine su file
docker save myapp:v1 -o myapp-v1.tar
docker save myapp:v1 | gzip > myapp-v1.tar.gz

# Carica immagine da file
docker load -i myapp-v1.tar
docker load < myapp-v1.tar.gz

# Export container (non immagine)
docker export container-id > container.tar

# Import come immagine
docker import container.tar myapp:imported
```

---

## 9. Build con Docker Compose

### 9.1 docker-compose.yml per Build

```yaml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        VERSION: 1.0
    image: myapp:v1.0
    ports:
      - "8000:8000"
  
  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: secret

volumes:
  postgres_data:
```

```bash
# Build tutti i servizi
docker-compose build

# Build con no cache
docker-compose build --no-cache

# Build e avvio
docker-compose up --build
```

---

## 10. Troubleshooting Build

### 10.1 Errori Comuni

```bash
# Errori comuni e soluzioni

# 1. "COPY failed: file not found"
# Soluzione: Verifica percorso nel contesto
ls -la $(cat .dockerignore)

# 2. "permission denied"
# Soluzione: Aggiungi utente o cambia permessi
RUN chmod +x script.sh

# 3. "no space left on device"
# Soluzione: Pulisci immagini e container
docker system prune -a

# 4. "network error"
# Soluzione: Verifica connessione o usa --network=host
docker build --network=host -t myapp .
```

### 10.2 Debug Build

```bash
# Build con output verboso
docker build --progress=plain -t myapp .

# Intervieni a uno stage specifico
docker build --target builder -t myapp-builder .

# Ispeziona layer intermedio
docker run --rm -it myapp-builder sh
```

---

## 11. Esercitazione Pratica

### Scenario
Ottimizzare un'applicazione esistente con:
1. Immagini molto grandi (>1GB)
2. Build lente
3. Deploy con tag `:latest`

### Passi

1. Analizza il Dockerfile esistente
2. Identifica problemi di caching
3. Implementa build multi-stage
4. Crea tag semantici
5. Configura registry privato
6. Verifica dimensioni finali

---

## Riepilogo

| Argomento | Importanza | Note |
|-----------|------------|------|
| docker build | Alta | Fondamentale |
| Layer caching | Alta | Performance build |
| Tagging | Alta | Gestione versioni |
| Registries | Media | DevOps workflow |
| imagePullPolicy | Media | Comportamento runtime |
| Ephemeral containers | Media | Debug avanzato |
| Ottimizzazione dimensioni | Media | Costi e performance |

---

## Risorse Aggiuntive

- [Docker Build Guide](https://docs.docker.com/build/)
- [Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Kubernetes Image Pull Policy](https://kubernetes.io/docs/concepts/containers/images/)
- [kubectl debug](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#debug)
