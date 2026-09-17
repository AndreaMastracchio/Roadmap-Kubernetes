# Module 08: Services and Networking

**Estimated Duration:** 4 hours  
**CKAD Weight:** Application Networking (20%)

## Learning Objectives

By the end of this module you will be able to:

- Create and configure ClusterIP, NodePort, LoadBalancer and ExternalName Services
- Understand Kubernetes internal DNS resolution
- Configure Ingress for HTTP/HTTPS routing
- Implement NetworkPolicy for network isolation
- Debug common networking issues

## Introduction to Services

Services abstract pod access, providing a stable endpoint for communicating with dynamic applications.

### The Addressing Problem

Pods are ephemeral: they're created, die, and restart. IP changes every time. How does a client find the application?

```
Without Service:
  Client → Pod (IP 10.244.1.5) → Pod crashes → Pod restarts (IP 10.244.1.99) → Client can't find it

With Service:
  Client → Service (stable IP 10.96.0.1) → Pod 1, Pod 2, Pod 3 (dynamic IPs)
  Service always knows which pods are ready
```

### The Four Service Types

```yaml
# ClusterIP - Default, internal only
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  type: ClusterIP  # Omitting defaults to this
  selector:
    app: myapp
  ports:
  - port: 80
    targetPort: 8080
```

```yaml
# NodePort - Exposes on every node
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  type: NodePort
  selector:
    app: myapp
  ports:
  - port: 80
    targetPort: 8080
    nodePort: 30080  # Optional, range 30000-32767
```

```yaml
# LoadBalancer - Integrates with cloud provider
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  type: LoadBalancer
  selector:
    app: myapp
  ports:
  - port: 80
    targetPort: 8080
# Automatically creates NodePort and ClusterIP
```

```yaml
# ExternalName - External DNS alias
apiVersion: v1
kind: Service
metadata:
  name: external-service
spec:
  type: ExternalName
  externalName: api.external-provider.com
```

## Key Concepts

### Selector and Endpoints

The Service uses selectors to find pods. Endpoints are created automatically:

```yaml
# Service with selector
spec:
  selector:
    app: web     # Find pods with label app=web
  ports:
  - port: 80
    targetPort: 8080

# Kubernetes automatically creates Endpoints:
apiVersion: v1
kind: Endpoints
metadata:
  name: web-service
subsets:
- addresses:
  - ip: 10.244.1.5
  - ip: 10.244.2.8
  ports:
  - port: 8080
```

### Service without Selector

For services external to the cluster:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: external-db
spec:
  ports:
  - port: 3306
    targetPort: 3306
  # No selector!
---
apiVersion: v1
kind: Endpoints
metadata:
  name: external-db  # Same name as Service
subsets:
- addresses:
  - ip: 192.168.1.100  # External IP
  ports:
  - port: 3306
```

### Multiple Ports

```yaml
spec:
  ports:
  - name: http
    port: 80
    targetPort: 8080
  - name: https
    port: 443
    targetPort: 8443
  # name is required with multiple ports
  selector:
    app: web
```

## Kubernetes DNS

Every Service gets a DNS name. CoreDNS resolves automatically:

```bash
# DNS format
<service-name>.<namespace>.svc.<cluster-domain>

# Examples
my-service              # Same namespace
my-service.default      # Explicit namespace
my-service.default.svc.cluster.local  # Full FQDN

# Different namespaces
db.production.svc.cluster.local
api.staging.svc.cluster.local
```

### DNS Verification

```bash
# From a pod in the cluster
kubectl run test --image=busybox --rm -it -- nslookup kubernetes

# Output:
Server:    10.96.0.10
Address 1: 10.96.0.10 kube-dns.kube-system.svc.cluster.local

Name:      kubernetes
Address 1: 10.96.0.1 kubernetes.default.svc.cluster.local
```

### Headless Service

For applications needing DNS per pod (e.g., clustered databases):

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web-headless
spec:
  clusterIP: None  # Headless!
  selector:
    app: web
  ports:
  - port: 80

# With StatefulSet, each pod gets:
# web-0.web-headless.default.svc.cluster.local
# web-1.web-headless.default.svc.cluster.local
```

