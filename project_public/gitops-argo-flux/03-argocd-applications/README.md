# Modulo 03: Applicazioni ArgoCD

**Durata:** 3 ore  
**Livello:** Intermedio  
**Prerequisiti:** Modulo 02 completato, cluster con ArgoCD funzionante

## Obiettivi di Apprendimento

Al termine di questo modulo, sarai in grado di:

1. Definire applicazioni ArgoCD tramite Custom Resource Definition
2. Configurare sorgenti Git, Helm e Kustomize
3. Implementare politiche di sincronizzazione automatica e manuale
4. Creare ApplicationSet per deployment multi-cluster
5. Gestire rollback e troubleshooting delle applicazioni

---

## 1. Application CRD

### 1.1 Struttura Base

L'Application CRD è la risorsa principale di ArgoCD per definire un'applicazione GitOps.

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: guestbook
  namespace: argocd
  # Le label sono utili per filtrare e organizzare
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

### 1.2 Campi Fondamentali

```text
Application Spec:

┌─────────────────────────────────────────────────────────────┐
│                       spec.source                            │
├─────────────────────────────────────────────────────────────┤
│  repoURL      → URL del repository Git/Helm                 │
│  targetRevision → Branch, tag, o commit                     │
│  path         → Directory nel repository                    │
│  chart        → Nome del chart Helm (se Helm)               │
│  directory    → Configurazione directory                     │
│  helm         → Configurazione Helm                         │
│  kustomize    → Configurazione Kustomize                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    spec.destination                          │
├─────────────────────────────────────────────────────────────┤
│  server       → URL del cluster Kubernetes                  │
│  namespace    → Namespace di destinazione                  │
│  name         → Nome del cluster (alternativa a server)    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     spec.syncPolicy                          │
├─────────────────────────────────────────────────────────────┤
│  automated    → Sincronizzazione automatica                 │
│  ├── prune    → Elimina risorse rimosse da Git              │
│  └── selfHeal → Correggi modifiche manuali                 │
│  syncOptions  → Opzioni aggiuntive                          │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 Creazione via CLI vs YAML

```bash
# Metodo CLI
argocd app create guestbook \
  --repo https://github.com/argoproj/argocd-example-apps.git \
  --path guestbook \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace guestbook

# Metodo YAML
kubectl apply -f application.yaml
```

---

## 2. Configurazione Source

### 2.1 Sorgente Git (Directory)

```yaml
spec:
  source:
    repoURL: https://github.com/myorg/myapp-config.git
    targetRevision: main  # Branch, tag, o commit
    path: overlays/production
    
    # Rilevamento automatico del tipo
    directory:
      recurse: true  # Includi sottodirectory
      jsonnet:
        extVars:
        - name: ENV
          value: production
```

### 2.2 Sorgente Helm

```yaml
spec:
  source:
    repoURL: https://charts.bitnami.com/bitnami
    chart: nginx-ingress
    targetRevision: "9.8.0"  # Versione del chart
    
    helm:
      # Valori inline
      values: |
        service:
          type: LoadBalancer
        replicaCount: 3
      
      # File values esterni (Git)
      valueFiles:
      - values.yaml
      - values-prod.yaml
      
      # Parametri singoli
      parameters:
      - name: service.type
        value: LoadBalancer
      - name: service.annotations.external-dns
        value: "true"
        forceString: true
      
      # Passare file come valori
      fileParameters:
      - name: customConfig
        path: config.yaml
```

**Gerarchia dei valori Helm:**

```text
Precedenza (dal più basso al più alto):

