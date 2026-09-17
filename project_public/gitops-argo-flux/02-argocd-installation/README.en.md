# Module 02: ArgoCD Installation

**Duration:** 2.5 hours  
**Level:** Intermediate  
**Prerequisites:** Working Kubernetes cluster, kubectl configured

## Learning Objectives

By the end of this module, you will be able to:

1. Describe the ArgoCD architecture and its components
2. Install ArgoCD on a Kubernetes cluster
3. Configure the ArgoCD CLI
4. Access the Web UI and configure authentication
5. Set up RBAC for users and teams

---

## 1. ArgoCD Architecture

### 1.1 Component Overview

ArgoCD consists of several components working together to implement GitOps:

```text
┌─────────────────────────────────────────────────────────────────────┐
│                        ArgoCD Architecture                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│    ┌─────────────────┐         ┌─────────────────┐                │
│    │   Web UI        │         │    CLI          │                │
│    │   (Browser)     │         │  (argocd)       │                │
│    └────────┬────────┘         └────────┬────────┘                │
│             │                           │                          │
│             └───────────────┬───────────┘                          │
│                             │                                      │
│                    ┌────────▼────────┐                            │
│                    │   API Server     │                            │
│                    │  (argocd-server) │                            │
│                    └────────┬────────┘                            │
│                             │                                      │
│         ┌───────────────────┼───────────────────┐                 │
│         │                   │                   │                  │
│  ┌──────▼─────┐     ┌──────▼─────┐     ┌──────▼─────┐            │
│  │ Repo Server│     │    Dex     │     │Application │            │
│  │            │     │   (SSO)    │     │Controller  │            │
│  └──────┬─────┘     └────────────┘     └──────┬─────┘            │
│         │                                      │                  │
│         │                                      │                  │
│         │        ┌──────────────────┐          │                  │
│         │        │   Redis         │          │                  │
│         │        │   (Cache)       │          │                  │
│         │        └──────────────────┘          │                  │
│         │                                      │                  │
│         └──────────────────┬───────────────────┘                  │
│                            │                                        │
│                    ┌───────▼────────┐                              │
│                    │  Kubernetes   │                              │
│                    │    Cluster    │                              │
│                    └───────────────┘                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Component Descriptions

#### API Server (argocd-server)

The API server is the central component exposing the API for Web UI and CLI.

```yaml
# Example API Server Pod resource
apiVersion: v1
kind: Pod
metadata:
  name: argocd-server-xxx
  namespace: argocd
spec:
  containers:
  - name: argocd-server
    image: quay.io/argoproj/argocd:v2.8.0
    ports:
    - containerPort: 8080
      name: http
    - containerPort: 8083
      name: grpc
    command:
    - argocd-server
    - --staticassets
    - /shared/app
    - --redis
    - argocd-redis:6379
```

**Responsibilities:**

- Authentication and authorization
- REST/gRPC API request handling
- Web UI serving
- WebSocket for real-time updates

**Ports used:**

| Port | Protocol | Usage |
|------|----------|-------|
| 8080 | HTTP | REST API and Web UI |
| 8083 | gRPC | CLI communication |

#### Repo Server (argocd-repo-server)

The Repo Server handles communication with Git repositories.

```text
Manifest retrieval flow:

Application Controller
        │
        │ 1. Request manifest
        ▼
   Repo Server
        │
        │ 2. Clone repository
        ▼
   Git Repository
        │
        │ 3. Manifest files
        ▼
   Repo Server
        │
        │ 4. Template rendering (Helm/Kustomize)
        │
        │ 5. Manifest YAML
        ▼
Application Controller
```

**Responsibilities:**

- Git repository cloning
- Repository file caching
- Template rendering (Helm, Kustomize, Jsonnet)
- Final manifest generation

**Cache:**

```bash
# Cache stored in memory or on disk
# Cache configuration in argocd-cm ConfigMap
data:
  repositories: |
    - type: git
      url: https://github.com/org/repo.git
      cacheExpirationMinutes: 60
```

#### Application Controller

The Application Controller is ArgoCD's heart, responsible for reconciliation.

```text
Reconciliation cycle:

