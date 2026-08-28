# 8. Monitoraggio e Multicluster

Headlamp è pensato per chi ha **più di un cluster**. Un'unica vista per controllare tutto, senza
aprire N terminali e N URL differenti.

## Monitoraggio del cluster
- **Home**: CPU/memoria aggregate, salute dei nodi ed eventi.
- **Nodi**: stato, condizioni e metrica per nodo.
- **Metrics API**: senza il componente Metrics Server molti grafici restano vuoti. Se vedi la Home
  senza dati di utilizzo, probabilmente il Metrics Server non è installato o non è raggiungibile.
- **Eventi**: la sezione dedicata raccoglie gli eventi del cluster e ti aiuta a capire dove c'è un
  problema prima ancora di aprire una risorsa.

## Multi-cluster con kubeconfig
- **Tutti i context** del tuo kubeconfig compaiono nel selettore cluster in alto.
- Puoi **passare da un cluster all'altro** con un click; la Home si aggiorna al cluster corrente.
- Se usi la web app in-cluster, Headlamp gestisce più cluster configurati nel relativo config.

## La vista aggregata
Headlamp dà una panoramica multi-cluster senza perdere il dettaglio: glossario dei cluster, stato
riassuntivo, possibilità di passare al dettaglio singolo con un click.

> **Nota:** la disponibilità delle metriche (CPU/memoria) dipende dal cluster. Un cluster senza
> Metrics Server mostrerà solo una parte della panoramica: non è un bug di Headlamp.

---
### Prossimo passo
Nel prossimo modulo vedremo Projects e Plugin, la vera potenza di Headlamp.

<div id="quiz-section"></div>