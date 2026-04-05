# Modulo 3: 📦 Risorse di Base

In Kubernetes, tutto è una risorsa dichiarata in file YAML. Questi file descrivono lo **stato desiderato** del tuo cluster.

## 1. Il Pod: L'unità atomica
Il Pod è l'unità più piccola che puoi creare in Kubernetes. Un Pod può contenere uno o più container che condividono lo stesso stack di rete (localhost) e gli stessi volumi di storage.

> **Regola d'oro**: Non creare quasi mai Pod direttamente. Usa i Deployment.

## 2. Deployment: Gestione del ciclo di vita
Il Deployment gestisce la creazione e l'aggiornamento dei Pod. Permette di definire quante repliche vuoi e come aggiornarle senza tempi di inattività (Rolling Update).

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: nginx
        image: nginx:1.21
        ports:
        - containerPort: 80
```

## 3. Service: Networking Stabile
I Pod hanno IP dinamici che cambiano a ogni riavvio. Un **Service** fornisce un IP stabile e un nome DNS per raggiungere un gruppo di Pod identificati da una label.

- **ClusterIP** (default): Espone il servizio solo all'interno del cluster.
- **NodePort**: Espone il servizio su una porta specifica (30000-32767) su ogni nodo del cluster.
- **LoadBalancer**: Crea un bilanciatore di carico esterno (funziona sui Cloud Provider come AWS, GCP, Azure).

## 4. ConfigMap & Secret: Configurazione Esterna
Permettono di iniettare dati nei container senza cambiare l'immagine Docker.
- **ConfigMap**: Usata per file di configurazione (`nginx.conf`) o variabili d'ambiente (`DB_HOST`).
- **Secret**: Simile alla ConfigMap ma progettata per dati sensibili (password, chiavi SSH, certificati). *Nota: Di default i Secret sono solo codificati in base64, non criptati!*

## Comandi per le Risorse
- `kubectl get <risorsa>`: Elenca le risorse (es. `kubectl get pods`).
- `kubectl apply -f file.yaml`: Crea o aggiorna le risorse dal file.
- `kubectl delete -f file.yaml`: Rimuove le risorse.
- `kubectl logs <nome-pod>`: Legge i log del container.
- `kubectl exec -it <nome-pod> -- sh`: Entra interattivamente nel container.

---

## Esercizio Pratico
Usa il file `deployment.yaml` presente in questa cartella:
1. Crea le risorse: `kubectl apply -f deployment.yaml`
2. Verifica che i 3 pod siano in esecuzione: `kubectl get pods`
3. Prova a scalare il deployment a 5 repliche: `kubectl scale deployment nginx-deployment --replicas=5`
4. Controlla di nuovo i pod: `kubectl get pods`