┌─────────────────────────────────────────────┐
│          Application Controller             │
│                                             │
│  1. Fetch Git State (via Repo Server)       │
│           │                                 │
│           ▼                                 │
│  2. Fetch Live State (from K8s API)        │
│           │                                 │
│           ▼                                 │
│  3. Compare States                         │
│           │                                 │
│           ├─── In Sync ───► Update Status  │
│           │                                 │
│           └─── Out of Sync ───► If Auto-Sync│
│                    │                        │
│                    ▼                        │
│              Apply Changes                  │
│                                             │
└─────────────────────────────────────────────┘
```

**Responsibilities:**

- Continuous application monitoring
- Drift detection
- Automatic sync execution
- Health status calculation

**Configuration:**

```yaml
# argocd-cm ConfigMap - Sync frequency
data:
  timeout.reconciliation: 180s  # Default: 3 minutes
```

#### Dex (SSO)

Dex is an integrated OIDC provider for SSO authentication.

```yaml
# ConfigMap for Dex
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-dex-server-cm
  namespace: argocd
data:
  dex.config: |
    connectors:
    - type: github
      name: GitHub
      config:
        clientID: your-client-id
        clientSecret: $dex.github.clientSecret
        orgs:
        - name: my-org
```

#### Redis

Redis is used for session caching and state.

```bash
# Verify Redis connection
kubectl exec -n argocd deployment/argocd-redis -- redis-cli ping
# Output: PONG
```

---

## 2. ArgoCD Installation

### 2.1 Prerequisites

```bash
# Check Kubernetes version (minimum 1.23)
kubectl version --short

# Check available resources
kubectl describe nodes | grep -A 5 "Allocated resources"
```

### 2.2 Installation with Manifests

```bash
# 1. Create the namespace
kubectl create namespace argocd

# 2. Apply manifests
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# 3. Verify installation
kubectl get pods -n argocd

# Expected output:
# NAME                                                READY   STATUS    RESTARTS   AGE
# argocd-application-controller-0                     1/1     Running   0          2m
# argocd-applicationset-controller-xxx               1/1     Running   0          2m
# argocd-dex-server-xxx                               1/1     Running   0          2m
# argocd-notifications-controller-xxx                 1/1     Running   0          2m
# argocd-redis-xxx                                    1/1     Running   0          2m
# argocd-repo-server-xxx                              1/1     Running   0          2m
# argocd-server-xxx                                   1/1     Running   0          2m
```

### 2.3 Installation with Helm

```bash
# 1. Add Helm repository
helm repo add argo https://argoproj.github.io/argo-helm
helm repo update

# 2. Install with base configuration
helm install argocd argo/argo-cd \
  --namespace argocd \
  --create-namespace \
  --set server.extraArgs={--insecure}

# 3. Verify
helm list -n argocd
```

**Common values.yaml:**

```yaml
# values.yaml for production installation
global:
  domain: argocd.example.com

server:
  ingress:
    enabled: true
    annotations:
      cert-manager.io/cluster-issuer: letsencrypt-prod
    tls:
    - hosts:
      - argocd.example.com
      secretName: argocd-tls

  config:
    url: https://argocd.example.com
    admin.enabled: "true"

configs:
  secret:
    argocdServerAdminPassword: "$2a$10$..."  # bcrypt hash
```

### 2.4 Installation Verification

```bash
# Check installed CRDs
kubectl get crd | grep argoproj

# Expected output:
# applications.argoproj.io                           2024-01-15T10:00:00Z
# applicationsets.argoproj.io                       2024-01-15T10:00:00Z
# appprojects.argoproj.io                            2024-01-15T10:00:00Z

# Check services
kubectl get svc -n argocd

# Ensure all pods are Running
kubectl get pods -n argocd -w
```

---

## 3. CLI Configuration

### 3.1 CLI Installation

```bash
# macOS
brew install argocd

# Linux (amd64)
curl -sSL -o argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
chmod +x argocd
sudo mv argocd /usr/local/bin/argocd

# Verify
argocd version --client
```

### 3.2 Accessing ArgoCD

```bash
# 1. Retrieve initial password
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d

# Output: xxxxx-xxxxx-xxxxx

# 2. Run port-forward
kubectl port-forward svc/argocd-server -n argocd 8080:443 &

# 3. Login
argocd login localhost:8080 \
  --username admin \
  --password <password> \
  --insecure

# Output:
# 'admin:login' logged in successfully
# Context 'localhost:8080' updated
```

### 3.3 Context Configuration

```bash
# List configured contexts
argocd context

# Switch context
argocd context localhost:8080

# Verify connection
argocd cluster list
```

---

## 4. Web UI Overview

### 4.1 Dashboard Access

```bash
# Port-forward or access via Ingress
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Open browser: https://localhost:8080
```

### 4.2 UI Navigation

```text
Main Dashboard:

