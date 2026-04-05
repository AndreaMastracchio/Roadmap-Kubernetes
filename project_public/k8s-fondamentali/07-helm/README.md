# Modulo 7: ☸️ Helm (Il Gestore dei Pacchetti)

Helm è lo strumento standard per pacchettizzare, condividere e distribuire applicazioni su Kubernetes. È spesso definito come "il gestore di pacchetti per K8s" (simile ad `apt`, `yum` o `npm`).

---

## 1. Perché usare Helm?
Gestire manualmente centinaia di file YAML per diversi ambienti (Dev, Test, Prod) è complesso e propenso agli errori. Helm risolve questo problema tramite:
- **Templating**: Sostituisce i valori variabili nei tuoi YAML usando il motore di template di Go.
- **Riutilizzabilità**: Una singola Chart può essere usata per installare l'applicazione in diversi modi cambiando solo i valori.
- **Gestione del Ciclo di Vita**: Ogni installazione crea una "Release" che può essere aggiornata o riportata a una versione precedente (rollback) in modo atomico.

---

## 2. Anatomia di una Chart
Una **Chart** è una cartella organizzata con una struttura specifica:
-   `Chart.yaml`: Metadati della chart (nome, versione, descrizione, dipendenze).
-   `values.yaml`: I valori di default della configurazione.
-   `templates/`: I file YAML con i placeholder (es. `{{ .Values.image.repository }}`).
-   `charts/`: (Opzionale) Altre chart da cui questa dipende.
-   `helpers.tpl`: (Opzionale) Definizioni di template riutilizzabili (partials).

---

## 3. Gestione delle Release
Helm tiene traccia dello stato di ogni installazione (Release) nel cluster (solitamente salvato come Secret nel namespace della release).

**Comandi principali**:
```bash
# Cerca pacchetti pubblici su Artifact Hub
helm search hub nginx

# Aggiungi un repository
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# Installa una chart
helm install my-app bitnami/nginx --values custom-values.yaml

# Aggiorna una release esistente
helm upgrade my-app bitnami/nginx --set replicaCount=5

# Torna a una versione precedente (Rollback)
helm rollback my-app 1

# Disinstalla tutto
helm uninstall my-app
```

---

## 4. Basi del Templating
Helm usa il motore di template di Go (`text/template`). Gli oggetti principali a cui hai accesso sono:
-   `.Values`: I valori definiti nel file `values.yaml` o passati tramite `--set`.
-   `.Chart`: Metadati definiti in `Chart.yaml`.
-   `.Release`: Informazioni sulla release corrente (nome, namespace, servizio).
-   `.Files`: Permette di accedere a file non-template nella cartella della chart.

**Esempio di Template (`templates/deployment.yaml`)**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}-deploy
spec:
  replicas: {{ .Values.replicaCount | default 1 }}
  template:
    spec:
      containers:
      - name: nginx
        image: {{ .Values.image.repository }}:{{ .Values.image.tag }}
```

---

## 🛠️ Debugging delle Chart

Prima di installare, è bene verificare che i template siano corretti:
1.  **helm lint**: Controlla se la chart ha errori di sintassi o strutturali.
2.  **helm install --dry-run --debug**: Simula l'installazione e stampa lo YAML generato senza applicarlo al cluster.
3.  **helm get manifest <release-name>**: Mostra lo YAML effettivamente installato nel cluster per una release.

---

## 🎯 Esercizio Pratico
1. Crea una nuova chart: `helm create my-chart`.
2. Esplora i file generati e prova a cambiare il valore di `replicaCount` in `values.yaml`.
3. Simula la generazione dello YAML: `helm template my-chart ./my-chart`.
4. Installa la chart nel tuo cluster locale (kind/minikube) e verifica che i pod siano creati.
