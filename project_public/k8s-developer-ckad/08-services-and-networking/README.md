# Modulo 08: Services e Networking

**Durata stimata:** 4 ore  
**Peso CKAD:** Application Networking (20%)

## Obiettivi di Apprendimento

Al termine di questo modulo sarai in grado di:

- Creare e configurare Service ClusterIP, NodePort, LoadBalancer ed ExternalName
- Comprendere la risoluzione DNS interna di Kubernetes
- Configurare Ingress per routing HTTP/HTTPS
- Implementare NetworkPolicy per isolamento rete
- Debuggare problemi di networking comuni

## Introduzione ai Service

I Service astraggono l'accesso ai pod, fornendo un endpoint stabile per comunicare con applicazioni dinamiche.

### Il Problema dell'Indirizzamento

I pod sono effimeri: nascono, muoiono, vengono riavviati. L'IP cambia ogni volta. Come fa un client a trovare l'applicazione?

```
Senza Service:
  Client → Pod (IP 10.244.1.5) → Pod crasha → Pod riavvia (IP 10.244.1.99) → Client non lo trova più

Con Service:
  Client → Service (IP stabile 10.96.0.1) → Pod 1, Pod 2, Pod 3 (IP dinamici)
  Service sa sempre quali pod sono pronti
```

### I Quattro Tipi di Service

```yaml
# ClusterIP - Predefinito, solo interno
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  type: ClusterIP  # Omettere equivale a questo
  selector:
    app: myapp
  ports:
  - port: 80
    targetPort: 8080
```

```yaml
# NodePort - Espone su ogni nodo
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
    nodePort: 30080  # Opzionale, range 30000-32767
```

```yaml
# LoadBalancer - Integra con cloud provider
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
# Crea automaticamente un NodePort e ClusterIP
```

```yaml
# ExternalName - Alias DNS esterno
apiVersion: v1
kind: Service
metadata:
  name: external-service
spec:
  type: ExternalName
  externalName: api.external-provider.com
```

## Concetti Chiave

### Selector ed Endpoints

Il Service usa il selector per trovare i pod. Gli Endpoints vengono creati automaticamente:

```yaml
# Service con selector
spec:
  selector:
    app: web     # Trova pod con label app=web
  ports:
  - port: 80
    targetPort: 8080

# Kubernetes crea automaticamente Endpoints:
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

### Service senza Selector

Per servizi esterni al cluster:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: external-db
spec:
  ports:
  - port: 3306
    targetPort: 3306
  # Nessun selector!
---
apiVersion: v1
kind: Endpoints
metadata:
  name: external-db  # Stesso nome del Service
subsets:
- addresses:
  - ip: 192.168.1.100  # IP esterno
  ports:
  - port: 3306
```

### Porte Multiple

```yaml
spec:
  ports:
  - name: http
    port: 80
    targetPort: 8080
  - name: https
    port: 443
    targetPort: 8443
  # name è obbligatorio con più porte
  selector:
    app: web
```

## DNS in Kubernetes

Ogni Service ottiene un nome DNS. CoreDNS risolve automaticamente:

```bash
# Formato del DNS
<service-name>.<namespace>.svc.<cluster-domain>

# Esempi
my-service              # Stesso namespace
my-service.default      # Namespace esplicito
my-service.default.svc.cluster.local  # FQDN completo

# Namespace diversi
db.production.svc.cluster.local
api.staging.svc.cluster.local
```

### Verifica DNS

```bash
# Da un pod nel cluster
kubectl run test --image=busybox --rm -it -- nslookup kubernetes

# Output:
Server:    10.96.0.10
Address 1: 10.96.0.10 kube-dns.kube-system.svc.cluster.local

Name:      kubernetes
Address 1: 10.96.0.1 kubernetes.default.svc.cluster.local
```

### Service Headless

Per applicazioni che necessitano di DNS per ogni pod (es. database clustered):

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

# Con StatefulSet, ogni pod ottiene:
# web-0.web-headless.default.svc.cluster.local
# web-1.web-headless.default.svc.cluster.local
```

## Ingress

Ingress gestisce routing HTTP/HTTPS a livello di applicazione. Richiede un Ingress Controller.

### Configurazione Base

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

Creare il secret TLS:

```bash
kubectl create secret tls tls-secret \
  --cert=path/to/cert.pem \
  --key=path/to/key.pem
```

## NetworkPolicy

Le NetworkPolicy controllano il traffico di rete tra pod. Default: tutto permesso.

### Policy di Base

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-policy
spec:
  podSelector:
    matchLabels:
      app: api      # Applica a questi pod
  policyTypes:
  - Ingress        # Controlla traffico in entrata
  - Egress         # Controlla traffico in uscita
  ingress:
  - from:
    - podSelector:
        matchLabels:
          role: frontend  # Solo da frontend
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
  # ingress vuoto = deny all ingress
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
  - {}  # Allow da qualsiasi sorgente
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

1. **Usa nomi significativi** - `api-gateway`, `user-service`, `db-primary`
2. **Definisci porte con nome** - Sempre con porte multiple
3. **Configura readinessProbe** - Il Service usa i pod pronti
4. **Usa headless per StatefulSet** - DNS stabile per ogni pod

### Ingress Best Practices

1. **Un Ingress per applicazione** - Evita conflitti
2. **Usa TLS** - Mai HTTP in produzione
3. **Configura rate limiting** - Proteggi dal traffico eccessivo
4. **Path specifici** - Evita path troppo generici

### NetworkPolicy Strategy

1. **Inizia con deny-all** - Poi apri solo il necessario
2. **Usa namespace** - Separa ambienti con NetworkPolicy
3. **Documenta le policy** - Motiva ogni regola
4. **Testa le policy** - Verifica che funzionino come previsto

## Debugging Networking

### Service Non Raggiungibile

```bash
# 1. Verifica che il Service esista
kubectl get svc

# 2. Verifica gli Endpoints
kubectl get endpoints <service-name>

# 3. Se vuoto, controlla il selector
kubectl describe svc <service-name>
kubectl get pods -l app=<label-value>

# 4. Testa da dentro il cluster
kubectl run test --image=busybox --rm -it -- wget -qO- <service-name>
```

### DNS Non Risolve

```bash
# Verifica CoreDNS
kubectl get pods -n kube-system -l k8s-app=kube-dns

# Testa DNS
kubectl run test --image=busybox --rm -it -- nslookup kubernetes

# Controlla ConfigMap CoreDNS
kubectl get configmap coredns -n kube-system -o yaml
```

### NetworkPolicy Blocca

```bash
# Verifica che la NetworkPolicy esista
kubectl get networkpolicy -n <namespace>

# Controlla i selettori
kubectl describe networkpolicy <name>

# Testa con pod che matcha/non matcha
```

## Esercitazione Pratica

Per consolidare le conoscenze:

1. Crea un'applicazione a tre tier (frontend, backend, database)
2. Configura i Service per ogni componente
3. Implementa Ingress per l'esposizione esterna
4. Aggiungi NetworkPolicy per isolare i tier
5. Testa la comunicazione e debugga eventuali problemi

## Conclusione

Il networking Kubernetes è fondamentale per applicazioni distribuite. In questo modulo hai imparato:

- I quattro tipi di Service e quando usarli
- Come funziona la risoluzione DNS interna
- A configurare Ingress per routing HTTP
- A implementare NetworkPolicy per sicurezza

Nel prossimo modulo approfondiremo lo storage persistente.
