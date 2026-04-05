# Modulo 2: 🏛️ Architettura di Kubernetes

Comprendere come Kubernetes gestisce i carichi di lavoro e come i suoi componenti comunicano tra loro è fondamentale per ogni amministratore o sviluppatore.

## 🧠 Il Control Plane (Il "Cervello")
Il Control Plane è responsabile di mantenere lo **stato desiderato** del cluster. È composto da diversi componenti chiave che lavorano in armonia.

### 1. kube-apiserver
L'unico punto di ingresso per tutte le operazioni sul cluster. 
- Gestisce le richieste REST da `kubectl`, dalla dashboard o da altri strumenti.
- Valida i dati e aggiorna gli oggetti in **etcd**.
- Implementa l'autenticazione (chi sei?) e l'autorizzazione (cosa puoi fare?).

### 2. etcd
Il database del cluster. 
- Archivio **chiave-valore** distribuito e coerente.
- Memorizza TUTTI i dati di configurazione e lo stato del cluster.
- **Best Practice**: In produzione, deve essere sempre in configurazione ad alta disponibilità (HA) con backup regolari.

### 3. kube-scheduler
Il "vigile" del traffico.
- Monitora i nuovi Pod che non hanno ancora un nodo assegnato.
- Sceglie il miglior nodo possibile basandosi su:
    - Requisiti di risorse (CPU/RAM).
    - Vincoli di policy (Affinity/Anti-affinity).
    - Taints e Tolerations.

### 4. kube-controller-manager
Il guardiano della stabilità.
- Esegue loop di controllo infiniti: osserva lo stato attuale, lo confronta con lo stato desiderato e agisce per correggere le discrepanze.
- Include: **Node Controller**, **Replication Controller**, **Endpoints Controller**, e molti altri.

---

## 👷 Worker Nodes (Le "Braccia")
I nodi sono le macchine (fisiche o virtuali) dove vengono eseguiti i container delle tue applicazioni.

### 1. kubelet
L'agente che gira su ogni nodo del cluster.
- Si assicura che i container descritti nei **PodSpec** siano in esecuzione e sani.
- Non gestisce container che non sono stati creati da Kubernetes.

### 2. kube-proxy
Il gestore della rete locale al nodo.
- Mantiene le regole di rete (iptables o IPVS) per permettere la comunicazione tra Pod e verso i Servizi.
- Gestisce il bilanciamento del carico semplice per i Servizi Kubernetes.

### 3. Container Runtime
Il software che esegue effettivamente i container.
- Kubernetes supporta runtime conformi allo standard **CRI** (Container Runtime Interface), come `containerd` or `CRI-O`.

---

## 🔌 Le Interfacce Standard (X-RI)
Kubernetes è modulare grazie a queste interfacce:
1. **CRI (Container Runtime Interface)**: Per la gestione dei container.
2. **CNI (Container Network Interface)**: Per la connettività di rete (es. Calico, Flannel, Cilium).
3. **CSI (Container Storage Interface)**: Per la gestione dei volumi persistenti.

---

## 🏷️ Concetti di Base degli Oggetti
Ogni risorsa in Kube ha dei metadati fondamentali:
- **Namespaces**: Isolamento logico all'interno dello stesso cluster (es. `dev`, `prod`).
- **Labels (Etichette)**: Coppie chiave-valore usate per raggruppare e selezionare oggetti (fondamentali per i Services).
- **Annotations (Annotazioni)**: Usate per memorizzare metadati non identificativi (es. info di build o config per strumenti esterni).

---

## 🛠️ Esercizi Pratici con Kubectl

Prova questi comandi sul tuo cluster (es. creato con Minikube o Kind):

```bash
# Verifica lo stato dei componenti del control plane (deprecato in alcune versioni, ma utile)
kubectl get componentstatuses

# Visualizza i nodi con etichette extra
kubectl get nodes --show-labels

# Ispeziona i dettagli di un nodo specifico
kubectl describe node <nome-nodo>

# Elenca tutte le API disponibili nel cluster
kubectl api-versions
```

---

## 💡 Approfondimento: Il giro di un Pod
Cosa succede quando dai `kubectl apply -f pod.yaml`?
1. **API Server**: Riceve il file, lo valida e lo scrive in `etcd`.
2. **Scheduler**: Nota il nuovo Pod senza nodo, sceglie un nodo e aggiorna l'API Server.
3. **API Server**: Scrive la decisione in `etcd`.
4. **Kubelet (sul nodo scelto)**: Nota che c'è un Pod assegnato a lui, contatta il **Container Runtime** per avviare i container.
5. **Kubelet**: Aggiorna lo stato del Pod ("Running") all'API Server.
