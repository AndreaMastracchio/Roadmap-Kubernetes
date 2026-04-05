# Modulo 6: 🔒 Sicurezza & Accesso (RBAC)

In Kubernetes, la sicurezza si basa sul principio del **minimo privilegio**: nessuno deve avere più permessi di quelli strettamente necessari.

## 1. RBAC (Role-Based Access Control)
È il sistema che decide "chi può fare cosa". Si compone di 4 oggetti principali:

- **Role**: Definisce un insieme di permessi all'interno di un **singolo Namespace** (es. "può leggere i Pod").
- **ClusterRole**: Definisce permessi validi in **tutto il cluster** (es. "può leggere i Nodi").
- **RoleBinding**: Lega un `Role` a un utente, gruppo o ServiceAccount in un Namespace.
- **ClusterRoleBinding**: Lega un `ClusterRole` a un utente in tutto il cluster.

### Esempio di Role (Solo lettura Pod)
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: default
  name: pod-reader
rules:
- apiGroups: [""] # "" indica il core API group
  resources: ["pods"]
  verbs: ["get", "watch", "list"]
```

## 2. ServiceAccounts: L'identità dei Pod
Mentre gli utenti (umani) sono gestiti esternamente (es. tramite certificati o OIDC), i processi che girano nei Pod usano i **ServiceAccounts**.
Se la tua applicazione deve parlare con l'API Server (es. per elencare altri Pod), deve avere un ServiceAccount con i permessi giusti.

## 3. Sicurezza dei Container: Pod Security Standards
Kubernetes definisce tre livelli di isolamento:
- **Privileged**: Nessuna restrizione (pericoloso, solo per componenti di sistema).
- **Baseline**: Previene le vulnerabilità note.
- **Restricted**: Segue le best practice più stringenti (es. vieta il root).

## 4. Best Practices di Sicurezza
1. **Network Policies**: Isola il traffico di rete (vedi Modulo 4).
2. **Secrets Encryption**: Assicurati che i Secret siano criptati a riposo in etcd.
3. **No Root**: Usa l'istruzione `runAsNonRoot: true` nel `securityContext` del Pod.
4. **Namespace**: Usa i Namespace per separare logicamente i team e gli ambienti (dev, staging, prod).

---

## Esercizio Pratico
1. Crea un ServiceAccount chiamato `monitor-sa`.
2. Crea un Role che permetta solo di fare `get` e `list` sui `services`.
3. Crea un RoleBinding per associare il Role al ServiceAccount.
4. Prova a lanciare un Pod usando quel ServiceAccount e usa `kubectl auth can-i list pods --as=system:serviceaccount:default:monitor-sa` per verificare i permessi.
