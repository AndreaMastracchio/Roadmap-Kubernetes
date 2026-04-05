# Modulo 1: 🏗️ Fondamentali dei Container

Prima di poter usare Kubernetes, devi capire cos'è un container e come funziona "sotto il cofano". Un container non è una VM molto leggera, ma un processo isolato nel sistema operativo host.

## Perché i Container?
I container permettono di isolare un'applicazione e le sue dipendenze (librerie, runtime, configurazioni), garantendo che funzioni nello stesso modo in qualsiasi ambiente. Risolvono il classico problema: *"Ma sulla mia macchina funzionava!"*.

### Container vs Macchine Virtuali (VM)
- **VM**: Includono un intero sistema operativo guest. Sono pesanti (GB) e lente ad avviarsi. L'isolamento è garantito dall'hypervisor.
- **Container**: Condividono il Kernel del sistema operativo host. Sono leggeri (MB), si avviano in secondi e utilizzano meno risorse. L'isolamento è garantito da funzionalità del Kernel Linux.

## Come funziona un Container? (Sotto il cofano)
I container si basano su due pilastri del Kernel Linux:

1.  **Namespaces**: Forniscono l'isolamento della visibilità.
    *   `PID`: Isola i processi (il container vede solo se stesso come PID 1).
    *   `NET`: Isola le interfacce di rete.
    *   `MNT`: Isola il file system (mount points).
    *   `UTS`: Isola l'hostname.
2.  **Control Groups (cgroups)**: Forniscono la gestione delle risorse (CPU, Memoria, I/O). Impediscono che un container consumi tutta la RAM dell'host ("OOM Killer").

## Concetti Chiave
1. **Immagine**: Un pacchetto statico, immutabile e stratificato (layers) che contiene tutto il necessario per far girare l'app. Segue lo standard **OCI (Open Container Initiative)**.
2. **Container**: Un'istanza in esecuzione di un'immagine.
3. **Registro (Registry)**: Un luogo dove memorizzare e condividere immagini (es. Docker Hub, Google Container Registry, Harbor).
4. **Runtime**: Il software che esegue i container (es. `containerd`, `CRI-O`). Docker usa `containerd` internamente. Kubernetes interagisce con il runtime tramite il **CRI (Container Runtime Interface)**.

## Docker e Dockerfile
Docker è lo strumento che ha reso popolari i container. Il `Dockerfile` è la "ricetta" per creare l'immagine.

### Ottimizzazione dei Layer
Ogni istruzione in un Dockerfile (`FROM`, `RUN`, `COPY`, `ADD`) crea un nuovo "layer" (strato). 
- I layer sono **immutabili**.
- Se modifichi solo l'ultimo layer, Docker riutilizza quelli precedenti (**Build Cache**).
- **Best Practice**: Ordina le istruzioni dalle meno frequenti alle più frequenti (es. installa le dipendenze *prima* di copiare il codice sorgente).

### Esempio Dockerfile Ottimizzato (Multi-stage + Non-root)
```dockerfile
# Stage 1: Build
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod ./
RUN go mod download
COPY . .
RUN go build -o main .

# Stage 2: Final (Immagine piccolissima e sicura)
FROM alpine:latest
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
WORKDIR /home/appuser
COPY --from=builder /app/main .
CMD ["./main"]
```

## Sicurezza dei Container
- **Non eseguire come Root**: Di default i container girano come root. È una pessima pratica. Usa l'istruzione `USER` nel Dockerfile.
- **Immagini Distroless**: Immagini che non contengono shell o utility di sistema, riducendo la superficie di attacco.
- **Scansione Vulnerabilità**: Usa tool come `Trivy` o `Snyk` per analizzare le tue immagini.

### Architettura a Layer (Copy-on-Write)
Le immagini sono composte da una serie di layer a sola lettura. Quando avvii un container, Docker aggiunge uno strato sottile scrivibile (**Container Layer**) in cima alla pila. 
- Tutte le modifiche fatte al container in esecuzione vengono salvate in questo layer.
- Se elimini il container, il layer scrivibile viene eliminato, ma l'immagine sottostante rimane intatta.
- Questa tecnologia si chiama **Union File System**.

### ENTRYPOINT vs CMD
Questi due comandi definiscono cosa viene eseguito all'avvio del container:
- **CMD**: Fornisce i parametri di default per l'eseguibile. Può essere sovrascritto facilmente da riga di comando (`docker run immagine comando-alternativo`).
- **ENTRYPOINT**: Configura il container per essere eseguito come un eseguibile. È più difficile da sovrascrivere (`--entrypoint`).
- **Best Practice**: Usa `ENTRYPOINT` per l'eseguibile principale e `CMD` per i parametri di default.

