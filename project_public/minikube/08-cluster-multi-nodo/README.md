# 8. Cluster Multi-Nodo

Per simulare scenari reali come l'alta affidabilità (High Availability), Minikube permette di avviare cluster con più di un nodo.

## Avviare un Cluster Multi-Nodo
Puoi decidere il numero di nodi al momento del primo avvio:
```bash
minikube start --nodes 3 -p multi-node-cluster
```
Questo comando creerà un cluster con 1 nodo master e 2 nodi worker.

## Aggiungere Nodi a un Cluster Esistente
Se hai già un cluster attivo e vuoi espanderlo:
```bash
minikube node add
```
Verrà creato un nuovo nodo (`minikube-m02`, `minikube-m03`, etc.).

## Visualizzare i Nodi
Puoi vedere lo stato dei tuoi nodi con:
```bash
minikube node list
```
Oppure tramite kubectl:
```bash
kubectl get nodes
```

## Gestione dei Nodi
- **Fermare un nodo specifico**: `minikube node stop minikube-m02`
- **Cancellare un nodo**: `minikube node delete minikube-m02`
- **SSH in un nodo specifico**: `minikube ssh -n minikube-m02`

<div id="exercises-section"></div>
