# Modulo 01: Fondamenti di GitOps

**Durata:** 2 ore  
**Livello:** Base  
**Prerequisiti:** Conoscenza base di Kubernetes, Git, e CI/CD

## Obiettivi di Apprendimento

Al termine di questo modulo, sarai in grado di:

1. Definire cos'è GitOps e i suoi quattro principi fondamentali
2. Distinguere tra modelli di deployment pull e push
3. Confrontare gli strumenti GitOps più diffusi (ArgoCD, Flux, Jenkins X)
4. Progettare la struttura di un repository per GitOps
5. Valutare le differenze tra approcci monorepo e multi-repo

---

## 1. Cos'è GitOps?

GitOps è una metodologia operativa per la gestione di infrastrutture e applicazioni cloud-native. Il termine è stato coniato da Weaveworks nel 2017 e rappresenta un'evoluzione naturale delle pratiche DevOps.

### Definizione Formale

> GitOps è un approccio alla gestione continua delle applicazioni e dell'infrastruttura in cui i repository Git sono la fonte unica di verità per lo stato desiderato del sistema.

### Origine ed Evoluzione

- **2017**: Weaveworks introduce il termine "GitOps"
- **2018**: ArgoCD e Flux entrano a far parte della CNCF
- **2020**: GitOps diventa uno standard de facto per Kubernetes
- **2022**: CNCF forma il GitOps Working Group per definire gli standard

### Perché GitOps?

```text
Problemi tradizionali:
├── Configurazione sparsa (Wiki, database, CI tools)
├── Mancanza di audit trail
├── Difficoltà nei rollback
├── Chi ha fatto cosa e quando?
└── Drift dello stato desiderato

Soluzioni GitOps:
├── Single source of truth in Git
├── Cronologia completa delle modifiche
├── Rollback = git revert
├── Git blame per responsabilità
└── Riconciliazione automatica
```

---

## 2. I Quattro Principi di GitOps

### 2.1 Infrastructure Declarative (Dichiarativo)

**Definizione:** L'intero sistema (applicazioni, configurazioni, infrastruttura) è descritto in modo dichiarativo.

```yaml
# Approccio IMPERATIVO (NON GitOps)
kubectl create deployment nginx --image=nginx
kubectl scale deployment nginx --replicas=3

# Approccio DICHIARATIVO (GitOps)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    spec:
      containers:
      - name: nginx
        image: nginx:1.21
```

**Vantaggi dell'approccio dichiarativo:**

- La configurazione è idempotente
- Facile da revisionare in PR
- Versionabile
- Riutilizzabile

### 2.2 Versioned and Immutable (Versionato)

**Definizione:** Lo stato desiderato è memorizzato in Git, fornendo una cronologia completa e immutabile.

```bash
# Ogni cambiamento è tracciato
$ git log --oneline -5

a3b2c1d Increase replicas to 5 for production
d4e5f6g Update nginx image to 1.21
h7i8j9k Add staging environment
l0m1n2o Initial commit with base infrastructure
p3q4r5s Add monitoring stack
```

**Implicazioni pratiche:**

| Scenario | Soluzione Tradizionale | Soluzione GitOps |
|----------|----------------------|------------------|
| Rollback | Script manuale | `git revert` |
| Audit | Log sparsi | Git history |
| Chi ha fatto X? | Ricerca multi-tool | `git blame` |
| Compliance | Documentazione separata | Repository Git |

### 2.3 Automated (Automatizzato)

**Definizione:** Le modifiche approvate vengono automaticamente applicate al sistema.

```text
Flusso automatizzato:

Developer          Git Repository         GitOps Agent
    │                    │                       │
    │ git push          │                       │
    │──────────────────>│                       │
    │                    │   webhook/poll       │
    │                    │<─────────────────────│
    │                    │   fetch changes      │
    │                    │<─────────────────────│
    │                    │                       │
    │                    │      apply changes    │
    │                    │───────────────────────> Cluster
    │                    │                       │
```

**Componenti dell'automazione:**

1. **Trigger**: Webhook, polling, o manuale
2. **Fetch**: Recupero dello stato desiderato
3. **Diff**: Confronto con lo stato attuale
4. **Apply**: Applicazione delle differenze
5. **Health**: Verifica dello stato

### 2.4 Continuously Reconciled (Riconciliazione Continua)

