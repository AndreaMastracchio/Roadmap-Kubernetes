# Modulo 2: 🏛️ Architettura di Kubernetes

Comprendere come Kubernetes gestisce i carichi di lavoro e come i suoi componenti comunicano tra loro.

## Il Cluster: Control Plane e Nodi
Un cluster Kubernetes è composto da un insieme di macchine (nodi) che eseguono applicazioni containerizzate.

### 🧠 Control Plane (Il "Cervello")
Responsabile di mantenere lo stato desiderato (es. "voglio 3 istanze di Nginx").
- **kube-apiserver**: L'unico componente che comunica direttamente con l'utente (`kubectl`) e con il database `etcd`. Funge da front-end per il cluster.
- **etcd**: Database chiave-valore distribuito altamente affidabile. Contiene l'intero stato del cluster. *Tip: Se perdi etcd, perdi il cluster!*
- **kube-scheduler**: Osserva i nuovi Pod senza un nodo assegnato e sceglie il nodo migliore in base a risorse disponibili, policy e vincoli.
- **kube-controller-manager**: Esegue i controller (es. Node Controller, Job Controller). Si occupa di riparare lo stato del cluster quando diverge da quello desiderato.

### 👷 Worker Nodes (Le "Braccia")
Dove girano effettivamente le tue applicazioni (i Pod).
- **kubelet**: L'agente locale del nodo. Riceve istruzioni dall'API Server e si assicura che i container descritti nei PodSpec siano sani e in esecuzione.
- **kube-proxy**: Gestisce le regole di rete sul nodo. Permette la comunicazione tra i Pod e l'accesso ai servizi dall'esterno.
- **Container Runtime**: Il software che esegue i container (es. `containerd`, `CRI-O`).

## Come interagire con il Cluster
Il modo principale è tramite **kubectl**, che invia richieste REST all'API Server.

### Comandi Fondamentali
- `kubectl cluster-info`: Verifica lo stato della connessione al cluster.
- `kubectl get nodes`: Elenca tutti i nodi e il loro stato (`Ready` / `NotReady`).
- `kubectl api-resources`: Elenca tutte le risorse disponibili (Pod, Services, ecc.).
- `kubectl describe node <nome-nodo>`: Mostra dettagli approfonditi (CPU, Memoria, Eventi).

## Strumenti Locali Consigliati
1. **Kind (Kubernetes in Docker)**: Crea un cluster usando container Docker come nodi. Ideale per test veloci e CI/CD.
2. **Minikube**: Crea una VM locale per far girare un cluster a nodo singolo.
3. **K9s**: Un'interfaccia terminale (TUI) fantastica per gestire il cluster senza scrivere mille comandi `kubectl`.

---

## 💡 Consiglio per lo studio
Prova a installare `kind` sul tuo computer e crea il tuo primo cluster con:
```bash
kind create cluster --name kubestudy
```
Verifica il successo con `kubectl get nodes`.
