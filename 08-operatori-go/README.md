# Modulo 8: 🛠️ Estendibilità & Operatori (Go)

Kubernetes è progettato per essere esteso. Puoi aggiungere nuovi tipi di risorse (**CRDs**) e scrivere codice personalizzato (**Controllers**) che automatizzi compiti complessi. Quando un controller gestisce un'applicazione specifica (es. un database), viene chiamato **Operatore**.

## 1. Custom Resource Definitions (CRDs)
Una CRD permette di definire il proprio oggetto Kubernetes. Ad esempio, invece di un generico Deployment, potresti creare un oggetto di tipo `PostgresCluster`.
Kubernetes memorizzerà questo oggetto in `etcd` e ti permetterà di gestirlo con `kubectl`.

## 2. Il Reconciliation Loop (Ciclo di Riconciliazione)
È il cuore di ogni controller. È un ciclo infinito che esegue questa logica:
1. **Observe**: Legge lo stato attuale del cluster (es. "Ci sono 2 pod").
2. **Analyze**: Confronta lo stato attuale con quello desiderato (es. "L'utente ne ha chiesti 3").
3. **Act**: Esegue le azioni necessarie per far coincidere i due stati (es. "Crea un nuovo pod").

## 3. Perché Go?
Go è il linguaggio nativo di Kubernetes. Usare Go ti permette di sfruttare:
- **client-go**: La libreria ufficiale per interagire con l'API.
- **controller-runtime**: Un framework di alto livello che gestisce la complessità del caching e degli eventi.
- **Kubebuilder / Operator SDK**: Strumenti che generano il boilerplate del codice per te.

## 4. Esempio di Codice (Go)
Un controller tipicamente implementa un'interfaccia con un metodo `Reconcile`:
```go
func (r *MyReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
    // 1. Recupera l'oggetto dal cluster
    var myObj MyCustomResource
    if err := r.Get(ctx, req.NamespacedName, &myObj); err != nil {
        return ctrl.Result{}, client.IgnoreNotFound(err)
    }

    // 2. Logica di business qui...
    
    return ctrl.Result{}, nil
}
```

---

## Esercizio Avanzato
1. Esplora il codice in `08-operatori-go/example/main.go`.
2. Prova a modificarlo per contare quanti Pod ci sono in ogni Namespace.
3. Se hai Go installato, prova a generare un progetto base con `operator-sdk init --domain my.domain --repo github.com/user/my-operator`.