**Definizione:** Un agente software verifica continuamente lo stato effettivo e lo confronta con lo stato desiderato.

```text
Ciclo di riconciliazione (ogni 3 minuti default ArgoCD):

┌─────────────────────────────────────────────────────────┐
│                    Application Controller                │
└─────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │ Git State│   │ Live State│   │ Diff?    │
    │ (Desired)│   │ (Actual)  │   │          │
    └──────────┘   └──────────┘   └──────────┘
          │               │               │
          └───────────────┴───────────────┘
                          │
                          ▼
                  ┌──────────────┐
                  │  Sync Needed?│
                  └──────────────┘
                          │
            ┌─────────────┴─────────────┐
            ▼                           ▼
    ┌──────────────┐           ┌──────────────┐
    │    Sync      │           │   Healthy    │
    │  (if drift)  │           │              │
    └──────────────┘           └──────────────┘
```

**Self-healing in action:**

```bash
# Qualcuno modifica manualmente il cluster
kubectl scale deployment nginx --replicas=100

# ArgoCD rileva la deviazione
# - OutOfSync rilevato entro 3 minuti
# - Se auto-sync è attivo, corregge automaticamente
# - Se manuale, segnala la deviazione

# Log ArgoCD:
time="2024-01-15T10:30:00Z" level=info msg="Detected drift: nginx Deployment"
time="2024-01-15T10:30:01Z" level=info msg="Reconciling: scaling back to 3"
time="2024-01-15T10:30:02Z" level=info msg="Sync completed successfully"
```

---

## 3. Modelli di Deployment: Pull vs Push

### 3.1 Modello Push

Il modello push utilizza una pipeline CI/CD esterna per applicare le modifiche.

```text
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌──────────┐
│ Developer│───>│   Git   │───>│CI Server │───>│ Cluster  │
└─────────┘    └─────────┘    └─────────┘    └──────────┘
                                   │
                                   │ kubectl apply
                                   │ (richiede kubeconfig)
                                   ▼
                              ┌──────────┐
                              │Production│
                              └──────────┘
```

**Caratteristiche:**

- La pipeline CI ha accesso diretto al cluster
- Deploy immediati dopo il merge
- Trigger webhook dal repository
- Configurazione centralizzata

**Vantaggi:**

- Feedback immediato sulla pipeline
- Maggiore controllo sulla sequenza di deploy
- Integrazione semplice con CI esistente

**Svantaggi:**

- Richiede segreti cluster nel sistema CI
- Superficie di attacco più ampia
- Nessuna riconciliazione automatica
- Complesso per multi-cluster

**Strumenti che supportano il push:**

- Jenkins con plugin Kubernetes
- GitLab CI con kubectl
- GitHub Actions con kubeconfig
- Spinnaker

### 3.2 Modello Pull

Il modello pull utilizza un agente nel cluster che monitora il repository.

```text
┌─────────┐    ┌─────────┐                  ┌──────────┐
│ Developer│───>│   Git   │                  │ Cluster  │
└─────────┘    └─────────┘                  └──────────┘
                    │                             │
                    │  poll/webhook (outbound)    │
                    │<────────────────────────────│
                    │                             │
                    │  manifest (outbound)        │
                    │<────────────────────────────│
                    │                             │
                              ┌──────────────┐
                              │ GitOps Agent │
                              │  (ArgoCD/    │
                              │   Flux)      │
                              └──────────────┘
```

**Caratteristiche:**

- L'agente gira all'interno del cluster
- Solo traffico in uscita richiesto
- Riconciliazione automatica
- Nessun segreto cluster esterno

**Vantaggi:**

- Sicurezza migliorata (nessun kubeconfig esterno)
- Riconciliazione continua
- Self-healing automatico
- Gestione multi-cluster nativa

**Svantaggi:**

- Latenza di sincronizzazione (default 3 min)
- Risorse cluster aggiuntive
- Debug più complesso

**Strumenti che supportano il pull:**

- ArgoCD (primario)
- Flux (primario)
- Rancher Fleet
- Kapitan

### 3.3 Confronto Dettagliato

