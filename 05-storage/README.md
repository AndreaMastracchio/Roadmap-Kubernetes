# Modulo 5: 💾 Storage e Persistenza

I Pod sono **effimeri**: se un Pod viene cancellato o crasha, tutti i dati salvati all'interno del suo file system locale vengono persi. Per far sopravvivere i dati (es. database, log, upload utenti), Kubernetes usa un sistema di astrazione dello storage.

## 1. Il Ciclo dello Storage: PV e PVC
Kubernetes separa chi *fornisce* lo storage da chi lo *usa*.

- **PersistentVolume (PV)**: Rappresenta la risorsa fisica di storage (un disco AWS EBS, un volume NFS, o una cartella sul nodo). È gestito dagli amministratori del cluster.
- **PersistentVolumeClaim (PVC)**: È la richiesta di storage fatta dallo sviluppatore. Specifica quanto spazio serve e come accedervi.
- **Binding**: Quando crei un PVC, Kubernetes cerca un PV compatibile e li "lega" insieme.

## 2. Access Modes (Modalità di Accesso)
- **ReadWriteOnce (RWO)**: Il volume può essere montato in lettura/scrittura da un **singolo** nodo alla volta (tipico dei dischi cloud).
- **ReadOnlyMany (ROX)**: Il volume può essere montato da molti nodi in sola lettura.
- **ReadWriteMany (RWX)**: Il volume può essere montato da molti nodi contemporaneamente in lettura/scrittura (tipico di NFS).

## 3. StorageClasses e Provisioning Dinamico
In passato, gli amministratori dovevano creare manualmente i PV. Oggi usiamo le **StorageClasses**.
Quando uno sviluppatore crea un PVC, Kubernetes usa la StorageClass per chiedere al cloud provider (o allo storage locale) di creare automaticamente un volume fisico e il relativo oggetto PV.

### Esempio PVC con StorageClass
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mysql-data
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: standard # Usa il provisioning dinamico
  resources:
    requests:
      storage: 10Gi
```

## 4. Volumi temporanei: emptyDir
Se ti serve spazio temporaneo che venga pulito quando il Pod muore (es. cache), usa `emptyDir`. I dati sopravvivono ai crash dei container nel Pod, ma non alla rimozione del Pod stesso.

---

## Esercizio Pratico
1. Crea un PVC da 1GB nel tuo cluster locale.
2. Crea un Pod (es. Nginx) che monti questo PVC nella cartella `/usr/share/nginx/html`.
3. Entra nel pod con `kubectl exec`, crea un file `index.html`.
4. Elimina il pod e creane uno nuovo identico.
5. Verifica che il file `index.html` sia ancora lì!
