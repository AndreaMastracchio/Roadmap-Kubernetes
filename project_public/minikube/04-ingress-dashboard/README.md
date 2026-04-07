# Ingress e Dashboard in Minikube

Minikube rende estremamente semplice abilitare funzionalità che in un cluster Kubernetes standard richiederebbero diverse configurazioni.

## Ingress Controller
Un Ingress Controller è un componente che gestisce l'accesso esterno ai servizi nel cluster, tipicamente tramite HTTP/HTTPS. In Minikube, puoi abilitare l'Ingress Controller ufficiale di Kubernetes (Nginx) con un singolo comando:

```bash
minikube addons enable ingress
```

Una volta abilitato, puoi definire risorse Ingress per esporre le tue applicazioni.

## Dashboard
La Dashboard di Kubernetes è un'interfaccia utente web-based per gestire il cluster. Minikube la include di default e puoi avviarla con:

```bash
minikube dashboard
```

Questo comando aprirà automaticamente il browser predefinito all'indirizzo della dashboard.

## Monitoraggio e Metriche
Per abilitare il monitoraggio delle risorse (come `kubectl top`), è necessario abilitare l'addon `metrics-server`:

```bash
minikube addons enable metrics-server
```

