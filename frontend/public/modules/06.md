# Modulo 6: 🔒 Sicurezza e Controllo Accessi (RBAC)

La sicurezza in Kubernetes segue il principio del **minimo privilegio** (Least Privilege): ogni utente o processo deve avere solo i permessi strettamente necessari per svolgere il proprio compito.

---

## 1. Autenticazione vs Autorizzazione
1.  **Autenticazione (Chi sei?)**: Kubernetes verifica l'identità tramite certificati X.509, token statici o sistemi esterni (OIDC, LDAP).
2.  **Autorizzazione (Cosa puoi fare?)**: Una volta identificato, Kubernetes controlla se hai il permesso di eseguire l'azione richiesta (es. `get pods`). Il sistema principale è **RBAC**.

---

## 2. RBAC (Role-Based Access Control)
RBAC si basa su quattro oggetti fondamentali divisi tra livello Namespace e livello Cluster.

### A livello di Namespace:
-   **Role**: Un insieme di regole di permesso (Verbi + Risorse) valide solo in un namespace.
-   **RoleBinding**: Lega un `Role` (o un `ClusterRole`) a un soggetto (utente, gruppo o ServiceAccount) in un namespace specifico.

### A livello di Cluster:
-   **ClusterRole**: Permessi validi in **tutto il cluster** (es. gestire i Nodi, i PersistentVolumes o i Pod in tutti i namespace).
-   **ClusterRoleBinding**: Lega un `ClusterRole` a un soggetto in tutto il cluster.

**Esempio di Role (Lettura Pod):**
```yaml
rules:
- apiGroups: [""] # Core API group
  resources: ["pods"]
  verbs: ["get", "list", "watch"]
```

---

## 3. ServiceAccounts: L'identità dei Pod
Mentre gli utenti (umani) sono gestiti esternamente, i processi che girano nei Pod usano i **ServiceAccounts** per autenticarsi presso l'API Server.
-   Ogni namespace ha un `default` ServiceAccount.
-   È best practice creare ServiceAccount dedicati per ogni applicazione che necessita di interagire con Kubernetes (es. una dashboard o un operatore).

---

## 4. Security Context: Sicurezza del Container
Il `securityContext` definisce le impostazioni di sicurezza a livello di Pod o di singolo Container.
-   **runAsNonRoot**: Impedisce l'esecuzione del container come utente `root`.
-   **readOnlyRootFilesystem**: Rende il file system del container in sola lettura (previene modifiche malevole).
-   **capabilities**: Permette di aggiungere o rimuovere privilegi specifici del kernel Linux (es. `NET_ADMIN`).

```yaml
spec:
  securityContext:
    runAsUser: 1000
    runAsGroup: 3000
    fsGroup: 2000
  containers:
  - name: my-app
    securityContext:
      allowPrivilegeEscalation: false
      capabilities:
        drop: ["ALL"]
```

---

## 5. Pod Security Admission (PSA)
Kubernetes ha rimpiazzato le vecchie *PodSecurityPolicies* con un sistema più semplice integrato nei namespace tramite label:
-   **privileged**: Nessuna restrizione.
-   **baseline**: Restrizioni minime per prevenire vulnerabilità note.
-   **restricted**: Massima sicurezza (seguendo le best practice).

**Comando per attivarlo**:
`kubectl label namespace dev pod-security.kubernetes.io/enforce=restricted`

---

## 🛠️ Comandi per la Sicurezza

```bash
# Verifica i permessi (molto utile!)
kubectl auth can-i list pods
kubectl auth can-i create deployments --namespace kube-system

# Verifica i permessi "come se fossi" un altro utente o SA
kubectl auth can-i list secrets --as=system:serviceaccount:default:my-sa

# Elenca i ServiceAccount
kubectl get sa

# Visualizza i ruoli e i binding
kubectl get roles,rolebindings,clusterroles,clusterrolebindings
```

---

## 🎯 Esercizio Pratico
1. Crea un ServiceAccount chiamato `view-only-sa`.
2. Crea un `Role` che permetta solo l'operazione `get` sui `pods` e sui `services`.
3. Crea un `RoleBinding` per collegarli.
4. Usa `kubectl auth can-i` per verificare che il SA possa leggere i pod ma non possa cancellarli.