┌─────────────────────────────────────────────────────────────┐
│  ArgoCD                                    [admin ▼] [?]    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    Applications                        │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐               │  │
│  │  │guestbook│  │ nginx   │  │ app-3   │               │  │
│  │  │  Synced │  │OutOfSync│  │ Synced  │               │  │
│  │  │Healthy  │  │Degraded │  │Healthy  │               │  │
│  │  └─────────┘  └─────────┘  └─────────┘               │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Recent Activity                                       │  │
│  │ • nginx synced successfully (2 min ago)              │  │
│  │ • New app guestbook created (5 min ago)              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Application States

```text
Status Legend:

Sync Status:
├── Synced: Cluster matches Git
├── OutOfSync: Differences between Git and cluster
└── Unknown: Unable to determine state

Health Status:
├── Healthy: All resources working
├── Progressing: Deploy in progress
├── Degraded: Problems detected
├── Suspended: Resources paused
└── Missing: Resources not found
```

---

## 5. RBAC Configuration

### 5.1 RBAC Structure

```text
ArgoCD RBAC:

┌─────────────────────────────────────────────────────────┐
│                      Policy CSV                          │
│  p, <subject>, <object>, <action>, <target>, <effect>  │
└─────────────────────────────────────────────────────────┘
            │
            ├─── Subject: Users, Groups, Roles
            ├─── Object: applications, projects, clusters, repositories
            ├─── Action: get, create, update, delete, sync, override
            ├─── Target: */*, namespace/*, specific-resource
            └─── Effect: allow, deny
```

### 5.2 Predefined Roles

| Role | Permissions |
|------|-------------|
| role:readonly | Full viewing |
| role:operator | Sync, rollback, operations |
| role:admin | Full control |

### 5.3 Policy Configuration

```yaml
# ConfigMap argocd-rbac-cm
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-rbac-cm
  namespace: argocd
data:
  policy.csv: |
    # Custom role for developers
    p, role:developer, applications, get, */*, allow
    p, role:developer, applications, sync, */*, allow
    p, role:developer, applications, create, */*, deny
    
    # Group to role assignments
    g, dev-team, role:developer
    g, ops-team, role:operator
    g, admins, role:admin
    
    # Project restriction
    p, role:frontend-dev, applications, *, frontend/*, allow
    g, frontend-team, role:frontend-dev
    
  policy.default: role:readonly
```

### 5.4 User Management

```bash
# Create new user (requires SSO)
argocd account create-user --username developer

# List users
argocd account list-users

# Verify permissions
argocd account can-i sync applications '*'
```

---

## 6. Multi-Cluster Connection

### 6.1 Cluster Registration

```bash
# List available contexts
kubectl config get-contexts

# Add cluster
argocd cluster add <context-name> \
  --name staging \
  --namespace argocd

# Verify
argocd cluster list

# Output:
# SERVER                          NAME      VERSION  STATUS
# https://kubernetes.default.svc  in-cluster          1.28   Successful
# https://staging.example.com     staging    1.27     Successful
```

### 6.2 Cluster Secret Management

```bash
# Cluster secrets are stored as Secrets
kubectl get secrets -n argocd | grep cluster

# Secret content
kubectl get secret cluster-staging-xxx -n argocd -o yaml
```

---

## 7. Troubleshooting

### 7.1 Common Issues

```bash
# Pods not starting
kubectl describe pod <pod-name> -n argocd
kubectl logs <pod-name> -n argocd

# Repository connection issues
argocd repo list
argocd repo get <repo-url>

# Failed syncs
argocd app get <app-name>
argocd app history <app-name>
```

### 7.2 Useful Logs

```bash
# Controller logs
kubectl logs -n argocd deployment/argocd-application-controller -f

# Repo server logs
kubectl logs -n argocd deployment/argocd-repo-server -f

# API server logs
kubectl logs -n argocd deployment/argocd-server -f
```

---

## 8. Summary

In this module we explored:

1. **Architecture**: The 5 main components and their responsibilities
2. **Installation**: Manifest and Helm methods with recommended configurations
3. **CLI**: Installation, login, and context configuration
4. **Web UI**: Navigation and state interpretation
5. **RBAC**: Permission and role configuration

### Next Steps

In the next module we will dive into ArgoCD application creation and management.

---

## Additional Resources

- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [ArgoCD Operator Manual](https://argo-cd.readthedocs.io/en/stable/operator-manual/)
- [ArgoCD Security](https://argo-cd.readthedocs.io/en/stable/operator-manual/security/)
