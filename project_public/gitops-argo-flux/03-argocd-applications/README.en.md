# Module 03: ArgoCD Applications

**Duration:** 3 hours  
**Level:** Intermediate  
**Prerequisites:** Module 02 completed, working ArgoCD cluster

## Learning Objectives

By the end of this module, you will be able to:

1. Define ArgoCD applications through Custom Resource Definition
2. Configure Git, Helm, and Kustomize sources
3. Implement automatic and manual synchronization policies
4. Create ApplicationSets for multi-cluster deployments
5. Manage rollbacks and application troubleshooting

---

## 1. Application CRD

### 1.1 Basic Structure

The Application CRD is ArgoCD's primary resource for defining a GitOps application.

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: guestbook
  namespace: argocd
  # Labels are useful for filtering and organizing
  labels:
    app.kubernetes.io/name: guestbook
    app.kubernetes.io/component: frontend
spec:
  project: default
  
  source:
    repoURL: https://github.com/argoproj/argocd-example-apps.git
    targetRevision: HEAD
    path: guestbook
  
  destination:
    server: https://kubernetes.default.svc
    namespace: guestbook
  
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

### 1.2 Fundamental Fields

```text
Application Spec:

┌─────────────────────────────────────────────────────────────┐
│                       spec.source                            │
├─────────────────────────────────────────────────────────────┤
│  repoURL      → Git/Helm repository URL                     │
│  targetRevision → Branch, tag, or commit                    │
│  path         → Directory in repository                     │
│  chart        → Helm chart name (if Helm)                   │
│  directory    → Directory configuration                     │
│  helm         → Helm configuration                          │
│  kustomize    → Kustomize configuration                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    spec.destination                          │
├─────────────────────────────────────────────────────────────┤
│  server       → Kubernetes cluster URL                      │
│  namespace    → Destination namespace                       │
│  name         → Cluster name (alternative to server)       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     spec.syncPolicy                          │
├─────────────────────────────────────────────────────────────┤
│  automated    → Automatic synchronization                   │
│  ├── prune    → Delete resources removed from Git           │
│  └── selfHeal → Correct manual modifications               │
│  syncOptions  → Additional options                          │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 Creation via CLI vs YAML

```bash
# CLI Method
argocd app create guestbook \
  --repo https://github.com/argoproj/argocd-example-apps.git \
  --path guestbook \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace guestbook

# YAML Method
kubectl apply -f application.yaml
```

---

## 2. Source Configuration

### 2.1 Git Source (Directory)

```yaml
spec:
  source:
    repoURL: https://github.com/myorg/myapp-config.git
    targetRevision: main  # Branch, tag, or commit
    path: overlays/production
    
    # Automatic type detection
    directory:
      recurse: true  # Include subdirectories
      jsonnet:
        extVars:
        - name: ENV
          value: production
```

### 2.2 Helm Source

```yaml
spec:
  source:
    repoURL: https://charts.bitnami.com/bitnami
    chart: nginx-ingress
    targetRevision: "9.8.0"  # Chart version
    
    helm:
      # Inline values
      values: |
        service:
          type: LoadBalancer
        replicaCount: 3
      
      # External values files (Git)
      valueFiles:
      - values.yaml
      - values-prod.yaml
      
      # Single parameters
      parameters:
      - name: service.type
        value: LoadBalancer
      - name: service.annotations.external-dns
        value: "true"
        forceString: true
      
      # Pass files as values
      fileParameters:
      - name: customConfig
        path: config.yaml
```

**Helm Values Hierarchy:**

```text
Precedence (lowest to highest):

1. values.yaml in chart
2. values.yaml from Git (if specified)
3. Additional files from valueFiles (in order)
4. Parameters from parameters
5. Inline values from 'values'
```

### 2.3 Kustomize Source

```yaml
spec:
  source:
    repoURL: https://github.com/myorg/kustomize-configs.git
    targetRevision: main
    path: apps/myapp/overlays/production
    
    kustomize:
      # NamePrefix added to all resources
      namePrefix: prod-
      
      # Name suffix
      nameSuffix: "-v1"
      
      # Common namespace
      namespace: production
      
      # Images to replace
      images:
      - name: myapp
        newName: myregistry.io/myapp
        newTag: v1.2.3
      
      # Inline patches
      patches:
      - target:
          kind: Deployment
          name: myapp
        patch: |
          - op: replace
            path: /spec/replicas
            value: 5
      
      # Patches from file
      patchesJson6902:
      - target:
          version: v1
          kind: Deployment
          name: myapp
        path: patch.yaml
