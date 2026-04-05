# Kubernetes Study Roadmap (It)

Benvenuto in questa guida strutturata per lo studio di Kubernetes! Questo repository è progettato per portarti dai fondamentali fino a concetti avanzati come l'estendibilità del cluster tramite Operatori (scritti in Go).

## 🗺️ La Roadmap

La roadmap è suddivisa in moduli progressivi. Per ogni modulo troverai una directory dedicata con approfondimenti ed esempi pratici.

### 1. 🏗️ Fondamentali dei Container
Prima di K8s, devi conoscere i container.
- **Docker**: Immagini, Container, Dockerfile, Docker Compose.
- **Concetti**: Isolamento, Layer, Runtime (containerd).

### 2. 🏛️ Architettura di Kubernetes
Comprendere come funziona "sotto il cofano".
- **Control Plane**: API Server, etcd, Scheduler, Controller Manager.
- **Worker Nodes**: Kubelet, Kube-proxy, Container Runtime.
- **Strumenti**: `kubectl`, `kubeadm`, `minikube`/`kind`.

### 3. 📦 Risorse di Base
Gli elementi costitutivi di un'applicazione su K8s.
- **Pod**: L'unità minima di esecuzione.
- **ReplicaSet & Deployment**: Gestione del ciclo di vita e scalabilità.
- **Service**: Networking interno (ClusterIP, NodePort, LoadBalancer).
- **ConfigMap & Secret**: Gestione della configurazione e dati sensibili.

### 4. 🌐 Networking Avanzato
Come le app comunicano tra loro e con l'esterno.
- **Ingress**: Esposizione HTTP/HTTPS esterna.
- **Network Policies**: Sicurezza del traffico tra i Pod.

### 5. 💾 Storage
Persistenza dei dati in un mondo effimero.
- **Volumes**: Storage temporaneo.
- **PersistentVolumes (PV) & PersistentVolumeClaims (PVC)**: Richiedere storage persistente.
- **StorageClasses**: Provisioning dinamico.

### 6. 🔒 Sicurezza & Accesso
- **RBAC (Role-Based Access Control)**: Ruoli e permessi.
- **Service Accounts**: Identità per i carichi di lavoro.
- **Secrets Management**: Best practices.

### 7. ☸️ Gestione dei Pacchetti con Helm
- **Charts**: Struttura e templating.
- **Release Management**: Installazione e upgrade.

### 8. 🛠️ Estendibilità & Operatori (Go)
Il livello avanzato per chi vuole costruire sopra Kubernetes.
- **Custom Resource Definitions (CRDs)**: Estendere l'API di K8s.
- **Controllers & Operators**: Automatizzare compiti complessi usando Go.

---

## 🚀 Come usare questo repository
Ogni cartella numerata corrisponde a un modulo della roadmap. Entra nella cartella e leggi il `README.md` specifico per iniziare.

---

## 🖥️ Piattaforma Web (Docker)
Per un'esperienza di studio più piacevole, è stata creata un'applicazione frontend che permette di leggere i contenuti in formato corso interattivo.

### Avvio rapido
Assicurati di avere Docker installato, quindi esegui:
```bash
docker-compose up --build
```
Una volta avviato, apri il browser su: [http://localhost:8080](http://localhost:8080)

### Caratteristiche
- 📱 Design responsive per studiare ovunque.
- 🌙 Navigazione laterale intuitiva.
- ⚡ Aggiornamenti in tempo reale dei contenuti tramite Docker Volumes.

Buono studio!