| Aspetto | Push Model | Pull Model |
|---------|------------|------------|
| Trigger | CI Pipeline | In-cluster agent |
| Credenziali | Nel sistema CI | Solo nel cluster |
| Self-healing | No | Si |
| Multi-cluster | Complesso | Nativo |
| Latenza | Secondi | Minuti |
| Sicurezza | Superficie ampia | Superficie ridotta |
| Debug | Pipeline logs | Controller logs |
| Tools | Jenkins, GitLab CI | ArgoCD, Flux |

### 3.4 Modello Ibrido

Alcune organizzazioni utilizzano un approccio ibrido:

```text
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌──────────┐
│ Developer│───>│   Git   │───>│ CI Build │───>│ Registry │
└─────────┘    └─────────┘    └─────────┘    └──────────┘
                    │                              │
                    │                              │
                    │                              │
                    ▼                              │
               ┌──────────┐                        │
               │ ArgoCD   │<───────────────────────┘
               │ (pull)   │   Image notification
               └──────────┘
```

---

## 4. Strumenti GitOps

### 4.1 ArgoCD

**Panoramica:**

ArgoCD è uno strumento GitOps dichiarativo nativo di Kubernetes, progetto graduato CNCF.

```yaml
# Esempio applicazione ArgoCD
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: guestbook
  namespace: argocd
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

**Caratteristiche chiave:**

- Web UI completa
- Applicazioni multi-source
- Sync waves e hooks
- Progetti per multi-tenancy
- SSO integrato
- Audit trail visuale

**Architettura:**

```text
┌─────────────────────────────────────────────────────────┐
│                      ArgoCD Components                   │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ API Server   │  │ Repo Server  │  │ Application  │  │
│  │              │  │              │  │ Controller   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                  │                  │         │
│         └──────────────────┴──────────────────┘         │
│                            │                            │
│                     ┌──────────┐                        │
│                     │   Dex    │ (SSO)                  │
│                     └──────────┘                        │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Flux

**Panoramica:**

Flux è un insieme di controller che implementano GitOps per Kubernetes, progetto graduato CNCF.

```yaml
# Esempio Flux GitRepository
apiVersion: source.toolkit.fluxcd.io/v1beta2
kind: GitRepository
metadata:
  name: podinfo
  namespace: flux-system
spec:
  interval: 1m
  url: https://github.com/stefanprodan/podinfo
  ref:
    branch: master
---
apiVersion: kustomize.toolkit.fluxcd.io/v1beta2
kind: Kustomization
metadata:
  name: podinfo
  namespace: flux-system
spec:
  interval: 5m
  path: ./deploy/overlays/dev
  sourceRef:
    kind: GitRepository
    name: podinfo
  prune: true
```

**Componenti Flux:**

| Componente | Funzione |
|------------|----------|
| source-controller | Gestisce sorgenti (Git, Helm, OCI) |
| kustomize-controller | Applica Kustomize |
| helm-controller | Gestisce Helm releases |
| notification-controller | Invia notifiche |
| image-automation-controller | Aggiorna immagini |

**Caratteristiche chiave:**

- Architettura modulare
- Image automation
- Helm OCI support
- Multi-tenancy
- Notifiche flessibili
- Nessuna UI (usare Weave GitOps)

### 4.3 Jenkins X

**Panoramica:**

Jenkins X combina CI/CD con GitOps per un'esperienza integrata.

