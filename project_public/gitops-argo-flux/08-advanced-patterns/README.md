# Modulo 8: Pattern Avanzati GitOps

**Durata**: 2 ore teoria + 2 ore lab  
**Obiettivo**: Implementare multi-tenancy, policy engine, automazione immagini e troubleshooting avanzato

## Panoramica del Modulo

I pattern avanzati di GitOps affrontano le sfide organizzative e operative che emergono quando GitOps scala oltre il singolo team o applicazione. La multi-tenancy garantisce isolamento sicuro, i policy engine impongono governance automatizzata, l'automazione delle immagini elimina il toil manuale, e il troubleshooting avanzato risolve problemi complessi.

Questo modulo copre tutti questi aspetti con esempi pratici e best practices derivanti dall'esperienza di produzione.

## 🎯 Obiettivi di Apprendimento

- Configurare multi-tenancy con Flux e Argo CD
- Implementare policy engine (Kyverno, OPA Gatekeeper)
- Configurare image automation e update policies
- Setup notifiche con provider multipli
- Implementare pattern di bootstrapping cluster
- Strutturare repository per scale enterprise
- Eseguire troubleshooting avanzato

## 📚 Contenuti Teorici

### 1. Multi-Tenancy con Flux

La multi-tenancy in Flux si basa su ServiceAccount dedicati per tenant e RBAC restrittivo.

```yaml
# Repository per tenant
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: team-a-repo
  namespace: team-a
spec:
  interval: 1m
  url: https://github.com/org/team-a-config
  secretRef:
    name: team-a-ssh-key
---
# ServiceAccount per tenant
apiVersion: v1
kind: ServiceAccount
metadata:
  name: team-a-reconciler
  namespace: team-a
---
# RBAC limitato al namespace del tenant
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: team-a-role
  namespace: team-a
rules:
- apiGroups: ["*"]
  resources: ["*"]
  verbs: ["*"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: team-a-rolebinding
  namespace: team-a
subjects:
- kind: ServiceAccount
  name: team-a-reconciler
  namespace: team-a
roleRef:
  kind: Role
  name: team-a-role
  apiGroup: rbac.authorization.k8s.io
---
# Kustomization che usa il ServiceAccount del tenant
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: team-a-apps
  namespace: team-a
spec:
  serviceAccountName: team-a-reconciler
  interval: 5m
  path: ./apps
  sourceRef:
    kind: GitRepository
    name: team-a-repo
  prune: true
```

### 2. Policy Engine: Kyverno

Kyverno è un policy engine nativo Kubernetes che valida, muta e genera risorse.

```yaml
# Policy: richiede label sui Pod
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-labels
spec:
  validationFailureAction: Enforce  # Block o Audit
  rules:
  - name: require-team-label
    match:
      resources:
        kinds:
        - Pod
    validate:
      message: "I Pod devono avere la label 'team'"
      pattern:
        metadata:
          labels:
            team: "?*"
---
# Policy: imposta limiti di default
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: add-default-resources
spec:
  rules:
  - name: set-resources
    match:
      resources:
        kinds:
        - Pod
    mutate:
      patchStrategicMerge:
        spec:
          containers:
          - (name): "*"
            resources:
              requests:
                memory: "128Mi"
                cpu: "100m"
              limits:
                memory: "512Mi"
```

### 3. Policy Engine: OPA Gatekeeper

```yaml
# ConstraintTemplate
apiVersion: templates.gatekeeper.sh/v1
kind: ConstraintTemplate
metadata:
  name: k8srequiredlabels
spec:
  crd:
    spec:
      names:
        kind: K8sRequiredLabels
      validation:
        openAPIV3Schema:
          type: object
          properties:
            labels:
              type: array
              items:
                type: string
  targets:
    - target: admission.k8s.gatekeeper.sh
      rego: |
        package k8srequiredlabels
        
        violation[{"msg": msg, "details": {"missing_labels": missing}}] {
          provided := {label | input.review.object.metadata.labels[label]}
          required := {label | label := input.parameters.labels[_]}
          missing := required - provided
          count(missing) > 0
          msg := sprintf("Missing required labels: %v", [missing])
        }
---
# Constraint
apiVersion: constraints.gatekeeper.sh/v1beta1
kind: K8sRequiredLabels
metadata:
  name: require-team-label
spec:
  match:
    kinds:
    - apiGroups: [""]
      kinds: ["Pod"]
  parameters:
    labels:
    - team
    - environment
```

### 4. Image Automation con Flux

```yaml
# ImageRepository: scansiona il registro
apiVersion: image.toolkit.fluxcd.io/v1beta2
kind: ImageRepository
metadata:
  name: my-app
  namespace: flux-system
spec:
  image: ghcr.io/org/my-app
  interval: 1m
  secretRef:
    name: registry-credentials
---
# ImagePolicy: seleziona la versione
apiVersion: image.toolkit.fluxcd.io/v1beta2
kind: ImagePolicy
metadata:
  name: my-app-policy
  namespace: flux-system
spec:
  imageRepositoryRef:
    name: my-app
  filterTags:
    pattern: '^v(?P<major>\d+)\.(?P<minor>\d+)\.(?P<patch>\d+)$'
    extract: '$major.$minor.$patch'
  policy:
    semver:
      range: '>=1.0.0'
---
# ImageUpdateAutomation: aggiorna il Git
apiVersion: image.toolkit.fluxcd.io/v1beta2
kind: ImageUpdateAutomation
metadata:
  name: my-app-automation
  namespace: flux-system
spec:
  interval: 1m
  sourceRef:
    kind: GitRepository
    name: flux-system
  git:
    checkout:
      ref:
        branch: main
    commit:
      author:
        email: flux@org.com
        name: Flux Bot
      messageTemplate: |
        Update {{ .AutomationObject.Name }}
        Updated image(s):
        {{ range .UpdatedContainers -}}
        - {{ . }}
        {{ end -}}
    push:
      branch: main
  update:
    path: ./apps/my-app
    strategy: settlers
```

