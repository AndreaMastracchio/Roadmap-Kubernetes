# Module 01: Container Design and Patterns

**Duration**: 3-4 hours  
**CKAD Weight**: 20% (Application Design and Build)

## Learning Objectives

By the end of this module, you will be able to:
- Write efficient Dockerfiles following best practices
- Implement multi-stage builds for optimized images
- Use .dockerignore to reduce build context
- Understand and apply container patterns: Sidecar, Ambassador, Adapter
- Configure init containers for initialization tasks
- Manage resource requests and limits in containers

---

## 1. Container Fundamentals

### 1.1 What is a Container

A container is a lightweight executable unit that includes application code and all its dependencies. Unlike virtual machines, containers share the host operating system kernel, making them much more resource-efficient.

**Key characteristics**:
- **Isolation**: Processes isolated from each other
- **Portability**: Works identically in every environment
- **Efficiency**: Shares kernel resources
- **Immutability**: Image doesn't change after creation

### 1.2 Container Images

An image is a read-only template that contains:
- Layered filesystem (layers)
- Configuration metadata
- Manifest describing the layers

```bash
# View image layers
docker history nginx:alpine

# Analyze size
docker images nginx:alpine --format "Size: {{.Size}}"
```

---

## 2. Dockerfile and Best Practices

### 2.1 Basic Dockerfile Structure

A Dockerfile is a text file containing instructions to build a container image.

```dockerfile
# Basic Dockerfile
FROM ubuntu:22.04

# Install dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy dependency file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose port
EXPOSE 8000

# Startup command
CMD ["python3", "app.py"]
```

### 2.2 Best Practices for Instructions

#### FROM - Choosing Base Image

```dockerfile
# Common base image choices
FROM ubuntu:22.04        # Complete but large (~77MB)
FROM python:3.11-slim   # Lighter (~150MB)
FROM python:3.11-alpine # Minimal (~50MB)
FROM scratch            # Empty, only for static binaries
```

**Guidelines**:
- Prefer official images
- Always specify tag (avoid `latest`)
- For Go, compile statically and use `scratch`
- For Python/Node, `alpine` often requires compilation

#### RUN - Command Execution

```dockerfile
# BAD: Too many layers
RUN apt-get update
RUN apt-get install -y python3
RUN apt-get install -y pip

# GOOD: Single layer with cleanup
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean
```

#### COPY vs ADD

```dockerfile
# COPY is preferred for local files
COPY app.py /app/

# ADD has extra features (URLs, auto-extraction)
# But not recommended for simple local files
ADD https://example.com/file.tar.gz /tmp/
```

#### CMD vs ENTRYPOINT

```dockerfile
# CMD: Default arguments, easily overridable
FROM ubuntu
CMD ["echo", "Hello"]

# Override: docker run myimage echo "Custom"

# ENTRYPOINT: Fixed command, arguments appended
FROM ubuntu
ENTRYPOINT ["echo"]
CMD ["Hello"]

# Override args: docker run myimage "Custom"
```

Optimal combination:
```dockerfile
ENTRYPOINT ["python3", "app.py"]
CMD ["--port", "8000"]
```

### 2.3 Cache Optimization

Docker uses cache to avoid rebuilding unchanged layers. Instruction order is crucial.

```dockerfile
# GOOD: Optimized order
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["python", "app.py"]

# BAD: Inefficient cache
FROM python:3.11-slim
WORKDIR /app
COPY . .
RUN pip install --no-cache-dir -r requirements.txt
CMD ["python", "app.py"]
```

Cache is invalidated when:
- A previous instruction changes
- Copied file changes (checksum)
- Using `--no-cache`

---

## 3. Multi-Stage Builds

### 3.1 Basic Concept

Multi-stage builds allow using different images for build and runtime, including only what's necessary in the final result.

```dockerfile
# Stage 1: Build
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.* ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# Stage 2: Runtime
FROM alpine:3.18
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/main .
EXPOSE 8080
CMD ["./main"]
```

### 3.2 Multi-Stage Examples for Common Languages

#### Node.js

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

#### Java with Maven

