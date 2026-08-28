# 4. Interfaccia e Navigazione

Una volta collegato un cluster, Headlamp ti dà una dashboard completa. Imparare a navigare in modo
veloce fa risparmiare tantissimo tempo rispetto a kubectl.

## La Home (Overview)
La schermata principale mostra una **panoramica del cluster**:
- **CPU e memoria** aggregate (se l'API Metrics è disponibile).
- **Stato dei nodi** con eventuali problemi.
- **Eventi recenti**: cambi di stato, warning e problemi delle risorse.
- Collegamenti rapidi alle sezioni più usate.

## La sidebar
Il menu laterale organizza le sezioni principali:
- **Cluster**: nodi, namespace e impostazioni.
- **Workload**: deployment, pod, statefulset, daemonset, cronjob e così via.
- **Network**: servizi, ingress e policy di rete.
- **Storage**: StorageClass, PV, PVC e volumi.
- **Config**: ConfigMap, Secret e altri oggetti di configurazione.
- **Custom Resources**: risorse definite tramite CRD.

## Lista e dettaglio delle risorse
- Selezionando una categoria vedi una **tabella** con tutte le risorse del cluster.
- La colonna **Status/React** usa icone colorate per dirti a colpo d'occhio se un pod è in esecuzione,
  in attesa o in errore.
- Cliccando su una risorsa apri il **dettaglio**: tab *Overview*, *Logs*, *Event* e talvolta *Exec*.
  Da qui arrivano le azioni principali: **Edit** (editor YAML), **Delete**, **Scale**, **Restart**,
  **Rollback**, **Port-forward** e altre a seconda del tipo di risorsa.

## Ricerca
La barra di ricerca permette di trovare rapidamente risorse **per nome e tipo** su tutto il cluster,
senza navigare categoria per categoria.

---
### Prossimo passo
Nel prossimo modulo gestiremo i workload: deployment e pod per davvero.

<div id="quiz-section"></div>