### 5. Notifiche e Receiver

```yaml
# Provider per Slack, Discord, Teams
apiVersion: notification.toolkit.fluxcd.io/v1beta3
kind: Provider
metadata:
  name: slack-prod
  namespace: flux-system
spec:
  type: slack
  channel: production-deploys
  secretRef:
    name: slack-webhook-url
---
# Provider per PagerDuty
apiVersion: notification.toolkit.fluxcd.io/v1beta3
kind: Provider
metadata:
  name: pagerduty
  namespace: flux-system
spec:
  type: pagerduty
  secretRef:
    name: pagerduty-secret
---
# Alert configurazione
apiVersion: notification.toolkit.fluxcd.io/v1beta3
kind: Alert
metadata:
  name: production-errors
  namespace: flux-system
spec:
  providerRef:
    name: pagerduty
  eventSeverity: error
  eventSources:
  - kind: Kustomization
    name: '*'
    namespace: flux-system
  exclusionList:
  - "status=''"
  - "message='.*no new generation.*'"
---
# Receiver per webhook esterni
apiVersion: notification.toolkit.fluxcd.io/v1
kind: Receiver
metadata:
  name: github-webhook
  namespace: flux-system
spec:
  type: github
  secretRef:
    name: github-webhook-secret
  resources:
  - kind: GitRepository
    name: my-app-repo
    namespace: flux-system
  events:
  - push
```

### 6. Cluster Bootstrapping Pattern

```yaml
# clusters/production/kustomization.yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: flux-system
  namespace: flux-system
spec:
  interval: 10m
  path: ./clusters/production
  sourceRef:
    kind: GitRepository
    name: flux-system
  prune: true
---
# Script di bootstrap
# flux bootstrap github \
#   --owner=org \
#   --repository=k8s-config \
#   --branch=main \
#   --path=clusters/production \
#   --personal
```

#### Struttura Repository Multi-Cluster

```
k8s-config/
├── clusters/
│   ├── production/
│   │   ├── flux-system/
│   │   ├── apps.yaml
│   │   └── infrastructure.yaml
│   └── staging/
│       ├── flux-system/
│       ├── apps.yaml
│       └── infrastructure.yaml
├── apps/
│   ├── base/
│   └── overlays/
│       ├── production/
│       └── staging/
└── infrastructure/
    ├── controllers/
    └── configs/
```

### 7. Troubleshooting Avanzato

#### Diagnostic Commands

```bash
# Controllare stato Flux completo
flux get all -A

# Verificare health delle Kustomization
flux get kustomization -A -o yaml | grep -A5 "conditions:"

# Forzare riconciliazione
flux reconcile kustomization my-app --force

# Controllare artifact delle fonti
flux get source git my-repo -o yaml

# Log del controller
kubectl logs -n flux-system deployment/kustomize-controller -f

# Descrivere risorsa con problemi
flux trace deployment/my-app -n production

# Verificare status di ImageRepository
flux get image repository my-app -o yaml

# Controllare RBAC
kubectl auth can-i list deployments -n team-a --as=system:serviceaccount:team-a:team-a-reconciler
```

#### Problemi Comuni e Soluzioni

| Sintomo | Causa Probabile | Soluzione |
|---------|-----------------|-----------|
| Kustomization stalled | DependsOn non ready | Verificare dipendenze |
| Artifact outdated | Network/auth issue | Controllare secret e connessione |
| Loop di reconciliation | HealthCheck fallente | Aggiustare threshold |
| RBAC denied | ServiceAccount errato | Verificare RoleBinding |
| ImagePolicy no match | Pattern errato | Controllare filterTags |

## ⚠️ Errori Comuni

1. **RBAC troppo permissivo**: Mai usare ClusterAdmin per tenant.

2. **Policy troppo restrittive**: Testare in Audit mode prima di Enforce.

3. **Image automation su main diretto**: Usare branch dedicato con PR.

4. **Notifiche spammy**: Configurare exclusionList e severity corretta.

5. **Bootstrapping manuale**: Automatizzare con flux bootstrap o Terraform.

## ✅ Best Practices

- Tenant isolation con ServiceAccount dedicati
- Policy testing in Audit mode prima di Enforce
- Image automation con PR flow
- Notifiche granulari per severity
- Repository structure per multi-cluster
- Drift detection automatico
- Backup dei secret di bootstrapping

## 🔧 Esercizi Pratici

1. Configurare multi-tenancy con due team isolati
2. Implementare Kyverno policy per Pod security
3. Setup image automation con PR flow
4. Configurare notifiche Slack per errori
5. Implementare bootstrapping con flux bootstrap
6. Debug di una Kustomization stalled

## 📝 Riepilogo

Questo modulo finale ha coperto i pattern avanzati essenziali per GitOps a scala enterprise. La multi-tenancy garantisce isolamento sicuro, i policy engine impongono governance automatizzata, l'automazione delle immagini elimina il toil, e le notifiche chiudono il ciclo di feedback. Il troubleshooting avanzato risolve problemi complessi che emergono in produzione.

La combinazione di questi pattern con le fondamenta dei moduli precedenti fornisce una base solida per implementare GitOps in qualsiasi organizzazione.
