# Cluster Multi-Nodo con Minikube

Anche se Minikube nasce come strumento per cluster a nodo singolo, dalla versione 1.10.1 supporta la creazione di cluster multi-nodo.

## Creare un Cluster Multi-Nodo
Per avviare un cluster con più di un nodo, usa il flag `--nodes`:

```bash
minikube start --nodes 3
```

Questo comando creerà un cluster con un Control Plane e due nodi di lavoro (worker).

## Aggiungere Nodi a un Cluster Esistente
Se hai già un cluster avviato, puoi aggiungere nodi dinamicamente:

```bash
minikube node add
```

E puoi visualizzare lo stato di tutti i nodi con:

```bash
minikube status
# oppure
kubectl get nodes
```

## Eliminare un Nodo
Per rimuovere un nodo specifico dal cluster:

```bash
minikube node delete -n <nome-nodo>
```

