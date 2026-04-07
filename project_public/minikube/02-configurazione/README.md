# 2. Configurazione e Profili

Minikube permette di gestire più cluster contemporaneamente attraverso i **profili**.

## Gestione Profili
- `minikube start -p dev`: Crea un profilo chiamato `dev`.
- `minikube profile list`: Elenca tutti i profili creati.
- `minikube profile dev`: Imposta il profilo attivo.

## Risorse
È possibile limitare o espandere le risorse assegnate a Minikube:
- `--cpus=2`
- `--memory=4096mb`
- `--disk-size=20gb`

Esempio:
`minikube start --cpus=4 --memory=8192mb`

