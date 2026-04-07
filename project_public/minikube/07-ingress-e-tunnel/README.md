# 7. Ingress e Tunnel

In Kubernetes reale, per esporre le tue applicazioni all'esterno usi spesso un **LoadBalancer** o un **Ingress Controller**. In ambiente locale (Minikube), il networking è un po' più complesso perché Minikube gira spesso in una "scatola" isolata (VM o Docker).

## Esporre un Servizio (LoadBalancer)
Se crei un Service di tipo `LoadBalancer`, vedrai che il suo IP rimarrà in stato `<pending>`. Per risolvere questo problema, Minikube offre il comando **tunnel**.

```bash
minikube tunnel
```
*Nota: Devi lasciare questo comando in esecuzione in una finestra del terminale separata.* Esso creerà un bridge tra il tuo host (localhost) e il network di Minikube.

## Accedere a un Servizio (Senza Tunnel)
Se non vuoi usare il tunnel, puoi usare:
```bash
minikube service <nome-del-servizio>
```
Questo comando ti restituirà l'URL per accedere al servizio e lo aprirà nel browser.

## Ingress Controller
Per usare gli Ingress, devi prima abilitare l'addon:
```bash
minikube addons enable ingress
```
Una volta abilitato, Minikube avvierà un controller Nginx. Ricorda che anche per far funzionare l'Ingress su macOS/Windows avrai bisogno di `minikube tunnel` attivo per instradare il traffico correttamente verso l'IP del controller.

<div id="exercises-section"></div>
