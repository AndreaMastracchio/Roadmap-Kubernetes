// Mock Exam Questions - CKA/CKAD Style
const examQuestions = [
    {
        id: 1,
        weight: 4,
        question: `Crea un Pod chiamato <code>nginx-pod</code> nel namespace <code>default</code> con l'immagine <code>nginx:1.25</code>.
        
Il Pod deve avere:
- Label: <code>app=web</code>, <code>tier=frontend</code>
- Resource requests: CPU 100m, Memory 128Mi
- Resource limits: CPU 200m, Memory 256Mi`,
        hint: "Usa kubectl run con --dry-run=client -o yaml per generare il template base, poi modifica",
        acceptedAnswers: [
            "kubectl run nginx-pod --image=nginx:1.25 --labels=app=web,tier=frontend --dry-run=client -o yaml",
            "kubectl run nginx-pod --image=nginx:1.25 -l app=web,tier=frontend",
        ],
        solution: `kubectl run nginx-pod --image=nginx:1.25 --labels=app=web,tier=frontend --dry-run=client -o yaml > pod.yaml

# Poi modifica pod.yaml aggiungendo resources:
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
  labels:
    app: web
    tier: frontend
spec:
  containers:
  - name: nginx-pod
    image: nginx:1.25
    resources:
      requests:
        cpu: 100m
        memory: 128Mi
      limits:
        cpu: 200m
        memory: 256Mi

kubectl apply -f pod.yaml`,
        explanation: "Usa comandi imperativi per velocità, poi modifica il YAML per aggiungere resources."
    },
    {
        id: 2,
        weight: 6,
        question: `Crea un Deployment chiamato <code>webapp</code> nel namespace <code>production</code> con:
- Immagine: <code>nginx:1.24</code>
- Replicas: 3
- Strategy: RollingUpdate con maxSurge=1 e maxUnavailable=1
- Readiness probe: HTTP GET su porta 80, path /, initialDelay 5s

Poi esponi il deployment con un Service di tipo ClusterIP sulla porta 80.`,
        hint: "Crea prima il namespace se non esiste, usa kubectl create deployment, poi kubectl expose",
        acceptedAnswers: [
            "kubectl create namespace production",
            "kubectl create deployment webapp --image=nginx:1.24 --replicas=3 -n production",
            "kubectl expose deployment webapp --port=80 -n production"
        ],
        solution: `kubectl create namespace production

kubectl create deployment webapp --image=nginx:1.24 --replicas=3 -n production --dry-run=client -o yaml > deployment.yaml

# Modifica deployment.yaml per aggiungere strategy e readinessProbe:
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp
  namespace: production
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 1
  selector:
    matchLabels:
      app: webapp
  template:
    metadata:
      labels:
        app: webapp
    spec:
      containers:
      - name: nginx
        image: nginx:1.24
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5

kubectl apply -f deployment.yaml
kubectl expose deployment webapp --port=80 -n production`,
        explanation: "Deployment con strategy personalizzata e readiness probe per zero-downtime updates."
    },
    {
        id: 3,
        weight: 5,
        question: `Crea un PersistentVolumeClaim chiamato <code>mysql-pvc</code> nel namespace <code>database</code> con:
- Storage: 2Gi
- Access Mode: ReadWriteOnce
- StorageClass: standard (se disponibile, altrimenti ometti)

Poi crea un Pod chiamato <code>mysql</code> che monta questo PVC in <code>/var/lib/mysql</code>.`,
        hint: "kubectl create non supporta PVC, devi scrivere il YAML manualmente",
        acceptedAnswers: [
            "kubectl create namespace database",
        ],
        solution: `kubectl create namespace database

# pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mysql-pvc
  namespace: database
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 2Gi
  storageClassName: standard

kubectl apply -f pvc.yaml

# pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: mysql
  namespace: database
spec:
  containers:
  - name: mysql
    image: mysql:8.0
    volumeMounts:
    - name: mysql-storage
      mountPath: /var/lib/mysql
  volumes:
  - name: mysql-storage
    persistentVolumeClaim:
      claimName: mysql-pvc

kubectl apply -f pod.yaml`,
        explanation: "PVC per storage persistente, montato nel Pod per database."
    },
    {
        id: 4,
        weight: 7,
        question: `Crea un ServiceAccount chiamato <code>app-sa</code> nel namespace <code>default</code>.

Poi crea un Role chiamato <code>pod-reader</code> che permette di:
- get, list, watch sui Pod

Infine crea un RoleBinding chiamato <code>app-binding</code> che assegna il Role al ServiceAccount.`,
        hint: "Usa kubectl create serviceaccount, kubectl create role, kubectl create rolebinding",
        acceptedAnswers: [
            "kubectl create serviceaccount app-sa",
            "kubectl create role pod-reader --verb=get,list,watch --resource=pods",
            "kubectl create rolebinding app-binding --role=pod-reader --serviceaccount=default:app-sa"
        ],
        solution: `kubectl create serviceaccount app-sa

kubectl create role pod-reader --verb=get,list,watch --resource=pods

kubectl create rolebinding app-binding --role=pod-reader --serviceaccount=default:app-sa

# Verifica
kubectl auth can-i list pods --as=system:serviceaccount:default:app-sa`,
        explanation: "RBAC completo: ServiceAccount + Role + RoleBinding per permessi granulari."
    },
    {
        id: 5,
        weight: 4,
        question: `Trova tutti i Pod nel namespace <code>kube-system</code> che hanno la label <code>k8s-app=kube-dns</code> e salva i loro nomi in un file chiamato <code>/tmp/dns-pods.txt</code> (uno per riga).`,
        hint: "Usa kubectl get con -l per filtrare per label e -o per formattare l'output",
        acceptedAnswers: [
            "kubectl get pods -n kube-system -l k8s-app=kube-dns -o name > /tmp/dns-pods.txt",
            "kubectl get pods -n kube-system -l k8s-app=kube-dns -o jsonpath='{.items[*].metadata.name}' > /tmp/dns-pods.txt"
        ],
        solution: `kubectl get pods -n kube-system -l k8s-app=kube-dns -o name > /tmp/dns-pods.txt

# Oppure solo i nomi senza "pod/":
kubectl get pods -n kube-system -l k8s-app=kube-dns -o jsonpath='{.items[*].metadata.name}' | tr ' ' '\\n' > /tmp/dns-pods.txt`,
        explanation: "Filtraggio con label selector e output formatting con jsonpath."
    },
    {
        id: 6,
        weight: 6,
        question: `Crea un ConfigMap chiamato <code>app-config</code> nel namespace <code>default</code> con i seguenti dati:
- database_host=mysql.database.svc.cluster.local
- database_port=3306
- log_level=INFO

Poi crea un Pod chiamato <code>app</code> che usa questo ConfigMap come variabili d'ambiente.`,
        hint: "kubectl create configmap --from-literal per ogni chiave-valore",
        acceptedAnswers: [
            "kubectl create configmap app-config --from-literal=database_host=mysql.database.svc.cluster.local --from-literal=database_port=3306 --from-literal=log_level=INFO"
        ],
        solution: `kubectl create configmap app-config \\
  --from-literal=database_host=mysql.database.svc.cluster.local \\
  --from-literal=database_port=3306 \\
  --from-literal=log_level=INFO

# pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  containers:
  - name: app
    image: busybox
    command: ["sh", "-c", "env && sleep 3600"]
    envFrom:
    - configMapRef:
        name: app-config

kubectl apply -f pod.yaml

# Verifica
kubectl exec app -- env | grep database`,
        explanation: "ConfigMap per configurazione esterna, iniettata come env vars nel Pod."
    },
    {
        id: 7,
        weight: 8,
        question: `Un Deployment chiamato <code>broken-app</code> nel namespace <code>default</code> ha dei Pod in CrashLoopBackOff.

Identifica il problema guardando i log e gli eventi, poi:
1. Salva i log del Pod in <code>/tmp/crash-logs.txt</code>
2. Salva gli eventi del Pod in <code>/tmp/pod-events.txt</code>
3. Descrivi brevemente il problema in <code>/tmp/diagnosis.txt</code>`,
        hint: "Usa kubectl logs, kubectl describe, kubectl get events",
        acceptedAnswers: [
            "kubectl logs deployment/broken-app > /tmp/crash-logs.txt",
            "kubectl describe pod -l app=broken-app > /tmp/pod-events.txt",
            "kubectl get events --field-selector involvedObject.name=broken-app > /tmp/pod-events.txt"
        ],
        solution: `# Trova il pod
POD=$(kubectl get pods -l app=broken-app -o name | head -1)

# Salva log (anche del container precedente se crashato)
kubectl logs $POD > /tmp/crash-logs.txt
kubectl logs $POD --previous >> /tmp/crash-logs.txt 2>/dev/null

# Salva eventi
kubectl describe $POD > /tmp/pod-events.txt

# Analizza e scrivi diagnosi
echo "Il Pod crasha perché [analizza log ed eventi]" > /tmp/diagnosis.txt

# Possibili cause comuni:
# - Comando errato nel container
# - Liveness probe fallisce troppo presto
# - Dipendenze mancanti (DB, API)
# - Permessi filesystem
# - OOMKilled (memoria insufficiente)`,
        explanation: "Troubleshooting sistematico: log + eventi + analisi per identificare root cause."
    },
    {
        id: 8,
        weight: 5,
        question: `Crea un NetworkPolicy chiamato <code>deny-all</code> nel namespace <code>production</code> che blocca tutto il traffico in ingresso ai Pod.

Poi crea una seconda NetworkPolicy chiamata <code>allow-frontend</code> che permette solo ai Pod con label <code>app=frontend</code> di comunicare con i Pod con label <code>app=backend</code> sulla porta 8080.`,
        hint: "NetworkPolicy richiede YAML, non c'è comando imperativo",
        acceptedAnswers: [],
        solution: `# deny-all.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all
  namespace: production
spec:
  podSelector: {}
  policyTypes:
  - Ingress

kubectl apply -f deny-all.yaml

# allow-frontend.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - protocol: TCP
      port: 8080

kubectl apply -f allow-frontend.yaml`,
        explanation: "Network Policies per micro-segmentazione: deny-all di default + allow espliciti."
    },
    {
        id: 9,
        weight: 4,
        question: `Scala il Deployment <code>webapp</code> nel namespace <code>production</code> a 5 repliche.

Poi verifica che tutte le repliche siano Running e salva il numero di repliche Ready in <code>/tmp/ready-replicas.txt</code>.`,
        hint: "kubectl scale per scalare, kubectl get deployment per verificare",
        acceptedAnswers: [
            "kubectl scale deployment webapp --replicas=5 -n production",
            "kubectl get deployment webapp -n production -o jsonpath='{.status.readyReplicas}' > /tmp/ready-replicas.txt"
        ],
        solution: `kubectl scale deployment webapp --replicas=5 -n production

# Aspetta che siano ready
kubectl rollout status deployment/webapp -n production

# Salva numero ready
kubectl get deployment webapp -n production -o jsonpath='{.status.readyReplicas}' > /tmp/ready-replicas.txt

# Verifica
cat /tmp/ready-replicas.txt`,
        explanation: "Scaling manuale e verifica dello stato con jsonpath per estrarre campi specifici."
    },
    {
        id: 10,
        weight: 6,
        question: `Crea un Ingress chiamato <code>main-ingress</code> nel namespace <code>default</code> che:
- Usa ingressClassName: nginx
- Host: myapp.local
- Path / -> Service frontend:80
- Path /api -> Service backend:8080`,
        hint: "Ingress richiede YAML, specifica rules con host e paths",
        acceptedAnswers: [],
        solution: `# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: main-ingress
  namespace: default
spec:
  ingressClassName: nginx
  rules:
  - host: myapp.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 80
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend
            port:
              number: 8080

kubectl apply -f ingress.yaml

# Verifica
kubectl get ingress main-ingress
kubectl describe ingress main-ingress`,
        explanation: "Ingress per routing HTTP basato su path, un unico entry point per più servizi."
    },
    {
        id: 11,
        weight: 5,
        question: `Crea un Secret chiamato <code>db-credentials</code> nel namespace <code>database</code> di tipo generic con:
- username: admin
- password: SuperSecret123

Poi crea un Pod chiamato <code>db-client</code> che monta questo Secret come volume in <code>/etc/db-credentials</code> in read-only.`,
        hint: "kubectl create secret generic --from-literal",
        acceptedAnswers: [
            "kubectl create secret generic db-credentials --from-literal=username=admin --from-literal=password=SuperSecret123 -n database"
        ],
        solution: `kubectl create secret generic db-credentials \\
  --from-literal=username=admin \\
  --from-literal=password=SuperSecret123 \\
  -n database

# pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: db-client
  namespace: database
spec:
  containers:
  - name: client
    image: busybox
    command: ["sh", "-c", "cat /etc/db-credentials/username && sleep 3600"]
    volumeMounts:
    - name: credentials
      mountPath: /etc/db-credentials
      readOnly: true
  volumes:
  - name: credentials
    secret:
      secretName: db-credentials

kubectl apply -f pod.yaml

# Verifica
kubectl exec -n database db-client -- ls -la /etc/db-credentials`,
        explanation: "Secret per dati sensibili, montato come volume read-only per sicurezza."
    },
    {
        id: 12,
        weight: 7,
        question: `Un Deployment chiamato <code>webapp</code> nel namespace <code>production</code> è stato aggiornato con un'immagine errata e ora i Pod crashano.

Esegui un rollback alla revisione precedente e verifica che i Pod siano Running.

Salva la history del rollout in <code>/tmp/rollout-history.txt</code>.`,
        hint: "kubectl rollout undo per rollback, kubectl rollout history per vedere le revisioni",
        acceptedAnswers: [
            "kubectl rollout undo deployment/webapp -n production",
            "kubectl rollout history deployment/webapp -n production > /tmp/rollout-history.txt"
        ],
        solution: `# Visualizza history
kubectl rollout history deployment/webapp -n production

# Rollback alla revisione precedente
kubectl rollout undo deployment/webapp -n production

# Oppure rollback a revisione specifica
# kubectl rollout undo deployment/webapp -n production --to-revision=2

# Verifica status
kubectl rollout status deployment/webapp -n production

# Salva history
kubectl rollout history deployment/webapp -n production > /tmp/rollout-history.txt

# Verifica Pod
kubectl get pods -n production -l app=webapp`,
        explanation: "Rollback per recovery rapido da deployment falliti, con history tracking."
    },
    {
        id: 13,
        weight: 4,
        question: `Trova tutti i Pod in tutti i namespace che usano più di 100Mi di memoria e salva i loro nomi e namespace in <code>/tmp/high-memory-pods.txt</code> nel formato: <code>namespace/pod-name</code>`,
        hint: "kubectl top pods --all-namespaces per vedere l'utilizzo memoria",
        acceptedAnswers: [
            "kubectl top pods --all-namespaces --sort-by=memory"
        ],
        solution: `# Visualizza utilizzo memoria di tutti i Pod
kubectl top pods --all-namespaces --sort-by=memory

# Filtra quelli > 100Mi (manualmente o con script)
kubectl top pods -A --no-headers | awk '$4 ~ /[0-9]+Mi/ && $4+0 > 100 {print $1"/"$2}' > /tmp/high-memory-pods.txt

# Oppure manualmente:
kubectl top pods -A | grep -E '[1-9][0-9]{2,}Mi' > /tmp/high-memory-pods.txt

# Nota: Richiede Metrics Server installato nel cluster`,
        explanation: "Monitoring risorse con kubectl top, utile per identificare Pod che consumano troppo."
    },
    {
        id: 14,
        weight: 6,
        question: `Crea un Job chiamato <code>backup-job</code> nel namespace <code>default</code> che:
- Usa immagine: busybox
- Comando: sh -c "echo Backup completed && sleep 10"
- Completions: 3
- Parallelism: 2
- RestartPolicy: OnFailure

Verifica che il Job completi con successo.`,
        hint: "kubectl create job per il template base, poi modifica per completions e parallelism",
        acceptedAnswers: [
            "kubectl create job backup-job --image=busybox -- sh -c 'echo Backup completed && sleep 10'"
        ],
        solution: `# job.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: backup-job
spec:
  completions: 3
  parallelism: 2
  template:
    spec:
      containers:
      - name: backup
        image: busybox
        command: ["sh", "-c", "echo Backup completed && sleep 10"]
      restartPolicy: OnFailure

kubectl apply -f job.yaml

# Monitora
kubectl get jobs backup-job -w

# Verifica completamento
kubectl get job backup-job
kubectl get pods -l job-name=backup-job

# Log
kubectl logs -l job-name=backup-job`,
        explanation: "Job per task batch con completions multiple e parallelismo controllato."
    },
    {
        id: 15,
        weight: 5,
        question: `Crea un Pod chiamato <code>secure-pod</code> nel namespace <code>default</code> con:
- Immagine: nginx:1.25
- SecurityContext:
  - runAsNonRoot: true
  - runAsUser: 1000
  - readOnlyRootFilesystem: true
  - allowPrivilegeEscalation: false
  - capabilities: drop ALL`,
        hint: "SecurityContext va nella spec del Pod e/o del container",
        acceptedAnswers: [],
        solution: `# pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: secure-pod
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
  containers:
  - name: nginx
    image: nginx:1.25
    securityContext:
      readOnlyRootFilesystem: true
      allowPrivilegeEscalation: false
      capabilities:
        drop:
        - ALL

kubectl apply -f pod.yaml

# Verifica
kubectl describe pod secure-pod | grep -A 10 "Security Context"`,
        explanation: "Security hardening con SecurityContext per ridurre superficie di attacco."
    },
    {
        id: 16,
        weight: 7,
        question: `Crea un StatefulSet chiamato <code>mysql</code> nel namespace <code>database</code> con:
- Replicas: 3
- Immagine: mysql:8.0
- ServiceName: mysql-headless
- VolumeClaimTemplate: 1Gi storage, ReadWriteOnce, montato in /var/lib/mysql

Crea anche il Headless Service necessario.`,
        hint: "StatefulSet richiede YAML completo, ricorda il serviceName e volumeClaimTemplates",
        acceptedAnswers: [],
        solution: `# headless-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: mysql-headless
  namespace: database
spec:
  clusterIP: None
  selector:
    app: mysql
  ports:
  - port: 3306

kubectl apply -f headless-service.yaml

# statefulset.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mysql
  namespace: database
spec:
  serviceName: mysql-headless
  replicas: 3
  selector:
    matchLabels:
      app: mysql
  template:
    metadata:
      labels:
        app: mysql
    spec:
      containers:
      - name: mysql
        image: mysql:8.0
        env:
        - name: MYSQL_ROOT_PASSWORD
          value: password
        ports:
        - containerPort: 3306
        volumeMounts:
        - name: data
          mountPath: /var/lib/mysql
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 1Gi

kubectl apply -f statefulset.yaml

# Verifica
kubectl get statefulset -n database
kubectl get pods -n database -l app=mysql
kubectl get pvc -n database`,
        explanation: "StatefulSet per applicazioni stateful con identità stabile e storage persistente per replica."
    },
    {
        id: 17,
        weight: 4,
        question: `Elenca tutti i nodi del cluster e salva in <code>/tmp/nodes-info.txt</code>:
- Nome nodo
- Status (Ready/NotReady)
- Versione kubelet
- IP interno

Formato: <code>nome,status,versione,ip</code> (uno per riga)`,
        hint: "kubectl get nodes con custom-columns o jsonpath",
        acceptedAnswers: [
            "kubectl get nodes -o custom-columns=NAME:.metadata.name,STATUS:.status.conditions[-1].type,VERSION:.status.nodeInfo.kubeletVersion,IP:.status.addresses[0].address"
        ],
        solution: `kubectl get nodes -o custom-columns=\\
NAME:.metadata.name,\\
STATUS:.status.conditions[-1].type,\\
VERSION:.status.nodeInfo.kubeletVersion,\\
IP:.status.addresses[0].address \\
--no-headers > /tmp/nodes-info.txt

# Oppure con jsonpath
kubectl get nodes -o jsonpath='{range .items[*]}{.metadata.name},{.status.conditions[-1].type},{.status.nodeInfo.kubeletVersion},{.status.addresses[0].address}{"\\n"}{end}' > /tmp/nodes-info.txt

# Verifica
cat /tmp/nodes-info.txt`,
        explanation: "Custom output formatting con custom-columns o jsonpath per report personalizzati."
    },
    {
        id: 18,
        weight: 6,
        question: `Crea un DaemonSet chiamato <code>node-monitor</code> nel namespace <code>kube-system</code> che:
- Usa immagine: busybox
- Comando: sh -c "while true; do echo Monitoring node; sleep 30; done"
- Deve girare su tutti i nodi inclusi i master (toleration per node-role.kubernetes.io/control-plane)`,
        hint: "DaemonSet richiede YAML, aggiungi tolerations per girare sui master",
        acceptedAnswers: [],
        solution: `# daemonset.yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: node-monitor
  namespace: kube-system
spec:
  selector:
    matchLabels:
      app: node-monitor
  template:
    metadata:
      labels:
        app: node-monitor
    spec:
      tolerations:
      - key: node-role.kubernetes.io/control-plane
        operator: Exists
        effect: NoSchedule
      - key: node-role.kubernetes.io/master
        operator: Exists
        effect: NoSchedule
      containers:
      - name: monitor
        image: busybox
        command: ["sh", "-c", "while true; do echo Monitoring node; sleep 30; done"]

kubectl apply -f daemonset.yaml

# Verifica
kubectl get daemonset -n kube-system node-monitor
kubectl get pods -n kube-system -l app=node-monitor -o wide`,
        explanation: "DaemonSet per eseguire un Pod su ogni nodo, con tolerations per master nodes."
    },
    {
        id: 19,
        weight: 8,
        question: `Esegui un backup di etcd e salvalo in <code>/tmp/etcd-backup.db</code>.

Usa i certificati in <code>/etc/kubernetes/pki/etcd/</code> e l'endpoint <code>https://127.0.0.1:2379</code>.

Poi verifica l'integrità del backup con etcdctl.`,
        hint: "etcdctl snapshot save con --endpoints, --cacert, --cert, --key",
        acceptedAnswers: [
            "ETCDCTL_API=3 etcdctl snapshot save /tmp/etcd-backup.db"
        ],
        solution: `# Backup etcd
ETCDCTL_API=3 etcdctl snapshot save /tmp/etcd-backup.db \\
  --endpoints=https://127.0.0.1:2379 \\
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \\
  --cert=/etc/kubernetes/pki/etcd/server.crt \\
  --key=/etc/kubernetes/pki/etcd/server.key

# Verifica integrità
ETCDCTL_API=3 etcdctl snapshot status /tmp/etcd-backup.db --write-out=table

# Output dovrebbe mostrare:
# +----------+----------+------------+------------+
# |   HASH   | REVISION | TOTAL KEYS | TOTAL SIZE |
# +----------+----------+------------+------------+
# | 12345678 |    12345 |       1234 |      5.6MB |
# +----------+----------+------------+------------+

# Per restore (NON eseguire ora):
# ETCDCTL_API=3 etcdctl snapshot restore /tmp/etcd-backup.db --data-dir=/var/lib/etcd-restore`,
        explanation: "Backup etcd è critico per disaster recovery, usa sempre certificati TLS corretti."
    },
    {
        id: 20,
        weight: 7,
        question: `Crea un HorizontalPodAutoscaler per il Deployment <code>webapp</code> nel namespace <code>production</code> con:
- Min replicas: 2
- Max replicas: 10
- Target CPU utilization: 70%

Poi genera carico sul deployment e verifica che l'HPA scali automaticamente.`,
        hint: "kubectl autoscale deployment per creare HPA",
        acceptedAnswers: [
            "kubectl autoscale deployment webapp --min=2 --max=10 --cpu-percent=70 -n production"
        ],
        solution: `# Crea HPA
kubectl autoscale deployment webapp --min=2 --max=10 --cpu-percent=70 -n production

# Oppure con YAML
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: webapp
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: webapp
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70

kubectl apply -f hpa.yaml

# Verifica HPA
kubectl get hpa -n production webapp

# Genera carico (in un altro terminale)
kubectl run load-generator --image=busybox -n production -- /bin/sh -c "while true; do wget -q -O- http://webapp; done"

# Monitora scaling
kubectl get hpa -n production webapp -w

# Cleanup
kubectl delete pod load-generator -n production`,
        explanation: "HPA per autoscaling basato su metriche CPU, richiede Metrics Server installato."
    }
];
