# Modulo 09: Storage

**Durata stimata:** 3.5 ore  
**Peso CKAD:** Application Storage and Networking (20%)

## Obiettivi di Apprendimento

Al termine di questo modulo sarai in grado di:

- Configurare PersistentVolume e PersistentVolumeClaim
- Utilizzare StorageClass per provisioning dinamico
- Comprendere le modalità di accesso (RWO, ROX, RWX)
- Implementare StatefulSet con storage persistente
- Usare init container per inizializzare volumi
- Gestire Secrets e ConfigMaps come volumi

## Introduzione allo Storage Kubernetes

Lo storage in Kubernetes è fondamentale per applicazioni stateful come database, cache e sistemi di messaggistica. A differenza dello storage effimero dei container, lo storage persistente sopravvive ai riavvii dei pod.

### Il Problema dell'Effimerità

```
Container Storage:
┌─────────────┐
│  Container  │ ─── crash ───> I dati sono persi
│  (writable) │
└─────────────┘

Persistent Storage:
┌─────────────┐      ┌──────────────┐
│  Container  │ ───> │     PV       │ ───> I dati persistono
│  (read-only)│      │ (persistent) │
└─────────────┘      └──────────────┘
```

## Concetti Fondamentali

### PersistentVolume (PV)

Risorsa cluster che rappresenta l'astrazione dello storage fisico:

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-demo
spec:
  capacity:
    storage: 5Gi
  volumeMode: Filesystem  # Filesystem o Block
  accessModes:
  - ReadWriteOnce
  persistentVolumeReclaimPolicy: Delete
  storageClassName: standard
  hostPath:               # Per demo locale
    path: /mnt/data
```

### PersistentVolumeClaim (PVC)

Richiesta di storage da parte di un utente:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-demo
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
  storageClassName: standard
```

### StorageClass

Definisce come provisionare storage dinamico:

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-storage
provisioner: kubernetes.io/aws-ebs
parameters:
  type: gp2
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer
```

## Modalità di Accesso

| Modalità | Sigla | Descrizione | Supporto |
|----------|-------|-------------|----------|
| ReadWriteOnce | RWO | Singolo nodo in RW | Tutti i backend |
| ReadOnlyMany | ROX | Multipli nodi in RO | NFS, CephFS |
| ReadWriteMany | RWX | Multipli nodi in RW | NFS, CephFS, GlusterFS |
| ReadWriteOncePod | RWOP | Singolo pod in RW | CSI driver recenti |

```yaml
# PVC con modalità di accesso
spec:
  accessModes:
  - ReadWriteOnce    # Un solo nodo può montare in RW
```

**Nota importante:** RWO significa un nodo alla volta, non un pod. Più pod sullo stesso nodo possono montare lo stesso volume RWO.

## Tipi di Volume

### emptyDir

Volume temporaneo condiviso tra container dello stesso pod:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: emptydir-pod
spec:
  volumes:
  - name: cache
    emptyDir: {}
  containers:
  - name: app
    image: nginx
    volumeMounts:
    - name: cache
      mountPath: /cache
```

Casi d'uso:
- Cache temporanea
- Dati intermedi tra container
- Workspace di calcolo

### hostPath

Monta un percorso dal nodo:

```yaml
volumes:
- name: node-data
  hostPath:
    path: /var/log
    type: Directory
```

⚠️ **Attenzione:** Non usare in produzione. I dati sono legati al nodo specifico.

### PersistentVolumeClaim

Monta un PVC esistente:

```yaml
volumes:
- name: data
  persistentVolumeClaim:
    claimName: my-pvc
```

### ConfigMap e Secret

Monta configurazioni e segreti come file:

```yaml
volumes:
- name: config
  configMap:
    name: app-config
- name: secrets
  secret:
    secretName: db-credentials
```

## StatefulSet con Storage

