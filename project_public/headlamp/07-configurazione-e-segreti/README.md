# 7. Configurazione e Segreti

Le configurazioni e i segreti in Kubernetes vivono tipicamente in **ConfigMap** e **Secret**.
Headlamp ti permette di gestirli senza aprire un editor, con attenzione particolare alla
**sicurezza**.

## ConfigMap
- Oggetti di configurazione non sensibile: file, variabili, piccoli payload.
- Dal dettaglio di una ConfigMap vedi le **data keys** e puoi **modificare** i valori dall'editor YAML.
- I volumi o le env che usano la ConfigMap vengono aggiornati al prossimo restart del pod.

## Secret
- I segreti (password, token, certificati) sono mostrati **offuscati** per default dalla UI:
  il valore non viene stampato in chiaro nel listing.
- Dal dettaglio puoi vederli in chiaro solo se hai permessi e dopo una conferma esplicita
  (bottone di reveal).
- Gestisci i segreti con cura: **RBAC** decide chi può leggerli. Un utente con soli permessi di
  lettura generici può vedere che il Secret esiste, non il suo contenuto.

## Storage
- **StorageClass**: definisce le policy di provisioning dei volumi dinamici.
- **PersistentVolume (PV)**: il volume fisico fornito allo storage backend.
- **PersistentVolumeClaim (PVC)**: la richiesta di volume dell'utente, che viene bindata a un PV.
- Dalla UI puoi vedere stati (Pending, Bound), capacità richiesta e di chi è il riferimento.

> **Regola d'oro:** i segreti più sensibili non vanno mai verificati condivisi in chiaro. La UI ti
> protegge: mostrare un segreto richiede consapevolezza e permessi.

---
### Prossimo passo
Nel prossimo modulo vedremo monitoraggio e multi-cluster.

<div id="quiz-section"></div>