```text
┌─────────────────────────────────────────────────────────┐
│                    Jenkins X Architecture                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌─────────┐    ┌─────────┐    ┌─────────────────┐    │
│   │Lighthouse│    │ Tekton  │    │    GitOps       │    │
│   │  (CI)    │───>│(Pipelines)│───>│   Operator     │    │
│   └─────────┘    └─────────┘    └─────────────────┘    │
│        │                               │               │
│        │                               │               │
│        ▼                               ▼               │
│   ┌─────────┐                    ┌───────────┐        │
│   │   Git   │                    │  Cluster  │        │
│   │  Repos  │                    │           │        │
│   └─────────┘                    └───────────┘        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 4.4 Confronto Strumenti

| Caratteristica | ArgoCD | Flux | Jenkins X |
|----------------|--------|------|-----------|
| UI | Completa | Plugin esterno | Dashboard |
| Learning curve | Media | Alta | Alta |
| Multi-cluster | Nativo | Nativo | Nativo |
| Helm | Si | Si | Si |
| Kustomize | Si | Si | Si |
| SSO | Integrato | Esterno | Integrato |
| Image update | Image Updater | Nativo | Nativo |
| CNCF Status | Graduated | Graduated | Sandbox |

---

## 5. Struttura del Repository GitOps

### 5.1 Approccio Monorepo

```text
gitops-monorepo/
├── apps/
│   ├── base/
│   │   └── nginx/
│   │       ├── deployment.yaml
│   │       └── service.yaml
│   └── overlays/
│       ├── dev/
│       │   └── kustomization.yaml
│       ├── staging/
│       │   └── kustomization.yaml
│       └── production/
│           └── kustomization.yaml
├── infrastructure/
│   ├── controllers/
│   │   ├── argocd/
│   │   └── cert-manager/
│   └── configs/
│       └── cluster-policies/
├── clusters/
│   ├── dev-cluster/
│   │   └── kustomization.yaml
│   └── prod-cluster/
│       └── kustomization.yaml
└── README.md
```

**Vantaggi monorepo:**

- Visibilità completa del sistema
- Refactoring cross-team facilitato
- CI/CD unificato
- Gestione semplificata

**Svantaggi monorepo:**

- Permessi ampi per tutti
- Repository grande (clone lento)
- Conflitti più frequenti
- CI può essere più lento

### 5.2 Approccio Multi-repo

```text
# Repository separati
├── app-source-repo/           # Codice applicativo
│   ├── src/
│   ├── tests/
│   └── Dockerfile
│
├── app-config-repo/           # Configurazione GitOps
│   ├── base/
│   └── overlays/
│       ├── dev/
│       ├── staging/
│       └── production/
│
├── infrastructure-repo/       # Infrastruttura
│   ├── controllers/
│   └── configs/
│
└── cluster-config-repo/       # Configurazione cluster
    ├── dev-cluster/
    └── prod-cluster/
```

**Vantaggi multi-repo:**

- Permessi granulari per repository
- Team autonomi
- Repository più piccoli
- CI/CD specializzato

**Svantaggi multi-repo:**

- Visibilità frammentata
- Refactoring cross-repo difficile
- Gestione permessi complessa
- Coordinamento richiesto

### 5.3 Best Practices per la Struttura

```yaml
# .gitignore per repository GitOps
# Segreti
*.env
*.key
*.pem
secrets/

# File generati
*.generated.yaml

# Editor
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
```

---

## 6. Considerazioni sulla Sicurezza

### 6.1 Gestione dei Segreti

```text
Opzioni per i segreti:

1. Sealed Secrets (Bitnami)
   ├── Chiave pubblica nel repository
   └── Decriptato solo nel cluster

2. SOPS (Mozilla)
   ├── Cripta file con Age/GPG/KMS
   └── Integrazione con Flux

3. External Secrets Operator
   ├── Sincronizza da HashiCorp Vault
   └── Supporta AWS Secrets Manager

4. Vault con ArgoCD
   ├── Plugin di sidecar
   └── Iniezione dinamica
```

### 6.2 Branch Protection

```yaml
# Regole consigliate per branch protection

main:
  protected: true
  require_pull_request: true
  required_approving_review_count: 1
  required_status_checks:
    - lint
    - validate-manifests
  enforce_admins: true
  allow_force_pushes: false
  allow_deletions: false
```

---

## 7. Riepilogo

In questo modulo abbiamo esplorato:

1. **Definizione di GitOps**: Metodologia operativa con Git come fonte di verità
2. **Quattro principi**: Dichiarativo, Versionato, Automatizzato, Riconciliato
3. **Modelli di deployment**: Pull (sicuro) vs Push (veloce)
4. **Strumenti**: ArgoCD, Flux, Jenkins X con le loro caratteristiche
5. **Struttura repository**: Monorepo vs Multi-repo

### Prossimi Passi

Nel prossimo modulo installeremo e configureremo ArgoCD su un cluster Kubernetes.

---

## Domande di Autovalutazione

1. Quale principio GitOps garantisce che le modifiche manuali vengano annullate?
2. Quale modello di deployment è più sicuro per ambienti production?
3. Quando preferiresti Flux rispetto ad ArgoCD?
4. Quali sono i trade-off tra monorepo e multi-repo?

---

## Risorse Aggiuntive

- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [Flux Documentation](https://fluxcd.io/)
- [GitOps Working Group](https://gitops.work/)
- [OpenGitOps Principles](https://opengitops.dev/)
