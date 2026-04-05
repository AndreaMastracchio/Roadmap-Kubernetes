# Modulo 4: 🌐 Networking Avanzato

In Kubernetes, il networking è fondamentale. Ogni Pod riceve il proprio indirizzo IP unico e può comunicare con gli altri Pod nel cluster senza NAT (Network Address Translation).

## 1. Ingress: Il Reverse Proxy intelligente
Mentre un `Service` di tipo `LoadBalancer` espone un solo servizio alla volta (spesso con un costo aggiuntivo in cloud), un **Ingress** agisce come un router/reverse proxy (spesso basato su Nginx, Traefik o HAProxy) che può gestire più servizi basandosi sul percorso URL o sul dominio.

### Perché usare Ingress?
- **Risparmio di costi**: Un solo LoadBalancer può servire centinaia di microservizi.
- **Terminazione SSL/TLS**: Gestisce i certificati HTTPS in un unico punto.
- **Routing avanzato**: Puoi dire "manda tutto quello che va su `/api` al servizio backend e tutto il resto al frontend".

## 2. Network Policies: Il Firewall dei Pod
Di default, in Kubernetes vige il principio della "rete piatta": **tutti i Pod possono parlare con tutti gli altri**. In produzione questo è un rischio di sicurezza.
Le **NetworkPolicies** permettono di definire regole di traffico (Ingress ed Egress) basate su label:

```yaml
kind: NetworkPolicy
apiVersion: networking.k8s.io/v1
metadata:
  name: api-allow-only-frontend
spec:
  podSelector:
    matchLabels:
      app: api # Applica la policy a questi Pod
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend # Solo i Pod con questa label possono entrare
```

## 3. CNI (Container Network Interface)
Kubernetes delega l'implementazione della rete a plugin esterni chiamati **CNI**.
- **Calico**: Leader per le Network Policies e scalabilità.
- **Flannel**: La soluzione più semplice "plug-and-play" per piccoli cluster.
- **Cilium**: La nuova frontiera basata su **eBPF**, offre prestazioni elevatissime e osservabilità profonda.

## 4. DNS nel Cluster
Kubernetes ha un servizio DNS interno (solitamente **CoreDNS**). Ogni servizio ha un nome DNS automatico:
`<service-name>.<namespace>.svc.cluster.local`

---

## Esercizio Pratico
1. Immagina di avere un frontend e un database. Scrivi una Network Policy che impedisca al database di ricevere connessioni da chiunque tranne che dal frontend.
2. Prova a installare un Ingress Controller (es. `nginx-ingress`) nel tuo cluster locale (kind/minikube).
