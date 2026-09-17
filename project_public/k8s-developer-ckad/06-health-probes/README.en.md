# Module 06: Health Probes

**Estimated Duration:** 3 hours  
**CKAD Weight:** Application Design and Build (20%)

## Learning Objectives

By the end of this module you will be able to:

- Configure livenessProbe to detect stuck applications
- Implement readinessProbe to safely manage traffic
- Use startupProbe for slow-starting applications
- Choose the appropriate handler type (HTTP, TCP, exec, gRPC)
- Configure advanced parameters like timeout, threshold, and delay
- Diagnose and resolve common probe-related issues

## Introduction to Kubernetes Probes

Probes are diagnostic mechanisms that Kubernetes uses to verify container health. An application might be running but not functioning properly: probes allow detecting this situation and taking automatic action.

### The Three Probe Types

Kubernetes supports three types of probes, each with a specific purpose:

**1. Liveness Probe** - Checks if the container is still alive
- If failed: the container gets restarted
- Purpose: detect deadlocks or unrecoverable states
- Action: container restart according to restartPolicy

**2. Readiness Probe** - Checks if the container is ready to receive traffic
- If failed: the pod is removed from Services
- Purpose: prevent requests from reaching unready pods
- Action: removal from endpoints (no restart)

**3. Startup Probe** - Checks if the application has completed startup
- If failed: the container gets restarted
- Purpose: allow slow startups without interference from other probes
- Action: disables liveness/readiness until success

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: probes-demo
spec:
  containers:
  - name: app
    image: myapp:1.0
    # Startup probe - waits for complete startup
    startupProbe:
      httpGet:
        path: /started
        port: 8080
      failureThreshold: 30
      periodSeconds: 10
    
    # Liveness probe - verifies it's alive
    livenessProbe:
      httpGet:
        path: /healthz
        port: 8080
      initialDelaySeconds: 0
      periodSeconds: 10
    
    # Readiness probe - verifies it's ready
    readinessProbe:
      httpGet:
        path: /ready
        port: 8080
      initialDelaySeconds: 5
      periodSeconds: 5
```

## Probe Handlers

Kubernetes supports four handler types for executing probes:

### HTTP GET (httpGet)

The most common for web applications. Executes an HTTP request and considers success if response is 200-399.

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

Key parameters:
- **path**: endpoint path
- **port**: port number or name
- **scheme**: HTTP or HTTPS
- **httpHeaders**: custom headers (optional)

### TCP Socket (tcpSocket)

Checks if a TCP port is open. Useful for databases and non-HTTP services.

```yaml
livenessProbe:
  tcpSocket:
    port: 3306
  initialDelaySeconds: 15
  periodSeconds: 10
```

Advantages:
- Lighter than HTTP
- Doesn't require dedicated endpoint
- Ideal for databases and TCP services

### Command (exec)

Executes a command in the container. Success if command exits with code 0.

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

Use cases:
- Verify lock files
- Check processes
- Complex health check scripts

### gRPC

Available from Kubernetes 1.24+, for gRPC services with standard health checking.

```yaml
livenessProbe:
  grpc:
    port: 50051
    service: mypackage.MyService
  initialDelaySeconds: 10
```

## Configuration Parameters

### initialDelaySeconds

Seconds to wait after container starts before beginning probes.

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 30  # Wait 30s before first probe
```

Importance:
- Prevents probes from failing during startup
- Depends on application startup time
- Default value: 0

### periodSeconds

Interval between consecutive probes.

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  periodSeconds: 10  # Execute every 10 seconds
```

Considerations:
- More frequent = faster detection but more load
- Less frequent = less load but slower detection
- Default value: 10

### timeoutSeconds

Maximum wait time for each probe.

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  timeoutSeconds: 5  # Fails if no response within 5s
```

Recommendations:
- Fast applications: 1-2 seconds
- Slow applications: 5-10 seconds
- Default value: 1

### failureThreshold