```

### 2.4 Multi-Source Applications

Available since ArgoCD 2.6+, allows combining multiple sources:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: multi-source-app
  namespace: argocd
spec:
  project: default
  sources:
  # First source: base application
  - repoURL: https://github.com/myorg/app-manifests.git
    path: base
    
  # Second source: specific configuration
  - repoURL: https://github.com/myorg/app-configs.git
    path: overlays/production
    helm:
      values: |
        replicaCount: 5
        
  # Third source: Helm chart
  - repoURL: https://charts.bitnami.com/bitnami
    chart: redis
    targetRevision: "17.x"
    helm:
      values: |
        architecture: standalone
    
  destination:
    server: https://kubernetes.default.svc
    namespace: production
```

---

## 3. Sync Policies

### 3.1 Manual Sync

```yaml
spec:
  syncPolicy: null  # Or omit the field
  
# In this way:
# - ArgoCD detects OutOfSync
# - User must click "Sync" or use argocd app sync
# - Greater control over production deploys
```

### 3.2 Automatic Sync

```yaml
spec:
  syncPolicy:
    automated:
      prune: true      # Delete removed resources
      selfHeal: true   # Correct manual changes
    
    syncOptions:
    - CreateNamespace=true
    - PruneLast=true
    - PrunePropagationPolicy=foreground
    - Replace=true
    - ServerSideApply=true
    
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
```

**Sync Options:**

| Option | Description |
|--------|-------------|
| CreateNamespace | Create namespace if it doesn't exist |
| PruneLast | Prune after other resources are synced |
| PrunePropagationPolicy | Policy for prune propagation |
| Replace | Use kubectl replace instead of apply |
| ServerSideApply | Use Server-Side Apply |
| ApplyOutOfSyncOnly | Apply only OutOfSync resources |

### 3.3 Self-Healing in Action

```text
Scenario: Someone manually modifies a deployment

┌────────────────────────────────────────────────────────┐
│ Timeline                                               │
├────────────────────────────────────────────────────────┤
│ T+0min: User executes                                  │
│   kubectl scale deployment nginx --replicas=100       │
│                                                        │
│ T+0min: ArgoCD detects drift                           │
│   Status: OutOfSync (spec.replicas)                   │
│                                                        │
│ T+1min: If selfHeal=true                               │
│   ArgoCD restores: replicas=3 (from Git)              │
│   Status: Synced, Healthy                             │
│                                                        │
│ T+1min: If selfHeal=false                              │
│   Status: OutOfSync (requires manual sync)            │
└────────────────────────────────────────────────────────┘
```

---

## 4. Application Sets

### 4.1 Overview

ApplicationSet automates creating multiple Applications:

```text
ApplicationSet Controller
        │
        │ Generates
        ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│ Application 1 │  │ Application 2 │  │ Application N │
│   (dev)       │  │   (staging)   │  │   (prod)     │
└───────────────┘  └───────────────┘  └───────────────┘
```

### 4.2 List Generator

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: guestbook-apps
  namespace: argocd
spec:
  generators:
  - list:
      elements:
      - env: dev
        replicas: "1"
      - env: staging
        replicas: "2"
      - env: prod
        replicas: "5"
  
  template:
    metadata:
      name: 'guestbook-{{env}}'
      labels:
        environment: '{{env}}'
    
    spec:
      project: default
      
      source:
        repoURL: https://github.com/myorg/guestbook-config.git
        targetRevision: main
        path: guestbook
        helm:
          parameters:
          - name: replicaCount
            value: '{{replicas}}'
      
      destination:
        server: https://kubernetes.default.svc
        namespace: 'guestbook-{{env}}'
      
      syncPolicy:
        automated:
          prune: true
          selfHeal: true
```

### 4.3 Cluster Generator

Generates applications for each registered cluster:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: cluster-apps
  namespace: argocd
spec:
  generators:
  - clusters:
      selector:
        matchLabels:
          argocd.argoproj.io/secret-type: cluster
          environment: production
  
  template:
    metadata:
      name: 'guestbook-{{name}}'
    
    spec:
      project: default
      
      source:
        repoURL: https://github.com/myorg/guestbook-config.git
        path: guestbook
      
      destination:
        server: '{{server}}'
        namespace: guestbook
```

### 4.4 Git Generator

Generates from file/structure in repository:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: git-apps
  namespace: argocd
