# Module 01: GitOps Fundamentals

**Duration:** 2 hours  
**Level:** Foundation  
**Prerequisites:** Basic knowledge of Kubernetes, Git, and CI/CD

## Learning Objectives

By the end of this module, you will be able to:

1. Define GitOps and its four fundamental principles
2. Distinguish between pull and push deployment models
3. Compare popular GitOps tools (ArgoCD, Flux, Jenkins X)
4. Design a repository structure for GitOps
5. Evaluate differences between monorepo and multi-repo approaches

---

## 1. What is GitOps?

GitOps is an operational methodology for managing cloud-native infrastructure and applications. The term was coined by Weaveworks in 2017 and represents a natural evolution of DevOps practices.

### Formal Definition

> GitOps is an approach to continuous management of applications and infrastructure where Git repositories are the single source of truth for the system's desired state.

### Origin and Evolution

- **2017**: Weaveworks introduces the term "GitOps"
- **2018**: ArgoCD and Flux join the CNCF
- **2020**: GitOps becomes a de facto standard for Kubernetes
- **2022**: CNCF forms the GitOps Working Group to define standards

### Why GitOps?

```text
Traditional problems:
├── Scattered configuration (Wiki, databases, CI tools)
├── Lack of audit trail
├── Difficulty in rollbacks
├── Who did what and when?
└── Desired state drift

GitOps solutions:
├── Single source of truth in Git
├── Complete change history
├── Rollback = git revert
├── Git blame for accountability
└── Automatic reconciliation
```

---

## 2. The Four GitOps Principles

### 2.1 Infrastructure Declarative

**Definition:** The entire system (applications, configurations, infrastructure) is described declaratively.

```yaml
# IMPERATIVE approach (NOT GitOps)
kubectl create deployment nginx --image=nginx
kubectl scale deployment nginx --replicas=3

# DECLARATIVE approach (GitOps)
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

**Benefits of declarative approach:**

- Configuration is idempotent
- Easy to review in PRs
- Versionable
- Reusable

### 2.2 Versioned and Immutable

**Definition:** The desired state is stored in Git, providing a complete and immutable history.

```bash
# Every change is tracked
$ git log --oneline -5

a3b2c1d Increase replicas to 5 for production
d4e5f6g Update nginx image to 1.21
h7i8j9k Add staging environment
l0m1n2o Initial commit with base infrastructure
p3q4r5s Add monitoring stack
```

**Practical Implications:**

| Scenario | Traditional Solution | GitOps Solution |
|----------|----------------------|-----------------|
| Rollback | Manual script | `git revert` |
| Audit | Scattered logs | Git history |
| Who did X? | Multi-tool search | `git blame` |
| Compliance | Separate documentation | Git repository |

### 2.3 Automated

**Definition:** Approved changes are automatically applied to the system.

```text
Automated flow:

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

**Automation components:**

1. **Trigger**: Webhook, polling, or manual
2. **Fetch**: Retrieve desired state
3. **Diff**: Compare with current state
4. **Apply**: Apply differences
5. **Health**: Verify state

### 2.4 Continuously Reconciled

**Definition:** A software agent continuously verifies the actual state and compares it with the desired state.

```text
Reconciliation cycle (every 3 minutes ArgoCD default):

┌─────────────────────────────────────────────────────────┐
│                    Application Controller                │
└─────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │ Git State │   │ Live State│   │ Diff?    │
    │ (Desired) │   │ (Actual)  │   │          │
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
# Someone manually modifies the cluster
kubectl scale deployment nginx --replicas=100

# ArgoCD detects the deviation
# - OutOfSync detected within 3 minutes
# - If auto-sync is active, corrects automatically
# - If manual, reports the deviation

# ArgoCD logs:
time="2024-01-15T10:30:00Z" level=info msg="Detected drift: nginx Deployment"
time="2024-01-15T10:30:01Z" level=info msg="Reconciling: scaling back to 3"
time="2024-01-15T10:30:02Z" level=info msg="Sync completed successfully"
```

---

## 3. Deployment Models: Pull vs Push

### 3.1 Push Model

The push model uses an external CI/CD pipeline to apply changes.

```text
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌──────────┐
│ Developer│───>│   Git   │───>│CI Server │───>│ Cluster  │
└─────────┘    └─────────┘    └─────────┘    └──────────┘
                                   │
                                   │ kubectl apply
                                   │ (requires kubeconfig)
                                   ▼
                              ┌──────────┐
                              │Production│
                              └──────────┘
```

**Characteristics:**

- CI pipeline has direct cluster access
- Immediate deploys after merge
- Webhook triggers from repository
- Centralized configuration

**Advantages:**

- Immediate pipeline feedback
- More control over deploy sequence
- Simple integration with existing CI

**Disadvantages:**

- Requires cluster secrets in CI system
- Larger attack surface
- No automatic reconciliation
- Complex for multi-cluster

**Tools supporting push:**

- Jenkins with Kubernetes plugin
- GitLab CI with kubectl
- GitHub Actions with kubeconfig
- Spinnaker

### 3.2 Pull Model

The pull model uses an agent in the cluster that monitors the repository.

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

**Characteristics:**

- Agent runs inside the cluster
- Only outbound traffic required
- Automatic reconciliation
- No external cluster secrets

**Advantages:**

- Improved security (no external kubeconfig)
- Continuous reconciliation
- Automatic self-healing
- Native multi-cluster management

