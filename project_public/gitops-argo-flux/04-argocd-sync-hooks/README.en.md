# Module 04: ArgoCD Sync Hooks and Waves

**Duration:** 3 hours  
**Level:** Advanced  
**Prerequisites:** Modules 01-03 completed

## Learning Objectives

By the end of this module, you will be able to:

1. Implement PreSync, Sync, PostSync, and SyncFail hooks
2. Orchestrate deployments with sync waves
3. Manage effective rollback strategies
4. Configure custom health checks
5. Troubleshoot complex synchronization issues

---

## 1. Sync Phases

### 1.1 Phase Overview

ArgoCD executes sync in well-defined phases:

```text
Execution order:

┌─────────────────────────────────────────────────────────────┐
│                    Sync Phases Timeline                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. PreSync Phase                                          │
│     ├── Wave -5, -4, -3, -2, -1                           │
│     └── Prepare environment, backup, validations          │
│                                                             │
│  2. Sync Phase                                             │
│     ├── Wave 0 (default)                                   │
│     ├── Wave 1, 2, 3, ...                                  │
│     └── Apply main resources                               │
│                                                             │
│  3. PostSync Phase                                         │
│     ├── Wave 0, 1, 2, ...                                  │
│     └── Notifications, cleanup, verifications              │
│                                                             │
│  4. SyncFail Phase (conditional)                          │
│     └── Executed only if sync fails                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Phase Details

#### PreSync

Executed **before** any Sync resource:

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  generateName: db-backup-
  annotations:
    argocd.argoproj.io/hook: PreSync
    argocd.argoproj.io/hook-delete-policy: HookSucceeded
spec:
  template:
    spec:
      containers:
      - name: backup
        image: postgres:14
        command: ["pg_dump", "-h", "postgres", "mydb", ">", "/backup/dump.sql"]
        volumeMounts:
        - name: backup
          mountPath: /backup
      volumes:
      - name: backup
        persistentVolumeClaim:
          claimName: backup-pvc
      restartPolicy: OnFailure
```

**Use cases:**

- Database backup before migrations
- Pre-deploy validations
- Dynamic configuration generation
- Cleanup obsolete resources

#### Sync

Executed for **main** resources (default):

```yaml
# Resources without hooks are automatically Sync
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
  # No hook annotation required
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: myapp
        image: myapp:v1
```

#### PostSync

Executed **after** all Sync resources are healthy:

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  generateName: notify-success-
  annotations:
    argocd.argoproj.io/hook: PostSync
    argocd.argoproj.io/hook-delete-policy: HookSucceeded
spec:
  template:
    spec:
      containers:
      - name: notify
        image: curlimages/curl
        command:
        - curl
        - -X
        - POST
        - -H
        - "Content-Type: application/json"
        - -d
        - '{"text":"Deploy completed successfully!"}'
        - $(SLACK_WEBHOOK)
        env:
        - name: SLACK_WEBHOOK
          valueFrom:
            secretKeyRef:
              name: slack-webhook
              key: url
      restartPolicy: OnFailure
```

**Use cases:**

- Deploy success notifications
- End-to-end tests
- Post-deploy cleanup
- CDN cache invalidation

#### SyncFail

Executed **only if** sync fails:

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  generateName: alert-failure-
  annotations:
    argocd.argoproj.io/hook: SyncFail
spec:
  template:
    spec:
      containers:
      - name: alert
        image: curlimages/curl
        command:
        - curl
        - -X
        - POST
        - -d
        - "Deploy failed! Check logs."
        - $(ALERT_WEBHOOK)
      restartPolicy: OnFailure
```

---

## 2. Sync Waves

### 2.1 Basic Concept

Sync waves allow ordering resources within the same phase:

```text
Wave execution:

PreSync Phase:
  Wave -2: Database backup
  Wave -1: Schema validation
  
Sync Phase:
  Wave 0: Namespace, ServiceAccount (default)
  Wave 1: ConfigMaps, Secrets
  Wave 2: Deployments, StatefulSets
  Wave 3: Services, Ingresses
  Wave 4: HPA, PDB
  
PostSync Phase:
  Wave 0: Base tests
  Wave 1: End-to-end tests
  Wave 2: Notifications
```

### 2.2 Configuration

