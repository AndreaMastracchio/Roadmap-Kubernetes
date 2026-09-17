# Module 6: Flux Sources & Kustomizations

**Duration**: 2 hours theory + 2 hours lab  
**Objective**: Configure Git, Helm, and OCI sources and manage Kustomization dependencies

## Module Overview

Flux uses the concept of "Sources" as the foundation for cluster reconciliation. A Source represents a versioned artifact that can be a Git repository, a Helm chart, or an OCI image. Kustomizations are the resources that apply these artifacts to the cluster, with support for dependencies, health checks, and garbage collection.

This module explores each source type in detail, authentication strategies, signature verification, and advanced dependency management patterns.

## 🎯 Learning Objectives

- Configure GitRepository with various authentication modes (HTTPS, SSH, token)
- Use HelmRepository and OCIRepository as sources for charts and bundles
- Create dependencies between Kustomizations to manage deployment order
- Implement signature verification with Cosign for OCI artifacts
- Configure health checks and timeouts for resources
- Manage garbage collection and resource pruning
- Understand status reporting and Kustomization conditions

## 📚 Theoretical Content

### 1. GitRepository

GitRepository is the most common source for GitOps configurations. It supports various reference modes and authentication.

```yaml
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: my-app-repo
  namespace: flux-system
spec:
  interval: 1m
  url: https://github.com/organization/app-config
  ref:
    branch: main
    # Alternative: tag, commit, semver
    # ref:
    #   semver: ">=1.0.0"
  secretRef:
    name: git-credentials
  timeout: 60s
  ignore: |
    # Exclude files from generated manifest
    .github/
    docs/
    *.md
  verification:
    mode: head
    secretRef:
      name: gpg-public-key
```

#### Version References

```yaml
# Specific branch
ref:
  branch: production

# Specific tag
ref:
  tag: v2.1.0

# Commit SHA
ref:
  commit: "a1b2c3d4e5f6"

# Semver for automatic releases
ref:
  semver: ">=1.0.0 <2.0.0"
```

### 2. Git Authentication

#### HTTPS with Personal Token

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: git-https-credentials
  namespace: flux-system
stringData:
  username: git
  password: ghp_xxxxxxxxxxxxxxxxxxxx  # Personal Access Token
---
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: private-repo
spec:
  url: https://github.com/org/private-repo.git
  secretRef:
    name: git-https-credentials
```

#### SSH Authentication

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: git-ssh-credentials
  namespace: flux-system
stringData:
  identity: |
    -----BEGIN OPENSSH PRIVATE KEY-----
    b3BlbnNzaC1rZXktdjEAAAAABG5vbmU...
    -----END OPENSSH PRIVATE KEY-----
  known_hosts: |
    github.com ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC...
---
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: ssh-repo
spec:
  url: ssh://git@github.com/org/repo.git
  secretRef:
    name: git-ssh-credentials
```

### 3. HelmRepository

```yaml
apiVersion: source.toolkit.fluxcd.io/v1beta2
kind: HelmRepository
metadata:
  name: bitnami
  namespace: flux-system
spec:
  interval: 10m
  url: https://charts.bitnami.com/bitnami
  timeout: 2m
  provider: generic  # 'generic' or 'aws', 'azure', 'gcp' for cloud registries
  # For private repositories:
  secretRef:
    name: helm-registry-credentials
```

#### Helm Chart from GitRepository

```yaml
apiVersion: source.toolkit.fluxcd.io/v1beta2
kind: HelmChart
metadata:
  name: my-app-chart
  namespace: flux-system
spec:
  interval: 5m
  chart: ./charts/my-app
  sourceRef:
    kind: GitRepository
    name: my-app-repo
  valuesFiles:
    - ./charts/my-app/values.yaml
    - ./environments/production/values.yaml
```

### 4. OCIRepository

```yaml
apiVersion: source.toolkit.fluxcd.io/v1beta2
kind: OCIRepository
metadata:
  name: my-oci-bundle
  namespace: flux-system
spec:
  interval: 5m
  url: oci://ghcr.io/organization/bundle
  ref:
    tag: v1.2.3
    # Or semver:
    # semver: ">=1.0.0"
  # Authentication for private registries:
  secretRef:
    name: oci-registry-credentials
  # Signature verification:
  verify:
    provider: cosign
    secretRef:
      name: cosign-public-key
```

#### Bucket Source (for S3/GCS/Azure storage)

