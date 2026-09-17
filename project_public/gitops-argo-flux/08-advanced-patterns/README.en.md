# Module 8: Advanced GitOps Patterns

**Duration**: 2 hours theory + 2 hours lab  
**Objective**: Implement multi-tenancy, policy engines, image automation, and advanced troubleshooting

## Module Overview

Advanced GitOps patterns address the organizational and operational challenges that emerge when GitOps scales beyond a single team or application. Multi-tenancy ensures secure isolation, policy engines enforce automated governance, image automation eliminates manual toil, and advanced troubleshooting resolves complex issues.

This module covers all these aspects with practical examples and production-proven best practices.

## 🎯 Learning Objectives

- Configure multi-tenancy with Flux and Argo CD
- Implement policy engines (Kyverno, OPA Gatekeeper)
- Configure image automation and update policies
- Setup notifications with multiple providers
- Implement cluster bootstrapping patterns
- Structure repositories for enterprise scale
- Perform advanced troubleshooting

## 📚 Theoretical Content

### 1. Multi-Tenancy with Flux

Multi-tenancy in Flux is based on dedicated ServiceAccounts per tenant and restrictive RBAC.

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
# ServiceAccount for tenant
apiVersion: v1
kind: ServiceAccount
metadata:
  name: team-a-reconciler
  namespace: team-a
---
# RBAC limited to tenant namespace
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
# Kustomization using tenant ServiceAccount
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

Kyverno is a Kubernetes-native policy engine that validates, mutates, and generates resources.

```yaml
# Policy: require labels on Pods
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-labels
spec:
  validationFailureAction: Enforce  # Block or Audit
  rules:
  - name: require-team-label
    match:
      resources:
        kinds:
        - Pod
    validate:
      message: "Pods must have the 'team' label"
      pattern:
        metadata:
          labels:
            team: "?*"
---
# Policy: set default limits
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

### 4. Image Automation with Flux

```yaml
# ImageRepository: scan the registry
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
# ImagePolicy: select version
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
# ImageUpdateAutomation: update Git
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

### 5. Notifications and Receivers

```yaml
# Provider for Slack, Discord, Teams
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
# Provider for PagerDuty
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
# Alert configuration
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
# Receiver for external webhooks
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
# Bootstrap script
# flux bootstrap github \
#   --owner=org \
#   --repository=k8s-config \
#   --branch=main \
#   --path=clusters/production \
#   --personal
```

#### Multi-Cluster Repository Structure

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

### 7. Advanced Troubleshooting

#### Diagnostic Commands

```bash
# Check complete Flux status
flux get all -A

# Verify Kustomization health
flux get kustomization -A -o yaml | grep -A5 "conditions:"

# Force reconciliation
flux reconcile kustomization my-app --force

# Check source artifacts
flux get source git my-repo -o yaml

# Controller logs
kubectl logs -n flux-system deployment/kustomize-controller -f

# Describe problematic resource
flux trace deployment/my-app -n production

# Verify ImageRepository status
flux get image repository my-app -o yaml

# Check RBAC
kubectl auth can-i list deployments -n team-a --as=system:serviceaccount:team-a:team-a-reconciler
```

#### Common Issues and Solutions

| Symptom | Probable Cause | Solution |
|---------|----------------|----------|
| Kustomization stalled | DependsOn not ready | Verify dependencies |
| Artifact outdated | Network/auth issue | Check secrets and connection |
| Reconciliation loop | HealthCheck failing | Adjust thresholds |
| RBAC denied | Wrong ServiceAccount | Verify RoleBinding |
| ImagePolicy no match | Wrong pattern | Check filterTags |

## ⚠️ Common Pitfalls

1. **RBAC too permissive**: Never use ClusterAdmin for tenants.

2. **Policies too restrictive**: Test in Audit mode before Enforce.

3. **Image automation to main directly**: Use dedicated branch with PR.

4. **Spammy notifications**: Configure exclusionList and correct severity.

5. **Manual bootstrapping**: Automate with flux bootstrap or Terraform.

## ✅ Best Practices

- Tenant isolation with dedicated ServiceAccounts
- Policy testing in Audit mode before Enforce
- Image automation with PR flow
- Granular notifications by severity
- Repository structure for multi-cluster
- Automatic drift detection
- Backup of bootstrapping secrets

## 🔧 Hands-on Exercises

1. Configure multi-tenancy with two isolated teams
2. Implement Kyverno policy for Pod security
3. Setup image automation with PR flow
4. Configure Slack notifications for errors
5. Implement bootstrapping with flux bootstrap
6. Debug a stalled Kustomization

## 📝 Summary

This final module covered essential advanced patterns for enterprise-scale GitOps. Multi-tenancy ensures secure isolation, policy engines enforce automated governance, image automation eliminates manual toil, and notifications close the feedback loop. Advanced troubleshooting resolves complex production issues.

Combining these patterns with the foundations from previous modules provides a solid base for implementing GitOps in any organization.