spec:
  generators:
  - git:
      repoURL: https://github.com/myorg/app-configs.git
      revision: main
      directories:
      - path: apps/*
  
  template:
    metadata:
      name: 'app-{{path.basename}}'
    
    spec:
      project: default
      
      source:
        repoURL: https://github.com/myorg/app-configs.git
        path: '{{path}}'
      
      destination:
        server: https://kubernetes.default.svc
        namespace: '{{path.basename}}'
```

### 4.5 Matrix Generator

Combines two generators:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: matrix-apps
  namespace: argocd
spec:
  generators:
  - matrix:
      generators:
      - list:
          elements:
          - app: frontend
          - app: backend
      - clusters:
          selector:
            matchLabels:
              environment: production
  
  template:
    metadata:
      name: '{{app}}-{{name}}'
    
    spec:
      project: default
      source:
        repoURL: https://github.com/myorg/configs.git
        path: 'apps/{{app}}'
      destination:
        server: '{{server}}'
        namespace: '{{app}}'
```

---

## 5. Application State Management

### 5.1 Sync States

```text
┌─────────────┐     git push      ┌─────────────┐
│   Git Repo  │ ───────────────► │    ArgoCD   │
└─────────────┘                   └──────┬──────┘
                                         │
                                         │ compares
                                         ▼
                                 ┌───────────────┐
                                 │  Live State   │
                                 │   (Cluster)   │
                                 └───────────────┘

Sync Status:
├── Synced: Git == Live (everything aligned)
├── OutOfSync: Git != Live (differences)
│   ├── Modified: Resource manually modified
│   ├── Added: Resource added in cluster
│   └── Missing: Resource in Git not present in cluster
└── Unknown: Unable to determine
```

### 5.2 Health States

```text
Health Status:

├── Healthy: Resource working correctly
├── Progressing: Deployment in progress, awaiting healthy
├── Degraded: Problems detected, not functioning
├── Suspended: Resources paused (CronJob, Rollout paused)
├── Missing: Resource not found in cluster
└── Unknown: Unable to determine state

Health check examples:

Deployment: Healthy if spec.replicas == status.readyReplicas
Service: Healthy if clusterIP assigned or endpoints ready
Pod: Healthy if phase Running, Degraded if CrashLoopBackOff
PVC: Healthy if Bound, Progressing if Pending
```

### 5.3 History and Rollback

```bash
# View history
argocd app history guestbook

# Output:
# REVISION  STATUS      AGE
# 1         Synced      1h
# 2         Synced      30m
# 3         Failed      5m

# Execute rollback
argocd app rollback guestbook 2

# Note: rollback disables auto-sync
# To re-enable:
argocd app set guestbook --sync-policy automated
```

---

## 6. Common Operations

### 6.1 Manual Sync

```bash
# Basic sync
argocd app sync guestbook

# Sync with options
argocd app sync guestbook \
  --dry-run \
  --prune \
  --replace \
  --server-side

# Selective sync
argocd app sync guestbook \
  --resource deployment:guestbook-ui \
  --resource service:guestbook-ui
```

### 6.2 Diff and Debug

```bash
# View differences
argocd app diff guestbook

# Generated manifests
argocd app manifests guestbook

# Application details
argocd app get guestbook --refresh

# Managed resources
argocd app resources guestbook
```

### 6.3 Resource Management

```bash
# Delete application (cascade)
argocd app delete guestbook

# Delete without removing resources
argocd app delete guestbook --cascade=false

# Force delete orphaned resources
argocd app delete guestbook --yes
```

---

## 7. Multi-Cluster Applications

### 7.1 Destination Configuration

```yaml
# Destination for registered cluster
spec:
  destination:
    name: staging-cluster  # Cluster name in ArgoCD
    namespace: production

# Alternative: Direct URL
spec:
  destination:
    server: https://staging.example.com
    namespace: production
```

### 7.2 Multi-Cluster Patterns

```yaml
# Pattern 1: Central application for multi-cluster
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: global-app
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/myorg/configs.git
    path: global-app
  destination:
    server: https://kubernetes.default.svc
    namespace: argocd
  syncPolicy:
    automated:
      prune: true
---
# Application deploying to multiple clusters via ApplicationSet
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: multi-cluster-apps
  namespace: argocd
spec:
  generators:
  - clusters:
      selector:
        matchLabels:
          argocd.argoproj.io/secret-type: cluster
  template:
    spec:
      source:
        repoURL: https://github.com/myorg/configs.git
        path: '{{name}}/apps'
      destination:
        server: '{{server}}'
        namespace: production
```

---

## 8. Summary

In this module we explored:

1. **Application CRD**: Structure and fundamental fields
2. **Source Config**: Git, Helm, Kustomize, multi-source
3. **Sync Policy**: Automatic, manual, self-heal, prune
4. **ApplicationSet**: Generators for multi-app and multi-cluster
5. **Operations**: Sync, rollback, diff, debug

### Next Steps

In the next module we will dive into sync hooks and waves for orchestrated deployments.

---

## Additional Resources

- [ArgoCD Application CRD](https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/)
- [ApplicationSet Documentation](https://argo-cd.readthedocs.io/en/stable/operator-manual/applicationset/)
- [Helm Integration](https://argo-cd.readthedocs.io/en/stable/user-guide/helm/)
- [Kustomize Integration](https://argo-cd.readthedocs.io/en/stable/user-guide/kustomize/)