```yaml
apiVersion: source.toolkit.fluxcd.io/v1beta2
kind: Bucket
metadata:
  name: config-bucket
  namespace: flux-system
spec:
  interval: 5m
  bucketName: my-config-bucket
  endpoint: s3.amazonaws.com
  provider: aws
  secretRef:
    name: bucket-credentials
```

### 5. Kustomization with Health Checks

```yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: my-app
  namespace: flux-system
spec:
  interval: 5m
  path: ./apps/my-app
  sourceRef:
    kind: GitRepository
    name: my-app-repo
  prune: true  # Remove resources no longer in manifest
  timeout: 3m
  
  # Health checks: wait for resources to be healthy
  healthChecks:
    - apiVersion: apps/v1
      kind: Deployment
      name: my-app
      namespace: production
    - apiVersion: batch/v1
      kind: Job
      name: migration-job
      namespace: production
  
  # Readiness check for dependencies
  healthCheckExprs:
    - apiVersion: apiextensions.k8s.io/v1
      kind: CustomResourceDefinition
      name: prometheuses.monitoring.coreos.com
      current: .status.conditions[?(@.type=="Established")].status=="True"
```

### 6. Kustomization Dependencies

Dependencies ensure Kustomizations are applied in the correct order.

```yaml
# Base Kustomization: infrastructure
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: infrastructure
  namespace: flux-system
spec:
  interval: 10m
  path: ./infrastructure
  sourceRef:
    kind: GitRepository
    name: flux-system
  prune: true
---
# Dependent Kustomization: applications
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: applications
  namespace: flux-system
spec:
  interval: 5m
  path: ./apps
  sourceRef:
    kind: GitRepository
    name: flux-system
  dependsOn:
    - name: infrastructure
  prune: true
---
# Complete chain
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: monitoring
  namespace: flux-system
spec:
  dependsOn:
    - name: infrastructure
    - name: applications
  # Waits for both to be ready
```

### 7. Signature Verification with Cosign

```yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: signed-app
  namespace: flux-system
spec:
  sourceRef:
    kind: OCIRepository
    name: signed-bundle
  verification:
    provider: cosign
    secretRef:
      name: cosign-public-key
---
apiVersion: v1
kind: Secret
metadata:
  name: cosign-public-key
  namespace: flux-system
stringData:
  cosign.pub: |
    -----BEGIN PUBLIC KEY-----
    MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...
    -----END PUBLIC KEY-----
```

### 8. Garbage Collection and Pruning

```yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: my-app
spec:
  prune: true  # Enable resource removal
  # Garbage collection strategy
  garbageCollection:
    mode: OnDeletion  # 'OnDeletion' (default) or 'Disabled'
```

## ⚠️ Common Pitfalls

1. **Circular dependencies**: Do not create cycles in Kustomization dependencies. Flux will refuse to apply them.

2. **Timeouts too short**: Complex deployments may require more time. Set appropriate timeouts (e.g., 5m for deployments with migration jobs).

3. **Health checks on non-existent resources**: Ensure resources referenced in health checks are created by the Kustomization or its dependency.

4. **Incorrect Secret format**: For SSH, the `identity` field must contain the complete private key including header/footer.

5. **Ignoring error conditions**: Always check `flux get kustomization -A` to identify failures.

## ✅ Best Practices

- Use `dependsOn` to guarantee deployment order
- Set `prune: true` to avoid orphaned resources
- Configure adequate timeouts for complex deployments
- Verify artifact signatures in production
- Use `semver` instead of branch for production environments
- Monitor Kustomization status with `flux get`
- Document dependencies in the repository README

## 📊 Status and Conditions

```bash
# View status of all Kustomizations
flux get kustomization -A

# Details on a specific Kustomization
flux get kustomization my-app -o yaml

# Check sources
flux get source git -A
flux get source helm -A
flux get source oci -A

# Troubleshoot reconciliation issues
flux reconcile kustomization my-app --with-source
```

## 🔧 Hands-on Exercises

1. Configure GitRepository with SSH authentication
2. Create a HelmRepository and use it to deploy a chart
3. Implement dependencies between three Kustomizations (infra → apps → monitoring)
4. Configure health checks for Deployment and Job
5. Enable Cosign verification for an OCIRepository

## 📝 Summary

This module covered Flux's fundamental components for source and Kustomization management. Understanding GitRepository, HelmRepository, OCIRepository, and Bucket enables integration with any configuration source. Kustomization dependencies, health checks, and garbage collection are essential for reliable deployments. Signature verification with Cosign adds a critical security layer for production environments.

In the next module, we'll explore CI/CD pipeline integration and advanced deployment strategies.
