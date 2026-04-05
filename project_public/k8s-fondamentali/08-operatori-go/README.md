# Modulo 8: 🛠️ Estendibilità e Operatori (Go)

Kubernetes è progettato per essere esteso. Puoi aggiungere nuovi tipi di risorse (**CRDs**) e scrivere codice personalizzato (**Controllers**) che automatizzi compiti complessi. Quando un controller gestisce un'applicazione specifica (es. un database), viene chiamato **Operatore**.

---

## 1. Custom Resource Definitions (CRDs)
Una CRD permette di definire il proprio oggetto Kubernetes. Invece di usare solo risorse standard (Pod, Service), puoi creare oggetti come `PostgresCluster`, `AutoScaler` o `MailServer`.
-   **Spec**: Definisce lo stato desiderato (es. versione del DB, numero di nodi).
-   **Status**: Definisce lo stato attuale (es. "Cluster in salute", "Upgrade in corso").

---

## 2. Il Reconciliation Loop (Ciclo di Riconciliazione)
È il cuore di ogni controller. È un ciclo infinito basato sulla logica: **Osserva -> Analizza -> Agisci**.
1.  **Osserva**: Legge lo stato attuale dal cluster (es. "Vedo 2 Pod").
2.  **Analizza**: Confronta con lo stato desiderato in etcd (es. "L'utente ne vuole 3").
3.  **Agisci**: Esegue le azioni necessarie (es. "Crea un nuovo Pod").

---

## 3. L'Operator Pattern
Un Operatore è un controller che incorpora la conoscenza operativa di un software (es. come fare il backup di un DB, come scalare un cluster Kafka) direttamente nel codice.
-   **Automazione**: Gestisce backup, ripristini, aggiornamenti e monitoraggio in modo autonomo.
-   **Dichiarativo**: L'utente descrive *cosa* vuole, l'operatore capisce *come* farlo.

---

## 4. Sviluppo in Go: Client-Go e Frameworks
Go è il linguaggio nativo di Kubernetes. Gli strumenti principali sono:
-   **client-go**: La libreria ufficiale per interagire con l'API Server. Include:
    -   **Informers**: Monitorano i cambiamenti alle risorse in modo efficiente (caching).
    -   **Listers**: Permettono di leggere i dati dalla cache locale senza sovraccaricare l'API.
-   **Controller-Runtime**: Il framework alla base di **Kubebuilder** e **Operator SDK**. Gestisce la complessità del loop di riconciliazione e degli eventi.

**Esempio di codice (client-go)**:
```go
// Elenca i Pod nel namespace "default"
pods, err := clientset.CoreV1().Pods("default").List(context.TODO(), metav1.ListOptions{})
if err != nil {
    panic(err.Error())
}
fmt.Printf("Ci sono %d pod nel cluster\n", len(pods.Items))
```

---

## 🛠️ Strumenti di Sviluppo

1.  **Kubebuilder**: Il framework standard per creare CRD e controller usando controller-runtime.
2.  **Operator SDK**: Estende Kubebuilder con strumenti aggiuntivi per il packaging e il testing (gestito da Red Hat).
3.  **Kind**: Fondamentale per testare gli operatori localmente in cluster multi-nodo.

---

## 🎯 Esercizio Avanzato
1. Esplora il codice in `08-operatori-go/example/main.go`.
2. Prova a comprendere come il client si connette al cluster (usando `kubeconfig` o `InClusterConfig`).
3. Prova a scrivere un piccolo programma che stampi il nome di tutti i ServiceAccount del namespace `kube-system`.
4. Se hai Go installato, prova a generare un progetto base con `kubebuilder init --domain my.domain --repo github.com/user/my-operator`.
