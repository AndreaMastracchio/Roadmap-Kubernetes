# Modulo 1: 🏗️ Fondamentali dei Container

Prima di poter usare Kubernetes, devi capire cos'è un container e come funziona "sotto il cofano".

## Perché i Container?
I container permettono di isolare un'applicazione e le sue dipendenze (librerie, runtime, configurazioni), garantendo che funzioni nello stesso modo in qualsiasi ambiente. Risolvono il classico problema: *"Ma sulla mia macchina funzionava!"*.

### Container vs Macchine Virtuali (VM)
- **VM**: Includono un intero sistema operativo guest. Sono pesanti (GB) e lente ad avviarsi.
- **Container**: Condividono il Kernel del sistema operativo host. Sono leggeri (MB), si avviano in secondi e utilizzano meno risorse.

## Concetti Chiave
1. **Immagine**: Un pacchetto statico, immutabile e stratificato (layers) che contiene tutto il necessario per far girare l'app.
2. **Container**: Un'istanza in esecuzione di un'immagine.
3. **Registro (Registry)**: Un luogo dove memorizzare e condividere immagini (es. Docker Hub, Google Container Registry).
4. **Runtime**: Il software che esegue i container (es. `containerd`, `CRI-O`). Docker usa `containerd`.

## Docker
Docker è lo strumento che ha reso popolari i container.

### Il Dockerfile e i Layer
Ogni istruzione in un Dockerfile crea un nuovo "layer" (strato). Se modifichi solo l'ultimo layer, Docker riutilizza quelli precedenti (cache), rendendo le build velocissime.

### Comandi fondamentali:
- `docker build -t mia-app:v1 .`: Crea l'immagine.
- `docker run -p 8080:80 mia-app:v1`: Avvia il container mappando la porta 8080 host alla 80 del container.
- `docker stop <id>`: Ferma il container.
- `docker system prune`: Pulisce risorse inutilizzate.

### Esempio Dockerfile Ottimizzato (Multi-stage)
```dockerfile
# Stage 1: Build
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod ./
RUN go mod download
COPY . .
RUN go build -o main .

# Stage 2: Final (Immagine piccolissima)
FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/main .
CMD ["./main"]
```

## Esercizio Pratico
1. Scarica un'immagine ufficiale (es. `docker pull nginx`).
2. Avviala e prova a modificare la pagina di benvenuto usando un volume (`-v`).
3. Prova a creare la tua immagine seguendo l'esempio sopra.
