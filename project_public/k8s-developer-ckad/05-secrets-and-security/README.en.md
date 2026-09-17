# Module 05: Secrets and Security

**Duration**: 4-5 hours  
**CKAD Weight**: 20% (Application Deployment)

## Learning Objectives

By the end of this module, you will be able to:
- Create and manage Kubernetes Secrets
- Use different Secret types (Opaque, TLS, docker-registry)
- Configure security context for Pods and containers
- Understand and apply Pod Security Standards
- Configure ServiceAccount and basic RBAC
- Implement NetworkPolicy for network isolation

---

## 1. Kubernetes Secrets

### 1.1 Secret Types

| Type | Use | Creation |
|------|-----|----------|
| Opaque | Generic data | kubectl create secret generic |
| kubernetes.io/tls | TLS certificates | kubectl create secret tls |
| kubernetes.io/dockerconfigjson | Docker registry | kubectl create secret docker-registry |
| kubernetes.io/basic-auth | Basic credentials | Manual YAML |
| kubernetes.io/ssh-auth | SSH keys | Manual YAML |

### 1.2 Creating Secrets

```bash
# Generic Secret (Opaque)
kubectl create secret generic db-secret \
  --from-literal=username=admin \
  --from-literal=password=secret123 \
  --from-file=ssh-key=./id_rsa

# TLS Secret
kubectl create secret tls tls-secret \
  --cert=path/to/cert.pem \
  --key=path/to/key.pem

# Registry Secret
kubectl create secret docker-registry regcred \
  --docker-server=registry.example.com \
  --docker-username=admin \
  --docker-password=password \
  --docker-email=admin@example.com
```

### 1.3 YAML Secret

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
type: Opaque
data:
  # Base64-encoded values
  username: YWRtaW4=
  password: c2VjcmV0MTIz
stringData:
  # Plain text values (automatically encoded)
  api-key: "my-api-key-123"
```

---

## 2. Using Secrets

### 2.1 As Environment Variables

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secret-env-pod
spec:
  containers:
  - name: app
    image: nginx:alpine
    env:
    - name: DB_USERNAME
      valueFrom:
        secretKeyRef:
          name: db-secret
          key: username
    envFrom:
    - secretRef:
        name: db-secret
```

### 2.2 As Volume

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secret-volume-pod
spec:
  containers:
  - name: app
    image: nginx:alpine
    volumeMounts:
    - name: secrets
      mountPath: /etc/secrets
      readOnly: true
  volumes:
  - name: secrets
    secret:
      name: app-secret
      defaultMode: 0400
      items:
      - key: username
        path: user.txt
        mode: 0444
```

---

## 3. Security Context

### 3.1 Pod Configuration

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secure-pod
spec:
  securityContext:
    runAsUser: 1000        # UID for all containers
    runAsGroup: 3000       # GID for all containers
    runAsNonRoot: true    # Prevent running as root
    fsGroup: 2000         # GID for volumes
  containers:
  - name: app
    image: nginx:alpine
    securityContext:
      readOnlyRootFilesystem: true
      allowPrivilegeEscalation: false
      capabilities:
        drop: ['ALL']
        add: ['NET_BIND_SERVICE']
```

### 3.2 Main Options

| Option | Level | Description |
|--------|-------|-------------|
| runAsUser | Pod/Container | User UID |
| runAsGroup | Pod | Group GID |
| runAsNonRoot | Pod/Container | Prevent root |
| fsGroup | Pod | GID for volumes |
| readOnlyRootFilesystem | Container | Read-only FS |
| allowPrivilegeEscalation | Container | No setuid |
| capabilities | Container | Linux capabilities |

---

## 4. Linux Capabilities

### 4.1 Managing Capabilities

```yaml
securityContext:
  capabilities:
    drop: ['ALL']              # Drop all
    add:                       # Add only necessary
    - 'NET_BIND_SERVICE'       # Bind ports < 1024
    - 'CHOWN'                  # Change file ownership
```

### 4.2 Common Capabilities

| Capability | Use |
|------------|-----|
| CAP_NET_BIND_SERVICE | Binding privileged ports |
| CAP_NET_ADMIN | Network configuration |
| CAP_NET_RAW | Ping, raw sockets |
| CAP_SYS_ADMIN | System operations (avoid) |
| CAP_CHOWN | Change ownership |
| CAP_FOWNER | Bypass file permissions |

---

## 5. Pod Security Standards

### 5.1 Three Levels

| Standard | Description | Use cases |
|----------|-------------|-----------|
| Privileged | No restrictions | System, infra |
| Baseline | Minimum restrictions | Standard apps |
| Restricted | Maximum security | Critical apps |

### 5.2 Namespace Application

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    # Enforce: block violations
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/enforce-version: v1.24
    
    # Audit: log violations
    pod-security.kubernetes.io/audit: restricted
    
    # Warn: warn on submission
    pod-security.kubernetes.io/warn: restricted
