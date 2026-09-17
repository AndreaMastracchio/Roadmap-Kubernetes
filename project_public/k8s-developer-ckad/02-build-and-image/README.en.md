# Module 02: Build and Image Management

**Duration**: 3-4 hours  
**CKAD Weight**: 20% (Application Design and Build)

## Learning Objectives

By the end of this module, you will be able to:
- Build Docker images with docker build
- Optimize builds leveraging layer caching
- Tag and manage image versions
- Interact with public and private container registries
- Configure appropriate imagePullPolicy
- Use ephemeral containers for debugging

---

## 1. Docker Build Process

### 1.1 docker build Command

The `docker build` command creates an image from a Dockerfile and build context.

```bash
# Basic build
docker build -t myapp:v1.0 .

# Build with specific Dockerfile
docker build -t myapp:v1.0 -f Dockerfile.prod .

# Build with arguments
docker build --build-arg VERSION=1.0 -t myapp:v1.0 .

# Build without cache
docker build --no-cache -t myapp:v1.0 .
```

### 1.2 Build Context

The context is the set of files accessible during the build:

```bash
# Context = current directory
docker build -t myapp .

# Context = specific directory
docker build -t myapp /path/to/context

# Context from Git repository
docker build -t myapp https://github.com/user/repo.git#branch

# Context from stdin (without Dockerfile)
echo -e "FROM alpine\nRUN echo 'Hello'" | docker build -t minimal -
```

### 1.3 Common Flags

| Flag | Purpose | Example |
|------|---------|---------|
| `-t` | Tag image | `-t myapp:v1` |
| `-f` | Alternate Dockerfile | `-f Dockerfile.prod` |
| `--build-arg` | Pass ARG | `--build-arg VERSION=1.0` |
| `--no-cache` | Disable cache | `--no-cache` |
| `--platform` | Target platform | `--platform linux/amd64` |
| `--target` | Specific stage | `--target builder` |

---

## 2. Layer Caching

### 2.1 How Cache Works

Docker saves each layer and reuses it if:
- The instruction hasn't changed
- Input files (for COPY/ADD) haven't changed
- Previous layers were used from cache

```dockerfile
# GOOD: Efficient cache
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci                 # Cached until here if package.json doesn't change
COPY . .                   # New layer if code changes
RUN npm run build
CMD ["npm", "start"]

# BAD: Inefficient cache
FROM node:18-alpine
WORKDIR /app
COPY . .                   # Invalidates cache if ANY file changes
RUN npm ci                 # Rebuilt every time
RUN npm run build
CMD ["npm", "start"]
```

### 2.2 Optimization Strategies

1. **Order instructions** from least frequent to most frequent
2. **Minimize layers** by combining related RUN statements
3. **Use .dockerignore** to reduce invalidations
4. **Separate dependencies** from source code

```dockerfile
# Complete optimization
FROM python:3.11-slim

# Layer 1: System dependencies (rarely changes)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Layer 2: Python dependencies (occasionally changes)
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Layer 3: Source code (frequently changes)
COPY . .

# Layer 4: Configuration (occasionally changes)
ARG ENV=production
ENV APP_ENV=$ENV

CMD ["gunicorn", "app:app"]
```

---

## 3. Tagging and Versioning

### 3.1 Tag Conventions

```bash
# Semantic tags (recommended for production)
myapp:v1.2.3
myapp:1.2.3

# Descriptive tags
myapp:latest           # Latest version (avoid in production)
myapp:stable           # Stable version
myapp:alpine           # Base image variant

# Tags with registry
docker.io/username/myapp:v1.2.3
gcr.io/project-id/myapp:v1.2.3
registry.example.com/team/myapp:v1.2.3

# Multiple tags
docker tag myapp:v1.2.3 myapp:latest
docker tag myapp:v1.2.3 myapp:v1.2
docker tag myapp:v1.2.3 myapp:v1
```

### 3.2 Best Practices for Tagging

