# Modulo 5: Fondamenti di Flux CD

**Durata**: 2 ore teoria + 2 ore lab
**Obiettivo**: Comprendere l'architettura di Flux e le sue CRD principali

## 🎯 Obiettivi di Apprendimento

- Comprendere l'architettura modulare di Flux v2
- Installare e configurare Flux su un cluster Kubernetes
- Usare il CLI di Flux per gestire le risorse GitOps
- Configurare GitRepository e Kustomization
- Gestire release Helm con HelmRelease

## 📚 Contenuti Teorici

### 1. Introduzione a Flux CD

Flux CD è un toolkit GitOps open-source per Kubernetes. A differenza di ArgoCD, Flux è progettato come un insieme di controller modulabili che possono essere estesi con plugin.

#### Componenti Flux v2

| Componente | Funzione |
|------------|----------|
| **source-controller** | Gestisce il fetching delle fonti (Git, Helm, OCI, Bucket) |
| **kustomize-controller** | Applica e riconcilia le risorse Kustomize e YAML raw |
| **helm-controller** | Gestisce le release Helm tramite HelmRelease CRD |
| **notification-controller** | Gestisce notifiche e alert per eventi di reconciliazione |

### 2. Principi GitOps in Flux

Flux implementa i principi GitOps:

- **Declarative**: Lo stato desiderato è dichiarato in YAML nel Git
- **Versioned**: Ogni cambiamento è versionato nel Git
- **Automated**: Il controller riconcilia automaticamente lo stato
- **Self-healing**: Le modifiche manuali al cluster vengono annullate

### 3. CRD Principali

```yaml
# GitRepository - definisce una fonte Git
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
# Kustomization - definisce come applicare le risorse
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

### 4. CLI di Flux

```bash
# Installare Flux
flux install

# Gestire fonti
flux create source git my-repo --url=... --branch=main
flux get sources git

# Gestire Kustomization
flux create kustomization my-app --source=GitRepository/my-repo --path=./k8s
flux get kustomizations

# Riconciliare manualmente
flux reconcile kustomization my-app

# Visualizzare log
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

## 🔧 Esercizi Pratici

1. Installare Flux su Minikube
2. Creare un GitRepository
3. Configurare un Kustomization
4. Forzare una riconciliazione
5. Installare un chart Helm con HelmRelease

## 📖 Risorse Aggiuntive

- [Flux Documentation](https://fluxcd.io/docs/)
- [Flux GitHub](https://github.com/fluxcd/flux2)
- [GitOps Toolkit](https://toolkit.fluxcd.io/)