Number of consecutive failures before considering probe failed.

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  failureThreshold: 3  # Restart after 3 consecutive failures
```

Impact:
- High value = more tolerance for transient glitches
- Low value = faster reaction
- Default value: 3

### successThreshold

Consecutive successes needed to consider probe successful.

```yaml
readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  successThreshold: 2  # Requires 2 successes to be ready
```

Constraints:
- For livenessProbe: MUST be 1
- For readinessProbe: can be > 1
- For startupProbe: MUST be 1
- Default value: 1

## RestartPolicy and Probe Behavior

The Pod's restartPolicy determines what happens when a probe fails:

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

### Behavior by Policy

| Policy | Liveness Failed | Crash (Exit != 0) | Exit 0 |
|--------|-----------------|-------------------|--------|
| Always | Restart | Restart | Restart |
| OnFailure | Restart | Restart | Nothing |
| Never | Nothing | Nothing | Nothing |

**Note:** In Deployments, restartPolicy is always "Always" (or unspecified).

## Optimal Configuration Strategy

### Fast-Starting Applications

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

### Slow-Starting Applications

```yaml
startupProbe:
  httpGet:
    path: /started
    port: 8080
  failureThreshold: 30  # 30 * 10s = 5 minutes max
  periodSeconds: 10

livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
  initialDelaySeconds: 0  # Disabled until startupProbe OK
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  initialDelaySeconds: 0
  periodSeconds: 5
```

Maximum startup time calculation:
```
max_startup_time = startupProbe.failureThreshold * startupProbe.periodSeconds
```

## Diagnosing Probe Problems

### Viewing Probe Status

```bash
# Describe pod to see status
kubectl describe pod <pod-name>

# Example output
Events:
  Type     Reason     Age   From               Message
  ----     ------     ----  ----               -------
  Warning  Unhealthy  12s   kubelet            Liveness probe failed: HTTP probe failed with statuscode: 500
  Normal   Killing    11s   kubelet            Container app failed liveness probe, will be restarted
```

### Checking Restarts

```bash
# Container restart count
kubectl get pod <pod-name> -o jsonpath='{.status.containerStatuses[0].restartCount}'

# Last container state
kubectl get pod <pod-name> -o jsonpath='{.status.containerStatuses[0].lastState}'
```

### Debug Logs

```bash
# Container logs (including exec probe stderr)
kubectl logs <pod-name>

# Previous container logs (after restart)
kubectl logs <pod-name> --previous
```

### Probe-Specific Events

```bash
# Filter events for failed probes
kubectl get events --field-selector reason=LivenessProbeFailed
kubectl get events --field-selector reason=ReadinessProbeFailed

# Recent events sorted
kubectl events --sort='.lastTimestamp'
```

## Common Problems and Solutions

### 1. Probe Too Early

**Problem:** Probe fails because application isn't ready yet.

```yaml
# Problem
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 0  # Too early!
```

**Solution:** Increase initialDelaySeconds or use startupProbe.

### 2. Probe Timeout Too Low

**Problem:** Probe times out before app responds.

```yaml
# Problem
livenessProbe:
  httpGet:
    path: /slow-health
    port: 8080
  timeoutSeconds: 1  # Too low for slow endpoint
```

**Solution:** Increase timeoutSeconds.

### 3. Heavy Probe Endpoint

**Problem:** Health check endpoint is too expensive.

**Solution:** Create dedicated lightweight endpoint.

```python
# Bad - heavy health check
@app.route('/health')
def health():
    check_database()  # Heavy query
    check_cache()     # External connection
    return "OK"

# Good - lightweight health check
@app.route('/healthz')
def healthz():
    return "OK"  # Just verify process responds
```

### 4. Probe and Graceful Shutdown

**Problem:** Pod gets killed while handling requests.

**Solution:** Implement graceful shutdown and use preStop hook.

```yaml
lifecycle:
  preStop:
    exec:
      command: ["/bin/sh", "-c", "sleep 10"]
```

## Best Practices

1. **Use startupProbe for slow apps** - Avoid restarts during startup
2. **Dedicated health endpoint** - Don't use business endpoints
3. **Always use readinessProbe with Services** - Prevent traffic to unready pods
4. **Don't overload probes** - Keep endpoints lightweight
5. **Configure appropriate timeouts** - Consider network latency
6. **Use named ports** - More maintainable than numbers
7. **Test the configuration** - Verify probes work as expected

## Hands-On Exercise

To consolidate this module's knowledge:

1. Create a deployment with all three probes configured
2. Simulate a livenessProbe failure and observe the restart
3. Verify that readinessProbe removes the pod from Service
4. Configure a startupProbe for a slow application
5. Analyze events generated by failed probes

## Conclusion

Probes are fundamental for resilient Kubernetes applications. The correct combination of liveness, readiness, and startup probes ensures that:

- Stuck applications are automatically restarted
- Traffic is routed only to functioning pods
- Slow applications have time to complete startup

In the next module we'll dive deeper into observability with logs and debugging.
