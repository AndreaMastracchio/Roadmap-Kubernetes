# 1. Introduzione a Headlamp

Headlamp è una **web UI per Kubernetes**: un'applicazione open source, vendor-agnostica, che ti
permette di vedere e gestire i tuoi cluster dal browser o da un'applicazione desktop, senza
scrivere migliaia di righe di `kubectl`.

## Cos'è Headlamp
- **UI di Kubernetes generica**: funziona con qualsiasi cluster conforme a Kubernetes, non è legata
  a un cloud provider (AWS, GCP, Azure) né a una distribuzione specifica (minikube, k3s, EKS, GKE).
- **Open source under Apache 2.0**, originariamente sviluppato da Kinvolk e oggi un progetto
  **CNCF Sandbox**, esteso e mantenuto dalla community.
- **Estensibile tramite plugin**: tante funzionalità — dagli ingress al monitoraggio — arrivano da
  plugin scaricabili dal catalogo ufficiale.

## Desktop app o in-cluster?
Headlamp può girare in **due modi principali**:
- **Applicazione desktop** (macOS, Windows, Linux): legge il tuo `kubeconfig` locale e mostra tutti
  i context configurati. La scelta migliore per chi lavora da casa o sul proprio computer.
- **Web app in-cluster**: viene installata dentro uno o più cluster (ad esempio con l'Helm chart
  ufficiale); la UI è allora raggiungibile via browser dagli utenti autorizzati, e continua a
  rispettare i permessi RBAC del singolo utente.

Puoi anche avviarla in modalità **headless** e aprirla semplicemente dal browser su `localhost:4466`.

## Perché Headlamp invece di solo kubectl?
- **Vista unificata**: pit stop su cluster diversi senza imparare comandi per ognuno.
- **UI che rispetta i tuoi permessi**: i bottoni di modifica/eliminazione compaiono solo se il tuo
  utente ha i permessi RBAC per quella azione. Niente click dati a vuoto.
- **Log, terminale, editor YAML e rollback** senza dover ricordare la sintassi di ogni comando.

---
### Prossimo passo
Nel prossimo modulo installeremo Headlamp e faremo partire il primo avvio.

<div id="quiz-section"></div>