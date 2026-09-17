# Module 03: Deployment Strategies

**Duration**: 4-5 hours  
**CKAD Weight**: 20% (Application Deployment)

## Learning Objectives

By the end of this module, you will be able to:
- Create and manage Deployments with rollout strategies
- Implement rollback and manage revision history
- Use DaemonSet for system agents
- Configure StatefulSet for stateful applications
- Create Jobs and CronJobs for batch workloads
- Understand and implement Blue-Green and Canary strategies

---

## 1. Deployment

### 1.1 Basic Concept

A Deployment provides declarative updates for Pods and ReplicaSets. You define the desired state and the controller synchronizes the current state.

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
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: nginx
        image: nginx:alpine
        ports:
        - containerPort: 80
```

### 1.2 Essential Commands

```bash
# Creation
kubectl create deployment nginx --image=nginx:alpine --replicas=3

# Scaling
kubectl scale deployment nginx --replicas=5

# Update image
kubectl set image deployment/nginx nginx=nginx:1.25-alpine

# Rollout status
kubectl rollout status deployment/nginx

# History
kubectl rollout history deployment/nginx
kubectl rollout history deployment/nginx --revision=2

# Rollback
kubectl rollout undo deployment/nginx
kubectl rollout undo deployment/nginx --to-revision=3

# Pause and resume
kubectl rollout pause deployment/nginx
kubectl rollout resume deployment/nginx

# Restart (force rollout)
kubectl rollout restart deployment/nginx
```

### 1.3 Update Strategies

#### RollingUpdate (Default)

```yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1          # Max extra Pods during update
      maxUnavailable: 0    # Max unavailable Pods
```

**Behavior**:
- Creates new Pods gradually
- Terminates old Pods only when new ones are Ready
- Default: 25% maxSurge, 25% maxUnavailable

#### Recreate

```yaml
spec:
  strategy:
    type: Recreate
```

**Behavior**:
- Terminates all old Pods
- Creates all new Pods
- **Causes downtime**

---

## 2. ReplicaSet

### 2.1 Role in Deployment

ReplicaSet maintains the desired number of Pods. Deployments manage ReplicaSets.

```yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: nginx
        image: nginx:alpine
```

### 2.2 Differences from Deployment

| Feature | ReplicaSet | Deployment |
|---------|------------|------------|
| Scaling | Yes | Yes (via RS) |
| Rolling Update | No | Yes |
| Rollback | No | Yes |
| History | No | Yes |
| Use case | Rare | Standard |

---

## 3. DaemonSet

### 3.1 When to Use

DaemonSet ensures a copy of a Pod on every node (or subset).

**Use cases**:
- Log collection (Fluentd, Filebeat)
- Monitoring (Prometheus Node Exporter)
- Network plugin (Cilium, Calico)
- Storage daemon

### 3.2 Configuration

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: log-agent
spec:
  selector:
    matchLabels:
      app: log-agent
  template:
    metadata:
      labels:
        app: log-agent
    spec:
      containers:
      - name: fluent-bit
        image: fluent/fluent-bit:1.9
        volumeMounts:
        - name: varlog
          mountPath: /var/log
      volumes:
      - name: varlog
        hostPath:
          path: /var/log
      tolerations:
      - key: node-role.kubernetes.io/control-plane
        effect: NoSchedule
```

### 3.3 Node Selector and Affinity

```yaml
spec:
  template:
    spec:
      nodeSelector:
        type: worker
      # or
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
            - matchExpressions:
              - key: kubernetes.io/os
                operator: In
                values:
                - linux
```

---

## 4. StatefulSet

### 4.1 Unique Features

- **Stable names**: Pods with ordinal (db-0, db-1, db-2)
- **Dedicated storage**: Each Pod has its own PVC
- **Ordered startup**: Sequential (0 → 1 → 2)
- **Stable network**: DNS: db-0.service.ns.svc.cluster.local

### 4.2 Complete Configuration

```yaml
apiVersion: v1
kind: Service
metadata:
  name: db-headless
spec:
  clusterIP: None  # Headless
  selector:
    app: db
  ports:
  - port: 5432
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: db
spec:
  serviceName: db-headless
  replicas: 3
  selector:
    matchLabels:
      app: db
  template:
    metadata:
      labels:
        app: db
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_PASSWORD
          value: "secret"
        volumeMounts:
        - name: data
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 10Gi
```

### 4.3 Startup Order

```
1. db-0 created → PVC db-data-db-0 → Ready
2. db-1 created → PVC db-data-db-1 → Ready
3. db-2 created → PVC db-data-db-2 → Ready
```

---

## 5. Job

### 5.1 Concept

Job runs a time-bound task until completion.

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: data-import
spec:
  backoffLimit: 4          # Max retries
  activeDeadlineSeconds: 600  # Total timeout
  completions: 1          # How many times to complete
  parallelism: 1          # How many parallel Pods
  template:
    spec:
      containers:
      - name: importer
        image: python:3.11-slim
        command: ["python", "import_data.py"]
      restartPolicy: OnFailure  # Never or OnFailure
```

### 5.2 Job Types

#### Single Job

```yaml
spec:
  completions: 1
  parallelism: 1
```

#### Fixed Completion Count Job

```yaml
spec:
  completions: 5      # 5 Pods must complete
  parallelism: 2      # 2 Pods run together
```

#### Work Queue Job

```yaml
spec:
  completions: null  # Complete when one Pod finishes
  parallelism: 3     # 3 Pods run together
