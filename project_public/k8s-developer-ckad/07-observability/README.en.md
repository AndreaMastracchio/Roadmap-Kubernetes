# Module 07: Observability and Debugging

**Estimated Duration:** 3 hours  
**CKAD Weight:** Application Resources and Scheduling (20%)

## Learning Objectives

By the end of this module you will be able to:

- View and analyze container logs with kubectl logs
- Monitor resources with kubectl top
- Diagnose common problems (CrashLoopBackOff, ImagePullBackOff, OOMKilled)
- Use ephemeral containers for debugging
- Analyze Kubernetes events
- Implement effective logging strategies

## Introduction to Observability

Observability in Kubernetes comprises three pillars: logs, metrics, and traces. For the CKAD exam, you focus primarily on logs and basic metrics, essential for diagnosing application problems.

### The Three Pillars

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     LOGS        │    │    METRICS      │    │    TRACES       │
│                 │    │                 │    │                 │
│ kubectl logs    │    │ kubectl top     │    │ (non CKAD)      │
│ stdout/stderr   │    │ Metrics Server  │    │                 │
│ aggregation     │    │ CPU/Memory      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Log Management

### Basic Viewing

The main command for logs is `kubectl logs`:

```bash
# Log of a single pod
kubectl logs <pod-name>

# Log of a specific container (multi-container pod)
kubectl logs <pod-name> -c <container-name>

# Last N lines
kubectl logs <pod-name> --tail=100

# Follow logs in real-time
kubectl logs <pod-name> -f
kubectl logs <pod-name> --follow
```

### Time-Filtered Logs

```bash
# Logs from the last hour
kubectl logs <pod-name> --since=1h

# Logs from the last 10 minutes
kubectl logs <pod-name> --since=10m

# Logs from a specific timestamp (ISO 8601)
kubectl logs <pod-name> --since-time=2024-01-15T10:00:00Z
```

### Logs with Timestamps

```bash
# Adds Kubernetes timestamp to each line
kubectl logs <pod-name> --timestamps

# Example output:
# 2024-01-15T10:30:45.123456789Z stderr F Starting application...
```

### Previous Container Logs

When a container crashes and gets restarted:

```bash
# Previous container logs
kubectl logs <pod-name> --previous

# Useful to understand why it crashed
kubectl logs <pod-name> --previous --tail=50
```

### Logs from Deployment

```bash
# Logs from all pods in a deployment
kubectl logs deployment/<name>

# With label selector
kubectl logs -l app=myapp

# All containers
kubectl logs deployment/<name> --all-containers
```

## Resource Monitoring

### kubectl top

Requires Metrics Server installed:

```bash
# Check if available
kubectl get pods -n kube-system | grep metrics-server

# Pod usage
kubectl top pods

# Node usage
kubectl top nodes

# Sort by memory
kubectl top pods --sort-by=memory

# Sort by CPU
kubectl top pods --sort-by=cpu
```

### Interpreting Output

```bash
NAME                         CPU(cores)   MEMORY(bytes)
my-app-7d8f9c-abc12          50m          128Mi
my-app-7d8f9c-def34          45m          120Mi

# CPU in millicores (1 core = 1000m)
# Memory in bytes (Mi = Mebibytes)
```

## Diagnosing Common Problems

### CrashLoopBackOff

**Symptoms:** The container crashes repeatedly.

```bash
# Check status
kubectl get pods -w

NAME    READY   STATUS             RESTARTS   AGE
app     0/1     CrashLoopBackOff   5          5m

# Diagnosis
kubectl describe pod <name>

Events:
  Type     Reason     Age                From     Message
  ----     ------     ----               ----     -------
  Normal   Started    60s (x5 over 3m)   kubelet  Started container app
  Normal   Killing    30s (x5 over 3m)   kubelet  Container app failed, will restart
  Warning  BackOff    10s (x6 over 3m)   kubelet  Back-off restarting failed container

# Check previous logs
kubectl logs <name> --previous
```

**Common causes:**
- Startup command fails
- Dependencies not ready
- Wrong configuration
- Probe fails immediately

**Solution:**
```yaml
# Add debugging to command
command: ["/bin/sh", "-c"]
args: ["echo 'Starting...' && <original-command>"]
```

### ImagePullBackOff

**Symptoms:** Image cannot be pulled.

```bash
kubectl describe pod <name>

Events:
  Type     Reason     Age   From     Message
  ----     ------     ----  ----     -------
  Normal   Pulling    60s   kubelet  Pulling image "myregistry.io/app:v1"
  Warning  Failed     55s   kubelet  Failed to pull image: rpc error: code = NotFound
  Warning  BackOff    40s   kubelet  Back-off pulling image
```

**Common causes:**
- Wrong image name
- Non-existent tag
- Private registry without credentials
- Unreachable registry

**Solution for private registry:**
```bash
# Create secret with credentials
kubectl create secret docker-registry regcred \
  --docker-server=myregistry.io \
  --docker-username=user \
  --docker-password=pass

# Add to pod
spec:
  imagePullSecrets:
  - name: regcred
```

### OOMKilled

**Symptoms:** Container terminated for insufficient memory.

```bash
kubectl describe pod <name>

Last State:     Terminated
  Reason:       OOMKilled
  Exit Code:    137
```

**Cause:** Process uses more memory than limit.

**Solution:**
```yaml
resources:
  requests:
    memory: "256Mi"
  limits:
    memory: "512Mi"  # Increase the limit
```

### Pending

**Symptoms:** Pod stays in Pending state.

