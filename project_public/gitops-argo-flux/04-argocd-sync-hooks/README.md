# Modulo 04: ArgoCD Sync Hooks e Waves

**Durata:** 3 ore  
**Livello:** Avanzato  
**Prerequisiti:** Moduli 01-03 completati

## Obiettivi di Apprendimento

Al termine di questo modulo, sarai in grado di:

1. Implementare hook PreSync, Sync, PostSync e SyncFail
2. Orchestrare deployment con sync waves
3. Gestire strategie di rollback efficaci
4. Configurare health check personalizzati
5. Risolvere problemi complessi di sincronizzazione

---

## 1. Fasi di Sync

### 1.1 Panoramica delle Fasi

ArgoCD esegue il sync in fasi ben definite:

```text
Ordine di esecuzione:

┌─────────────────────────────────────────────────────────────┐
│                    Sync Phases Timeline                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. PreSync Phase                                          │
│     ├── Wave -5, -4, -3, -2, -1                           │
│     └── Prepara l'ambiente, backup, validazioni           │
│                                                             │
│  2. Sync Phase                                             │
│     ├── Wave 0 (default)                                   │
│     ├── Wave 1, 2, 3, ...                                  │
│     └── Applica le risorse principali                      │
│                                                             │
│  3. PostSync Phase                                         │
│     ├── Wave 0, 1, 2, ...                                  │
│     └── Notifiche, cleanup, verifiche                      │
│                                                             │
│  4. SyncFail Phase (condizionale)                         │
│     └── Eseguito solo se il sync fallisce                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Dettaglio delle Fasi

#### PreSync

Eseguito **prima** di qualsiasi risorsa Sync:

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

**Casi d'uso:**

- Backup database prima di migrazioni
- Validazioni pre-deploy
- Generazione di configurazioni dinamiche
- Pulizia risorse obsolete

#### Sync

Eseguito per le risorse **principali** (default):

```yaml
# Le risorse senza hook sono automaticamente Sync
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
  # Nessuna annotazione hook richiesta
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: myapp
        image: myapp:v1
```

#### PostSync

Eseguito **dopo** che tutte le risorse Sync sono healthy:

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
        - '{"text":"Deploy completato con successo!"}'
        - $(SLACK_WEBHOOK)
        env:
        - name: SLACK_WEBHOOK
          valueFrom:
            secretKeyRef:
              name: slack-webhook
              key: url
      restartPolicy: OnFailure
```

**Casi d'uso:**

- Notifiche successo deploy
- Eseguire test end-to-end
- Pulizia post-deploy
- Invalidazione cache CDN

#### SyncFail

Eseguito **solo se** il sync fallisce:

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
        - "Deploy fallito! Controllare i log."
        - $(ALERT_WEBHOOK)
      restartPolicy: OnFailure
```

---

## 2. Sync Waves

### 2.1 Concetto Base

Le sync waves permettono di ordinare le risorse all'interno della stessa fase:

```text
Esecuzione waves:

Fase PreSync:
  Wave -2: Backup database
  Wave -1: Validazione schema
  
Fase Sync:
  Wave 0: Namespace, ServiceAccount (default)
  Wave 1: ConfigMaps, Secrets
  Wave 2: Deployments, StatefulSets
  Wave 3: Services, Ingresses
  Wave 4: HPA, PDB
  
Fase PostSync:
  Wave 0: Test base
  Wave 1: Test end-to-end
  Wave 2: Notifiche
```

### 2.2 Configurazione

```yaml
# CRD - Wave -1 (deve esistere prima)
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
# ConfigMap - Wave 0 (default, opzionale)
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

### 2.3 Waves con Hooks

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

### 3.1 Opzioni Disponibili

| Policy | Descrizione |
|--------|-------------|
| `HookSucceeded` | Cancella dopo successo |
| `HookFailed` | Cancella dopo fallimento |
| `BeforeHookCreation` | Cancella vecchia versione prima di crearne una nuova |
| HookSucceeded,HookFailed | Cancella sempre |

### 3.2 Esempi

```yaml
# Cancella solo se ha successo
annotations:
  argocd.argoproj.io/hook-delete-policy: HookSucceeded

# Cancella solo se fallisce
annotations:
  argocd.argoproj.io/hook-delete-policy: HookFailed

# Mantiene solo l'ultima esecuzione
annotations:
  argocd.argoproj.io/hook-delete-policy: BeforeHookCreation

# Cancella sempre
annotations:
  argocd.argoproj.io/hook-delete-policy: HookSucceeded,HookFailed
```

---

## 4. Strategie di Rollback

### 4.1 Rollback Manuale

