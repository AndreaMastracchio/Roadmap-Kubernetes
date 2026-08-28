# 6. Log e Terminale

Headlamp non mostra solo lo stato: ti dà accesso diretto ai **log dei container** e — dove i
permessi lo consentono — a un **terminale interattivo** dentro il pod. Sono gli strumenti giusti
per capire *perché* qualcosa non funziona, senza dover aprire un terminale locale e ricordare i
comandi a memoria.

## Log
- Dal dettaglio di un pod (tab **Log**) leggi lo stream del container.
- Puoi **scorrere** la cronologia, **fare follow** (log che continuano ad arrivare) e cambiare
  la quantità di linee mostrate.
- La UI distingue i container: se il pod ha più container, scegli quale vedere.
- I log hanno i **timestamp**, utili per correlare con eventi del cluster.

## Terminale (Exec)
- Dal dettaglio di un pod, il tab **Exec** ti dà una shell nel container scelto.
- Scaffolding completo: `sh`, `bash` (se presenti) e i comandi standard.
- I permessi contano: se il tuo utente non ha `pods/exec`, il tab non è disponibile.
- È un modo impeccabile per controllare file, processi, env e rete dentro il pod.

## Parti fondamentali per il debugging
1. **State del pod**: nella colonna Status e nell'Overview (Running, CrashLoopBackOff, Pending...).
2. **Log**: cosa scrive davvero l'applicazione (tab Log).
3. **Eventi**: cosa ha fatto Kubernetes (tab Event).
4. **Terminale**: conferma con un comando ciò che i log suggeriscono.

> **Regola pratica:** prima guarda log ed eventi; entra nel pod solo se ti serve confermare qualcosa
> che i log non spiegano.

---
### Prossimo passo
Nel prossimo modulo gestiremo configurazioni e segreti.

<div id="quiz-section"></div>