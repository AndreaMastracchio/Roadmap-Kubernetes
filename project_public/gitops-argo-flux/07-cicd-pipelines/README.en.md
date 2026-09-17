# Module 7: CI/CD Pipelines with GitOps

**Duration**: 2 hours theory + 2 hours lab  
**Objective**: Build complete CI/CD pipelines and integrate them with GitOps workflows

## Module Overview

Integration between CI/CD and GitOps requires a different mindset from traditional pipelines. Instead of deploying directly, the pipeline updates the desired state in the Git repository. The GitOps controller (Flux or Argo CD) detects the change and reconciles the cluster. This approach ensures audit trail, simple rollbacks, and a single source of truth.

This module covers Argo CD ApplicationSets for multi-cluster, progressive delivery with Flagger, deployment strategies (canary/blue-green), pipeline security, and notification management.

## 🎯 Learning Objectives

- Design efficient CI/CD pipelines integrated with GitOps
- Configure Argo CD ApplicationSets for multi-cluster deployment
- Implement progressive delivery with Flagger
- Configure canary and blue-green deployments
- Manage secrets in CI/CD pipelines
- Implement automated test gates
- Configure notifications and alerts

## 📚 Theoretical Content

### 1. CI/CD Concepts Integration

| Approach | CI Action | CD Action | GitOps |
|----------|-----------|-----------|--------|
| Push-based | Build + Push Image | Deploy via API | No |
| Pull-based | Build + Push Image + Update Git | Controller reconcile | Yes |

**GitOps Benefits**:
- Complete audit trail in Git
- Rollback via `git revert`
- Automatic drift detection
- Simplified disaster recovery

### 2. GitHub Actions GitOps Workflow

```yaml
name: Build and Deploy
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      image-tag: ${{ steps.meta.outputs.tags }}
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3
    
    - name: Login to Registry
      uses: docker/login-action@v3
      with:
        registry: ghcr.io
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ghcr.io/${{ github.repository }}
        tags: |
          type=sha,prefix=
          type=ref,event=branch
    
    - name: Build and push
      uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        cache-from: type=gha
        cache-to: type=gha,mode=max
    
    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        image-ref: ${{ steps.meta.outputs.tags }}
        severity: 'CRITICAL,HIGH'
        exit-code: '1'
  
  update-manifests:
    needs: build
    runs-on: ubuntu-latest
    steps:
    - name: Checkout manifests
      uses: actions/checkout@v4
      with:
        repository: org/k8s-manifests
        token: ${{ secrets.PAT_TOKEN }}
    
    - name: Update image tag
      run: |
        cd apps/my-app
        kustomize edit set image ghcr.io/org/app:${{ needs.build.outputs.image-tag }}
    
    - name: Commit and push
      run: |
        git config user.name "CI Bot"
        git config user.email "ci@org.com"
        git add .
        git commit -m "Update my-app to ${{ needs.build.outputs.image-tag }}"
        git push
```

### 3. Argo CD ApplicationSets for Multi-Cluster

ApplicationSets generate applications from templates for multiple clusters.

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: multi-cluster-apps
  namespace: argocd
spec:
  generators:
  # Generate applications for each cluster
  - list:
      elements:
      - cluster: staging
        url: https://kubernetes.default.svc
        env: staging
      - cluster: production
        url: https://prod-cluster.example.com
        env: production
  
  template:
    metadata:
      name: '{{cluster}}-my-app'
    spec:
      project: default
      source:
        repoURL: https://github.com/org/k8s-manifests
        targetRevision: main
        path: apps/my-app/overlays/{{env}}
      destination:
        server: '{{url}}'
        namespace: my-app
      syncPolicy:
        automated:
          prune: true
          selfHeal: true
        syncOptions:
        - CreateNamespace=true
```

#### Generator Types

```yaml
# Cluster generator - uses labels on clusters
- clusterDecisionResource:
    labelSelector:
      matchLabels:
        environment: production

