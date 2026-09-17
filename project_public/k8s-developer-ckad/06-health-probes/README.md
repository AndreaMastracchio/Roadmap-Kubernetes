# Modulo 06: Health Probes

**Durata stimata:** 3 ore  
**Peso CKAD:** Application Design and Build (20%)

## Obiettivi di Apprendimento

Al termine di questo modulo sarai in grado di:

- Configurare livenessProbe per rilevare applicazioni bloccate
- Implementare readinessProbe per gestire il traffico in modo sicuro
- Utilizzare startupProbe per applicazioni con avvio lento
- Scegliere il tipo di handler appropriato (HTTP, TCP, exec, gRPC)
- Configurare parametri avanzati come timeout, threshold e delay
- Diagnosticare e risolvere problemi comuni legati ai probe

## Introduzione ai Probe Kubernetes

I probe sono meccanismi diagnostici che Kubernetes utilizza per verificare lo stato dei container. Un'applicazione può essere in esecuzione ma non funzionante: i probe permettono di rilevare questa situazione e intervenire automaticamente.

### I Tre Tipi di Probe

Kubernetes supporta tre tipi di probe, ognuno con uno scopo specifico:

**1. Liveness Probe** - Verifica se il container è ancora vivo
- Se fallisce: il container viene riavviato
- Scopo: rilevare deadlock o stati irrecuperabili
- Azione: restart del container secondo la restartPolicy

**2. Readiness Probe** - Verifica se il container è pronto a ricevere traffico
- Se fallisce: il pod viene rimosso dai Service
- Scopo: impedire che le richieste arrivino a pod non pronti
- Azione: rimozione dagli endpoint (nessun restart)

**3. Startup Probe** - Verifica se l'applicazione ha completato l'avvio
- Se fallisce: il container viene riavviato
- Scopo: permettere avvii lenti senza interferenze da altri probe
- Azione: disabilita liveness/readiness fino al successo

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: probes-demo
spec:
  containers:
  - name: app
    image: myapp:1.0
    # Startup probe - attende l'avvio completo
    startupProbe:
      httpGet:
        path: /started
        port: 8080
      failureThreshold: 30
      periodSeconds: 10
    
    # Liveness probe - verifica che sia vivo
    livenessProbe:
      httpGet:
        path: /healthz
        port: 8080
      initialDelaySeconds: 0
      periodSeconds: 10
    
    # Readiness probe - verifica che sia pronto
    readinessProbe:
      httpGet:
        path: /ready
        port: 8080
      initialDelaySeconds: 5
      periodSeconds: 5
```

## Handler per Probe

Kubernetes supporta quattro tipi di handler per eseguire i probe:

### HTTP GET (httpGet)

Il più comune per applicazioni web. Esegue una richiesta HTTP e considera successo se la risposta è 200-399.

```yaml
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
    scheme: HTTP
    httpHeaders:
    - name: X-Custom-Header
      value: probe-value
  initialDelaySeconds: 10
  periodSeconds: 5
  timeoutSeconds: 2
  failureThreshold: 3
```

Parametri chiave:
- **path**: percorso dell'endpoint
- **port**: numero porta o nome
- **scheme**: HTTP o HTTPS
- **httpHeaders**: header personalizzati (opzionale)

### TCP Socket (tcpSocket)

Verifica se una porta TCP è aperta. Utile per database e servizi non HTTP.

```yaml
livenessProbe:
  tcpSocket:
    port: 3306
  initialDelaySeconds: 15
  periodSeconds: 10
```

Vantaggi:
- Più leggero di HTTP
- Non richiede endpoint dedicato
- Ideale per database e servizi TCP

### Comando (exec)

Esegue un comando nel container. Successo se il comando termina con codice 0.

```yaml
livenessProbe:
  exec:
    command:
    - /bin/sh
    - -c
    - test -f /tmp/healthy && pgrep myapp
  initialDelaySeconds: 10
  periodSeconds: 5
```

Casi d'uso:
- Verificare file di lock
- Controllare processi
- Script di health check complessi

### gRPC

Disponibile da Kubernetes 1.24+, per servizi gRPC con health checking standard.

```yaml
livenessProbe:
  grpc:
    port: 50051
    service: mypackage.MyService
  initialDelaySeconds: 10
```

## Parametri di Configurazione

### initialDelaySeconds

Secondi da attendere dopo l'avvio del container prima di iniziare i probe.

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 30  # Aspetta 30s prima del primo probe
```

Importanza:
- Evita che probe falliscano durante l'avvio
- Dipende dal tempo di startup dell'applicazione
- Valore predefinito: 0

### periodSeconds

Intervallo tra probe consecutivi.

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  periodSeconds: 10  # Esegue ogni 10 secondi
```

Considerazioni:
- Più frequente = rilevamento più rapido ma più carico
- Meno frequente = meno carico ma rilevamento più lento
- Valore predefinito: 10

### timeoutSeconds

Tempo massimo di attesa per ogni probe.

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  timeoutSeconds: 5  # Fallisce se non risponde entro 5s
```

Raccomandazioni:
- Applicazioni veloci: 1-2 secondi
- Applicazioni lente: 5-10 secondi
- Valore predefinito: 1

### failureThreshold

