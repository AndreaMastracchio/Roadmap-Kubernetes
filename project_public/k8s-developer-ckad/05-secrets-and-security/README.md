# Modulo 05: Secrets e Security

**Durata**: 4-5 ore  
**Peso CKAD**: 20% (Application Deployment)

## Obiettivi di Apprendimento

Al termine di questo modulo sarai in grado di:
- Creare e gestire Kubernetes Secrets
- Utilizzare diversi tipi di Secret (Opaque, TLS, docker-registry)
- Configurare security context per Pod e container
- Comprendere e applicare Pod Security Standards
- Configurare ServiceAccount e RBAC base
- Implementare NetworkPolicy per isolamento rete

---

## 1. Kubernetes Secrets

### 1.1 Tipi di Secret

| Tipo | Uso | Creazione |
|------|-----|-----------|
| Opaque | Dati generici | kubectl create secret generic |
| kubernetes.io/tls | Certificati TLS | kubectl create secret tls |
| kubernetes.io/dockerconfigjson | Registry Docker | kubectl create secret docker-registry |
| kubernetes.io/basic-auth | Credenziali base | YAML manuale |
| kubernetes.io/ssh-auth | Chiavi SSH | YAML manuale |

### 1.2 Creazione di Secret

```bash
# Secret generico (Opaque)
kubectl create secret generic db-secret \
  --from-literal=username=admin \
  --from-literal=password=secret123 \
  --from-file=ssh-key=./id_rsa

# Secret TLS
kubectl create secret tls tls-secret \
  --cert=path/to/cert.pem \
  --key=path/to/key.pem

# Secret per registry
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
  # Valori codificati base64
  username: YWRtaW4=
  password: c2VjcmV0MTIz
stringData:
  # Valori in chiaro (codificati automaticamente)
  api-key: "my-api-key-123"
```

---

## 2. Utilizzo dei Secret

### 2.1 Come Variabili d'Ambiente

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

### 2.2 Come Volume

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

### 3.1 Configurazione Pod

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secure-pod
spec:
  securityContext:
    runAsUser: 1000        # UID per tutti i container
    runAsGroup: 3000       # GID per tutti i container
    runAsNonRoot: true    # Impedisce esecuzione come root
    fsGroup: 2000         # GID per i volumi
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

### 3.2 Opzioni Principali

| Opzione | Livello | Descrizione |
|---------|---------|-------------|
| runAsUser | Pod/Container | UID dell'utente |
| runAsGroup | Pod | GID del gruppo |
| runAsNonRoot | Pod/Container | Impedisce root |
| fsGroup | Pod | GID per volumi |
| readOnlyRootFilesystem | Container | FS in sola lettura |
| allowPrivilegeEscalation | Container | No setuid |
| capabilities | Container | Capabilities Linux |

---

## 4. Linux Capabilities

### 4.1 Gestione Capabilities

```yaml
securityContext:
  capabilities:
    drop: ['ALL']              # Rimuovi tutte
    add:                       # Aggiungi solo necessarie
    - 'NET_BIND_SERVICE'       # Binding porte < 1024
    - 'CHOWN'                  # Cambia ownership file
```

### 4.2 Capabilities Comuni

| Capability | Uso |
|------------|-----|
| CAP_NET_BIND_SERVICE | Binding porte privilegiate |
| CAP_NET_ADMIN | Configurazione rete |
| CAP_NET_RAW | Ping, socket raw |
| CAP_SYS_ADMIN | Operazioni sistema (evitare) |
| CAP_CHOWN | Cambia ownership |
| CAP_FOWNER | Bypass permessi file |

---

## 5. Pod Security Standards

### 5.1 Tre Livelli

| Standard | Descrizione | Casi d'uso |
|----------|-------------|------------|
| Privileged | Nessuna restrizione | Sistema, infra |
| Baseline | Restrizioni minime | App standard |
| Restricted | Massima sicurezza | App critiche |

### 5.2 Applicazione per Namespace

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    # Enforce: blocca violazioni
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/enforce-version: v1.24
    
    # Audit: logga violazioni
    pod-security.kubernetes.io/audit: restricted
    
    # Warn: avvisa all'invio
    pod-security.kubernetes.io/warn: restricted
```

### 5.3 Requisiti Restricted

- `runAsNonRoot: true`
- `runAsUser` > 0
- `allowPrivilegeEscalation: false`
- `capabilities.drop: ['ALL']`
- Seccomp profile: `RuntimeDefault`
- Volume types limitati

---

## 6. ServiceAccount

### 6.1 Concetto

ServiceAccount fornisce identità ai Pod per comunicare con il API server.

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: app-sa
automountServiceAccountToken: false  # Disabilita mount automatico
```

### 6.2 Utilizzo

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

### 6.3 Token JWT

Montato in: `/var/run/secrets/kubernetes.io/serviceaccount/token`

```bash
# Verifica token
kubectl exec <pod> -- cat /var/run/secrets/kubernetes.io/serviceaccount/token

# Decodifica JWT (base64)
kubectl exec <pod> -- cat /var/run/secrets/kubernetes.io/serviceaccount/token | cut -d. -f2 | base64 -d
```

---

## 7. RBAC Base

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
  resourceNames: ['app-secret']  # Solo questo Secret
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

### 8.1 Concetto

NetworkPolicy controlla il traffico di rete tra Pod. È additiva: se non ci sono policy, tutto è permesso.

### 8.2 Deny All

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all
spec:
  podSelector: {}        # Tutti i Pod nel namespace
  policyTypes:
  - Ingress
  - Egress
  # Nessuna regola = deny all
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

## 9. Best Practice di Sicurezza

### 9.1 Checklist

- [ ] Eseguire come utente non-root
- [ ] Filesystem read-only
- [ ] Drop tutte le capabilities
- [ ] Impostare ResourceQuota
- [ ] Usare NetworkPolicy
- [ ] Disabilitare automount token se non necessario
- [ ] Usare Secret per dati sensibili
- [ ] Applicare Pod Security Standards

### 9.2 Pod Hardened

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

## 10. Esercitazione Pratica

### Scenario
Implementare un'applicazione sicura con:
1. Secret per credenziali
2. Security context restrittivo
3. NetworkPolicy per isolamento
4. RBAC per accesso API

### Passi

1. Crea Secret per database
2. Configura Pod sicuro
3. Implementa NetworkPolicy
4. Testa isolamento
5. Verifica RBAC

---

## Riepilogo

| Concetto | Importanza | Note |
|----------|------------|------|
| Secret | Alta | Mai in chiaro |
| Security Context | Alta | Hardening base |
| Pod Security Standards | Media | Policy namespace |
| RBAC | Media | Accesso API |
| NetworkPolicy | Media | Isolamento rete |

---

## Risorse Aggiuntive

- [Kubernetes Secrets](https://kubernetes.io/docs/concepts/configuration/secret/)
- [Pod Security Standards](https://kubernetes.io/docs/concepts/security/pod-security-standards/)
- [RBAC Documentation](https://kubernetes.io/docs/reference/access-authn-authz/rbac/)
- [Network Policies](https://kubernetes.io/docs/concepts/services-networking/network-policies/)