```bash
# Visualizza cronologia
argocd app history myapp

# Output:
# REVISION  HASH        STATUS     AGE
# 1         abc1234     Synced     1h
# 2         def5678     Synced     30m
# 3         ghi9012     Failed     5m

# Rollback a revisione 2
argocd app rollback myapp 2

# Nota: questo disabilita l'auto-sync
# Riattiva se necessario
argocd app set myapp --sync-policy automated
```

### 4.2 Rollback Automatico (Pattern)

ArgoCD non ha rollback automatico nativo, ma può essere implementato:

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
          # Trova ultima revisione buona
          LAST_GOOD=$(argocd app history myapp -o json | jq -r '.[] | select(.status=="Synced") | .revision' | head -1)
          # Esegui rollback
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

### 5.1 Health Check Predefiniti

ArgoCD ha health check incorporati per:

```text
Risorse supportate nativamente:

├── Deployment
│   └── Healthy se readyReplicas == replicas
├── StatefulSet
│   └── Healthy se readyReplicas == replicas
├── DaemonSet
│   └── Healthy se readyReplicas == desiredNumberScheduled
├── Service
│   └── Healthy se ha ClusterIP o LoadBalancer
├── Ingress
│   └── Healthy se ha IP o hostname
├── PersistentVolumeClaim
│   └── Healthy se Bound
├── Pod
│   └── Healthy se Running, Progressing se Pending
└── Job
    └── Healthy se Complete, Progressing se Running
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
  # Health check per CRD custom
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

### 5.3 Esempi Pratici

```lua
-- Health check per Certificate (cert-manager)
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

## 6. Troubleshooting Sync

### 6.1 Debug Hooks

```bash
# Visualizza hook in esecuzione
kubectl get jobs -n argocd -l argocd.argoproj.io/hook

# Log di un hook
kubectl logs job/presync-backup-xxx -n argocd

# Eventi correlati
kubectl get events -n argocd --field-selector reason=HookError

# Dettagli Application
argocd app get myapp --refresh

# Manifest generati
argocd app manifests myapp --show-managed-fields
```

### 6.2 Problemi Comuni

```text
Problema: Hook non viene eseguito

Cause possibili:
├── Annotazione errata
├── Hook già in esecuzione (BeforeHookCreation)
├── Risorse dipendenti mancanti
└── ServiceAccount senza permessi

Soluzione:
├── Verifica annotazioni
├── Controlla kubectl get events
└── Usa --dry-run per test
```

```text
Problema: Sync fallisce senza messaggio chiaro

Cause possibili:
├── Risorsa OutOfSync bloccante
├── Health check in Progressing infinito
└── Timeout applicazione

Soluzione:
├── Aumenta timeout (spec.syncPolicy.retry)
├── Controlla health check personalizzati
└── Usa argocd app diff
```

---

## 7. Best Practices

### 7.1 Hooks

```yaml
# ✓ Best practice: Usa nomi descrittivi
metadata:
  generateName: db-migrate-presync-
  
# ✓ Best practice: Imposta timeout appropriati
spec:
  activeDeadlineSeconds: 600
  
# ✓ Best practice: Gestisci i failure
spec:
  template:
    spec:
      restartPolicy: OnFailure
      
# ✓ Best practice: Pulisci dopo esecuzione
annotations:
  argocd.argoproj.io/hook-delete-policy: HookSucceeded
```

### 7.2 Waves

```text
Best practices waves:

1. Usa wave negative per dipendenze
   ├── -5: CRD e namespace
   ├── -3: ServiceAccount e role
   └── -1: ConfigMap e secret
   
2. Wave positive per applicazione
   ├── 0: Deployments (default)
   ├── 1: Services
   └── 2: Ingress e HPA
   
3. Evita gap non necessari
   ├── Non usare wave 1, 5, 10
   └── Preferisci 1, 2, 3
```

---

## 8. Riepilogo

In questo modulo abbiamo esplorato:

1. **Sync Phases**: PreSync, Sync, PostSync, SyncFail
2. **Sync Waves**: Ordinamento risorse con waves
3. **Hook Management**: Delete policy e lifecycle
4. **Rollback**: Strategie manuali e automatiche
5. **Health Checks**: Predefiniti e personalizzati

### Prossimi Passi

Hai completato il corso GitOps con ArgoCD! Applica le conoscenze in progetti reali.

---

## Risorse Aggiuntive

- [ArgoCD Sync Hooks](https://argo-cd.readthedocs.io/en/stable/user-guide/sync-options/)
- [ArgoCD Sync Waves](https://argo-cd.readthedocs.io/en/stable/user-guide/sync-waves/)
- [Custom Health Checks](https://argo-cd.readthedocs.io/en/stable/operator-manual/health/)
- [Rollback Strategies](https://argo-cd.readthedocs.io/en/stable/user-guide/rollback/)