# Git directory generator
- git:
    repoURL: https://github.com/org/k8s-manifests
    revision: main
    directories:
    - path: apps/*
```

### 4. Progressive Delivery with Flagger

Flagger automates canary releases with metric analysis.

```yaml
apiVersion: flagger.app/v1beta1
kind: Canary
metadata:
  name: my-app
  namespace: production
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: my-app
  
  # Progression deadline
  progressDeadlineSeconds: 600
  
  service:
    port: 8080
    targetPort: 8080
    # Istio/Linkerd/Gateway API support
    meshName: istio
  
  analysis:
    # Analysis interval
    interval: 1m
    
    # Number of analyses needed for promotion
    iterations: 10
    
    # Tolerated failures before rollback
    threshold: 2
    
    # Maximum canary traffic weight
    maxWeight: 50
    
    # Weight increment per step
    stepWeight: 5
    
    # Metrics to analyze
    metrics:
    - name: request-success-rate
      thresholdRange:
        min: 99
      interval: 1m
    
    - name: request-duration
      thresholdRange:
        max: 500
      interval: 1m
    
    # External test webhooks
    webhooks:
    - name: load-test
      url: http://loadtester.test/
      timeout: 5s
      metadata:
        cmd: "hey -z 1m -q 10 -c 2 http://my-app-canary.production:8080/"
```

### 5. Blue-Green Deployment

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: app
        image: my-app:v2.0.0
        ports:
        - containerPort: 8080
  
  strategy:
    blueGreen:
      # Active service (blue)
      activeService: my-app-active
      
      # Preview service (green)
      previewService: my-app-preview
      
      # Replicas to keep after switch
      scaleDownDelayRevisionLimit: 2
      
      # Auto-promotion after ready
      autoPromotionEnabled: true
      
      # Wait time before promoting
      autoPromotionSeconds: 30
```

### 6. Secret Management in Pipelines

#### External Secrets Operator

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: app-secrets
  namespace: production
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secretsmanager
    kind: ClusterSecretStore
  
  target:
    name: app-secrets
    creationPolicy: Owner
  
  data:
  - secretKey: database-url
    remoteRef:
      key: prod/database
      property: url
  
  - secretKey: api-key
    remoteRef:
      key: prod/api-keys
      property: my-service
```

#### Sealed Secrets

```yaml
apiVersion: bitnami.com/v1alpha1
kind: SealedSecret
metadata:
  name: app-secrets
  namespace: production
spec:
  encryptedData:
    database-url: AgB...encrypted...data
---
# Generated with:
# kubectl create secret generic app-secrets --dry-run=client --from-literal=database-url=postgresql://... | kubeseal -o yaml
```

### 7. Pipeline Security

#### RBAC for Argo CD

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: argocd-apps-role
  namespace: apps
rules:
- apiGroups: ["apps"]
  resources: ["deployments"]
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
- apiGroups: [""]
  resources: ["secrets"]
  verbs: ["get", "list"]
  resourceNames: ["app-secrets"]  # Limited to specific secrets
```

#### Network Policies

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: argocd-repo-server-policy
  namespace: argocd
spec:
  podSelector:
    matchLabels:
      app.kubernetes.io/name: argocd-repo-server
  policyTypes:
  - Egress
  egress:
  # Only connections to GitHub/GitLab
  - to:
    - ipBlock:
        cidr: 0.0.0.0/0
        exceptions:
        - 10.0.0.0/8
        - 172.16.0.0/12
        - 192.168.0.0/16
    ports:
    - protocol: TCP
      port: 443
```

### 8. Notifications

```yaml
apiVersion: notification.toolkit.fluxcd.io/v1beta3
kind: Provider
metadata:
  name: slack
  namespace: flux-system
spec:
  type: slack
  channel: deploy-notifications
  secretRef:
    name: slack-webhook
---
apiVersion: notification.toolkit.fluxcd.io/v1beta3
kind: Alert
metadata:
  name: deploy-alerts
  namespace: flux-system
spec:
  providerRef:
    name: slack
  eventSeverity: info
  eventSources:
  - kind: Kustomization
    name: '*'
  summary: "Deploy {{ .Kustomization.Name }} {{ .Kustomization.Status }}"
```

## ⚠️ Common Pitfalls

1. **Automated commits to wrong branch**: Use branch protection for main.

2. **Secrets in logs**: Never print environment variables in CI logs.

3. **Using `latest` image tag**: Use SHA or semantic tags, never `latest`.

4. **Skipping security tests**: Trivy, Snyk, and SAST must be blocking.

5. **Timeouts too short**: Canary analysis requires sufficient time.

## ✅ Best Practices

- Branch protection with required status checks
- Sign automated commits with GPG or SSH
- Separate repositories for code and manifests
- Policy as code with Kyverno/OPA
- Notifications for every deployment
- Automated tests as mandatory gates
- Audit log for every GitOps change

## 🔧 Hands-on Exercises

1. Create a complete GitHub Actions workflow
2. Configure an ApplicationSet for staging/production
3. Implement canary deployment with Flagger
4. Configure Slack notifications for Flux
5. Implement blue-green with Argo Rollouts

## 📝 Summary

This module explored CI/CD pipeline integration with GitOps. Argo CD ApplicationSets simplify multi-cluster management, while Flagger automates progressive delivery. Security requires granular RBAC, network policies, and secure secret management. Notifications close the feedback loop.

The next module will dive into advanced patterns: multi-tenancy, policy engines, and troubleshooting.