1. values.yaml nel chart
2. values.yaml da Git (se specificato)
3. File aggiuntivi da valueFiles (in ordine)
4. Parametri da parameters
5. Valori inline da 'values'
```

### 2.3 Sorgente Kustomize

```yaml
spec:
  source:
    repoURL: https://github.com/myorg/kustomize-configs.git
    targetRevision: main
    path: apps/myapp/overlays/production
    
    kustomize:
      # NamePrefix aggiunto a tutte le risorse
      namePrefix: prod-
      
      # Suffisso per i nomi
      nameSuffix: "-v1"
      
      # Namespace comune
      namespace: production
      
      # Immagini da sostituire
      images:
      - name: myapp
        newName: myregistry.io/myapp
        newTag: v1.2.3
      
      # Patch inline
      patches:
      - target:
          kind: Deployment
          name: myapp
        patch: |
          - op: replace
            path: /spec/replicas
            value: 5
      
      # Patch da file
      patchesJson6902:
      - target:
          version: v1
          kind: Deployment
          name: myapp
        path: patch.yaml
```

### 2.4 Multi-Source Applications

Disponibile da ArgoCD 2.6+, permette di combinare più sorgenti:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: multi-source-app
  namespace: argocd
spec:
  project: default
  sources:
  # Prima sorgente: applicazione base
  - repoURL: https://github.com/myorg/app-manifests.git
    path: base
    
  # Seconda sorgente: configurazione specifica
  - repoURL: https://github.com/myorg/app-configs.git
    path: overlays/production
    helm:
      values: |
        replicaCount: 5
        
  # Terza sorgente: chart Helm
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

## 3. Politiche di Sync

### 3.1 Sync Manuale

```yaml
spec:
  syncPolicy: null  # O omettere il campo
  
# In questo modo:
# - ArgoCD rileva OutOfSync
# - L'utente deve cliccare "Sync" o usare argocd app sync
# - Maggiore controllo sui deploy in produzione
```

### 3.2 Sync Automatico

```yaml
spec:
  syncPolicy:
    automated:
      prune: true      # Elimina risorse rimosse
      selfHeal: true   # Correggi modifiche manuali
    
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

**Opzioni di Sync:**

| Opzione | Descrizione |
|---------|-------------|
| CreateNamespace | Crea il namespace se non esiste |
| PruneLast | Prune dopo che le altre risorse sono sincronizzate |
| PrunePropagationPolicy | Policy per la propagazione del prune |
| Replace | Usa kubectl replace invece di apply |
| ServerSideApply | Usa Server-Side Apply |
| ApplyOutOfSyncOnly | Applica solo le risorse OutOfSync |

### 3.3 Self-Healing in Action

```text
Scenario: Qualcuno modifica manualmente un deployment

┌────────────────────────────────────────────────────────┐
│ Timeline                                               │
├────────────────────────────────────────────────────────┤
│ T+0min: Utente esegue                                  │
│   kubectl scale deployment nginx --replicas=100       │
│                                                        │
│ T+0min: ArgoCD rileva drift                           │
│   Status: OutOfSync (spec.replicas)                   │
│                                                        │
│ T+1min: Se selfHeal=true                              │
│   ArgoCD ripristina: replicas=3 (da Git)             │
│   Status: Synced, Healthy                             │
│                                                        │
│ T+1min: Se selfHeal=false                              │
│   Status: OutOfSync (richiede sync manuale)          │
└────────────────────────────────────────────────────────┘
```

---

## 4. Application Sets

### 4.1 Panoramica

ApplicationSet automatizza la creazione di multiple Application:

```text
ApplicationSet Controller
        │
        │ Genera
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

Genera applicazioni per ogni cluster registrato:

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

Genera da file/structure nel repository:

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

Combina due generatori:

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

## 5. Gestione Stato Applicazioni

### 5.1 Stati di Sync

```text
┌─────────────┐     git push      ┌─────────────┐
│   Git Repo  │ ───────────────► │    ArgoCD   │
└─────────────┘                   └──────┬──────┘
                                         │
                                         │ confronta
                                         ▼
                                 ┌───────────────┐
                                 │  Live State   │
                                 │   (Cluster)   │
                                 └───────────────┘

