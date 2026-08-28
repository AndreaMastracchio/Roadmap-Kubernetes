# 2. Installazione

Headlamp si installa con pochi passi. La via più semplice è l'**applicazione desktop**, ma puoi
anche avviarlo in modo **headless** (server + browser) o installarlo **dentro il cluster**.

## Applicazione desktop
- Scarica il file corretto dal sito ufficiale (`headlamp.dev`) o dal repository GitHub:
  `.dmg` per macOS, `.exe` per Windows, `.AppImage`/`.tar.gz` per Linux.
- Trascina l'app in *Applicazioni* (macOS) o completa l'installer (Windows/Linux).
- Apri Headlamp: nella sidebar vedrai i cluster presenti nel tuo `~/.kube/config`.

> **Attenzione (macOS/Windows):** l'app non è firmata/notarizzata. macOS mostrerà "developer
> cannot be verified": apri *Sistema > Privacy e Sicurezza* e approva, oppure usa
> `xattr -dr com.apple.quarantine /Applications/Headlamp.app` da terminale.

## Modalità headless (browser)
Puoi avviare Headlamp senza finestra e aprirlo nel browser:
- Con l'app desktop: arricchisci il comando oppure usa i flag del binario.
- La UI è disponibile su `http://localhost:4466`.

## Installazione in-cluster
Per un team che accede a uno o più cluster via browser:
- Usa l'immagine ufficiale `ghcr.io/headlamp-k8s/headlamp` con la porta `4466`.
- In Produzione di solito si deploya con Helm o manifest e si protegge con i permessi RBAC
  (vedi modulo 3) e un ingress.

---
### Prossimo passo
Nel prossimo modulo collegheremo i cluster e configureremo l'autenticazione.

<div id="quiz-section"></div>