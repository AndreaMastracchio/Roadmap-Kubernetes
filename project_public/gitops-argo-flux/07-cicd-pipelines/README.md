# Modulo 7: Pipeline CI/CD con GitOps

**Durata**: 2 ore teoria + 2 ore lab  
**Obiettivo**: Costruire pipeline CI/CD complete e integrarle con workflow GitOps

## Panoramica del Modulo

L'integrazione tra CI/CD e GitOps richiede una mentalità diversa dai pipeline tradizionali. Invece di deployare direttamente, il pipeline aggiorna lo stato desiderato nel repository Git. Il controller GitOps (Flux o Argo CD) rileva il cambiamento e riconcilia il cluster. Questo approccio garantisce audit trail, rollback semplici e un'unica fonte di verità.

Questo modulo copre ApplicationSets di Argo CD per multi-cluster, progressive delivery con Flagger, strategie di deployment (canary/blue-green), sicurezza delle pipeline e gestione delle notifiche.

## 🎯 Obiettivi di Apprendimento

- Progettare pipeline CI/CD efficienti integrate con GitOps
- Configurare Argo CD ApplicationSets per deployment multi-cluster
- Implementare progressive delivery con Flagger
- Configurare deployment canary e blue-green
- Gestire segreti nelle pipeline CI/CD
- Implementare gate di test automatizzati
- Configurare notifiche e alert

## 📚 Contenuti Teorici

### 1. CI/CD Concepts Integration

| Approccio | CI Action | CD Action | GitOps |
|-----------|-----------|-----------|--------|
| Push-based | Build + Push Image | Deploy via API | No |
| Pull-based | Build + Push Image + Update Git | Controller reconcile | Sì |

**Vantaggi GitOps**:
- Audit trail completo nel Git
- Rollback tramite `git revert`
- Drift detection automatico
- Disaster recovery semplificato

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

### 3. Argo CD ApplicationSets per Multi-Cluster

Gli ApplicationSets permettono di generare applicazioni da template per multipli cluster.

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: multi-cluster-apps
  namespace: argocd
spec:
  generators:
  # Genera applicazioni per ogni cluster
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
# Cluster generator - usa label sui cluster
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

### 4. Progressive Delivery con Flagger

Flagger automatizza canary release con analisi metriche.

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
    # Intervallo di analisi
    interval: 1m
    
    # Numero di analisi necessarie per promuovere
    iterations: 10
    
    # Fallimenti tollerati prima del rollback
    threshold: 2
    
    # Peso massimo del traffico canary
    maxWeight: 50
    
    # Incremento peso per step
    stepWeight: 5
    
    # Metriche da analizzare
    metrics:
    - name: request-success-rate
      thresholdRange:
        min: 99
      interval: 1m
    
    - name: request-duration
      thresholdRange:
        max: 500
      interval: 1m
    
    # Test webhooks esterni
    webhooks:
    - name: load-test
      url: http://loadtester.test/
      timeout: 5s
      metadata:
        cmd: "hey -z 1m -q 10 -c 2 http://my-app-canary.production:8080/"
```

### 5. Deployment Blue-Green

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
      # Servizio attivo (blue)
      activeService: my-app-active
      
      # Servizio preview (green)
      previewService: my-app-preview
      
      # Numero di repliche da mantenere dopo lo switch
      scaleDownDelayRevisionLimit: 2
      
      # Auto-promozione dopo ready
      autoPromotionEnabled: true
      
      # Tempo di attesa prima di promuovere
      autoPromotionSeconds: 30
```

### 6. Gestione Segreti nelle Pipeline

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
# Generato con:
# kubectl create secret generic app-secrets --dry-run=client --from-literal=database-url=postgresql://... | kubeseal -o yaml
```

### 7. Pipeline Security

#### RBAC per Argo CD

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
  resourceNames: ["app-secrets"]  # Limitato a secret specifici
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
  # Solo connessioni a GitHub/GitLab
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

### 8. Notifiche

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

## ⚠️ Errori Comuni

1. **Commit automation in branch sbagliato**: Usare branch protection per il main.

2. **Secret nei log**: Mai stampare variabili d'ambiente nei log CI.

3. **Image tag `latest`**: Usa SHA o tag semantici, mai `latest`.

4. **Skip dei test di sicurezza**: Trivy, Snyk e SAST devono essere blocking.

5. **Timeout troppo brevi**: Canary analysis richiede tempo sufficiente.

## ✅ Best Practices

- Branch protection con required status checks
- Firmare commit automatici con GPG o SSH
- Separate repository per codice e manifest
- Policy as code con Kyverno/OPA
- Notifiche per ogni deployment
- Test automatici come gate obbligatori
- Audit log per ogni modifica GitOps

## 🔧 Esercizi Pratici

1. Creare un workflow GitHub Actions completo
2. Configurare un ApplicationSet per staging/production
3. Implementare canary deployment con Flagger
4. Configurare notifiche Slack per Flux
5. Implementare blue-green con Argo Rollouts

## 📝 Riepilogo

Questo modulo ha esplorato l'integrazione tra pipeline CI/CD e GitOps. ApplicationSets di Argo CD semplificano il multi-cluster, mentre Flagger automatizza progressive delivery. La sicurezza richiede RBAC granulare, network policies e gestione sicura dei segreti. Le notifiche chiudono il ciclo di feedback.

Il prossimo modulo approfondirà pattern avanzati: multi-tenancy, policy engine e troubleshooting.