```dockerfile
# Build stage
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### Python with Virtual Environment

```dockerfile
# Build stage
FROM python:3.11-slim AS builder
WORKDIR /app
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Runtime stage
FROM python:3.11-slim
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
WORKDIR /app
COPY . .
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser
EXPOSE 8000
CMD ["gunicorn", "app:app"]
```

### 3.3 Distroless and Scratch

For maximum security and minimal size:

```dockerfile
# With Distroless (Google)
FROM gcr.io/distroless/static-debian11
COPY --from=builder /app/main /
CMD ["/main"]

# With Scratch (completely empty)
FROM scratch
COPY --from=builder /app/main /
CMD ["/main"]
```

**Limitations**:
- No shell (difficult debugging)
- No package manager
- Requires completely static binaries

---

## 4. The .dockerignore File

### 4.1 Purpose and Usage

The `.dockerignore` file excludes files from the build context, reducing time and size.

```dockerignore
# Version control
.git
.gitignore

# Dependencies
node_modules
vendor
__pycache__
*.pyc
.venv

# IDE and editors
.idea
.vscode
*.swp
*~

# Build and artifacts
dist
build
target
*.o
*.pyc

# Documentation
*.md
!README.md
docs/

# Sensitive files
.env
.env.*
*.pem
*.key
secrets/

# Test and CI
test/
tests/
.github/
.gitlab-ci.yml

# OS files
.DS_Store
Thumbs.db
```

### 4.2 Benefits

1. **Faster builds**: Fewer files to transfer
2. **Smaller images**: No unnecessary files
3. **Security**: Avoid including secrets accidentally
4. **Better cache**: More stable context

---

## 5. Container Patterns

### 5.1 Sidecar Pattern

A sidecar is a secondary container that extends the main container's functionality.

**Use cases**:
- Log forwarding
- Metrics and monitoring
- File synchronization
- Service proxy

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: sidecar-demo
spec:
  containers:
  # Main container
  - name: app
    image: nginx:alpine
    volumeMounts:
    - name: logs
      mountPath: /var/log/nginx
  
  # Sidecar for log forwarding
  - name: log-forwarder
    image: fluent/fluent-bit:latest
    volumeMounts:
    - name: logs
      mountPath: /var/log/nginx
      readOnly: true
  
  volumes:
  - name: logs
    emptyDir: {}
```

**Advantages**:
- Separation of concerns
- Autonomous and reusable containers
- Easier maintenance and updates

### 5.2 Ambassador Pattern

The ambassador hides the complexity of connections to external services.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: ambassador-demo
spec:
  containers:
  # Main application (connects to localhost)
  - name: app
    image: myapp:1.0
    env:
    - name: DB_HOST
      value: "localhost"
    - name: DB_PORT
      value: "5432"
  
  # Ambassador forwarding to real database
  - name: ambassador
    image: haproxy:2.8-alpine
    volumeMounts:
    - name: config
      mountPath: /usr/local/etc/haproxy
  
  volumes:
  - name: config
    configMap:
      name: haproxy-config
```

**Use cases**:
- Connection to databases in different environments
- Simplified service discovery
- Legacy connection management

### 5.3 Adapter Pattern

The adapter transforms the main container's output into a standard format.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: adapter-demo
spec:
  containers:
  # Main container with custom output
  - name: app
    image: legacy-app:1.0
    volumeMounts:
    - name: logs
      mountPath: /var/log/app
  
  # Adapter converting to JSON
  - name: adapter
    image: log-adapter:latest
    volumeMounts:
    - name: logs
      mountPath: /var/log/app
      readOnly: true
    - name: output
      mountPath: /var/log/output
  
  volumes:
  - name: logs
    emptyDir: {}
  - name: output
    emptyDir: {}
```

**Use cases**:
- Log normalization
- Protocol conversion
- Integration with legacy systems

---

## 6. Init Containers

### 6.1 Basic Concept