Lo StatefulSet è il controller per applicazioni stateful:

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: database
spec:
  serviceName: database-headless  # Obbligatorio
  replicas: 3
  selector:
    matchLabels:
      app: database
  template:
    metadata:
      labels:
        app: database
    spec:
      containers:
      - name: postgres
        image: postgres:15
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: data
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:    # PVC per ogni replica
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 10Gi
```

Caratteristiche:
- Nomi dei pod stabili: `database-0`, `database-1`, etc.
- DNS stabile: `database-0.database-headless.default.svc.cluster.local`
- PVC dedicato per ogni replica
- Ordinamento di startup e shutdown

## Init Container e Volumi

Gli init container possono preparare i volumi:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: init-volume-demo
spec:
  volumes:
  - name: workdir
    emptyDir: {}
  initContainers:
  - name: setup
    image: busybox
    command: ['sh', '-c', 'echo "Initialized" > /data/ready.txt']
    volumeMounts:
    - name: workdir
      mountPath: /data
  containers:
  - name: app
    image: nginx
    volumeMounts:
    - name: workdir
      mountPath: /data
```

Casi d'uso:
- Inizializzazione database
- Download dati iniziali
- Generazione certificati
- Preparazione configurazioni

## Reclaim Policy

Cosa succede ai dati quando il PVC viene cancellato:

| Policy | Comportamento |
|--------|---------------|
| Retain | PV e dati restano, necessita pulizia manuale |
| Delete | PV e dati vengono eliminati |
| Recycle | Deprecated, usare dynamic provisioning |

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: retained-pv
spec:
  persistentVolumeReclaimPolicy: Retain
```

## Provisioning Dinamico

Con StorageClass, i PV vengono creati automaticamente:

```yaml
# PVC senza PV preesistente
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: dynamic-pvc
spec:
  accessModes:
  - ReadWriteOnce
  storageClassName: standard
  resources:
    requests:
      storage: 5Gi
```

Kubernetes crea automaticamente un PV e lo binda al PVC.

## Espansione Volumi

Per espandere un PVC esistente:

```yaml
# StorageClass con espansione abilitata
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: expandable
provisioner: kubernetes.io/aws-ebs
allowVolumeExpansion: true
```

```bash
# Espandi il PVC
kubectl patch pvc my-pvc -p '{"spec": {"resources": {"requests": {"storage": "10Gi"}}}}'
```

## Best Practices

### Dimensionamento

1. **Definisci requests e limits** - Evita OOMKilled
2. **Usa StorageClass appropriate** - Fast per database, standard per backup
3. **Pianifica la crescita** - Prevedi espansione

### Sicurezza

1. **Usa Secrets per credenziali** - Mai hardcoded
2. **Configura backup** - Snapshot regolari
3. **Isola dati sensibili** - Namespace dedicati

### Operatività

1. **Monitora l'utilizzo** - Evita di riempire i volumi
2. **Testa il recovery** - Verifica che i backup funzionino
3. **Documenta le policy** - Reclaim e retention

## Debugging Storage

### PVC Pending

```bash
kubectl describe pvc <name>

Events:
  Type     Reason                Age   From                         Message
  ----     ------                ----  ----                         -------
  Warning  ProvisioningFailed    10s   persistentvolume-controller  storageclass.storage.k8s.io "missing" not found
```

Cause comuni:
- StorageClass inesistente
- Capacità insufficiente
- PV non disponibile per binding

### Pod non parte per volume

```bash
kubectl describe pod <name>

Events:
  Type     Reason       Age   From     Message
  ----     ------       ----  ----     -------
  Warning  FailedMount  60s   kubelet  Unable to attach or mount volumes
```

Verificare:
- PVC è Bound
- AccessMode compatibile
- Nodo ha accesso allo storage

## Esercitazione Pratica

Per consolidare le conoscenze:

1. Crea una StorageClass personalizzata
2. Deploya un database con StatefulSet
3. Configura backup con Job
4. Testa recovery da snapshot
5. Simula espansione volume

## Conclusione

Lo storage persistente è essenziale per applicazioni stateful. In questo modulo hai imparato:

- A configurare PV e PVC
- A usare StorageClass per provisioning dinamico
- A implementare StatefulSet con storage
- A gestire volumi con init container

Nel prossimo modulo affronteremo il troubleshooting completo delle applicazioni.
