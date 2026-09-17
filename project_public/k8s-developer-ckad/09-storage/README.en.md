# Module 09: Storage

**Estimated Duration:** 3.5 hours  
**CKAD Weight:** Application Storage and Networking (20%)

## Learning Objectives

By the end of this module you will be able to:

- Configure PersistentVolume and PersistentVolumeClaim
- Use StorageClass for dynamic provisioning
- Understand access modes (RWO, ROX, RWX)
- Implement StatefulSet with persistent storage
- Use init containers to initialize volumes
- Manage Secrets and ConfigMaps as volumes

## Introduction to Kubernetes Storage

Storage in Kubernetes is fundamental for stateful applications like databases, caches, and messaging systems. Unlike ephemeral container storage, persistent storage survives pod restarts.

### The Ephemerality Problem

```
Container Storage:
┌─────────────┐
│  Container  │ ─── crash ───> Data is lost
│  (writable) │
└─────────────┘

Persistent Storage:
┌─────────────┐      ┌──────────────┐
│  Container  │ ───> │     PV       │ ───> Data persists
│  (read-only)│      │ (persistent) │
└─────────────┘      └──────────────┘
```

## Fundamental Concepts

### PersistentVolume (PV)

Cluster resource representing the abstraction of physical storage:

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-demo
spec:
  capacity:
    storage: 5Gi
  volumeMode: Filesystem  # Filesystem or Block
  accessModes:
  - ReadWriteOnce
  persistentVolumeReclaimPolicy: Delete
  storageClassName: standard
  hostPath:               # For local demo
    path: /mnt/data
```

### PersistentVolumeClaim (PVC)

Storage request from a user:

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

Defines how to provision dynamic storage:

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

## Access Modes

| Mode | Abbrev. | Description | Support |
|------|---------|-------------|---------|
| ReadWriteOnce | RWO | Single node in RW | All backends |
| ReadOnlyMany | ROX | Multiple nodes in RO | NFS, CephFS |
| ReadWriteMany | RWX | Multiple nodes in RW | NFS, CephFS, GlusterFS |
| ReadWriteOncePod | RWOP | Single pod in RW | Recent CSI drivers |

```yaml
# PVC with access mode
spec:
  accessModes:
  - ReadWriteOnce    # One node can mount in RW
```

**Important note:** RWO means one node at a time, not one pod. Multiple pods on the same node can mount the same RWO volume.

## Volume Types

### emptyDir

Temporary volume shared between containers in the same pod:

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

Use cases:
- Temporary cache
- Intermediate data between containers
- Compute workspace

### hostPath

Mounts a path from the node:

```yaml
volumes:
- name: node-data
  hostPath:
    path: /var/log
    type: Directory
```

⚠️ **Warning:** Don't use in production. Data is tied to the specific node.

### PersistentVolumeClaim

Mounts an existing PVC:

```yaml
volumes:
- name: data
  persistentVolumeClaim:
    claimName: my-pvc
```

### ConfigMap and Secret

Mounts configurations and secrets as files:

```yaml
volumes:
- name: config
  configMap:
    name: app-config
- name: secrets
  secret:
    secretName: db-credentials
```

## StatefulSet with Storage

StatefulSet is the controller for stateful applications:

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: database
spec:
  serviceName: database-headless  # Required
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
  volumeClaimTemplates:    # PVC for each replica
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 10Gi
```

Characteristics:
- Stable pod names: `database-0`, `database-1`, etc.
- Stable DNS: `database-0.database-headless.default.svc.cluster.local`
- Dedicated PVC for each replica
- Ordered startup and shutdown

## Init Containers and Volumes

Init containers can prepare volumes:

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

Use cases:
- Database initialization
- Initial data download
- Certificate generation
- Configuration preparation

## Reclaim Policy

What happens to data when the PVC is deleted:

| Policy | Behavior |
|--------|----------|
| Retain | PV and data remain, manual cleanup needed |
| Delete | PV and data are deleted |
| Recycle | Deprecated, use dynamic provisioning |

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: retained-pv
spec:
  persistentVolumeReclaimPolicy: Retain
```

## Dynamic Provisioning

With StorageClass, PVs are created automatically:

```yaml
# PVC without pre-existing PV
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

Kubernetes automatically creates a PV and binds it to the PVC.

## Volume Expansion

To expand an existing PVC:

```yaml
# StorageClass with expansion enabled
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: expandable
provisioner: kubernetes.io/aws-ebs
allowVolumeExpansion: true
```

```bash
# Expand the PVC
kubectl patch pvc my-pvc -p '{"spec": {"resources": {"requests": {"storage": "10Gi"}}}}'
```

## Best Practices

### Sizing

1. **Define requests and limits** - Avoid OOMKilled
2. **Use appropriate StorageClass** - Fast for databases, standard for backups
3. **Plan for growth** - Anticipate expansion

### Security

1. **Use Secrets for credentials** - Never hardcoded
2. **Configure backups** - Regular snapshots
3. **Isolate sensitive data** - Dedicated namespaces

### Operations

1. **Monitor usage** - Avoid filling volumes
2. **Test recovery** - Verify backups work
3. **Document policies** - Reclaim and retention

## Debugging Storage

### PVC Pending

```bash
kubectl describe pvc <name>

Events:
  Type     Reason                Age   From                         Message
  ----     ------                ----  ----                         -------
  Warning  ProvisioningFailed    10s   persistentvolume-controller  storageclass.storage.k8s.io "missing" not found
```

Common causes:
- Non-existent StorageClass
- Insufficient capacity
- No PV available for binding

### Pod won't start due to volume

```bash
kubectl describe pod <name>

Events:
  Type     Reason       Age   From     Message
  ----     ------       ----  ----     -------
  Warning  FailedMount  60s   kubelet  Unable to attach or mount volumes
```

Check:
- PVC is Bound
- Compatible AccessMode
- Node has access to storage

## Hands-On Exercise

To consolidate your knowledge:

1. Create a custom StorageClass
2. Deploy a database with StatefulSet
3. Configure backup with Job
4. Test recovery from snapshot
5. Simulate volume expansion

## Conclusion

Persistent storage is essential for stateful applications. In this module you learned:

- To configure PV and PVC
- To use StorageClass for dynamic provisioning
- To implement StatefulSet with storage
- To manage volumes with init containers

In the next module we'll cover complete application troubleshooting.