Init containers run sequentially before the main container and must complete successfully.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: init-demo
spec:
  initContainers:
  # Init 1: Setup database
  - name: init-db
    image: busybox:1.36
    command: ['sh', '-c', 'until nslookup db-service; do sleep 2; done']
  
  # Init 2: Migration
  - name: init-migration
    image: migrate:latest
    command: ['python', 'manage.py', 'migrate']
  
  containers:
  - name: app
    image: myapp:1.0
```

### 6.2 Characteristics

- Guaranteed sequential execution
- Must terminate successfully
- No readiness/liveness probes
- Can have different volumes than main container

### 6.3 Common Use Cases

```yaml
# 1. Wait for dependent service
initContainers:
- name: wait-for-db
  image: busybox
  command: ['sh', '-c', 'until nc -z db-service 5432; do sleep 1; done']

# 2. Download assets
initContainers:
- name: download-assets
  image: busybox
  command: ['wget', '-O', '/data/config.json', 'https://example.com/config.json']
  volumeMounts:
  - name: data
    mountPath: /data

# 3. Setup permissions
initContainers:
- name: setup-permissions
  image: busybox
  command: ['chmod', '777', '/data']
  volumeMounts:
  - name: data
    mountPath: /data
```

---

## 7. Resource Management

### 7.1 Requests and Limits

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: resource-demo
spec:
  containers:
  - name: app
    image: nginx:alpine
    resources:
      # Requests: guaranteed for scheduling
      requests:
        cpu: 100m      # 0.1 core
        memory: 128Mi  # 128 MiB
      # Limits: maximum usable
      limits:
        cpu: 500m      # 0.5 core
        memory: 256Mi  # 256 MiB
```

### 7.2 Units of Measurement

**CPU**:
- `1` = 1 CPU core (AWS vCPU, GCP Core)
- `100m` = 0.1 core (100 millicores)
- `0.5` = 500m

**Memory**:
- `128Mi` = 128 MiB (2^20 bytes)
- `1Gi` = 1024 MiB
- `1G` = 1000 MB (decimal)

### 7.3 Behavior with Limits

- **CPU**: Throttling (limits usage, doesn't kill)
- **Memory**: OOMKill (container is terminated)

---

## 8. Image Pull Policies

```yaml
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: app
    image: myimage:v1.0
    imagePullPolicy: Always  # Always pull
    # imagePullPolicy: IfNotPresent  # Pull if not present
    # imagePullPolicy: Never  # Never pull, local only
```

**Defaults**:
- `latest` tag → `Always`
- Specific tag → `IfNotPresent`

---

## 9. Security Best Practices

### 9.1 Non-Root User

```dockerfile
# In Dockerfile
RUN useradd -m -r appuser && chown -R appuser:appuser /app
USER appuser

# Or in Pod
securityContext:
  runAsUser: 1000
  runAsGroup: 3000
  fsGroup: 2000
```

### 9.2 Read-Only Filesystem

```yaml
securityContext:
  readOnlyRootFilesystem: true
  allowPrivilegeEscalation: false
```

### 9.3 Capabilities

```yaml
securityContext:
  capabilities:
    drop:
    - ALL
    add:
    - NET_BIND_SERVICE
```

---

## 10. Practical Exercise

### Objective
Create a complete application with:
1. Multi-stage Dockerfile
2. Pod with log sidecar
3. Init container for setup
4. Appropriate resource limits

### Steps

1. **Create the Dockerfile** multi-stage for a Python app
2. **Build the image** with specific tag
3. **Write the Pod YAML** with all components
4. **Verify operation** with kubectl
5. **Analyze sidecar logs**

---

## Summary

| Concept | CKAD Importance | Notes |
|----------|-----------------|------|
| Dockerfile basics | High | Fundamental |
| Multi-stage builds | High | Image optimization |
| Init containers | High | Initialization tasks |
| Sidecar pattern | Medium | Functionality extension |
| Resource limits | High | Scheduling and performance |
| Security context | Medium | Production best practices |

---

## Additional Resources

- [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Kubernetes Init Containers](https://kubernetes.io/docs/concepts/workloads/pods/init-containers/)
- [Container Patterns](https://kubernetes.io/blog/2015/06/the-distributed-system-toolkit-patterns/)
- [Resource Management](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/)
