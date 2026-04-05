# Modulo 3: 📦 Risorse di Base (Workloads & Config)

In Kubernetes, tutto è una risorsa dichiarata in file YAML. Questi file descrivono lo **stato desiderato** del tuo cluster. Kubernetes lavora costantemente per far sì che lo stato attuale coincida con quello desiderato.

---

## 🏗️ Anatomia di un file YAML
Ogni risorsa Kubernetes ha quattro sezioni fondamentali:
1.  **apiVersion**: La versione dell'API di Kubernetes che stai usando (es. `v1`, `apps/v1`).
2.  **kind**: Il tipo di risorsa (es. `Pod`, `Service`, `Deployment`).
3.  **metadata**: Dati che identificano la risorsa (`name`, `namespace`, `labels`, `annotations`).
4.  **spec**: Lo stato desiderato (es. quale immagine usare, quante repliche, quali porte).
5.  **status** (solo nel cluster): Lo stato attuale della risorsa, generato e aggiornato dal Control Plane.

---

## 1. Il Pod: L'unità atomica
Il Pod è l'oggetto più piccolo e semplice di Kubernetes. Rappresenta un'istanza di un processo in esecuzione.
- **Multi-container**: Un Pod può contenere più container (es. un'app e un "sidecar" per i log).
- **Condivisione**: I container in un Pod condividono lo stesso indirizzo IP (comunicano via `localhost`) e possono condividere volumi di storage.
- **Risorse**: È qui che definisci `requests` (garantite) e `limits` (massime) per CPU e Memoria.

```yaml
spec:
  containers:
  - name: my-app
    image: my-app:1.0
    resources:
      requests:
        memory: "64Mi"
        cpu: "250m"
      limits:
        memory: "128Mi"
        cpu: "500m"
```

---

## 2. Deployment: Gestione del ciclo di vita
Il Deployment è il controller che gestisce le applicazioni stateless.
- **Replicas**: Gestisce il numero di istanze tramite un **ReplicaSet** sottostante.
- **Self-healing**: Se un nodo fallisce, il Deployment ricrea i Pod su un altro nodo.
- **Strategie di aggiornamento**:
    - **RollingUpdate** (default): Sostituisce i vecchi Pod con i nuovi uno alla volta (zero downtime).
    - **Recreate**: Elimina tutti i vecchi Pod prima di creare i nuovi (causa downtime).

---

## 3. Service: Networking Stabile
I Pod sono effimeri: se muoiono, il loro IP cambia. Il **Service** fornisce un punto di accesso stabile.
- **ClusterIP**: Indirizzo IP interno al cluster (default). Usato per la comunicazione tra servizi (es. App -> DB).
- **NodePort**: Espone il servizio su una porta fissa (30000-32767) su ogni Nodo. Utile per test veloci.
- **LoadBalancer**: Espone il servizio all'esterno usando il bilanciatore di carico di un Cloud Provider.

**Selector**: Il Service usa le `labels` per capire a quali Pod inviare il traffico.

---

## 4. ConfigMap & Secret: Configurazione Esterna
Separa il codice dalla configurazione per rendere le immagini Docker portabili tra ambienti (dev, test, prod).
- **ConfigMap**: Memorizza dati non sensibili (es. `config.properties`).
- **Secret**: Memorizza dati sensibili (password, API keys). I dati sono codificati in `base64`.
- **Utilizzo**: Possono essere montati come **file** (volumi) o iniettati come **variabili d'ambiente**.

---

## 🛠️ Comandi Essenziali per le Risorse

```bash
# Crea o aggiorna risorse
kubectl apply -f risorsa.yaml

# Visualizza lo stato (aggiungi -o yaml per vedere il file completo)
kubectl get deployments
kubectl get pods -o wide

# Debug: vedi gli eventi e i dettagli della risorsa
kubectl describe pod <nome-pod>

# Debug: guarda i log (usa -f per il follow)
kubectl logs -f <nome-pod>

# Esegui un comando dentro un container
kubectl exec -it <nome-pod> -- bash

# Modifica una risorsa al volo (sconsigliato in prod!)
kubectl edit deployment <nome-deployment>
```

---

## 🎯 Esercizio Pratico
In questa cartella trovi `deployment.yaml`. Prova a:
1. Applicarlo: `kubectl apply -f deployment.yaml`.
2. Verificare i Pod: `kubectl get pods -l app=nginx`.
3. Simulare un aggiornamento: cambia l'immagine in `nginx:1.21.1` nel file e riapplica.
4. Osservare il rolling update: `kubectl get pods -w`.
