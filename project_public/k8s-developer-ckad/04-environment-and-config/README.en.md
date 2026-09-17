# Module 04: Environment and Configuration

**Duration**: 4-5 hours  
**CKAD Weight**: 20% (Application Deployment)

## Learning Objectives

By the end of this module, you will be able to:
- Create and use ConfigMaps for configuration data
- Configure environment variables from ConfigMap and Secret
- Mount ConfigMap and Secret as volumes
- Use Downward API for Pod metadata
- Manage resource requests, limits and QoS
- Implement LimitRange and ResourceQuota

---

## 1. ConfigMaps

### 1.1 Creation

```bash
# From literal values
kubectl create configmap app-config \
  --from-literal=APP_ENV=production \
  --from-literal=DB_HOST=db.example.com

# From file
kubectl create configmap nginx-config --from-file=nginx.conf

# From directory
kubectl create configmap app-settings --from-file=./config/

# From env file
kubectl create configmap env-config --from-env-file=config.env
```

### 1.2 YAML

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  DB_HOST: db.example.com
  DB_PORT: "5432"
  config.yaml: |
    database:
      host: db.example.com
      port: 5432
```

### 1.3 Using in Pods

#### As environment variables

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: config-env-pod
spec:
  containers:
  - name: app
    image: nginx:alpine
    env:
    # Single key
    - name: DATABASE_HOST
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: DB_HOST
    # All keys
    envFrom:
    - configMapRef:
        name: app-config
```

#### As volume

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: config-volume-pod
spec:
  containers:
  - name: app
    image: nginx:alpine
    volumeMounts:
    - name: config
      mountPath: /etc/app
      readOnly: true
  volumes:
  - name: config
    configMap:
      name: app-config
      items:
      - key: config.yaml
        path: app.yaml
        mode: 0644
```

---

## 2. Environment Variables

### 2.1 Source Types

```yaml
spec:
  containers:
  - name: app
    env:
    # Direct value
    - name: APP_NAME
      value: "myapp"
    
    # From ConfigMap
    - name: DB_HOST
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: DB_HOST
    
    # From Secret
    - name: DB_PASSWORD
      valueFrom:
        secretKeyRef:
          name: db-secret
          key: password
    
    # From Pod field (Downward API)
    - name: POD_NAME
      valueFrom:
        fieldRef:
          fieldPath: metadata.name
```

### 2.2 envFrom

```yaml
spec:
  containers:
  - name: app
    envFrom:
    # Entire ConfigMap
    - configMapRef:
        name: app-config
      prefix: CONFIG_
    
    # Entire Secret
    - secretRef:
        name: app-secrets
    
    # Inline values
    - configMapRef:
        name: override-config
```

---

## 3. Downward API

### 3.1 Environment Variables

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: downward-env-pod
spec:
  containers:
  - name: app
    image: busybox
    command: ['sh', '-c', 'env && sleep 3600']
    env:
    - name: POD_NAME
      valueFrom:
        fieldRef:
          fieldPath: metadata.name
    - name: POD_NAMESPACE
      valueFrom:
        fieldRef:
          fieldPath: metadata.namespace
    - name: POD_IP
      valueFrom:
        fieldRef:
          fieldPath: status.podIP
    - name: NODE_NAME
      valueFrom:
        fieldRef:
          fieldPath: spec.nodeName
    - name: CPU_REQUEST
      valueFrom:
        resourceFieldRef:
          containerName: app
          resource: requests.cpu
```

### 3.2 As Volume

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: downward-volume-pod
  labels:
    app: test
    env: dev
spec:
  containers:
  - name: app
    image: busybox
    command: ['sh', '-c', 'while true; do cat /etc/labels; sleep 5; done']
    volumeMounts:
    - name: podinfo
      mountPath: /etc
  volumes:
  - name: podinfo
    downwardAPI:
      items:
      - path: "labels"
        fieldRef:
          fieldPath: metadata.labels
      - path: "annotations"
        fieldRef:
          fieldPath: metadata.annotations
      - path: "cpu_limit"
        resourceFieldRef:
          containerName: app
          resource: limits.cpu
```

---

## 4. Resource Management

### 4.1 Requests and Limits

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: resource-pod
spec:
  containers:
  - name: app
    image: nginx:alpine
    resources:
      # Requests: guaranteed for scheduling
      requests:
        cpu: 100m        # 0.1 core
        memory: 128Mi    # 128 MiB
        ephemeral-storage: 1Gi
      # Limits: maximum usable
      limits:
        cpu: 500m        # 0.5 core
        memory: 256Mi    # 256 MiB
        ephemeral-storage: 2Gi
```

