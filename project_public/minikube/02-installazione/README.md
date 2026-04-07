# 2. Installazione di Minikube

Minikube richiede due componenti fondamentali:
1. **Minikube**: Il binario che gestisce il cluster.
2. **Kubectl**: Lo strumento CLI per interagire con Kubernetes (opzionale, ma caldamente consigliato).

## Prerequisiti
Assicurati che il tuo computer supporti la **virtualizzazione** e di avere almeno 2 CPU e 2GB di RAM liberi.

## Installazione su macOS
Il modo più semplice è usare **Homebrew**:
```bash
brew install minikube
```
Alternativamente puoi scaricare il binario:
```bash
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-darwin-amd64
sudo install minikube-darwin-amd64 /usr/local/bin/minikube
```

## Installazione su Linux
Scarica l'eseguibile e installalo nel path:
```bash
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

## Installazione su Windows
Usa l'installer eseguibile (.exe) scaricabile dal sito ufficiale o usa **Chocolatey**:
```powershell
choco install minikube
```

## Verifica dell'installazione
Una volta installato, verifica che il comando funzioni correttamente:
```bash
minikube version
```

<div id="exercises-section"></div>