### COPY vs ADD
- **COPY**: Copia file e directory locali nel container. È l'istruzione consigliata per la maggior parte dei casi.
- **ADD**: Simile a COPY, ma può anche scaricare file da URL remoti ed estrarre automaticamente archivi `.tar`. Da usare con cautela.

## Gestione dei Dati: Volumi e Bind Mounts
I container sono effimeri: se il container viene eliminato, i dati al suo interno vanno persi.
- **Volumes**: Gestiti da Docker (solitamente in `/var/lib/docker/volumes/`). Sono il modo consigliato per la persistenza.
- **Bind Mounts**: Mappano una cartella dell'host in una cartella del container. Utili in sviluppo per il ricaricamento a caldo del codice.

## Reti Docker
Docker isola i container anche a livello di rete:
- **Bridge**: Il driver di default. I container possono comunicare tra loro se collegati alla stessa rete.
- **Host**: Rimuove l'isolamento tra il container e l'host (usa la rete dell'host direttamente).
- **None**: Disabilita completamente la rete per il container.

## Comandi Docker Comuni

Per padroneggiare i container, devi conoscere questi comandi fondamentali suddivisi per categoria:

### 🚀 Gestione Lifecycle (Ciclo di Vita)
- `docker run [immagine]`: Crea e avvia un nuovo container.
  - `-d`: Avvia in modalità "detached" (background).
  - `-p [host]:[container]`: Mappa le porte (es. `8080:80`).
  - `--name [nome]`: Assegna un nome mnemonico al container.
  - `-v [host]:[container]`: Monta un volume o bind mount.
  - `-e KEY=VALUE`: Imposta variabili d'ambiente.
- `docker ps`: Elenca i container in esecuzione.
  - `-a`: Elenca TUTTI i container (anche quelli stoppati).
- `docker stop [container]`: Ferma un container in esecuzione.
- `docker start [container]`: Avvia un container precedentemente fermato.
- `docker restart [container]`: Riavvia un container.
- `docker rm [container]`: Rimuove un container (deve essere fermo).
  - `-f`: Forza la rimozione (anche se in esecuzione).

### 📦 Gestione Immagini
- `docker images`: Elenca le immagini scaricate localmente.
- `docker pull [immagine]`: Scarica un'immagine dal registry.
- `docker build -t [tag] .`: Crea un'immagine a partire da un `Dockerfile` nella directory corrente.
- `docker rmi [immagine]`: Rimuove un'immagine locale.
- `docker tag [immagine] [nuovo_tag]`: Crea un alias per un'immagine.
- `docker push [immagine]`: Carica un'immagine nel registry.

### 🔍 Ispezione e Debug
- `docker logs [container]`: Visualizza lo standard output del container.
  - `-f`: Segue i log in tempo reale.
- `docker exec -it [container] [comando]`: Esegue un comando dentro un container attivo (es. `sh` o `bash`).
- `docker inspect [container/immagine]`: Mostra dettagli tecnici in formato JSON.
- `docker stats`: Monitora in tempo reale l'uso delle risorse (CPU, RAM).
- `docker top [container]`: Mostra i processi in esecuzione dentro il container.

### 🧹 Pulizia (Pruning)
- `docker system prune`: Rimuove container fermi, reti inutilizzate e immagini "dangling" (senza tag).
- `docker volume prune`: Rimuove volumi inutilizzati.

---

## Esercizi Pratici
1. **Hello Nginx**: 
   - Scarica `docker pull nginx:alpine`.
   - Avvialo con `docker run -d -p 8081:80 --name mio-web nginx:alpine`.
   - Accedi a `http://localhost:8081`.
2. **Volumi**:
   - Crea un file `index.html` locale.
   - Avvia nginx montando il file: `docker run -d -p 8082:80 -v $(pwd)/index.html:/usr/share/nginx/html/index.html nginx:alpine`.
3. **Multi-stage Build**:
   - Prendi l'esempio sopra e prova a buildarlo (`docker build -t go-app .`). 
   - Controlla la dimensione dell'immagine finale (`docker images | grep go-app`).
4. **Isolamento**:
   - Entra in un container con `docker exec -it <id> sh`.
   - Prova ad eseguire `ps aux` e vedi cosa succede.
5. **ENTRYPOINT vs CMD**:
   - Prova a creare un Dockerfile con `ENTRYPOINT ["echo", "Ciao"]` e `CMD ["Mondo"]`. 
   - Eseguilo normalmente e poi con un parametro aggiuntivo (`docker run mia-immagine Junie`).
