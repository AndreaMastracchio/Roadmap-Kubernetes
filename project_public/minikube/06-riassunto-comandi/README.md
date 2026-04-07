# Riassunto dei Comandi Minikube

In questo capitolo abbiamo raccolto tutti i comandi principali che hai imparato finora. Usalo come riferimento rapido per le tue attività quotidiane.

## Gestione del Cluster
- `minikube start`: Avvia il cluster predefinito.
- `minikube stop`: Ferma il cluster salvando lo stato.
- `minikube pause`: Mette in pausa il cluster senza spegnerlo.
- `minikube unpause`: Ripristina il cluster dalla pausa.
- `minikube delete`: Elimina completamente il cluster.
- `minikube status`: Mostra lo stato dei componenti del cluster.

## Configurazione e Profili
- `minikube profile list`: Elenca tutti i profili creati.
- `minikube start -p <nome>`: Avvia un profilo specifico.
- `minikube config set cpus <n>`: Imposta il numero di CPU predefinito.
- `minikube config set memory <mb>`: Imposta la RAM predefinita.

## Networking e Accesso
- `minikube ip`: Restituisce l'IP del nodo del cluster.
- `minikube service <nome>`: Espone un servizio nel browser.
- `minikube tunnel`: Crea un tunnel per esporre i servizi di tipo LoadBalancer.

## Add-ons e Strumenti
- `minikube addons list`: Elenca tutti gli addon disponibili.
- `minikube addons enable <nome>`: Abilita un addon (es. ingress).
- `minikube addons disable <nome>`: Disabilita un addon.
- `minikube dashboard`: Apre l'interfaccia web di Kubernetes.
- `minikube kubectl -- <comando>`: Esegue comandi kubectl tramite minikube.

## Cluster Multi-Nodo
- `minikube start --nodes <n>`: Avvia un cluster con N nodi.
- `minikube node add`: Aggiunge un nuovo nodo al cluster corrente.
- `minikube node delete -n <nome>`: Rimuove un nodo specifico.

