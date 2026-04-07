# ☸️ KubeStudy - Piattaforma di Apprendimento Kubernetes

Benvenuto su **KubeStudy**, non un semplice repository, ma una **piattaforma interattiva completa** progettata per trasformare lo studio di Kubernetes in un'esperienza pratica e coinvolgente. Dai fondamentali del cloud-native fino alla creazione di Operatori custom in Go, KubeStudy ti accompagna in ogni fase della tua crescita professionale.

---

## 🏛️ Filosofia del Progetto

Imparare Kubernetes leggendo solo la documentazione è difficile. KubeStudy nasce con l'idea di **"Learning by Doing"**:
- **Teoria Strutturata**: Moduli Markdown chiari e progressivi.
- **Pratica Immediata**: Una console interattiva integrata per sporcarsi le mani.
- **Validazione**: Quiz ed esercizi di coding per confermare le tue competenze.
- **Persistenza**: Un sistema completo di account per non perdere mai il filo dello studio.

---

## 🏗️ Architettura del Progetto

Il progetto utilizza un'architettura a microservizi robusta e moderna, completamente Dockerizzata:

- **🎨 Frontend**: Sviluppato in **React 18** con **Material UI (MUI)** e **Vite**. Un'interfaccia fluida, responsive e dotata di un tema personalizzato in stile Kubernetes.
- **🧠 Backend**: Un server API in **Node.js + Express** che gestisce l'autenticazione sicura (bcrypt), la gestione delle sessioni e il caricamento dinamico dei contenuti.
- **🗄️ Database**: **MySQL 8.0** per la persistenza affidabile di utenti, acquisti di corsi premium e progressi.
- **⚡ Cache & Sessioni**: **Redis 7** per una gestione delle sessioni ultra-veloce e performance ottimizzate.

---

## 🚀 Requisiti

- **Docker Desktop** o **Docker Engine** (V2 raccomandato).
- **Docker Compose**.
- Browser moderno (Chrome, Firefox, Safari).

---

## ⚙️ Installazione e Setup Rapido

1. **Clona il repository**:
   ```bash
   git clone https://github.com/tuo-utente/kubestudy.git
   cd kubestudy
   ```

2. **Prepara l'ambiente**:
   Copia il file di configurazione e inizializza le cartelle necessarie:
   ```bash
   cp .env.example .env
   mkdir -p project_public project_private
   ```

3. **Inizializzazione**:
   Il sistema si occuperà automaticamente di configurare il database al primo avvio.

---

## 🛠️ Modalità di Esecuzione

### 💻 Ambiente di Sviluppo (Consigliato)
Avvia l'intero stack con **Hot Reload** (le modifiche al codice si riflettono istantaneamente):
```bash
./bin/dev
```
- **Interfaccia Web**: [http://localhost:8080](http://localhost:8080)
- **API Health Check**: [http://localhost:5005/api/health](http://localhost:5005/api/health)

### 🚢 Produzione
Per avviare i servizi in modalità stabile e ottimizzata:
```bash
./bin/start
```

### 🧰 Utility CLI
Nella cartella `bin/` trovi strumenti pronti all'uso:
- `./bin/status`: Monitora la salute dei container e degli endpoint.
- `./bin/stop`: Spegne in modo pulito tutti i servizi.
- `./bin/restart`: Riavvia rapidamente l'intero stack.

---

## 🖥️ Caratteristiche Distintive

- **💻 Console Interattiva (zsh-style)**: Una shell nel browser con autocompletamento intelligente (Tab) e feedback sui comandi in tempo reale.
- **🎓 Roadmap Progressiva**: Da Docker ai container, dall'architettura di K8s al networking avanzato.
- **📝 Esercitazioni di Coding**: Scrivi ed esegui manifest YAML e comandi `kubectl` simulati.
- **👤 User Experience**: Gestione profilo (avatar, password), Dashboard dei progressi e ripresa automatica dello studio dall'ultimo modulo non completato.
- **🔒 Modello Public/Private**: Supporto per contenuti gratuiti (Open Source) e moduli Premium (in `project_private`).

---

## 🤝 Contribuire

KubeStudy è un progetto guidato dalla community. Se vuoi proporre nuovi moduli, correggere bug o suggerire funzionalità:
1. Apri una **Issue** descrivendo la tua idea.
2. Invia una **Pull Request** seguendo le best practices di React/Node.

Buono studio con **KubeStudy**! ☸️🚀