```bash
kubectl describe pod <name>

Events:
  Type     Reason            Age   From            Message
  ----     ------            ----  ----            -------
  Warning  FailedScheduling  60s   default-scheduler  0/3 nodes available: 3 Insufficient cpu.
```

**Common causes:**
- Insufficient resources (CPU, memory)
- NodeSelector/NodeAffinity not satisfied
- Incompatible Taints/Tolerations
- PVC cannot be mounted

## Ephemeral Containers

Ephemeral containers are temporary containers added to an existing pod for debugging.

### Creation with kubectl debug

```bash
# Interactive container for debug
kubectl debug <pod-name> -it --image=busybox

# With specific name
kubectl debug <pod-name> -it --image=busybox --container=debugger

# With network tools
kubectl debug <pod-name> -it --image=nicolaka/netshoot

# Pod copy for safe debug
kubectl debug <pod-name> -it --image=busybox --copy-to=debug-copy
```

### Practical Example

```bash
# Existing pod without shell
kubectl run minimal --image=gcr.io/google-containers/pause

# Add debug container
kubectl debug minimal -it --image=busybox

# In the ephemeral container:
/ # ps aux
/ # ls /proc/1/root/etc/hostname
/ # curl http://localhost:8080/health
```

### Use Cases

1. **Debug minimal images** - Distroless containers have no shell
2. **Network testing** - Verify internal connectivity
3. **Filesystem inspection** - See original container files
4. **Missing tools** - Use tools not in original image

## Kubernetes Events

### Viewing Events

```bash
# All namespace events
kubectl get events

# Events of a specific resource
kubectl get events --field-selector involvedObject.name=<name>

# Warning events
kubectl get events --field-selector type=Warning

# Sorted by time
kubectl get events --sort-by='.lastTimestamp'

# Detailed format
kubectl describe events
```

### Interpreting Events

```bash
kubectl get events -o wide

LAST SEEN   TYPE      REASON    OBJECT         MESSAGE
2m          Normal    Pulled    pod/nginx       Successfully pulled image
2m          Normal    Created   pod/nginx       Created container nginx
2m          Normal    Started   pod/nginx       Started container nginx
1m          Warning   BackOff   pod/nginx       Back-off restarting failed container
```

**Event types:**
- **Normal** - Successful operations
- **Warning** - Problems or failures

**Common reasons:**
- `Scheduled` - Pod scheduled
- `Pulled` - Image downloaded
- `Started` - Container started
- `Killing` - Container terminated
- `FailedScheduling` - Scheduling failed
- `BackOff` - Restart backoff

## Logging Strategies

### Structured Logging

```python
# Best practice: JSON logging
import json
import logging
import logger

def json_formatter(record):
    return json.dumps({
        "timestamp": record.created,
        "level": record.levelname,
        "message": record.getMessage(),
        "service": "myapp",
        "version": "1.0"
    })

logger.setFormatter(json_formatter)
```

### Multi-Container Logs

```bash
# Combined logs with prefix
kubectl logs <pod> --prefix --all-containers

# Output:
# [app-1] Log message from app1
# [app-2] Log message from app2
```

### Log Aggregation (Overview)

In production, logs are aggregated with stacks like:
- ELK (Elasticsearch, Logstash, Kibana)
- EFK (Elasticsearch, Fluentd, Kibana)
- Loki + Grafana

For CKAD, know that kubectl logs reads from container stdout/stderr.

## Running Commands in Pods

### kubectl exec

```bash
# Single command
kubectl exec <pod> -- <command>

# Example
kubectl exec nginx -- ls /etc/nginx

# Interactive shell
kubectl exec -it <pod> -- sh
kubectl exec -it <pod> -- bash

# Specific container
kubectl exec -it <pod> -c <container> -- sh
```

### kubectl run (Debug)

```bash
# Temporary pod for testing
kubectl run -it --rm debug --image=busybox -- sh

# DNS test
kubectl run -it --rm debug --image=busybox -- nslookup kubernetes

# HTTP test
kubectl run -it --rm debug --image=curlimages/curl -- curl http://my-service
```

## Best Practices

### Debugging Workflow

1. **Check status:** `kubectl get pods`
2. **Describe pod:** `kubectl describe pod <name>`
3. **Check events:** `kubectl get events`
4. **Read logs:** `kubectl logs <pod>`
5. **If crashed:** `kubectl logs <pod> --previous`
6. **Run commands:** `kubectl exec -it <pod> -- sh`
7. **If needed:** `kubectl debug <pod> -it --image=busybox`

### Logging Best Practices

1. **Write to stdout/stderr** - Not local files
2. **Structured logs** - JSON for automatic parsing
3. **Appropriate levels** - DEBUG, INFO, WARN, ERROR
4. **Sufficient context** - request_id, user_id
5. **Don't log secrets** - Never passwords or tokens

### Useful Commands for the Exam

```bash
# Quick workflow for problematic pod
kubectl get pods -o wide
kubectl describe pod <name>
kubectl logs <name> --previous --tail=50
kubectl get events --sort-by='.lastTimestamp' | head -20

# Test connectivity
kubectl run test --image=busybox --rm -it -- wget -qO- http://service-name

# Copy file
kubectl cp <pod>:/path/file ./local-file
```

## Hands-On Exercise

To consolidate your knowledge:

1. Create a deployment with various problems (wrong image, OOM, crash)
2. Diagnose each problem systematically
3. Use ephemeral container for debugging
4. Analyze events to understand the sequence of events
5. Practice commands until they become automatic

## Conclusion

Observability is fundamental for effective debugging. In this module you learned:

- To view and filter logs
- To monitor resources with kubectl top
- To diagnose common problems
- To use ephemeral containers for advanced debugging

In the next module we'll cover service networking.