1. **Production**: Use immutable semantic tags
2. **Staging**: Use branch name + commit SHA
3. **Development**: Use temporary tags or untagged
4. **Avoid**: `:latest` for prod deployments

```bash
# Example CI/CD tagging
VERSION=$(git describe --tags --always)
docker build -t myapp:${VERSION} .
docker tag myapp:${VERSION} registry.example.com/myapp:${VERSION}
docker push registry.example.com/myapp:${VERSION}
```

---

## 4. Container Registries

### 4.1 Common Registries

| Registry | URL | Notes |
|----------|-----|------|
| Docker Hub | docker.io | Default, free public tier |
| GitHub Container | ghcr.io | GitHub integration |
| Google Container | gcr.io | Native to GKE |
| Amazon ECR | <account>.dkr.ecr.<region>.amazonaws.com | AWS native |
| Harbor | harbor.example.com | Enterprise, self-hosted |

### 4.2 Authentication

```bash
# Docker Hub
docker login

# Private registry
docker login registry.example.com -u username -p password

# With credentials file
cat ~/.docker/config.json

# Kubernetes Secret for private registry
kubectl create secret docker-registry my-registry \
  --docker-server=registry.example.com \
  --docker-username=admin \
  --docker-password=password \
  --docker-email=admin@example.com

# Use Secret in Pod
apiVersion: v1
kind: Pod
metadata:
  name: private-pod
spec:
  containers:
  - name: app
    image: registry.example.com/myapp:v1
  imagePullSecrets:
  - name: my-registry
```

### 4.3 Push and Pull

```bash
# Push image
docker push registry.example.com/myapp:v1

# Pull image
docker pull registry.example.com/myapp:v1

# Pull with specific platform
docker pull --platform linux/arm64 registry.example.com/myapp:v1
```

---

## 5. Image Pull Policy

### 5.1 Available Values

```yaml
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: app
    image: myapp:v1.0
    
    # Always: Always download the image
    imagePullPolicy: Always
    
    # IfNotPresent: Download only if not present (default for specific tags)
    imagePullPolicy: IfNotPresent
    
    # Never: Never download, use local only
    imagePullPolicy: Never
```

### 5.2 Default Behavior

- Tag `:latest` or absent → `Always`
- Specific tag → `IfNotPresent`
- Image digest (SHA256) → `IfNotPresent`

### 5.3 When to Use What

| Policy | When to Use |
|--------|--------------|
| `Always` | `:latest` tag, dev/staging environments |
| `IfNotPresent` | Specific tags, prod with stable registry |
| `Never` | Local images only, air-gapped environments |

---

## 6. Ephemeral Containers for Debugging

### 6.1 kubectl debug

```bash
# Add temporary container to existing Pod
kubectl debug -it pod-name --image=busybox:1.36

# With specific target
kubectl debug -it pod-name --image=busybox:1.36 --target=container-name

# Create a copy of the Pod for debugging
kubectl debug pod-name --image=busybox:1.36 --copy-to=debug-pod

# Copy with changes
kubectl debug pod-name --copy-to=debug-pod \
  --image=busybox:1.36 \
  --container=main-container \
  -- sh
```

### 6.2 Practical Examples

```bash
# Network debug
kubectl debug -it nginx-pod --image=nicolaka/netshoot

# Filesystem debug
kubectl debug -it nginx-pod --image=busybox:1.36 --target=nginx

# Debug with strace
kubectl debug -it nginx-pod --image=alpine --target=nginx
# apk add strace && strace -p 1
```

### 6.3 Debugging Failed Pods

```bash
# Create copy of failed Pod to investigate
kubectl debug failing-pod --copy-to=debug-pod --image=busybox:1.36

# Run investigation
kubectl logs debug-pod -c debug-container
kubectl describe pod debug-pod
```

---

## 7. Image Size Optimization

### 7.1 Basic Techniques

