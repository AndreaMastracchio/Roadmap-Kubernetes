# Modulo 8: 🛠️ Estendibilità & Operatori (Go)

Il vero potere di Kubernetes risiede nella sua estendibilità. Invece di usare solo le risorse standard (Pod, Deployment), puoi creare le tue risorse personalizzate (**CRDs**) e scrivere codice che gestisca il loro ciclo di vita (**Controllers** e **Operators**).

## Perché Go?
Kubernetes stesso è scritto in Go. Usare Go ti dà accesso diretto alle librerie ufficiali:
- **client-go**: Per interagire con l'API Server.
- **controller-runtime**: Il framework standard per scrivere operatori (usato da SDK come Kubebuilder e Operator SDK).

## Concetti Chiave
- **Control Loop (Reconciliation Loop)**: Il codice che confronta continuamente lo "stato desiderato" (definito in YAML) con lo "stato attuale" del cluster e corregge le discrepanze.
- **Custom Resource Definition (CRD)**: Definisce uno schema per un nuovo oggetto K8s.

## Esempio pratico
Nella cartella `example/` troverai un'applicazione Go minimale che:
1. Carica la configurazione del cluster (es. dal file `~/.kube/config`).
2. Crea un client per l'API.
3. Elenca tutti i Pod presenti nel cluster.

### Come eseguirlo localmente
1. Assicurati di avere un cluster locale (Minikube/Kind) attivo.
2. Vai nella cartella: `cd 08-operatori-go/example`
3. Scarica le dipendenze: `go mod tidy`
4. Esegui il programma: `go run main.go`
