# 3. Architettura e Driver

Minikube non è Kubernetes, ma è un **orchestratore di orchestratori**. Per funzionare, ha bisogno di un "ambiente" dove far girare i nodi del cluster. Questo ambiente è gestito dai **Driver**.

## Tipi di Driver
I driver di Minikube si dividono in tre categorie:

1. **Docker (Consigliato)**: Minikube crea un container Docker e all'interno di quel container fa girare Kubernetes. È il più veloce e leggero.
2. **Macchina Virtuale (VirtualBox, VMware, Hyper-V)**: Minikube crea una vera VM. È più isolato ma consuma più risorse.
3. **Bare Metal (None)**: Kubernetes gira direttamente sull'host Linux. Molto veloce ma potenzialmente rischioso per la stabilità del sistema host.

## Scegliere un Driver
Puoi specificare il driver all'avvio:
```bash
minikube start --driver=docker
```

Se vuoi rendere un driver quello predefinito per il futuro:
```bash
minikube config set driver docker
```

## Architettura Interna
All'interno dell'ambiente scelto, Minikube installa:
- **Kubelet**: L'agente che gestisce i pod.
- **Docker/Containerd**: Il runtime dei container.
- **Control Plane**: I componenti di gestione (API Server, etcd, Scheduler).

<div id="exercises-section"></div>