```

### 5.4 Failure Handling

```yaml
spec:
  backoffLimit: 6        # Max 6 retries (default)
  activeDeadlineSeconds: 3600  # 1 hour max
```

---

## 6. CronJob

### 6.1 Configuration

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: daily-backup
spec:
  schedule: "0 2 * * *"    # Every day at 2:00 AM
  concurrencyPolicy: Forbid  # Allow, Forbid, Replace
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 1
  startingDeadlineSeconds: 300
  suspend: false
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: backup:latest
            command: ["backup.sh"]
          restartPolicy: OnFailure
```

### 6.2 Cron Format

```
┌───────────── minutes (0 - 59)
│ ┌───────────── hours (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6, 0=Sunday)
│ │ │ │ │
* * * * *
```

**Examples**:
- `*/15 * * * *` - Every 15 minutes
- `0 * * * *` - Every hour
- `0 0 * * 0` - Every Sunday at midnight
- `0 0 1 * *` - First of the month

### 6.3 ConcurrencyPolicy

| Value | Behavior |
|-------|----------|
| Allow | Allows concurrent Jobs |
| Forbid | Prevents concurrent Jobs |
| Replace | Replaces the existing Job |

---

## 7. Advanced Deployment Strategies

### 7.1 Blue-Green Deployment

**Concept**: Two identical environments, instant switch.

```yaml
# Blue deployment (current version)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-blue
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
      version: blue
  template:
    metadata:
      labels:
        app: myapp
        version: blue
    spec:
      containers:
      - name: app
        image: myapp:v1
---
# Green deployment (new version)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-green
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
      version: green
  template:
    metadata:
      labels:
        app: myapp
        version: green
    spec:
      containers:
      - name: app
        image: myapp:v2
---
# Service (initially points to blue)
apiVersion: v1
kind: Service
metadata:
  name: myapp
spec:
  selector:
    app: myapp
    version: blue  # Change to 'green' to switch
  ports:
  - port: 80
```

**Advantages**:
- Zero downtime
- Instant rollback
- Full production testing

**Disadvantages**:
- Double resource usage
- Increased cost

### 7.2 Canary Deployment

**Concept**: Gradually expose users to the new version.

```yaml
# Stable (90% traffic)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-stable
spec:
  replicas: 9
  selector:
    matchLabels:
      app: api
      track: stable
  template:
    metadata:
      labels:
        app: api
        track: stable
    spec:
      containers:
      - name: api
        image: api:v1
---
# Canary (10% traffic)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-canary
spec:
  replicas: 1
  selector:
    matchLabels:
      app: api
      track: canary
  template:
    metadata:
      labels:
        app: api
        track: canary
    spec:
      containers:
      - name: api
        image: api:v2
---
# Service balances by common labels
apiVersion: v1
kind: Service
metadata:
  name: api
spec:
  selector:
    app: api
  ports:
  - port: 8080
```

**Advanced implementation** with Service Mesh:
- Istio: Traffic splitting
- Linkerd: Traffic split
- NGINX Ingress: Canary annotations

---

## 8. Rollback and Recovery

### 8.1 History Management

```bash
# View all revisions
kubectl rollout history deployment/web-app

# Details of specific revision
kubectl rollout history deployment/web-app --revision=2

# Rollback to previous
kubectl rollout undo deployment/web-app

# Rollback to specific revision
kubectl rollout undo deployment/web-app --to-revision=5
```

### 8.2 Limit History

```yaml
spec:
  revisionHistoryLimit: 10  # Default
```

### 8.3 Annotations for Tracking

```yaml
metadata:
  annotations:
    kubernetes.io/change-cause: "Update to v1.2.3 for security fix"
```

---

## 9. Deployment Troubleshooting

### 9.1 Common Problems

```bash
# Deployment stuck
kubectl rollout status deployment/web-app --timeout=30s
kubectl describe deployment web-app

# Pods not starting
kubectl get events --sort-by='.lastTimestamp'
kubectl describe pod <pod-name>

# ImagePullBackOff
kubectl get pod <pod-name> -o jsonpath='{.status.containerStatuses[0].state.waiting}'

# Rollback failed
kubectl rollout history deployment/web-app
kubectl rollout undo deployment/web-app --to-revision=N
```

### 9.2 Advanced Debugging

```bash
# Check ReplicaSets
kubectl get rs -l app=web-app

# Check events
kubectl get events --field-selector involvedObject.name=web-app

# Check Pod template hash
kubectl get pods -l app=web-app -o jsonpath='{.items[*].metadata.ownerReferences[0].name}'
```

---

## 10. Practical Exercise

### Scenario
Implement a complete deployment strategy for a web application with:
1. Zero downtime for updates
2. Automatic rollback on errors
3. Canary testing for new versions

### Steps

1. Create base deployment with probes
2. Configure rolling update parameters
3. Implement canary deployment
4. Test rollback
5. Document procedures

---

## Summary

| Controller | Use Case | Notes |
|------------|----------|-------|
| Deployment | Stateless apps | Standard |
| StatefulSet | Stateful apps | Database, Queue |
| DaemonSet | Per-node agents | Logging, Monitoring |
| Job | Batch task | One-off |
| CronJob | Scheduled task | Recurring |

---

## Additional Resources

- [Deployment Strategies](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [StatefulSet Basics](https://kubernetes.io/docs/tutorials/stateful-application/basic-statefulset/)
- [Jobs](https://kubernetes.io/docs/concepts/workloads/controllers/job/)
- [CronJobs](https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/)
