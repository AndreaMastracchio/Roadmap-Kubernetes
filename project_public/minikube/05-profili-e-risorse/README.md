# 5. Profili e Risorse

A volte potresti aver bisogno di più cluster indipendenti o di assegnare più risorse (CPU/RAM) a un cluster specifico per far girare applicazioni pesanti.

## Gestire più Cluster con i Profili
Un **Profilo** in Minikube è un cluster separato.
- **Creare un nuovo profilo**: `minikube start -p project-a`
- **Elencare i profili**: `minikube profile list`
- **Passare da un profilo all'altro**: `minikube profile project-a`
- **Cancellare un profilo specifico**: `minikube delete -p project-a`

## Ottimizzazione delle Risorse
Puoi configurare le risorse assegnate al cluster al momento della creazione:

### Memoria e CPU
```bash
minikube start --cpus=4 --memory=8192mb
```
*Nota: Assicurati di non assegnare più risorse di quelle che il tuo computer possiede realmente!*

### Spazio su Disco
```bash
minikube start --disk-size=40gb
```

## Configurazione Persistente
Se vuoi che ogni nuovo cluster abbia sempre le stesse risorse, usa il comando `config`:
```bash
minikube config set cpus 4
minikube config set memory 8192
```

<div id="exercises-section"></div>
