# Modulo 5: 💾 Storage e Persistenza

I Pod sono **effimeri**: se un Pod viene cancellato o crasha, i dati salvati nel suo file system locale vengono persi. Per far sopravvivere i dati (es. database, log, upload), Kubernetes usa un sistema di astrazione dello storage basato su volumi.

---

## 1. Il Ciclo dello Storage: PV e PVC
Kubernetes separa chi *fornisce* lo storage (Amministratore) da chi lo *usa* (Sviluppatore).

-   **PersistentVolume (PV)**: La risorsa fisica di storage nel cluster (es. un disco AWS EBS, un volume NFS, o una cartella locale). È un oggetto del cluster, non di un namespace.
-   **PersistentVolumeClaim (PVC)**: La richiesta di storage fatta dallo sviluppatore in un namespace specifico. Specifica quanto spazio serve e la modalità di accesso.
-   **Binding**: Quando crei un PVC, Kubernetes cerca un PV compatibile e li "lega" insieme in modo esclusivo.

---

## 2. Modalità di Accesso (Access Modes)
Le modalità supportate dipendono dal tipo di storage sottostante:
-   **ReadWriteOnce (RWO)**: Il volume può essere montato in lettura/scrittura da un **singolo nodo** alla volta. (Es: AWS EBS, Azure Disk).
-   **ReadOnlyMany (ROX)**: Il volume può essere montato da **molti nodi** contemporaneamente in **sola lettura**. (Es: NFS, Azure Files).
-   **ReadWriteMany (RWX)**: Il volume può essere montato da **molti nodi** contemporaneamente in **lettura/scrittura**. (Es: NFS, CephFS, Azure Files).

---

## 3. StorageClasses e Provisioning Dinamico
In passato, gli amministratori dovevano creare manualmente i PV (Provisioning Statico). Oggi usiamo le **StorageClasses**.
-   Quando uno sviluppatore crea un PVC specificando una `storageClassName`, Kubernetes chiede al provider di creare automaticamente il volume fisico e l'oggetto PV corrispondente.
-   **Reclaim Policy**: Definisce cosa succede al volume fisico quando il PVC viene eliminato:
    -   `Delete` (default): Il volume fisico viene cancellato.
    -   `Retain`: Il volume fisico rimane intatto per un recupero manuale dei dati.

---

## 4. Volume Binding Mode
Questa impostazione nella StorageClass controlla *quando* deve avvenire il binding del PV:
-   **Immediate**: Il volume viene creato non appena viene creato il PVC.
-   **WaitForFirstConsumer**: Il volume viene creato solo quando un Pod che usa il PVC viene programmato (fondamentale in cloud multi-zona per assicurarsi che il disco sia nella stessa zona del Pod).

---

## 5. Volumi Temporanei: emptyDir
Se ti serve spazio temporaneo (es. cache, dati intermedi) che venga pulito quando il Pod viene rimosso, usa `emptyDir`.
I dati sopravvivono ai crash dei container nel Pod, ma vengono persi se il Pod viene terminato o spostato su un altro nodo.

---

## 🛠️ Comandi per lo Storage

```bash
# Elenca i volumi persistenti e le richieste
kubectl get pv
kubectl get pvc

# Ispeziona i dettagli (es. vedi perché un PVC è in stato 'Pending')
kubectl describe pvc <nome-pvc>

# Elenca le classi di storage disponibili
kubectl get storageclass (o 'sc')
```

---

## 🎯 Esercizio Pratico
1. Crea un file `storage-test.yaml` con un PVC da 1GB e un Pod Nginx che lo monti in `/usr/share/nginx/html`.
2. Applica il file e scrivi un file `index.html` dentro il pod: `kubectl exec -it <pod-name> -- sh -c "echo 'Persistente!' > /usr/share/nginx/html/index.html"`.
3. Elimina il Pod: `kubectl delete pod <pod-name>`.
4. Crea di nuovo il Pod e verifica con `curl` che il contenuto sia ancora presente.
