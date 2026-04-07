# 9. Cheat Sheet: Comandi Minikube

Usa questa pagina come riferimento rapido per tutti i comandi appresi durante il corso.

| Categoria | Comando | Descrizione |
| :--- | :--- | :--- |
| **Lifecycle** | `minikube start` | Avvia il cluster predefinito. |
| | `minikube stop` | Ferma il cluster senza cancellare i dati. |
| | `minikube pause` | Sospende i container di Kubernetes. |
| | `minikube delete` | Cancella il cluster e tutti i dati. |
| | `minikube status` | Mostra lo stato dei componenti. |
| **Configurazione** | `minikube config set driver <name>` | Imposta il driver predefinito. |
| | `minikube config set cpus <num>` | Imposta le CPU predefinite. |
| | `minikube profile list` | Elenca tutti i cluster creati. |
| | `minikube profile <name>` | Passa a un altro cluster. |
| **Networking** | `minikube tunnel` | Bridge per i Service LoadBalancer. |
| | `minikube service <name>` | URL di accesso per un Service. |
| | `minikube addons enable ingress` | Attiva l'Ingress Controller. |
| **Interazione** | `minikube dashboard` | Apre la UI grafica nel browser. |
| | `minikube ssh` | Entra nel nodo in terminale. |
| | `minikube logs` | Mostra i log del cluster. |
| **Multi-Nodo** | `minikube node add` | Aggiunge un nuovo worker. |
| | `minikube node list` | Mostra i nodi del profilo attivo. |

---
### Hai imparato tutto!
Ora sei pronto per l'**Esame Finale**. Metti alla prova le tue abilità nel prossimo modulo!