**Disadvantages:**

- Sync latency (default 3 min)
- Additional cluster resources
- More complex debugging

**Tools supporting pull:**

- ArgoCD (primary)
- Flux (primary)
- Rancher Fleet
- Kapitan

### 3.3 Detailed Comparison

| Aspect | Push Model | Pull Model |
|--------|------------|------------|
| Trigger | CI Pipeline | In-cluster agent |
| Credentials | In CI system | Only in cluster |
| Self-healing | No | Yes |
| Multi-cluster | Complex | Native |
| Latency | Seconds | Minutes |
| Security | Large surface | Reduced surface |
| Debugging | Pipeline logs | Controller logs |
| Tools | Jenkins, GitLab CI | ArgoCD, Flux |

### 3.4 Hybrid Model

Some organizations use a hybrid approach:

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

## 4. GitOps Tools

### 4.1 ArgoCD

**Overview:**

ArgoCD is a declarative GitOps tool native to Kubernetes, a CNCF graduated project.

```yaml
# ArgoCD Application example
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

**Key features:**

- Complete Web UI
- Multi-source applications
- Sync waves and hooks
- Projects for multi-tenancy
- Integrated SSO
- Visual audit trail

**Architecture:**

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

**Overview:**

Flux is a set of controllers that implement GitOps for Kubernetes, a CNCF graduated project.

```yaml
# Flux GitRepository example
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

**Flux Components:**

| Component | Function |
|-----------|----------|
| source-controller | Manages sources (Git, Helm, OCI) |
| kustomize-controller | Applies Kustomize |
| helm-controller | Manages Helm releases |
| notification-controller | Sends notifications |
| image-automation-controller | Updates images |

**Key features:**

- Modular architecture
- Image automation
- Helm OCI support
- Multi-tenancy
- Flexible notifications
- No built-in UI (use Weave GitOps)

### 4.3 Jenkins X

**Overview:**

Jenkins X combines CI/CD with GitOps for an integrated experience.

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

### 4.4 Tools Comparison

| Feature | ArgoCD | Flux | Jenkins X |
|---------|--------|------|-----------|
| UI | Complete | External plugin | Dashboard |
| Learning curve | Medium | High | High |
| Multi-cluster | Native | Native | Native |
| Helm | Yes | Yes | Yes |
| Kustomize | Yes | Yes | Yes |
| SSO | Integrated | External | Integrated |
| Image update | Image Updater | Native | Native |
| CNCF Status | Graduated | Graduated | Sandbox |

---

## 5. GitOps Repository Structure

### 5.1 Monorepo Approach

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

**Monorepo advantages:**

- Complete system visibility
- Simplified cross-team refactoring
- Unified CI/CD
- Simplified management

**Monorepo disadvantages:**

- Broad permissions for everyone
- Large repository (slow clone)
- More frequent conflicts
- CI can be slower

### 5.2 Multi-repo Approach

```text
# Separate repositories
├── app-source-repo/           # Application code
│   ├── src/
│   ├── tests/
│   └── Dockerfile
│
├── app-config-repo/           # GitOps configuration
│   ├── base/
│   └── overlays/
│       ├── dev/
│       ├── staging/
│       └── production/
│
├── infrastructure-repo/       # Infrastructure
│   ├── controllers/
│   └── configs/
│
└── cluster-config-repo/       # Cluster configuration
    ├── dev-cluster/
    └── prod-cluster/
```

**Multi-repo advantages:**

- Granular permissions per repository
- Autonomous teams
- Smaller repositories
- Specialized CI/CD

**Multi-repo disadvantages:**

- Fragmented visibility
- Cross-repo refactoring difficult
- Complex permission management
- Coordination required

### 5.3 Structure Best Practices

```yaml
# .gitignore for GitOps repositories
# Secrets
*.env
*.key
*.pem
secrets/

# Generated files
*.generated.yaml

# Editors
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
```

---

## 6. Security Considerations

### 6.1 Secret Management

```text
Secret options:

1. Sealed Secrets (Bitnami)
   ├── Public key in repository
   └── Decrypted only in cluster

2. SOPS (Mozilla)
   ├── Encrypt files with Age/GPG/KMS
   └── Integration with Flux

3. External Secrets Operator
   ├── Syncs from HashiCorp Vault
   └── Supports AWS Secrets Manager

4. Vault with ArgoCD
   ├── Sidecar plugin
   └── Dynamic injection
```

### 6.2 Branch Protection

```yaml
# Recommended branch protection rules

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

## 7. Summary

In this module we explored:

1. **GitOps Definition**: Operational methodology with Git as source of truth
2. **Four Principles**: Declarative, Versioned, Automated, Reconciled
3. **Deployment Models**: Pull (secure) vs Push (fast)
4. **Tools**: ArgoCD, Flux, Jenkins X with their characteristics
5. **Repository Structure**: Monorepo vs Multi-repo

### Next Steps

In the next module, we will install and configure ArgoCD on a Kubernetes cluster.

---

## Self-Assessment Questions

1. Which GitOps principle ensures manual changes are reverted?
2. Which deployment model is more secure for production environments?
3. When would you prefer Flux over ArgoCD?
4. What are the trade-offs between monorepo and multi-repo?

---

## Additional Resources

- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [Flux Documentation](https://fluxcd.io/)
- [GitOps Working Group](https://gitops.work/)
- [OpenGitOps Principles](https://opengitops.dev/)
