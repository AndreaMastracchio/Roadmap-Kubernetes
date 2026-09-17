# Modulo 6: Fonti e Kustomizations Flux

**Durata**: 2 ore teoria + 2 ore lab  
**Obiettivo**: Configurare fonti Git, Helm e OCI e gestire dipendenze tra Kustomization

## Panoramica del Modulo

Flux utilizza il concetto di "fonti" (Sources) come base per la riconciliazione del cluster. Una Source rappresenta un artifact versionato che può essere un repository Git, un chart Helm o un'immagine OCI. Le Kustomization sono le risorse che applicano questi artifact al cluster, con supporto per dipendenze, health check e garbage collection.

Questo modulo esplora in dettaglio ogni tipo di fonte, le strategie di autenticazione, la verifica delle firme e i pattern avanzati di gestione delle dipendenze.

## 🎯 Obiettivi di Apprendimento

- Configurare GitRepository con diverse modalità di autenticazione (HTTPS, SSH, token)
- Usare HelmRepository e OCIRepository come fonti per chart e bundle
- Creare dipendenze tra Kustomization per gestire l'ordine di deployment
- Implementare la verifica delle firme con Cosign per artifact OCI
- Configurare health check e timeout per le risorse
- Gestire la garbage collection e il pruning delle risorse
- Comprendere lo status reporting e le condizioni delle Kustomization

## 📚 Contenuti Teorici

### 1. GitRepository

Il GitRepository è la fonte più comune per configurazioni GitOps. Supporta diverse modalità di riferimento e autenticazione.

```yaml
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: my-app-repo
  namespace: flux-system
spec:
  interval: 1m
  url: https://github.com/organization/app-config
  ref:
    branch: main
    # Alternative: tag, commit, semver
    # ref:
    #   semver: ">=1.0.0"
  secretRef:
    name: git-credentials
  timeout: 60s
  ignore: |
    # Escludi file dal manifest generato
    .github/
    docs/
    *.md
  verification:
    mode: head
    secretRef:
      name: gpg-public-key
```

#### Riferimenti Versione

```yaml
# Branch specifico
ref:
  branch: production

# Tag specifico
ref:
  tag: v2.1.0

# Commit SHA
ref:
  commit: "a1b2c3d4e5f6"

# Semver per release automatiche
ref:
  semver: ">=1.0.0 <2.0.0"
```

### 2. Autenticazione Git

#### HTTPS con Token Personale

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: git-https-credentials
  namespace: flux-system
stringData:
  username: git
  password: ghp_xxxxxxxxxxxxxxxxxxxx  # Personal Access Token
---
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: private-repo
spec:
  url: https://github.com/org/private-repo.git
  secretRef:
    name: git-https-credentials
```

#### Autenticazione SSH

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: git-ssh-credentials
  namespace: flux-system
stringData:
  identity: |
    -----BEGIN OPENSSH PRIVATE KEY-----
    b3BlbnNzaC1rZXktdjEAAAAABG5vbmU...
    -----END OPENSSH PRIVATE KEY-----
  known_hosts: |
    github.com ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC...
---
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: ssh-repo
spec:
  url: ssh://git@github.com/org/repo.git
  secretRef:
    name: git-ssh-credentials
```

### 3. HelmRepository

```yaml
apiVersion: source.toolkit.fluxcd.io/v1beta2
kind: HelmRepository
metadata:
  name: bitnami
  namespace: flux-system
spec:
  interval: 10m
  url: https://charts.bitnami.com/bitnami
  timeout: 2m
  provider: generic  # 'generic' o 'aws', 'azure', 'gcp' per registri cloud
  # Per repository privati:
  secretRef:
    name: helm-registry-credentials
```

#### Helm Chart da GitRepository

```yaml
apiVersion: source.toolkit.fluxcd.io/v1beta2
kind: HelmChart
metadata:
  name: my-app-chart
  namespace: flux-system
spec:
  interval: 5m
  chart: ./charts/my-app
  sourceRef:
    kind: GitRepository
    name: my-app-repo
  valuesFiles:
    - ./charts/my-app/values.yaml
    - ./environments/production/values.yaml
```

### 4. OCIRepository

```yaml
apiVersion: source.toolkit.fluxcd.io/v1beta2
kind: OCIRepository
metadata:
  name: my-oci-bundle
  namespace: flux-system
spec:
  interval: 5m
  url: oci://ghcr.io/organization/bundle
  ref:
    tag: v1.2.3
    # Oppure semver:
    # semver: ">=1.0.0"
  # Autenticazione per registri privati:
  secretRef:
    name: oci-registry-credentials
  # Verifica firma:
  verify:
    provider: cosign
    secretRef:
      name: cosign-public-key
```

#### Bucket Source (per storage S3/GCS/Azure)

```yaml
apiVersion: source.toolkit.fluxcd.io/v1beta2
kind: Bucket
metadata:
  name: config-bucket
  namespace: flux-system
spec:
  interval: 5m
  bucketName: my-config-bucket
  endpoint: s3.amazonaws.com
  provider: aws
  secretRef:
    name: bucket-credentials
```

