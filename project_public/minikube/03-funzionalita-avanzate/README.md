# 3. Funzionalità Avanzate

Minikube include molti **Add-ons** e funzionalità per il networking.

## Add-ons
- `minikube addons list`: Elenca tutti gli add-on.
- `minikube addons enable ingress`: Abilita l'Ingress controller.
- `minikube addons disable dashboard`: Disabilita la dashboard.

## Tunneling e Service
Poiché Minikube gira spesso in una VM o container isolato, per accedere ai Service di tipo `LoadBalancer` si usa:
`minikube tunnel`

Per aprire un servizio nel browser:
`minikube service my-service`

