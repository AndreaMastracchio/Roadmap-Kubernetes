# ☸️ KubeStudy - Piattaforma di Studio Kubernetes

Benvenuto su **KubeStudy**, una piattaforma interattiva progettata per guidarti nello studio di Kubernetes, dai fondamentali fino a concetti avanzati come l'estendibilità del cluster tramite Operatori in Go.

---

## 🏗️ Architettura del Progetto

Il progetto segue un'architettura moderna a microservizi (Dockerizzata):

- **Frontend**: React + Material UI + Vite. Interfaccia utente fluida con supporto a temi e componenti personalizzati.
- **Backend**: Node.js + Express. Gestisce l'autenticazione, il tracciamento dei progressi e il caricamento dinamico dei contenuti.
- **Database**: MySQL 8.0 per la persistenza di utenti, acquisti e progressi dei corsi.
- **Cache/Sessioni**: Redis per la gestione delle sessioni utente e performance elevate.

---

## 🚀 Requisiti

- **Docker** e **Docker Compose** (V2 raccomandato).
- **Node.js** (opzionale, solo se si desidera eseguire i servizi localmente senza Docker).

---

## ⚙️ Installazione e Setup

1. **Clona il repository**:
   ```bash
   git clone https://github.com/tuo-utente/kubestudy.git
   cd kubestudy
   ```

2. **Configura l'ambiente**:
   Copia il file di esempio `.env.example` in `.env` e personalizza le variabili se necessario:
   ```bash
   cp .env.example .env
   ```

3. **Prepara i contenuti**:
   Assicurati che le cartelle `project_public` e `project_private` siano presenti (anche se vuote inizialmente):
   ```bash
   mkdir -p project_public project_private
   ```

---

## 🛠️ Modalità di Esecuzione

### Sviluppo (Consigliata)
Per avviare l'intero stack con **Hot Reload** (Frontend e Backend si riavviano automaticamente alle modifiche):
```bash
./bin/dev
```
- **Frontend**: [http://localhost:8080](http://localhost:8080)
- **Backend**: [http://localhost:5005](http://localhost:5005)

### Produzione
Per avviare i container in modalità ottimizzata:
```bash
./bin/start
```

### Comandi Rapidi (CLI)
Nella cartella `bin/` trovi script utili per gestire lo stack:
- `./bin/status`: Controlla lo stato dei container e degli endpoint.
- `./bin/stop`: Ferma tutti i servizi.
- `./bin/restart`: Riavvia l'applicazione.

---

## 🖥️ Caratteristiche Principali

- **🎓 Corsi Interattivi**: Contenuti Markdown renderizzati dinamicamente con supporto a evidenziazione sintattica.
- **💻 Console Interattiva**: Una shell integrata (stile zsh) con autocompletamento (Tab) per esercitarsi sui comandi.
- **📝 Quiz & Esercizi**: Verifica le tue competenze con quiz a scelta multipla ed esercizi di coding pratici.
- **👤 Area Personale**: Sistema di login/registrazione, gestione profilo con avatar e dashboard dei progressi.
- **📊 Tracciamento Progresso**: Il sistema salva automaticamente l'ultimo modulo visitato e i quiz completati.
- **🔒 Contenuti Privati**: Supporto per corsi "Premium" (in `project_private`) accessibili solo dopo l'attivazione.

---

## 📂 Struttura delle Cartelle

- `frontend/`: Codice sorgente dell'applicazione React.
- `backend/`: API server, gestione database e logica di business.
- `project_public/`: Contenuti dei corsi accessibili a tutti (Markdown + JSON).
- `project_private/`: Contenuti riservati (richiedono login/acquisto).
- `bin/`: Script di automazione per Docker.

---

## 🤝 Contribuire

Le contribuzioni sono benvenute! Se vuoi aggiungere un modulo o migliorare una funzionalità:
1. Apri una Issue per discutere il cambiamento.
2. Invia una Pull Request.

Buono studio con KubeStudy! ☸️🚀