```dockerfile
# 1. Use minimal base images
FROM alpine:3.18      # ~5MB
# or
FROM python:3.11-slim # ~150MB vs python:3.11 ~1GB

# 2. Clean package manager cache
RUN apt-get update && apt-get install -y \
    package1 \
    package2 \
    && rm -rf /var/lib/apt/lists/*

# 3. Combine related RUN statements
RUN apk add --no-cache \
    curl \
    jq \
    && rm -rf /tmp/*

# 4. Use .dockerignore
# .dockerignore:
# node_modules
# *.log
# .git
```

### 7.2 Size Comparison

```bash
# Large base images
python:3.11          # ~1.0GB
node:18              # ~900MB

# Slim base images
python:3.11-slim     # ~150MB
node:18-slim         # ~200MB

# Alpine base images
python:3.11-alpine   # ~50MB
node:18-alpine       # ~180MB

# Scratch/distroless
static binary        # 5-20MB
```

---

## 8. Image Analysis

### 8.1 Useful Commands

```bash
# List images
docker images
docker images --filter "dangling=false"
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

# Layer history
docker history myapp:v1
docker history --no-trunc myapp:v1
docker history --format "{{.CreatedBy}}" myapp:v1

# Detailed inspection
docker inspect myapp:v1
docker inspect --format '{{.Config.Entrypoint}}' myapp:v1
docker inspect --format '{{range .Config.Env}}{{println .}}{{end}}' myapp:v1
```

### 8.2 Export and Import

```bash
# Save image to file
docker save myapp:v1 -o myapp-v1.tar
docker save myapp:v1 | gzip > myapp-v1.tar.gz

# Load image from file
docker load -i myapp-v1.tar
docker load < myapp-v1.tar.gz

# Export container (not image)
docker export container-id > container.tar

# Import as image
docker import container.tar myapp:imported
```

---

## 9. Building with Docker Compose

### 9.1 docker-compose.yml for Build

```yaml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        VERSION: 1.0
    image: myapp:v1.0
    ports:
      - "8000:8000"
  
  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: secret

volumes:
  postgres_data:
```

```bash
# Build all services
docker-compose build

# Build with no cache
docker-compose build --no-cache

# Build and start
docker-compose up --build
```

---

## 10. Build Troubleshooting

### 10.1 Common Errors

```bash
# Common errors and solutions

# 1. "COPY failed: file not found"
# Solution: Check path in context
ls -la $(cat .dockerignore)

# 2. "permission denied"
# Solution: Add user or change permissions
RUN chmod +x script.sh

# 3. "no space left on device"
# Solution: Clean up images and containers
docker system prune -a

# 4. "network error"
# Solution: Check connection or use --network=host
docker build --network=host -t myapp .
```

### 10.2 Build Debug

```bash
# Build with verbose output
docker build --progress=plain -t myapp .

# Intervene at specific stage
docker build --target builder -t myapp-builder .

# Inspect intermediate layer
docker run --rm -it myapp-builder sh
```

---

## 11. Practical Exercise

### Scenario
Optimize an existing application with:
1. Very large images (>1GB)
2. Slow builds
3. Deployments with `:latest` tag

### Steps

1. Analyze existing Dockerfile
2. Identify caching problems
3. Implement multi-stage build
4. Create semantic tags
5. Configure private registry
6. Verify final sizes

---

## Summary

| Topic | Importance | Notes |
|-------|------------|-------|
| docker build | High | Fundamental |
| Layer caching | High | Build performance |
| Tagging | High | Version management |
| Registries | Medium | DevOps workflow |
| imagePullPolicy | Medium | Runtime behavior |
| Ephemeral containers | Medium | Advanced debugging |
| Size optimization | Medium | Costs and performance |

---

## Additional Resources

- [Docker Build Guide](https://docs.docker.com/build/)
- [Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Kubernetes Image Pull Policy](https://kubernetes.io/docs/concepts/containers/images/)
- [kubectl debug](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#debug)