```yaml
# CRD - Wave -1 (must exist before)
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: myresources.example.com
  annotations:
    argocd.argoproj.io/sync-wave: "-1"
spec:
  group: example.com
  versions:
  - name: v1
    served: true
    storage: true
---
# Namespace - Wave -1
apiVersion: v1
kind: Namespace
metadata:
  name: production
  annotations:
    argocd.argoproj.io/sync-wave: "-1"
---
# ConfigMap - Wave 0 (default, optional)
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: production
  annotations:
    argocd.argoproj.io/sync-wave: "0"
data:
  config.yaml: |
    key: value
---
# Deployment - Wave 1
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
  namespace: production
  annotations:
    argocd.argoproj.io/sync-wave: "1"
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    spec:
      containers:
      - name: myapp
        image: myapp:v1
        envFrom:
        - configMapRef:
            name: app-config
---
# Service - Wave 2
apiVersion: v1
kind: Service
metadata:
  name: myapp
  namespace: production
  annotations:
    argocd.argoproj.io/sync-wave: "2"
spec:
  selector:
    app: myapp
  ports:
  - port: 80
```

### 2.3 Waves with Hooks

```yaml
# PreSync wave -2: Check prerequisites
apiVersion: batch/v1
kind: Job
metadata:
  generateName: check-prereq-
  annotations:
    argocd.argoproj.io/hook: PreSync
    argocd.argoproj.io/sync-wave: "-2"
spec:
  template:
    spec:
      containers:
      - name: check
        image: bitnami/kubectl
        command: ["kubectl", "get", "namespace", "production"]
      restartPolicy: OnFailure
---
# PreSync wave -1: Migration
apiVersion: batch/v1
kind: Job
metadata:
  generateName: db-migrate-
  annotations:
    argocd.argoproj.io/hook: PreSync
    argocd.argoproj.io/sync-wave: "-1"
spec:
  template:
    spec:
      containers:
      - name: migrate
        image: myapp-migrate:v1
        command: ["./migrate.sh"]
      restartPolicy: OnFailure
```

---

## 3. Hook Delete Policy

### 3.1 Available Options

| Policy | Description |
|--------|-------------|
| `HookSucceeded` | Delete after success |
| `HookFailed` | Delete after failure |
| `BeforeHookCreation` | Delete old version before creating new one |
| HookSucceeded,HookFailed | Always delete |

### 3.2 Examples

```yaml
# Delete only if successful
annotations:
  argocd.argoproj.io/hook-delete-policy: HookSucceeded

# Delete only if failed
annotations:
  argocd.argoproj.io/hook-delete-policy: HookFailed

# Keep only last execution
annotations:
  argocd.argoproj.io/hook-delete-policy: BeforeHookCreation

# Always delete
annotations:
  argocd.argoproj.io/hook-delete-policy: HookSucceeded,HookFailed
```

---

## 4. Rollback Strategies

### 4.1 Manual Rollback

```bash
# View history
argocd app history myapp

# Output:
# REVISION  HASH        STATUS     AGE
# 1         abc1234     Synced     1h
# 2         def5678     Synced     30m
# 3         ghi9012     Failed     5m

# Rollback to revision 2
argocd app rollback myapp 2

# Note: this disables auto-sync
# Re-enable if needed
argocd app set myapp --sync-policy automated
```

### 4.2 Automatic Rollback (Pattern)

ArgoCD doesn't have native automatic rollback, but can be implemented:

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  generateName: auto-rollback-
  annotations:
    argocd.argoproj.io/hook: SyncFail
    argocd.argoproj.io/hook-delete-policy: HookSucceeded
spec:
  template:
    spec:
      serviceAccountName: argocd-repo-server
      containers:
      - name: rollback
        image: argoproj/argocd:v2.8.0
        command:
        - sh
        - -c
        - |
          # Find last good revision
          LAST_GOOD=$(argocd app history myapp -o json | jq -r '.[] | select(.status=="Synced") | .revision' | head -1)
          # Execute rollback
          argocd app rollback myapp $LAST_GOOD
      restartPolicy: OnFailure
```

### 4.3 Revision History Limit

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: myapp
  namespace: argocd
spec:
  project: default
  
  revisionHistoryLimit: 20  # Default: 10
  
  source:
    repoURL: https://github.com/myorg/myapp-config.git
    path: .
  
  destination:
    server: https://kubernetes.default.svc
    namespace: production
```

---

## 5. Health Checks

### 5.1 Built-in Health Checks

ArgoCD has built-in health checks for:

```text
Natively supported resources:

├── Deployment
│   └── Healthy if readyReplicas == replicas
├── StatefulSet
│   └── Healthy if readyReplicas == replicas
├── DaemonSet
│   └── Healthy if readyReplicas == desiredNumberScheduled
├── Service
│   └── Healthy if has ClusterIP or LoadBalancer
├── Ingress
│   └── Healthy if has IP or hostname
├── PersistentVolumeClaim
│   └── Healthy if Bound
├── Pod
│   └── Healthy if Running, Progressing if Pending
└── Job
    └── Healthy if Complete, Progressing if Running
```