Numero di fallimenti consecutivi prima di considerare il probe fallito.

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  failureThreshold: 3  # Riavvia dopo 3 fallimenti consecutivi
```

Impatto:
- Valore alto = più tolleranza ai glitch transitori
- Valore basso = reazione più rapida
- Valore predefinito: 3

### successThreshold

Successi consecutivi necessari per considerare il probe riuscito.

```yaml
readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  successThreshold: 2  # Richiede 2 successi per essere ready
```

Vincoli:
- Per livenessProbe: DEVE essere 1
- Per readinessProbe: può essere > 1
- Per startupProbe: DEVE essere 1
- Valore predefinito: 1

## RestartPolicy e Comportamento dei Probe

La restartPolicy del Pod determina cosa succede quando un probe fallisce:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: restart-demo
spec:
  restartPolicy: Always  # Always, OnFailure, Never
  containers:
  - name: app
    image: myapp
    livenessProbe:
      httpGet:
        path: /health
        port: 8080
```

### Comportamento per Policy

| Policy | Liveness Fallito | Crash (Exit != 0) | Exit 0 |
|--------|------------------|-------------------|--------|
| Always | Restart | Restart | Restart |
| OnFailure | Restart | Restart | Niente |
| Never | Niente | Niente | Niente |

**Nota:** Nei Deployment, la restartPolicy è sempre "Always" (o non specificata).

## Strategia di Configurazione Ottimale

### Applicazioni con Avvio Rapido

```yaml
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 3
```

### Applicazioni con Avvio Lento

```yaml
startupProbe:
  httpGet:
    path: /started
    port: 8080
  failureThreshold: 30  # 30 * 10s = 5 minuti max
  periodSeconds: 10

livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
  initialDelaySeconds: 0  # Disabilitato fino a startupProbe OK
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  initialDelaySeconds: 0
  periodSeconds: 5
```

Calcolo del tempo massimo di avvio:
```
max_startup_time = startupProbe.failureThreshold * startupProbe.periodSeconds
```

## Diagnosticare Problemi con i Probe

### Visualizzare lo Stato dei Probe

```bash
# Descrivere il pod per vedere lo stato
kubectl describe pod <pod-name>

# Esempio output
Events:
  Type     Reason     Age   From               Message
  ----     ------     ----  ----               -------
  Warning  Unhealthy  12s   kubelet            Liveness probe failed: HTTP probe failed with statuscode: 500
  Normal   Killing    11s   kubelet            Container app failed liveness probe, will be restarted
```

### Controllare i Restart

```bash
# Numero di restart del container
kubectl get pod <pod-name> -o jsonpath='{.status.containerStatuses[0].restartCount}'

# Ultimo stato del container
kubectl get pod <pod-name> -o jsonpath='{.status.containerStatuses[0].lastState}'
```

### Log per Debug

```bash
# Log del container (inclusi stderr del probe exec)
kubectl logs <pod-name>

# Log del container precedente (dopo restart)
kubectl logs <pod-name> --previous
```

### Eventi Specifici per Probe

```bash
# Filtrare eventi per probe falliti
kubectl get events --field-selector reason=LivenessProbeFailed
kubectl get events --field-selector reason=ReadinessProbeFailed

# Eventi recenti ordinati
kubectl events --sort='.lastTimestamp'
```

## Problemi Comuni e Soluzioni

### 1. Probe Troppo Precoce

**Problema:** Il probe fallisce perché l'applicazione non è ancora pronta.

```yaml
# Problema
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 0  # Tropo presto!
```

**Soluzione:** Aumentare initialDelaySeconds o usare startupProbe.

### 2. Probe con Timeout Troppo Basso

**Problema:** Il probe va in timeout prima che l'app risponda.

```yaml
# Problema
livenessProbe:
  httpGet:
    path: /slow-health
    port: 8080
  timeoutSeconds: 1  # Troppo basso per endpoint lento
```

**Soluzione:** Aumentare timeoutSeconds.

### 3. Endpoint Probe Pesante

**Problema:** L'endpoint di health check è troppo costoso.

**Soluzione:** Creare endpoint leggero dedicato.

```python
# Cattivo - health check pesante
@app.route('/health')
def health():
    check_database()  # Query pesante
    check_cache()     # Connessione esterna
    return "OK"

# Buono - health check leggero
@app.route('/healthz')
def healthz():
    return "OK"  # Solo verifica che il processo risponda
```

### 4. Probe e Graceful Shutdown

**Problema:** Il pod viene ucciso mentre gestisce richieste.

**Soluzione:** Implementare graceful shutdown e usare preStop hook.

```yaml
lifecycle:
  preStop:
    exec:
      command: ["/bin/sh", "-c", "sleep 10"]
```

## Best Practices

1. **Usa startupProbe per applicazioni lente** - Evita restart durante l'avvio
2. **Endpoint dedicato per health** - Non usare endpoint business
3. **ReadinessProbe sempre con il Service** - Evita traffico a pod non pronti
4. **Non sovraccaricare i probe** - Mantieni gli endpoint leggeri
5. **Configura timeout appropriati** - Considera la latenza di rete
6. **Usa porte nominali** - Più manutenibile dei numeri
7. **Testa la configurazione** - Verifica che i probe funzionino come previsto

## Esercitazione Pratica

Per consolidare le conoscenze di questo modulo:

1. Crea un deployment con tutti e tre i probe configurati
2. Simula un fallimento del livenessProbe e osserva il restart
3. Verifica che il readinessProbe rimuova il pod dal Service
4. Configura uno startupProbe per un'applicazione lenta
5. Analizza gli eventi generati dai probe falliti

## Conclusione

I probe sono fondamentali per applicazioni Kubernetes resilienti. La combinazione corretta di liveness, readiness e startup probe garantisce che:

- Le applicazioni bloccate vengano riavviate automaticamente
- Il traffico sia instradato solo verso pod funzionanti
- Le applicazioni lente abbiano tempo di completare l'avvio

Nel prossimo modulo approfondiremo l'osservabilità con logs e debugging.
