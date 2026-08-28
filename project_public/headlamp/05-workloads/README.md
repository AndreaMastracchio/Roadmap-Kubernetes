# 5. Workload

La gestione dei workload è il cuore di Headlamp. Deployment, pod, StatefulSet e DaemonSet si
governano da un'unica vista, con le azioni più comuni a un click.

## Tipi di workload supportati
- **Deployment**: la risorsa più usata. Qui puoi **scale** (cambiare il numero di replica), **restart**
  (riavvio controllato dei pod) e **rollback** (tornare a una revisione precedente in caso di problemi).
- **Pod**: il dettaglio permette container info, environment, volume mounts e **quote**.
- **StatefulSet** e **DaemonSet**: gestione di servizi con identità stabile o su tutti i nodi.
- **CronJob/Job**: workload batch programmati.

## Azioni principali
- **Scale**: il numero di replica si imposta dal dettaglio del Deployment, senza toccare YAML.
- **Restart**: utile quando un pod è in stato strano; ricrea i pod dell'oggetto rispettando il
  rollout strategy.
- **Rollback**: se un nuovo deployment introdotto (una versione nuova, un'immagine sbagliata)
  non funziona, con un click torni all'**ultima revisione stabile**.
- **Edit**: un pulsante apre l'editor **YAML** della risorsa. Puoi modificare spec e apply con un click.
- **Delete**: elimina l'oggetto (con conferma). Headlamp segnala anche le operazioni in corso
  (cancellabili) così capisci subito se una delete è rimasta appesa.

## Editor YAML
L'editor integrato di Headlamp è un **resource editor con documentazione**: mentre scrivi YAML ti
mostra campi, valori ammessi e descrizione, riducendo gli errori. Non è solo un editor di testo:
è una guida alla risorsa.

> **Best practice:** quando fai un rollout, se qualcosa va male usa prima *Restart* o *Rollback*
> per riportare lo stato, poi indaga con Log ed Event (vedi moduli 4 e 7).

---
### Prossimo passo
Nel prossimo modulo vedremo log e terminale.

<div id="quiz-section"></div>