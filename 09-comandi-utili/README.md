# Cheat Sheet: Tutti i Comandi di Kubernetes e Docker

In questo capitolo finale, raccogliamo tutti i comandi essenziali che abbiamo incontrato durante il percorso "Fondamentali Kube". Questa guida può servire come riferimento rapido per il tuo lavoro quotidiano.

## 1. Fondamentali Docker
Gestione di container, immagini e sistema.

| Comando | Descrizione |
|---------|-------------|
| `docker build -t name:tag .` | Crea un'immagine dal Dockerfile corrente. |
| `docker run -d -p 80:80 name` | Avvia un container in background mappando le porte. |
| `docker ps` | Elenca i container in esecuzione. |
| `docker ps -a` | Elenca tutti i container (anche fermi). |
| `docker logs -f <id>` | Visualizza i log in tempo reale. |
| `docker exec -it <id> sh` | Entra in un container in esecuzione. |
| `docker images` | Elenca le immagini scaricate localmente. |
| `docker rm <id>` | Rimuove un container. |
| `docker rmi <id>` | Rimuove un'immagine. |
| `docker system prune` | Pulisce tutto ciò che non è utilizzato (cache, container fermi, etc). |

## 2. Esplorazione Cluster (Architettura)
Comandi per capire cosa sta succedendo nel cluster.

| Comando | Descrizione |
|---------|-------------|
| `kubectl cluster-info` | Mostra gli endpoint dei servizi del Control Plane. |
| `kubectl get nodes` | Elenca i nodi del cluster. |
| `kubectl describe node <name>` | Mostra dettagli tecnici, risorse e eventi di un nodo. |
| `kubectl version --short` | Mostra la versione client e server di K8s. |
| `kubectl api-resources` | Elenca tutte le risorse supportate dal cluster. |

## 3. Gestione Risorse Base
Pod, Deployment, Service e configurazioni.

| Comando | Descrizione |
|---------|-------------|
| `kubectl apply -f file.yaml` | Crea o aggiorna le risorse definite nel file. |
| `kubectl get pods` | Elenca i Pod nel namespace corrente. |
| `kubectl get deploy` | Elenca i Deployment. |
| `kubectl get svc` | Elenca i Servizi. |
| `kubectl describe pod <name>` | Dettagli completi e troubleshooting di un Pod. |
| `kubectl delete -f file.yaml` | Rimuove le risorse definite nel file. |
| `kubectl label pods <name> key=value` | Aggiunge una label a un Pod. |
| `kubectl edit deploy <name>` | Modifica la configurazione di un deployment "al volo". |

## 4. Networking e Debugging
Troubleshooting e ispezione rete.

| Comando | Descrizione |
|---------|-------------|
| `kubectl get ingress` | Elenca gli oggetti Ingress. |
| `kubectl get netpol` | Elenca le Network Policies. |
| `kubectl get endpoints` | Mostra gli IP dei Pod associati ai Servizi. |
| `kubectl port-forward pod/<name> 8080:80` | Espone un Pod locale per test rapido. |
| `kubectl logs <pod-name>` | Mostra i log di un Pod. |
| `kubectl exec -it <pod-name> -- sh` | Esegue una shell dentro un Pod (notare il `--`). |

## 5. Storage
Persistenza dei dati.

| Comando | Descrizione |
|---------|-------------|
| `kubectl get pv` | Elenca i Persistent Volumes (livello cluster). |
| `kubectl get pvc` | Elenca i Persistent Volume Claims (livello namespace). |
| `kubectl get sc` | Elenca le Storage Classes. |

## 6. Sicurezza e RBAC
Permessi e identità.

| Comando | Descrizione |
|---------|-------------|
| `kubectl get sa` | Elenca i ServiceAccounts. |
| `kubectl auth can-i create pods` | Verifica se hai i permessi per un'azione. |
| `kubectl get roles,rolebindings` | Elenca ruoli e assegnazioni. |
| `kubectl get clusterroles` | Elenca i ruoli a livello di cluster. |

## 7. Helm
Gestione pacchetti.

| Comando | Descrizione |
|---------|-------------|
| `helm repo add <name> <url>` | Aggiunge un repository di chart. |
| `helm install <release> <chart>` | Installa un'applicazione. |
| `helm list` | Elenca le release installate. |
| `helm upgrade <release> <chart>` | Aggiorna un'applicazione. |
| `helm uninstall <release>` | Rimuove un'applicazione. |
| `helm template <chart>` | Mostra i manifest YAML generati (senza installare). |

## 8. Sviluppo e Operatori
Strumenti avanzati.

| Comando | Descrizione |
|---------|-------------|
| `kubectl get crd` | Elenca le Custom Resource Definitions. |
| `kubectl explain <resource>` | Documentazione integrata per ogni campo di una risorsa. |

---

Congratulazioni! Hai completato il percorso **Fondamentali Kube**. Ora sei pronto per affrontare sfide più complesse nell'universo Cloud Native.
