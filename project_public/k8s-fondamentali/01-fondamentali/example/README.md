# Esempio Go App - Container Fondamentali

Questo è un esempio pratico di applicazione Go containerizzata che dimostra le best practice per Docker.

## Caratteristiche

- **Multi-stage build**: Separa l'ambiente di build da quello di runtime
- **Non-root user**: Esegue come utente non privilegiato per sicurezza
- **Healthcheck**: Verifica automatica dello stato dell'applicazione
- **.dockerignore**: Ottimizza il build context
- **docker-compose**: Configurazione completa con limiti di risorse

## Build e Run

### Opzione 1: Docker diretto

```bash
# Build dell'immagine
docker build -t go-app:latest .

# Run del container
docker run -d -p 8080:8080 --name my-go-app go-app:latest

# Verifica che funzioni
curl http://localhost:8080

# Visualizza i log
docker logs my-go-app

# Verifica l'healthcheck
docker inspect my-go-app | grep -A 10 Health
```

### Opzione 2: Docker Compose

```bash
# Avvia l'applicazione
docker compose up -d

# Visualizza i log
docker compose logs -f

# Ferma l'applicazione
docker compose down
```

## Verifica delle Best Practice

### 1. Dimensione dell'immagine
```bash
docker images go-app:latest
# Dovresti vedere un'immagine di pochi MB grazie al multi-stage build
```

### 2. Utente non-root
```bash
docker exec my-go-app whoami
# Output: appuser (non root!)
```

### 3. Healthcheck
```bash
docker inspect my-go-app --format='{{json .State.Health}}' | jq
# Mostra lo stato di salute del container
```

### 4. Build context ottimizzato
```bash
# Verifica che .dockerignore funzioni
docker build --no-cache -t go-app:test .
# Nota: il build context dovrebbe essere piccolo (pochi KB)
```

## Esercizi Pratici

1. **Modifica il codice**: Cambia il messaggio in `main.go` e rebuilda. Nota come Docker riutilizza i layer della cache.

2. **Prova il digest**: 
   ```bash
   docker inspect go-app:latest | grep -A 1 RepoDigests
   docker pull go-app@sha256:...
   ```

3. **Testa il tmpfs**:
   ```bash
   docker exec my-go-app df -h
   # Verifica che /tmp sia montato in RAM
   ```

4. **Simula un healthcheck failure**:
   - Ferma il server Go manualmente
   - Osserva come Docker marca il container come "unhealthy"

## Pulizia

```bash
# Ferma e rimuovi il container
docker stop my-go-app && docker rm my-go-app

# Rimuovi l'immagine
docker rmi go-app:latest

# Pulizia completa
docker system prune -a
```