## Ingress

Ingress manages HTTP/HTTPS routing at application level. Requires an Ingress Controller.

### Basic Configuration

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-service
            port:
              number: 80
```

### Path-Based Routing

```yaml
spec:
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 80
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
```

### TLS/HTTPS

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: tls-ingress
spec:
  tls:
  - hosts:
    - secure.example.com
    secretName: tls-secret
  rules:
  - host: secure.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: secure-service
            port:
              number: 80
```

Create the TLS secret:

```bash
kubectl create secret tls tls-secret \
  --cert=path/to/cert.pem \
  --key=path/to/key.pem
```

## NetworkPolicy

NetworkPolicies control network traffic between pods. Default: everything allowed.

### Basic Policy

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-policy
spec:
  podSelector:
    matchLabels:
      app: api      # Apply to these pods
  policyTypes:
  - Ingress        # Control incoming traffic
  - Egress         # Control outgoing traffic
  ingress:
  - from:
    - podSelector:
        matchLabels:
          role: frontend  # Only from frontend
    ports:
    - protocol: TCP
      port: 8080
```

### Deny All

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all
spec:
  podSelector:
    matchLabels:
      app: private
  policyTypes:
  - Ingress
  # empty ingress = deny all ingress
```

### Allow All

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-all
spec:
  podSelector:
    matchLabels:
      app: public
  ingress:
  - {}  # Allow from any source
  policyTypes:
  - Ingress
```

### Cross-Namespace

```yaml
spec:
  podSelector:
    matchLabels:
      app: api
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: frontend
      podSelector:
        matchLabels:
          app: frontend
```

## Best Practices

### Service Design

1. **Use meaningful names** - `api-gateway`, `user-service`, `db-primary`
2. **Define named ports** - Always with multiple ports
3. **Configure readinessProbe** - Service uses ready pods
4. **Use headless for StatefulSet** - Stable DNS for each pod

### Ingress Best Practices

1. **One Ingress per application** - Avoid conflicts
2. **Use TLS** - Never HTTP in production
3. **Configure rate limiting** - Protect from excessive traffic
4. **Specific paths** - Avoid overly generic paths

### NetworkPolicy Strategy

1. **Start with deny-all** - Then open only necessary
2. **Use namespaces** - Separate environments with NetworkPolicy
3. **Document policies** - Justify every rule
4. **Test policies** - Verify they work as intended

## Debugging Networking

### Service Unreachable

```bash
# 1. Verify Service exists
kubectl get svc

# 2. Verify Endpoints
kubectl get endpoints <service-name>

# 3. If empty, check selector
kubectl describe svc <service-name>
kubectl get pods -l app=<label-value>

# 4. Test from inside cluster
kubectl run test --image=busybox --rm -it -- wget -qO- <service-name>
```

### DNS Not Resolving

```bash
# Verify CoreDNS
kubectl get pods -n kube-system -l k8s-app=kube-dns

# Test DNS
kubectl run test --image=busybox --rm -it -- nslookup kubernetes

# Check CoreDNS ConfigMap
kubectl get configmap coredns -n kube-system -o yaml
```

### NetworkPolicy Blocking

```bash
# Verify NetworkPolicy exists
kubectl get networkpolicy -n <namespace>

# Check selectors
kubectl describe networkpolicy <name>

# Test with matching/non-matching pod
```

## Hands-On Exercise

To consolidate your knowledge:

1. Create a three-tier application (frontend, backend, database)
2. Configure Services for each component
3. Implement Ingress for external exposure
4. Add NetworkPolicy to isolate tiers
5. Test communication and debug any issues

## Conclusion

Kubernetes networking is fundamental for distributed applications. In this module you learned:

- The four Service types and when to use them
- How internal DNS resolution works
- To configure Ingress for HTTP routing
- To implement NetworkPolicy for security

In the next module we'll explore persistent storage.