Sync Status:
├── Synced: Git == Live (tutto allineato)
├── OutOfSync: Git != Live (differenze)
│   ├── Modified: Risorsa modificata manualmente
│   ├── Added: Risorsa aggiunta nel cluster
│   └── Missing: Risorsa in Git non presente nel cluster
└── Unknown: Impossibile determinare
```

### 5.2 Stati di Health

```text
Health Status:

├── Healthy: La risorsa funziona correttamente
├── Progressing: Deployment in corso, in attesa di healthy
├── Degraded: Problemi rilevati, non funzionante
├── Suspended: Risorse in pausa (CronJob, Rollout paused)
├── Missing: Risorsa non trovata nel cluster
└── Unknown: Impossibile determinare lo stato

Esempi di health check:

Deployment: Healthy se spec.replicas == status.readyReplicas
Service: Healthy se clusterIP assegnato o endpoint pronti
Pod: Healthy se fase Running, Degraded se CrashLoopBackOff
PVC: Healthy se Bound, Progressing se Pending
```

### 5.3 Cronologia e Rollback

```bash
# Visualizzare la cronologia
argocd app history guestbook

# Output:
# REVISION  STATUS      AGE
# 1         Synced      1h
# 2         Synced      30m
# 3         Failed      5m

# Eseguire rollback
argocd app rollback guestbook 2

# Nota: rollback disabilita auto-sync
# Per riattivarlo:
argocd app set guestbook --sync-policy automated
```

---

## 6. Operazioni Comuni

### 6.1 Sync Manuale

```bash
# Sync base
argocd app sync guestbook

# Sync con opzioni
argocd app sync guestbook \
  --dry-run \
  --prune \
  --replace \
  --server-side

# Sync selettivo
argocd app sync guestbook \
  --resource deployment:guestbook-ui \
  --resource service:guestbook-ui
```

### 6.2 Diff e Debug

```bash
# Visualizzare differenze
argocd app diff guestbook

# Manifest generati
argocd app manifests guestbook

# Dettagli applicazione
argocd app get guestbook --refresh

# Risorse gestite
argocd app resources guestbook
```

### 6.3 Gestione Risorse

```bash
# Eliminare applicazione (cascade)
argocd app delete guestbook

# Eliminare senza cancellare risorse
argocd app delete guestbook --cascade=false

# Eliminare forzatamente risorse orfane
argocd app delete guestbook --yes
```

---

## 7. Applicazioni Multi-Cluster

### 7.1 Configurazione Destination

```yaml
# Destination per cluster registrato
spec:
  destination:
    name: staging-cluster  # Nome del cluster in ArgoCD
    namespace: production

# Alternativa: URL diretto
spec:
  destination:
    server: https://staging.example.com
    namespace: production
```

### 7.2 Pattern Multi-Cluster

```yaml
# Pattern 1: Applicazione centrale per multi-cluster
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
# Applicazione che deploya su cluster multipli via ApplicationSet
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

## 8. Riepilogo

In questo modulo abbiamo esplorato:

1. **Application CRD**: Struttura e campi fondamentali
2. **Source Config**: Git, Helm, Kustomize, multi-source
3. **Sync Policy**: Automatico, manuale, self-heal, prune
4. **ApplicationSet**: Generatori per multi-app e multi-cluster
5. **Operazioni**: Sync, rollback, diff, debug

### Prossimi Passi

Nel prossimo modulo approfondiremo sync hooks e waves per deploy orchestrati.

---

## Risorse Aggiuntive

- [ArgoCD Application CRD](https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/)
- [ApplicationSet Documentation](https://argo-cd.readthedocs.io/en/stable/operator-manual/applicationset/)
- [Helm Integration](https://argo-cd.readthedocs.io/en/stable/user-guide/helm/)
- [Kustomize Integration](https://argo-cd.readthedocs.io/en/stable/user-guide/kustomize/)
