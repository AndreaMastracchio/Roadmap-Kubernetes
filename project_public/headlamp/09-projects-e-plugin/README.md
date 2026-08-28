# 9. Projects e Plugin

Il vero punto di forza di Headlamp arriva da **Projects** (la vista applicativa) e dai **plugin**
(estensibilità).

## Projects: la vista applicativa
- Un **Project** raggruppa workload e risorse che appartengono a una stessa applicazione, anche se
  distribuiti su **più namespace o più cluster**.
- La vista Project dà una panoramica: cosa c'è nell'app, lo stato, le relazioni. Per entrarci dai
  dati, in Headlamp i Projects spiccano perché sono nativi, non un CRD separato.
- I Progetti si creano/gestiscono dalla sezione **Projects** della UI, definendo quali namespace e
  cluster includere.

## Plugin
Headlamp è progettato **plugin-first**:
- Un **Plugin Catalog** permette di installare, aggiornare e rimuovere plugin direttamente dalla UI.
- I plugin aggiungono sezioni, dettagli, action custom e integrazioni (es. ingress, monitoraggio,
  ArgoCD/Flux, assistente AI).
- I plugin sono di solito pubblicati su registri compatibile (Artifact Hub).

## AI Assistant
- Headlamp integra un **assistente AI** per aiutarti nelle operazioni quotidiane (spiegare risorse,
  suggerire fix).
- Le funzionalità AI richiedono configurazione (provider e possibile chiave) e sono **facoltative**:
  il core di Headlamp funziona anche completamente offline.

> **Race:** Headlamp è utile già da solo. I plugin lo rendono potente. Projects lo rendono
> orientato all'applicazione. Impara nell'ordine: core → plugin → projects.

---
### Prossimo passo
Nel prossimo modulo affronterai l'esame finale.

<div id="quiz-section"></div>