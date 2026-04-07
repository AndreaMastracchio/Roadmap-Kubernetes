# 6. Add-ons e Dashboard

Minikube viene fornito con un ecosistema di estensioni (Add-ons) pronte all'uso per aggiungere funzionalità comuni al cluster.

## La Dashboard di Kubernetes
Uno degli add-on più amati è la **Dashboard ufficiale di Kubernetes**. Ti permette di vedere graficamente lo stato di Pod, Deployment e Service.

Per avviarla:
```bash
minikube dashboard
```
Questo aprirà automaticamente il tuo browser predefinito puntando all'indirizzo della dashboard.

## Gestione degli Add-ons
Gli add-on non sono tutti attivi di default per non consumare troppa RAM.

### Elencare gli Add-on
```bash
minikube addons list
```

### Abilitare/Disabilitare un Add-on
Ecco alcuni dei più comuni:
- **Ingress**: Necessario per esporre servizi via HTTP/HTTPS.
- **Metrics Server**: Per vedere l'uso di CPU/RAM dei pod con `kubectl top`.
- **Registry**: Per far girare un registro Docker locale all'interno di Minikube.

```bash
minikube addons enable ingress
minikube addons disable dashboard
```

<div id="exercises-section"></div>
