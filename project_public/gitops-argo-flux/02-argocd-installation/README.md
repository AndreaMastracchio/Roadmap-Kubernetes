# Modulo 02: Installazione di ArgoCD

**Durata:** 2.5 ore  
**Livello:** Intermedio  
**Prerequisiti:** Cluster Kubernetes funzionante, kubectl configurato

## Obiettivi di Apprendimento

Al termine di questo modulo, sarai in grado di:

1. Descrivere l'architettura di ArgoCD e i suoi componenti
2. Installare ArgoCD su un cluster Kubernetes
3. Configurare la CLI di ArgoCD
4. Accedere alla Web UI e configurare l'autenticazione
5. Impostare RBAC per utenti e team

---

## 1. Architettura di ArgoCD

### 1.1 Panoramica dei Componenti

ArgoCD è composto da diversi componenti che lavorano insieme per implementare GitOps:

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

### 1.2 Descrizione dei Componenti

#### API Server (argocd-server)

Il server API è il componente centrale che espone l'API per Web UI e CLI.

```yaml
# Esempio di risorsa Pod del API Server
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

**Responsabilità:**

- Autenticazione e autorizzazione
- Gestione delle richieste API REST/gRPC
- Web UI serving
- Websocket per aggiornamenti real-time

**Porte utilizzate:**

| Porta | Protocollo | Uso |
|-------|------------|-----|
| 8080 | HTTP | API REST e Web UI |
| 8083 | gRPC | Comunicazione CLI |

#### Repo Server (argocd-repo-server)

Il Repo Server gestisce la comunicazione con i repository Git.

```text
Flusso di recupero manifest:

Application Controller
        │
        │ 1. Richiede manifest
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

**Responsabilità:**

- Clone dei repository Git
- Cache dei file del repository
- Rendering di template (Helm, Kustomize, Jsonnet)
- Generazione dei manifest finali

**Cache:**

```bash
# La cache viene memorizzata in memoria o su disco
# Configurazione cache in argocd-cm ConfigMap
data:
  repositories: |
    - type: git
      url: https://github.com/org/repo.git
      cacheExpirationMinutes: 60
```

#### Application Controller

L'Application Controller è il cuore di ArgoCD, responsabile della riconciliazione.

```text
Ciclo di riconciliazione:

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

**Responsabilità:**

- Monitoraggio continuo delle applicazioni
- Rilevamento delle deviazioni (drift)
- Esecuzione delle sincronizzazioni automatiche
- Calcolo dello stato di salute

**Configurazione:**

```yaml
# argocd-cm ConfigMap - Frequenza di sync
data:
  timeout.reconciliation: 180s  # Default: 3 minuti
```

#### Dex (SSO)

Dex è un provider OIDC integrato per l'autenticazione SSO.

```yaml
# ConfigMap per Dex
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

Redis viene utilizzato per la cache delle sessioni e lo stato.

```bash
# Verifica connessione Redis
kubectl exec -n argocd deployment/argocd-redis -- redis-cli ping
# Output: PONG
```

---

## 2. Installazione di ArgoCD

### 2.1 Prerequisiti

```bash
# Verifica versione Kubernetes (minimo 1.23)
kubectl version --short

# Verifica risorse disponibili
kubectl describe nodes | grep -A 5 "Allocated resources"
```

### 2.2 Installazione con Manifest

```bash
# 1. Creare il namespace
kubectl create namespace argocd

# 2. Applicare i manifest
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# 3. Verificare l'installazione
kubectl get pods -n argocd

# Output atteso:
# NAME                                                READY   STATUS    RESTARTS   AGE
# argocd-application-controller-0                     1/1     Running   0          2m
# argocd-applicationset-controller-xxx               1/1     Running   0          2m
# argocd-dex-server-xxx                               1/1     Running   0          2m
# argocd-notifications-controller-xxx                 1/1     Running   0          2m
# argocd-redis-xxx                                    1/1     Running   0          2m
# argocd-repo-server-xxx                              1/1     Running   0          2m
# argocd-server-xxx                                   1/1     Running   0          2m
```

### 2.3 Installazione con Helm

```bash
# 1. Aggiungere il repository Helm
helm repo add argo https://argoproj.github.io/argo-helm
helm repo update

# 2. Installare con configurazione base
helm install argocd argo/argo-cd \
  --namespace argocd \
  --create-namespace \
  --set server.extraArgs={--insecure}

# 3. Verificare
helm list -n argocd
```

**Values.yaml comune:**

```yaml
# values.yaml per installazione produzione
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

### 2.4 Verifica dell'Installazione

```bash
# Verificare le CRD installate
kubectl get crd | grep argoproj

# Output atteso:
# applications.argoproj.io                           2024-01-15T10:00:00Z
# applicationsets.argoproj.io                       2024-01-15T10:00:00Z
# appprojects.argoproj.io                            2024-01-15T10:00:00Z

# Verificare i servizi
kubectl get svc -n argocd

# Verificare che tutti i pod siano Running
kubectl get pods -n argocd -w
```

---

## 3. Configurazione CLI

### 3.1 Installazione CLI

```bash
# macOS
brew install argocd

