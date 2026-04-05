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
- **Probes**: Kubernetes usa probe per verificare lo stato dei container:
  - **Liveness Probe**: Verifica se il container è vivo. Se fallisce, kubelet lo riavvia.
  - **Readiness Probe**: Verifica se il container è pronto a ricevere traffico. Se fallisce, viene rimosso dagli Endpoints del Service.
  - **Startup Probe**: Per container con avvio lento, ritarda liveness/readiness fino al primo successo.

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
    livenessProbe:
      httpGet:
        path: /healthz
        port: 8080
      initialDelaySeconds: 30
      periodSeconds: 10
    readinessProbe:
      httpGet:
        path: /ready
        port: 8080
      initialDelaySeconds: 5
      periodSeconds: 5
```

---

## 2. Deployment: Gestione del ciclo di vita
Il Deployment è il controller che gestisce le applicazioni stateless.
- **Replicas**: Gestisce il numero di istanze tramite un **ReplicaSet** sottostante.
- **Self-healing**: Se un nodo fallisce, il Deployment ricrea i Pod su un altro nodo.
- **Strategie di aggiornamento**:
    - **RollingUpdate** (default): Sostituisce i vecchi Pod con i nuovi uno alla volta (zero downtime).
      - `maxSurge`: Numero massimo di Pod extra durante l'update (default 25%).
      - `maxUnavailable`: Numero massimo di Pod non disponibili durante l'update (default 25%).
    - **Recreate**: Elimina tutti i vecchi Pod prima di creare i nuovi (causa downtime).
- **Rollback**: Puoi tornare a una versione precedente con `kubectl rollout undo deployment/<name>`.
- **Pause/Resume**: Puoi mettere in pausa un rollout per fare modifiche multiple: `kubectl rollout pause/resume`.

---

## 2.5 StatefulSet: Per Applicazioni Stateful
Mentre i Deployment sono per app stateless, gli **StatefulSet** gestiscono applicazioni che richiedono:
- **Identità stabile**: Ogni Pod ha un nome predicibile (es. `mysql-0`, `mysql-1`).
- **Storage persistente**: Ogni Pod ha il suo PVC dedicato che sopravvive ai restart.
- **Ordine di avvio/terminazione**: I Pod vengono creati/eliminati in ordine sequenziale.

**Casi d'uso**: Database (MySQL, PostgreSQL), sistemi distribuiti (Kafka, ZooKeeper, Cassandra).

---

## 2.6 DaemonSet: Un Pod per Nodo
Un **DaemonSet** assicura che una copia di un Pod giri su ogni nodo del cluster (o su un sottoinsieme filtrato da node selector).

**Casi d'uso**: 
- Agenti di monitoring (Prometheus Node Exporter, Datadog)
- Log collectors (Fluentd, Filebeat)
- Network plugins (kube-proxy, CNI agents)
- Storage daemons (Ceph, GlusterFS)

---

## 2.7 Job e CronJob: Task Batch
- **Job**: Esegue un task fino al completamento (es. batch processing, migration script).
  - `completions`: Numero di esecuzioni riuscite richieste.
  - `parallelism`: Numero di Pod che possono girare in parallelo.
- **CronJob**: Esegue Job su schedule (sintassi cron Unix).

**Esempio CronJob**:
```yaml
schedule: "0 2 * * *"  # Ogni giorno alle 2 AM
jobTemplate:
  spec:
    template:
      spec:
        containers:
        - name: backup
          image: backup-tool:latest
        restartPolicy: OnFailure
```

---

## 3. Service: Networking Stabile
I Pod sono effimeri: se muoiono, il loro IP cambia. Il **Service** fornisce un punto di accesso stabile.
- **ClusterIP**: Indirizzo IP interno al cluster (default). Usato per la comunicazione tra servizi (es. App -> DB).
- **NodePort**: Espone il servizio su una porta fissa (30000-32767) su ogni Nodo. Utile per test veloci.
- **LoadBalancer**: Espone il servizio all'esterno usando il bilanciatore di carico di un Cloud Provider.
- **ExternalName**: Mappa un Service a un nome DNS esterno (es. `database.example.com`). Non usa selector.
- **Headless Service**: ClusterIP impostato a `None`. Restituisce direttamente gli IP dei Pod invece di un IP virtuale. Usato per StatefulSet e service discovery diretta.

**Selector**: Il Service usa le `labels` per capire a quali Pod inviare il traffico.

**Session Affinity**: Puoi configurare `sessionAffinity: ClientIP` per instradare sempre lo stesso client allo stesso Pod.

---

## 4. ConfigMap & Secret: Configurazione Esterna
Separa il codice dalla configurazione per rendere le immagini Docker portabili tra ambienti (dev, test, prod).
- **ConfigMap**: Memorizza dati non sensibili (es. `config.properties`, variabili d'ambiente).
- **Secret**: Memorizza dati sensibili (password, API keys, certificati TLS). I dati sono codificati in `base64` (non criptati!).
- **Utilizzo**: Possono essere montati come **file** (volumi) o iniettati come **variabili d'ambiente**.

**Tipi di Secret**:
- `Opaque`: Generico (default)
- `kubernetes.io/tls`: Certificati TLS (richiede `tls.crt` e `tls.key`)
- `kubernetes.io/dockerconfigjson`: Credenziali per registry privati
- `kubernetes.io/service-account-token`: Token per ServiceAccount

**Best Practice**: Usa strumenti esterni per la gestione sicura dei secret (Sealed Secrets, External Secrets Operator, Vault).

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