### 4.2 Units of Measurement

**CPU**:
- `1` = 1 CPU core
- `100m` = 100 millicores = 0.1 core
- `0.5` = 500m = half core

**Memory**:
- `128Mi` = 128 MiB (2^20 bytes)
- `1Gi` = 1024 MiB
- `1G` = 1000 MB (decimal)

### 4.3 Runtime Behavior

| Resource | Over Request | Over Limit |
|----------|--------------|------------|
| CPU | Throttling | Throttling |
| Memory | Eviction possible | OOMKilled |
| Storage | - | Eviction |

---

## 5. QoS Classes

### 5.1 Automatic Determination

| QoS Class | Criteria | Eviction Priority |
|-----------|----------|-------------------|
| Guaranteed | Requests == Limits (all resources, all containers) | Lowest |
| Burstable | At least one request or limit defined | Medium |
| BestEffort | No resources specified | Highest |

```bash
# Verify QoS
kubectl get pod <pod> -o jsonpath='{.status.qosClass}'
```

---

## 6. LimitRange

### 6.1 Purpose

Enforces defaults and limits per namespace:
- Default resources per Pod/Container
- Min/Max resources
- Min/Max storage request
- Limit ratio (request/limit)

### 6.2 Configuration

```yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: cpu-mem-limit-range
spec:
  limits:
  - type: Container
    # Defaults (if not specified)
    default:
      cpu: 200m
      memory: 256Mi
    defaultRequest:
      cpu: 50m
      memory: 64Mi
    # Minimums
    min:
      cpu: 10m
      memory: 16Mi
    # Maximums
    max:
      cpu: 1
      memory: 1Gi
    # Max request/limit ratio
    maxLimitRequestRatio:
      cpu: 5
      memory: 2
  - type: PersistentVolumeClaim
    min:
      storage: 1Gi
    max:
      storage: 10Gi
```

---

## 7. ResourceQuota

### 7.1 Purpose

Limits total resource consumption per namespace:
- Object counts (Pod, Service, PVC, etc.)
- Resource sums (CPU, memory, storage)
- Resource sums per QoS class

### 7.2 Configuration

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: compute-quota
spec:
  hard:
    # Object counts
    pods: 10
    services: 5
    persistentvolumeclaims: 5
    
    # Total requests
    requests.cpu: 2
    requests.memory: 2Gi
    requests.storage: 10Gi
    
    # Total limits
    limits.cpu: 4
    limits.memory: 4Gi
    
    # Per QoS class
    count/pods: 50
```

### 7.3 Scope

```yaml
spec:
  hard:
    pods: 10
  scopeSelector:
    matchExpressions:
    - operator: In
      scopeName: PriorityClass
      values: [high-priority]
```

---

## 8. Pod Priority

### 8.1 PriorityClass

```yaml
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
  name: high-priority
value: 1000000
globalDefault: false
preemptionPolicy: PreemptLowerPriority  # PreemptLowerPriority, Never
description: "Critical workloads"
```

### 8.2 Usage

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: critical-pod
spec:
  priorityClassName: high-priority
  containers:
  - name: app
    image: nginx
```

---

## 9. Practical Exercise

### Scenario
Configure an application with:
1. Configuration from ConfigMap
2. Secrets for credentials
3. Appropriate resource limits
4. LimitRange for defaults
5. ResourceQuota for namespace limits

### Steps

1. Create 'production' namespace
2. Configure LimitRange
3. Configure ResourceQuota
4. Create ConfigMaps and Secrets
5. Deploy Pod with all configurations

---

## Summary

| Resource | Purpose | Scope |
|----------|---------|-------|
| ConfigMap | Configuration data | Pod/Namespace |
| LimitRange | Defaults and limits per object | Namespace |
| ResourceQuota | Total namespace limits | Namespace |
| PriorityClass | Preemption | Cluster |

---

## Additional Resources

- [ConfigMaps](https://kubernetes.io/docs/concepts/configuration/configmap/)
- [Resource Management](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/)
- [LimitRange](https://kubernetes.io/docs/concepts/policy/limit-range/)
- [ResourceQuota](https://kubernetes.io/docs/concepts/policy/resource-quotas/)
