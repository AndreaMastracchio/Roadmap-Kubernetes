# Modulo 7: ☸️ Helm (Il Gestore dei Pacchetti)

Helm è lo strumento standard per pacchettizzare, condividere e distribuire applicazioni su Kubernetes. È spesso definito come "il gestore di pacchetti per K8s" (simile ad `apt`, `yum` o `npm`).

## 1. Perché usare Helm?
Gestire manualmente centinaia di file YAML per diversi ambienti (Dev, Test, Prod) è propenso agli errori. Helm risolve questo problema tramite:
- **Templating**: Sostituisce i valori variabili nei tuoi YAML usando il motore di template di Go.
- **Versionamento**: Ogni installazione crea una "Release" che può essere aggiornata o riportata a una versione precedente (rollback).
- **Condivisione**: Puoi scaricare Chart già pronte per software comuni (PostgreSQL, Redis, Jenkins) dai repository pubblici.

## 2. I componenti di una Chart
Una **Chart** è una cartella organizzata in questo modo:
- `Chart.yaml`: Contiene il nome della chart, la descrizione e la versione.
- `values.yaml`: Il file che contiene tutti i valori di default (es. numero di repliche, immagine da usare).
- `templates/`: La cartella che contiene i file YAML con i placeholder (es. `{{ .Values.replicaCount }}`).
- `charts/`: (Opzionale) Contiene altre chart da cui questa dipende.

## 3. Comandi Essenziali
- `helm create my-app`: Crea una struttura di chart pronta all'uso.
- `helm install my-release ./my-app`: Installa la chart nel cluster.
- `helm upgrade my-release ./my-app -f prod-values.yaml`: Aggiorna la release usando valori specifici per la produzione.
- `helm rollback my-release 1`: Riporta la release alla versione 1 in caso di errori.
- `helm list`: Elenca tutte le release installate nel cluster.

---

## Esempio di Templating
Nel file `templates/deployment.yaml`:
```yaml
spec:
  replicas: {{ .Values.replicaCount }}
```
Nel file `values.yaml`:
```yaml
replicaCount: 3
```

---

## Esercizio Pratico
1. Installa Helm sul tuo computer.
2. Aggiungi il repository di Bitnami: `helm repo add bitnami https://charts.bitnami.com/bitnami`.
3. Prova a installare un server Nginx: `helm install my-nginx bitnami/nginx`.
4. Verifica i pod creati e prova a disinstallarlo: `helm uninstall my-nginx`.
