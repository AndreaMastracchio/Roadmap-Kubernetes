# Module 5: Flux CD Fundamentals

**Duration**: 2 hours theory + 2 hours lab
**Objective**: Understand Flux architecture and its main CRDs

## 🎯 Learning Objectives

- Understand the modular architecture of Flux v2
- Install and configure Flux on a Kubernetes cluster
- Use the Flux CLI to manage GitOps resources
- Configure GitRepository and Kustomization
- Manage Helm releases with HelmRelease

## 📚 Theoretical Content

### 1. Introduction to Flux CD

Flux CD is an open-source GitOps toolkit for Kubernetes. Unlike ArgoCD, Flux is designed as a set of composable controllers that can be extended with plugins.

#### Flux v2 Components

| Component | Function |
|-----------|----------|
| **source-controller** | Handles fetching sources (Git, Helm, OCI, Bucket) |
| **kustomize-controller** | Applies and reconciles Kustomize and raw YAML resources |
| **helm-controller** | Manages Helm releases via HelmRelease CRD |
| **notification-controller** | Handles notifications and alerts for reconciliation events |

### 2. GitOps Principles in Flux

Flux implements GitOps principles:

- **Declarative**: Desired state is declared in YAML in Git
- **Versioned**: Every change is versioned in Git
- **Automated**: Controller automatically reconciles state
- **Self-healing**: Manual changes to the cluster are undone

### 3. Main CRDs

```yaml
# GitRepository - defines a Git source
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: my-repo
spec:
  interval: 1m
  url: https://github.com/user/repo
  ref:
    branch: main
---
# Kustomization - defines how to apply resources
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: my-app
spec:
  interval: 5m
  sourceRef:
    kind: GitRepository
    name: my-repo
  path: ./k8s
  prune: true
```

### 4. Flux CLI

```bash
# Install Flux
flux install

# Manage sources
flux create source git my-repo --url=... --branch=main
flux get sources git

# Manage Kustomization
flux create kustomization my-app --source=GitRepository/my-repo --path=./k8s
flux get kustomizations

# Force reconciliation
flux reconcile kustomization my-app

# View logs
flux logs --follow
```

### 5. HelmRelease

```yaml
apiVersion: helm.toolkit.fluxcd.io/v2
kind: HelmRelease
metadata:
  name: nginx
spec:
  interval: 10m
  chart:
    spec:
      chart: nginx
      version: ">=1.0.0"
      sourceRef:
        kind: HelmRepository
        name: bitnami
  values:
    replicaCount: 3
```

## 🔧 Hands-on Exercises

1. Install Flux on Minikube
2. Create a GitRepository
3. Configure a Kustomization
4. Force a reconciliation
5. Install a Helm chart with HelmRelease

## 📖 Additional Resources

- [Flux Documentation](https://fluxcd.io/docs/)
- [Flux GitHub](https://github.com/fluxcd/flux2)
- [GitOps Toolkit](https://toolkit.fluxcd.io/)
