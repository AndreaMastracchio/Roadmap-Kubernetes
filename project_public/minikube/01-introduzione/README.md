# 1. Introduzione a Minikube

Minikube è un'implementazione leggera di Kubernetes che crea una VM (o un container) sul tuo computer locale e vi distribuisce un cluster semplice con un solo nodo.

## Architettura di Minikube
Minikube supporta diversi **driver**:
- **Docker** (Consigliato): Esegue Kubernetes all'interno di un container Docker.
- **VirtualBox / VMware**: Esegue Kubernetes in una macchina virtuale.
- **None**: Esegue i componenti di Kubernetes direttamente sull'host (richiede Linux e privilegi di root).

## Comandi principali
- `minikube start`: Avvia il cluster.
- `minikube status`: Verifica lo stato.
- `minikube stop`: Ferma il cluster senza cancellare i dati.
- `minikube delete`: Cancella completamente il cluster.

