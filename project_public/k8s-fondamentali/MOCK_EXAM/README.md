# 🎓 Mock Exam CKA/CKAD - Fondamentali Kube

Simulatore d'esame completo per la preparazione alle certificazioni Kubernetes CKA (Certified Kubernetes Administrator) e CKAD (Certified Kubernetes Application Developer).

---

## 📋 Caratteristiche

### ✅ Ambiente Realistico
- **Timer 2 ore** come l'esame ufficiale
- **20 domande pratiche** con pesi variabili (2%-8%)
- **Passing score 66%** (13/20 domande corrette)
- **Navigazione libera** tra le domande
- **Sistema di flag** per domande difficili

### 📊 Tracking e Analytics
- **Progress bar** in tempo reale
- **Contatore domande** risposte/totali
- **Griglia navigazione** con stato visuale
- **Timer con warning** ultimi 15 minuti

### 📝 Domande Performance-Based
- Comandi kubectl imperativi
- YAML declarativo
- Troubleshooting scenarios
- RBAC e Security
- Networking e Storage
- Scaling e High Availability

### 🎯 Report Dettagliato
- **Punteggio totale** e percentuale
- **Tempo impiegato**
- **Review completa** di ogni domanda
- **Confronto** risposta vs soluzione
- **Spiegazioni dettagliate**

---

## 🚀 Come Usare

### Apertura
1. Apri `index.html` nel browser
2. Leggi le istruzioni
3. Clicca "Inizia Esame"

### Durante l'Esame
- Scrivi comandi kubectl o YAML nell'area di testo
- Usa il pulsante "Flag" per domande difficili
- Naviga liberamente con i pulsanti o la griglia
- Monitora il timer (diventa rosso sotto 15 min)

### Terminazione
- Clicca "Termina Esame" quando pronto
- Oppure attendi lo scadere del timer (auto-submit)
- Ricevi report dettagliato con soluzioni

---

## 📚 Argomenti Coperti

### Core Concepts (20%)
- Pod creation e configuration
- Labels e selectors
- Namespaces

### Workloads (25%)
- Deployments e scaling
- StatefulSets
- DaemonSets
- Jobs

### Services & Networking (20%)
- Services (ClusterIP, NodePort)
- Ingress
- Network Policies
- DNS

### Storage (15%)
- PersistentVolumes
- PersistentVolumeClaims
- StorageClass

### Security (15%)
- RBAC (Role, RoleBinding)
- ServiceAccounts
- SecurityContext
- Secrets

### Troubleshooting (5%)
- Log analysis
- Rollback
- Resource monitoring

---

## 🎯 Domande Esempio

### Domanda 1 (4%)
Crea un Pod chiamato `nginx-pod` con immagine `nginx:1.25`, labels `app=web,tier=frontend`, e resource requests/limits.

### Domanda 7 (8%)
Troubleshooting: Un Deployment ha Pod in CrashLoopBackOff. Identifica il problema analizzando log ed eventi.

### Domanda 16 (7%)
Crea un StatefulSet con 3 replicas, Headless Service, e VolumeClaimTemplate per storage persistente.

### Domanda 19 (8%)
Esegui backup di etcd usando etcdctl con certificati TLS e verifica l'integrità.

---

## 💡 Tips per l'Esame

### Time Management
- **6-8 minuti** per domanda in media
- **Prima passata**: Domande facili (5-10 min)
- **Seconda passata**: Domande medie (15-20 min)
- **Terza passata**: Domande difficili (30-40 min)
- **Review finale**: Ultimi 10-15 minuti

### Strategia
1. Leggi attentamente ogni domanda
2. Verifica sempre il namespace richiesto
3. Usa comandi imperativi quando possibile
4. Flag domande difficili e continua
5. Verifica le risposte prima di terminare

### Comandi Veloci
```bash
# Alias utili
alias k=kubectl
alias kgp='kubectl get pods'
alias kd='kubectl describe'

# Autocompletion
source <(kubectl completion bash)
complete -F __start_kubectl k

# Dry-run per YAML
kubectl run nginx --image=nginx --dry-run=client -o yaml > pod.yaml
```

---

## 📊 Sistema di Scoring

### Pesi Domande
- **Facili (2-4%)**: Comandi base, creazione risorse semplici
- **Medie (5-6%)**: Configurazioni complesse, troubleshooting
- **Difficili (7-8%)**: Scenari avanzati, RBAC, etcd backup

### Valutazione
- **66%+ (13/20)**: ✅ SUPERATO
- **<66%**: ❌ NON SUPERATO

### Scoring Automatico
Il sistema valuta le risposte cercando:
- Comandi kubectl corretti
- Keyword YAML (apiVersion, kind, metadata, spec)
- Concetti chiave della domanda

**Nota**: Lo scoring è semplificato. Nell'esame reale, un valutatore verifica che il task sia completato correttamente nel cluster.

---

## 🔧 Requisiti Tecnici

### Browser
- Chrome/Edge (consigliato)
- Firefox
- Safari

### Risoluzione
- Minimo 1024x768
- Consigliato 1920x1080

### JavaScript
- Deve essere abilitato
- Nessuna connessione internet richiesta (funziona offline)

---

## 📁 Struttura File

```
MOCK_EXAM/
├── index.html          # Interfaccia principale
├── exam.js             # Logica esame e timer
├── questions.js        # Database 20 domande
└── README.md           # Questa guida
```

---

## 🎓 Dopo il Mock Exam

### Se Hai Superato (66%+)
✅ Sei pronto per l'esame ufficiale!
- Prenota l'esame CKA/CKAD
- Continua a praticare scenari reali
- Usa Killer.sh per simulazione finale

### Se Non Hai Superato (<66%)
💪 Continua a studiare!
- Rivedi le domande sbagliate
- Studia le soluzioni dettagliate
- Pratica i comandi kubectl
- Riprova il mock exam tra 1-2 settimane

---

## 📚 Risorse Aggiuntive

### Documentazione
- [Kubernetes Docs](https://kubernetes.io/docs/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)

### Pratica
- [Killer.sh](https://killer.sh/) - Simulatore ufficiale
- [KodeKloud](https://kodekloud.com/) - Lab interattivi
- [GitHub Exercises](https://github.com/dgkanatsios/CKAD-exercises)

### Corso Completo
- Torna ai moduli 1-10 per teoria
- Completa i 4 Lab Hands-On
- Leggi TROUBLESHOOTING.md
- Studia CERTIFICATION_TIPS.md

---

## 🐛 Note e Limitazioni

### Scoring Semplificato
Lo scoring automatico è basato su keyword matching. Nell'esame reale:
- Devi eseguire i comandi in un cluster vero
- Un valutatore verifica il risultato finale
- Sintassi e dettagli contano

### Ambiente Simulato
Questo è un simulatore web, non un cluster reale:
- Non puoi eseguire comandi kubectl
- Non c'è validazione YAML
- Focus su conoscenza teorica e sintassi

### Raccomandazione
Dopo il mock exam, pratica in un cluster reale:
- Kind/Minikube locale
- Killer.sh (2 sessioni incluse con esame)
- Cloud playground (GCP, AWS, Azure)

---

## 🎉 Buona Fortuna!

Ricorda: La pratica è la chiave del successo. Questo mock exam ti prepara alla struttura e al tempo dell'esame, ma devi praticare in un cluster reale per padroneggiare kubectl e YAML.

**Passa il mock exam? Sei pronto per l'esame ufficiale! 🚀**

---

**Versione**: 1.0.0  
**Autore**: Fondamentali Kube  
**Licenza**: Open Source
