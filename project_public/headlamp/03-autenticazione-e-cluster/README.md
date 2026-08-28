# 3. Autenticazione e Cluster

Headlamp arriva a Kubernetes come ogni altro client: attraverso un **kubeconfig** e i metodi di
autenticazione che contiene. Capire come si autentica è il passaggio più importante di questo corso.

## Metodi supportati
- **Client certificate**: certificati client + CA, tipico nei cluster on-prem e in alcuni setup k3s.
- **Bearer token**: un token statico o di servizio presentato nell'header `Authorization`.
- **OIDC**: autenticazione con provider esterni (es. Keycloak, Dex, Google) tramite flusso OAuth2.

Headlamp sulla *web app* assegna l'autenticazione a ogni utente: ognuno si connette con le sue
credenziali e vede solo ciò che il suo account RBAC consente.

> **Approccio consigliato (Service Account + RBAC):** creare un `ServiceAccount` con permessi
> mirati e collegare Headlamp con il suo token. Ad esempio un utente di sola lettura avrà un
> ServiceAccount con ruoli di lettura, un amministratore uno con permessi più ampi. Nulla si fa
> come `cluster-admin` per abitudine.

## Collegare un cluster
- **Desktop**: Headlamp legge automaticamente i context del kubeconfig locale.
- **Aggiungere un cluster**: si può specificare manualmente l'URL del cluster (server API) e
  il metodo di autenticazione, oppure estendere il kubeconfig.
- **Access Denied?** Il problema più comune non è il collegamento ma i **permessi**: Headlamp
  rispetta i permessi del tuo utente. Se la vista è vuota o ti nega l'accesso a risorse, verifica
  RBAC e, se necessario, imposta gli `accessibleNamespaces` per il cluster.

## Namespace ammissibili
Il parametro `accessibleNamespaces` permette a Headlamp di sapere quali namespace mostrare a un
utente con permessi limitati. In assenza di esso, la UI assume che l'utente possa vedere tutti i
namespace (o nessuno, a seconda della configurazione).

---
### Prossimo passo
Nel prossimo modulo esploreremo l'interfaccia e la navigazione.

<div id="quiz-section"></div>