```

### 5.3 Restricted Requirements

- `runAsNonRoot: true`
- `runAsUser` > 0
- `allowPrivilegeEscalation: false`
- `capabilities.drop: ['ALL']`
- Seccomp profile: `RuntimeDefault`
- Limited volume types

---

## 6. ServiceAccount

### 6.1 Concept

ServiceAccount provides identity to Pods for communicating with the API server.

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: app-sa
automountServiceAccountToken: false  # Disable auto-mount
```

### 6.2 Usage

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-pod
spec:
  serviceAccountName: app-sa
  automountServiceAccountToken: false  # Override per Pod
  containers:
  - name: app
    image: nginx
```

### 6.3 JWT Token

Mounted at: `/var/run/secrets/kubernetes.io/serviceaccount/token`

```bash
# Verify token
kubectl exec <pod> -- cat /var/run/secrets/kubernetes.io/serviceaccount/token

# Decode JWT (base64)
kubectl exec <pod> -- cat /var/run/secrets/kubernetes.io/serviceaccount/token | cut -d. -f2 | base64 -d
```

---

## 7. Basic RBAC

### 7.1 Role

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader
  namespace: default
rules:
- apiGroups: ['']
  resources: ['pods', 'pods/log']
  verbs: ['get', 'list', 'watch']
- apiGroups: ['']
  resources: ['secrets']
  verbs: ['get']
  resourceNames: ['app-secret']  # Only this Secret
```

### 7.2 ClusterRole

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: node-reader
rules:
- apiGroups: ['']
  resources: ['nodes']
  verbs: ['get', 'list', 'watch']
```

### 7.3 RoleBinding

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: app-sa-pod-reader
  namespace: default
subjects:
- kind: ServiceAccount
  name: app-sa
  namespace: default
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

### 7.4 ClusterRoleBinding

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: admin-binding
subjects:
- kind: User
  name: admin
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: ClusterRole
  name: cluster-admin
  apiGroup: rbac.authorization.k8s.io
```

---

## 8. NetworkPolicy

### 8.1 Concept

NetworkPolicy controls network traffic between Pods. It's additive: if no policies exist, everything is allowed.

### 8.2 Deny All

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all
spec:
  podSelector: {}        # All Pods in namespace
  policyTypes:
  - Ingress
  - Egress
  # No rules = deny all
```

### 8.3 Allow Specific

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    - namespaceSelector:
        matchLabels:
          env: production
    ports:
    - port: 8080
      protocol: TCP
```

### 8.4 Egress

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-dns
spec:
  podSelector: {}
  policyTypes:
  - Egress
  egress:
  - to:
    - namespaceSelector: {}
      podSelector:
        matchLabels:
          k8s-app: kube-dns
    ports:
    - port: 53
      protocol: UDP
```

---

## 9. Security Best Practices

### 9.1 Checklist

- [ ] Run as non-root user
- [ ] Read-only filesystem
- [ ] Drop all capabilities
- [ ] Set ResourceQuota
- [ ] Use NetworkPolicy
- [ ] Disable token automount if not needed
- [ ] Use Secrets for sensitive data
- [ ] Apply Pod Security Standards

### 9.2 Hardened Pod

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: hardened-pod
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    runAsGroup: 1000
    fsGroup: 1000
    seccompProfile:
      type: RuntimeDefault
  containers:
  - name: app
    image: nginx:alpine
    securityContext:
      readOnlyRootFilesystem: true
      allowPrivilegeEscalation: false
      capabilities:
        drop: ['ALL']
    resources:
      limits:
        cpu: 500m
        memory: 256Mi
      requests:
        cpu: 100m
        memory: 64Mi
    volumeMounts:
    - name: cache
      mountPath: /var/cache/nginx
    - name: run
      mountPath: /var/run
  volumes:
  - name: cache
    emptyDir: {}
  - name: run
    emptyDir: {}
```

---

## 10. Practical Exercise

### Scenario
Implement a secure application with:
1. Secrets for credentials
2. Restrictive security context
3. NetworkPolicy for isolation
4. RBAC for API access

### Steps

1. Create Secret for database
2. Configure secure Pod
3. Implement NetworkPolicy
4. Test isolation
5. Verify RBAC

---

## Summary

| Concept | Importance | Notes |
|---------|------------|-------|
| Secret | High | Never in plaintext |
| Security Context | High | Basic hardening |
| Pod Security Standards | Medium | Namespace policy |
| RBAC | Medium | API access |
| NetworkPolicy | Medium | Network isolation |

---

## Additional Resources

- [Kubernetes Secrets](https://kubernetes.io/docs/concepts/configuration/secret/)
- [Pod Security Standards](https://kubernetes.io/docs/concepts/security/pod-security-standards/)
- [RBAC Documentation](https://kubernetes.io/docs/reference/access-authn-authz/rbac/)
- [Network Policies](https://kubernetes.io/docs/concepts/services-networking/network-policies/)