### 5.2 Custom Health Checks

```yaml
# ConfigMap argocd-cm
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-cm
  namespace: argocd
data:
  # Health check for custom CRD
  resource.customizations.health.mygroup.myresource: |
    hs = {}
    if obj.status ~= nil then
      if obj.status.phase ~= nil then
        if obj.status.phase == "Ready" then
          hs.status = "Healthy"
          hs.message = "Resource is ready"
          return hs
        elseif obj.status.phase == "Failed" then
          hs.status = "Degraded"
          hs.message = "Resource failed: " .. (obj.status.message or "unknown")
          return hs
        end
      end
    end
    hs.status = "Progressing"
    hs.message = "Waiting for resource to be ready"
    return hs
```

### 5.3 Practical Examples

```lua
-- Health check for Certificate (cert-manager)
resource.customizations.health.cert-manager.io_Certificate: |
  hs = {}
  if obj.status ~= nil then
    if obj.status.conditions ~= nil then
      for i, condition in ipairs(obj.status.conditions) do
        if condition.type == "Ready" then
          if condition.status == "True" then
            hs.status = "Healthy"
            hs.message = "Certificate is valid"
            return hs
          else
            hs.status = "Degraded"
            hs.message = condition.message or "Certificate not ready"
            return hs
          end
        end
      end
    end
  end
  hs.status = "Progressing"
  hs.message = "Waiting for certificate"
  return hs
```

---

## 6. Sync Troubleshooting

### 6.1 Debug Hooks

```bash
# View running hooks
kubectl get jobs -n argocd -l argocd.argoproj.io/hook

# Logs of a hook
kubectl logs job/presync-backup-xxx -n argocd

# Related events
kubectl get events -n argocd --field-selector reason=HookError

# Application details
argocd app get myapp --refresh

# Generated manifests
argocd app manifests myapp --show-managed-fields
```

### 6.2 Common Issues

```text
Issue: Hook doesn't execute

Possible causes:
├── Incorrect annotation
├── Hook already running (BeforeHookCreation)
├── Missing dependent resources
└── ServiceAccount without permissions

Solution:
├── Verify annotations
├── Check kubectl get events
└── Use --dry-run for testing
```

```text
Issue: Sync fails without clear message

Possible causes:
├── Blocking OutOfSync resource
├── Health check stuck in Progressing
└── Application timeout

Solution:
├── Increase timeout (spec.syncPolicy.retry)
├── Check custom health checks
└── Use argocd app diff
```

---

## 7. Best Practices

### 7.1 Hooks

```yaml
# ✓ Best practice: Use descriptive names
metadata:
  generateName: db-migrate-presync-
  
# ✓ Best practice: Set appropriate timeouts
spec:
  activeDeadlineSeconds: 600
  
# ✓ Best practice: Handle failures
spec:
  template:
    spec:
      restartPolicy: OnFailure
      
# ✓ Best practice: Clean up after execution
annotations:
  argocd.argoproj.io/hook-delete-policy: HookSucceeded
```

### 7.2 Waves

```text
Wave best practices:

1. Use negative waves for dependencies
   ├── -5: CRD and namespace
   ├── -3: ServiceAccount and role
   └── -1: ConfigMap and secret
   
2. Positive waves for application
   ├── 0: Deployments (default)
   ├── 1: Services
   └── 2: Ingress and HPA
   
3. Avoid unnecessary gaps
   ├── Don't use waves 1, 5, 10
   └── Prefer 1, 2, 3
```

---

## 8. Summary

In this module we explored:

1. **Sync Phases**: PreSync, Sync, PostSync, SyncFail
2. **Sync Waves**: Resource ordering with waves
3. **Hook Management**: Delete policy and lifecycle
4. **Rollback**: Manual and automatic strategies
5. **Health Checks**: Built-in and custom

### Next Steps

You have completed the GitOps with ArgoCD course! Apply your knowledge in real projects.

---

## Additional Resources

- [ArgoCD Sync Hooks](https://argo-cd.readthedocs.io/en/stable/user-guide/sync-options/)
- [ArgoCD Sync Waves](https://argo-cd.readthedocs.io/en/stable/user-guide/sync-waves/)
- [Custom Health Checks](https://argo-cd.readthedocs.io/en/stable/operator-manual/health/)
- [Rollback Strategies](https://argo-cd.readthedocs.io/en/stable/user-guide/rollback/)