### 5. Kustomization con Health Check

```yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: my-app
  namespace: flux-system
spec:
  interval: 5m
  path: ./apps/my-app
  sourceRef:
    kind: GitRepository
    name: my-app-repo
  prune: true  # Rimuovi risorse non più presenti nel manifest
  timeout: 3m
  
  # Health checks: aspetta che le risorse siano healthy
  healthChecks:
    - apiVersion: apps/v1
      kind: Deployment
      name: my-app
      namespace: production
    - apiVersion: batch/v1
      kind: Job
      name: migration-job
      namespace: production
  
  # Controllo readiness delle dipendenze
  healthCheckExprs:
    - apiVersion: apiextensions.k8s.io/v1
      kind: CustomResourceDefinition
      name: prometheuses.monitoring.coreos.com
      current: .status.conditions[?(@.type=="Established")].status=="True"
```

### 6. Dipendenze tra Kustomization

Le dipendenze garantiscono che le Kustomization vengano applicate nell'ordine corretto.

```yaml
# Kustomization base: infrastruttura
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: infrastructure
  namespace: flux-system
spec:
  interval: 10m
  path: ./infrastructure
  sourceRef:
    kind: GitRepository
    name: flux-system
  prune: true
---
# Kustomization dipendente: applicazioni
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: applications
  namespace: flux-system
spec:
  interval: 5m
  path: ./apps
  sourceRef:
    kind: GitRepository
    name: flux-system
  dependsOn:
    - name: infrastructure
  prune: true
---
# Catena completa
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: monitoring
  namespace: flux-system
spec:
  dependsOn:
    - name: infrastructure
    - name: applications
  # Attende che entrambe siano ready
```

### 7. Verifica Firme con Cosign

```yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: signed-app
  namespace: flux-system
spec:
  sourceRef:
    kind: OCIRepository
    name: signed-bundle
  verification:
    provider: cosign
    secretRef:
      name: cosign-public-key
---
apiVersion: v1
kind: Secret
metadata:
  name: cosign-public-key
  namespace: flux-system
stringData:
  cosign.pub: |
    -----BEGIN PUBLIC KEY-----
    MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...
    -----END PUBLIC KEY-----
```

### 8. Garbage Collection e Pruning

```yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: my-app
spec:
  prune: true  # Abilita la rimozione delle risorse
  # Strategia di garbage collection
  garbageCollection:
    mode: OnDeletion  # 'OnDeletion' (default) o 'Disabled'
```

## ⚠️ Errori Comuni

1. **Dipendenze circolari**: Non creare cicli nelle dipendenze tra Kustomization. Flux rifiuterà di applicarle.

2. **Timeout troppo brevi**: Deployment complessi potrebbero richiedere più tempo. Impostare timeout adeguati (es. 5m per deployment con job di migrazione).

3. **Health check su risorse non esistenti**: Assicurarsi che le risorse referenziate negli health check siano create dalla Kustomization o da una sua dipendenza.

4. **Secret con formato errato**: Per SSH, il campo `identity` deve contenere la chiave privata completa, inclusi header/footer.

5. **Ignorare le condizioni di errore**: Controllare sempre `flux get kustomization -A` per identificare fallimenti.

## ✅ Best Practices

- Usare `dependsOn` per garantire l'ordine di deployment
- Impostare `prune: true` per evitare risorse orfane
- Configurare timeout adeguati per deployment complessi
- Verificare le firme degli artifact in produzione
- Usare `semver` invece di branch per ambienti di produzione
- Monitorare lo status delle Kustomization con `flux get`
- Documentare le dipendenze nel README del repository

## 📊 Status e Condizioni

```bash
# Visualizzare lo stato di tutte le Kustomization
flux get kustomization -A

# Dettagli su una specifica Kustomization
flux get kustomization my-app -o yaml

# Controllare le fonti
flux get source git -A
flux get source helm -A
flux get source oci -A

# Risolvere problemi di riconciliazione
flux reconcile kustomization my-app --with-source
```

## 🔧 Esercizi Pratici

1. Configurare GitRepository con autenticazione SSH
2. Creare una HelmRepository e usarla per deployare un chart
3. Implementare dipendenze tra tre Kustomization (infra → apps → monitoring)
4. Configurare health check per Deployment e Job
5. Abilitare la verifica Cosign per un OCIRepository

## 📝 Riepilogo

Questo modulo ha coperto i componenti fondamentali di Flux per la gestione delle fonti e delle Kustomization. La comprensione di GitRepository, HelmRepository, OCIRepository e Bucket permette di integrare qualsiasi fonte di configurazione. Le dipendenze tra Kustomization, gli health check e la garbage collection sono essenziali per deployment affidabili. La verifica delle firme con Cosign aggiunge un livello di sicurezza critico per gli ambienti di produzione.

Nel prossimo modulo esploreremo l'integrazione con pipeline CI/CD e le strategie di deployment avanzate.
