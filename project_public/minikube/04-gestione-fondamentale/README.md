# 4. Gestione del Cluster

Gestire un cluster Minikube significa saperlo avviare, fermare, monitorare e, se necessario, distruggere.

## Comandi di Vita del Cluster

### Avvio
```bash
minikube start
```
Se il cluster esiste già, viene ripreso. Se è la prima volta, scarica le immagini necessarie.

### Stato
```bash
minikube status
```
Mostra lo stato del `host`, del `kubelet`, dell'`apiserver` e del `kubeconfig`.

### Stop e Pausa
- `minikube stop`: Ferma la macchina virtuale o il container. I dati rimangono salvati.
- `minikube pause`: Congela il cluster senza spegnerlo (veloce da riprendere).
- `minikube unpause`: Sblocca il cluster messo in pausa.

### Eliminazione
```bash
minikube delete
```
Cancella completamente il cluster e i dati associati. Se vuoi pulire tutto usa `minikube delete --all`.

## Accesso al Cluster
Minikube gira in un ambiente isolato. Per "entrare" nel nodo puoi usare:
```bash
minikube ssh
```
Questo ti permette di navigare nel filesystem del nodo Minikube (molto utile per il debug dei volumi).

<div id="exercises-section"></div>