# Linux (amd64)
curl -sSL -o argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
chmod +x argocd
sudo mv argocd /usr/local/bin/argocd

# Verifica
argocd version --client
```

### 3.2 Accesso ad ArgoCD

```bash
# 1. Recuperare la password iniziale
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d

# Output: xxxxx-xxxxx-xxxxx

# 2. Eseguire port-forward
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

### 3.3 Configurazione del Contesto

```bash
# Elencare i contesti configurati
argocd context

# Cambiare contesto
argocd context localhost:8080

# Verificare la connessione
argocd cluster list
```

---

## 4. Web UI Overview

### 4.1 Accesso alla Dashboard

```bash
# Port-forward o accesso tramite Ingress
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Aprire browser: https://localhost:8080
```

### 4.2 Navigazione della UI

```text
Dashboard principale:

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

### 4.3 Stato delle Applicazioni

```text
Legenda stati:

Sync Status:
├── Synced: Il cluster corrisponde a Git
├── OutOfSync: Differenze tra Git e cluster
└── Unknown: Impossibile determinare lo stato

Health Status:
├── Healthy: Tutte le risorse funzionano
├── Progressing: Deploy in corso
├── Degraded: Problemi rilevati
├── Suspended: Risorse in pausa
└── Missing: Risorse non trovate
```

---

## 5. Configurazione RBAC

### 5.1 Struttura RBAC

```text
ArgoCD RBAC:

┌─────────────────────────────────────────────────────────┐
│                      Policy CSV                          │
│  p, <subject>, <object>, <action>, <target>, <effect>  │
└─────────────────────────────────────────────────────────┘
            │
            ├─── Subject: Utenti, Gruppi, Ruoli
            ├─── Object: applications, projects, clusters, repositories
            ├─── Action: get, create, update, delete, sync, override
            ├─── Target: */*, namespace/*, specific-resource
            └─── Effect: allow, deny
```

### 5.2 Ruoli Predefiniti

| Ruolo | Permessi |
|-------|----------|
| role:readonly | Visualizzazione completa |
| role:operator | Sync, rollback, operazioni |
| role:admin | Controllo completo |

### 5.3 Configurazione Policy

```yaml
# ConfigMap argocd-rbac-cm
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-rbac-cm
  namespace: argocd
data:
  policy.csv: |
    # Ruolo personalizzato per sviluppatori
    p, role:developer, applications, get, */*, allow
    p, role:developer, applications, sync, */*, allow
    p, role:developer, applications, create, */*, deny
    
    # Assegnazione gruppi a ruoli
    g, dev-team, role:developer
    g, ops-team, role:operator
    g, admins, role:admin
    
    # Restrizione per progetto
    p, role:frontend-dev, applications, *, frontend/*, allow
    g, frontend-team, role:frontend-dev
    
  policy.default: role:readonly
```

### 5.4 Gestione Utenti

```bash
# Creare un nuovo utente (richiede SSO)
argocd account create-user --username developer

# Listare utenti
argocd account list-users

# Verificare permessi
argocd account can-i sync applications '*'
```

---

## 6. Connessione Multi-Cluster

### 6.1 Registrazione Cluster

```bash
# Listare contesti disponibili
kubectl config get-contexts

# Aggiungere cluster
argocd cluster add <context-name> \
  --name staging \
  --namespace argocd

# Verificare
argocd cluster list

# Output:
# SERVER                          NAME      VERSION  STATUS
# https://kubernetes.default.svc  in-cluster          1.28   Successful
# https://staging.example.com     staging    1.27     Successful
```

### 6.2 Gestione Secret Cluster

```bash
# I secret dei cluster sono memorizzati come Secret
kubectl get secrets -n argocd | grep cluster

# Contenuto del secret
kubectl get secret cluster-staging-xxx -n argocd -o yaml
```

---

## 7. Troubleshooting

### 7.1 Problemi Comuni

```bash
# Pod non partono
kubectl describe pod <pod-name> -n argocd
kubectl logs <pod-name> -n argocd

# Problemi di connessione repository
argocd repo list
argocd repo get <repo-url>

# Sync falliti
argocd app get <app-name>
argocd app history <app-name>
```

### 7.2 Log utili

```bash
# Log del controller
kubectl logs -n argocd deployment/argocd-application-controller -f

# Log del repo server
kubectl logs -n argocd deployment/argocd-repo-server -f

# Log del server API
kubectl logs -n argocd deployment/argocd-server -f
```

---

## 8. Riepilogo

In questo modulo abbiamo esplorato:

1. **Architettura**: I 5 componenti principali e le loro responsabilità
2. **Installazione**: Metodo manifest e Helm con configurazioni consigliate
3. **CLI**: Installazione, login e configurazione contesto
4. **Web UI**: Navigazione e interpretazione degli stati
5. **RBAC**: Configurazione permessi e ruoli

### Prossimi Passi

Nel prossimo modulo approfondiremo la creazione e gestione delle applicazioni ArgoCD.

---

## Risorse Aggiuntive

- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [ArgoCD Operator Manual](https://argo-cd.readthedocs.io/en/stable/operator-manual/)
- [ArgoCD Security](https://argo-cd.readthedocs.io/en/stable/operator-manual/security/)
