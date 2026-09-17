# Module 10: Troubleshooting

**Estimated Duration:** 4 hours  
**CKAD Weight:** Application Resources and Scheduling (20%)

## Learning Objectives

By the end of this module you will be able to:

- Apply a systematic troubleshooting methodology
- Diagnose common application problems
- Resolve networking and DNS issues
- Debug RBAC permission errors
- Analyze resource issues (OOM, CPU)
- Prepare information for escalation

## Troubleshooting Methodology

Effective debugging follows a systematic approach. Don't jump to fixes: understand first.

### The Layered Method

```
┌─────────────────────────────────────────┐
│  Layer 7: Application (code)             │
├─────────────────────────────────────────┤
│  Layer 6: Configuration (env, secrets)  │
├─────────────────────────────────────────┤
│  Layer 5: Probes (health check)          │
├─────────────────────────────────────────┤
│  Layer 4: Container (image, cmd)         │
├─────────────────────────────────────────┤
│  Layer 3: Pod (status, resources)         │
├─────────────────────────────────────────┤
│  Layer 2: Service/Ingress (network)       │
├─────────────────────────────────────────┤
│  Layer 1: DNS/Network (connectivity)     │
└─────────────────────────────────────────┘
```

### Standard Workflow

```bash
# 1. Identify the problem
kubectl get pods -n <namespace>

# 2. Describe the problematic resource
kubectl describe <resource> <name>

# 3. Read the logs
kubectl logs <pod> [-c <container>] [--previous]

# 4. Check events
kubectl get events --sort-by='.lastTimestamp'

# 5. Execute commands in the pod
kubectl exec -it <pod> -- <command>

# 6. Create test pods to isolate the problem
kubectl run test --image=busybox --rm -it -- <command>
```

## Common Problems and Solutions

### Pod in Pending

**Symptoms:** Pod is not scheduled.

```bash
kubectl describe pod <name>

Events:
  Type     Reason            Age   From            Message
  ----     ------            ----  ----            -------
  Warning  FailedScheduling  10s   default-scheduler  0/3 nodes available: 3 Insufficient cpu.
```

**Common causes:**
1. Insufficient resources (CPU, memory)
2. NodeSelector/NodeAffinity not satisfied
3. Taints without tolerations
4. Unbound PVC
5. ResourceQuota exhausted

**Solution:**
```bash
# Check node resources
kubectl describe nodes | grep -A5 "Allocated resources"

# Verify constraints
kubectl get pod <name> -o yaml | grep -A10 nodeSelector
kubectl describe node <node> | grep Taints

# Check PVC
kubectl get pvc
```

### CrashLoopBackOff

**Symptoms:** Container crashes repeatedly.

```bash
kubectl describe pod <name>

Events:
  Type     Reason     Age                From     Message
  ----     ------     ----               ----     -------
  Normal   Started    60s (x5 over 3m)  kubelet  Started container
  Normal   Killing    30s (x5 over 3m)  kubelet  Container failed, will restart
  Warning  BackOff    10s (x6 over 3m)  kubelet  Back-off restarting failed container

Last State:     Terminated
  Reason:       Error
  Exit Code:    1
```

**Common causes:**
1. Startup command fails
2. Dependencies not ready (DB, API)
3. Wrong configuration
4. Probe fails immediately
5. Insufficient permissions

**Solution:**
```bash
# Check previous container logs
kubectl logs <pod> --previous --tail=100

# Run interactively for debug
kubectl run debug --image=<same-image> --rm -it -- sh

# Verify environment variables
kubectl exec <pod> -- env

# Check health probes
kubectl describe pod <pod> | grep -A10 "Liveness\\|Readiness"
```

### ImagePullBackOff / ErrImagePull

**Symptoms:** Image cannot be pulled.

```bash
kubectl describe pod <name>

Events:
  Type     Reason     Age   From     Message
  ----     ------     ----  ----     -------
  Normal   Pulling    60s   kubelet  Pulling image "myregistry.io/app:v1"
  Warning  Failed     55s   kubelet  Failed to pull image: rpc error: code = Unknown
  Warning  BackOff    40s   kubelet  Back-off pulling image
```

**Common causes:**
1. Wrong image name
2. Non-existent tag
3. Private registry without credentials
4. Unreachable registry
5. Registry rate limit

**Solution:**
```bash
# Verify image name
kubectl get pod <name> -o jsonpath='{.spec.containers[*].image}'

# For private registry, add secret
kubectl create secret docker-registry regcred \
  --docker-server=<registry> \
  --docker-username=<user> \
  --docker-password=<pass>

# Verify secret is referenced
kubectl describe pod <name> | grep -A3 "ImagePullSecrets"
```

### OOMKilled

**Symptoms:** Container terminated for insufficient memory.

```bash
kubectl describe pod <name>

Last State:     Terminated
  Reason:       OOMKilled
  Exit Code:    137
```

**Exit code 137 = 128 + 9 (SIGKILL)**

**Solution:**
```bash
# Check memory limit
kubectl get pod <name> -o jsonpath='{.spec.containers[*].resources.limits.memory}'

# Increase the limit
kubectl set resources deployment/<name> --limits=memory=512Mi

# Verify memory usage
kubectl top pods
```

### Service Unreachable

**Symptoms:** Service doesn't respond.

```bash
# 1. Verify Service exists
kubectl get svc <name>

# 2. Check Endpoints
kubectl get endpoints <name>

# 3. If empty, verify selector
kubectl describe svc <name> | grep Selector
kubectl get pods -l <selector-label>

# 4. Test from cluster
kubectl run test --image=busybox --rm -it -- wget -qO- <service-name>:<port>
```

### DNS Not Resolving

**Symptoms:** Names aren't resolved.

```bash
# Check CoreDNS
kubectl get pods -n kube-system -l k8s-app=kube-dns

# Test DNS
kubectl run test --image=busybox --rm -it -- nslookup kubernetes

# Check CoreDNS ConfigMap
kubectl get configmap coredns -n kube-system -o yaml

# Verify pod's resolv.conf
kubectl exec <pod> -- cat /etc/resolv.conf
```

### NetworkPolicy Blocking

**Symptoms:** Traffic refused.

```bash
# List NetworkPolicies
kubectl get networkpolicy -A

# Describe the policy
kubectl describe networkpolicy <name>

# Test with matching/non-matching pod
kubectl run test-allowed --image=busybox --labels="role=allowed" --rm -it -- wget <service>
kubectl run test-denied --image=busybox --labels="role=denied" --rm -it -- wget <service>
```

## RBAC Debugging

### Verify Permissions

```bash
# For current user
kubectl auth can-i list pods

# For a ServiceAccount
kubectl auth can-i list pods --as=system:serviceaccount:default:my-sa

# List all permissions
kubectl auth can-i --list --as=system:serviceaccount:default:my-sa
```

### Create Permissions

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods
subjects:
- kind: ServiceAccount
  name: my-sa
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

## Advanced Debugging

### Ephemeral Container

For debugging pods without shell:

```bash
# Add debug container
kubectl debug <pod> -it --image=busybox --target=<container>

# Create pod copy for safe debug
kubectl debug <pod> -it --copy-to=debug-copy --image=busybox
```

### Filesystem Analysis

```bash
# Copy file from pod
kubectl cp <pod>:/path/to/file ./local-file

# Inspect filesystem
kubectl exec <pod> -- find / -name "*.log" 2>/dev/null
```

### Network Debugging

```bash
# From inside pod
kubectl exec <pod> -- netstat -tlnp
kubectl exec <pod> -- curl -v http://localhost:8080/health
kubectl exec <pod> -- nslookup kubernetes.default

# With ephemeral container
kubectl debug <pod> -it --image=nicolaka/netshoot -- curl -v <target>
```

## Prepare Support Ticket

Essential information for escalation:

```bash
# 1. Context
kubectl version -o yaml
kubectl cluster-info
kubectl get nodes

# 2. Problematic resource
kubectl describe <resource> <name> > describe.txt
kubectl get <resource> <name> -o yaml > resource.yaml

# 3. Logs
kubectl logs <pod> --tail=500 --timestamps > logs.txt
kubectl logs <pod> --previous > previous-logs.txt 2>/dev/null || echo "No previous logs"

# 4. Events
kubectl get events --sort-by='.lastTimestamp' > events.txt

# 5. Additional data
kubectl top pods >> support-data.txt
kubectl get pods -o wide >> support-data.txt
```

## Best Practices

### Troubleshooting

1. **Don't assume, verify** - Use commands to confirm hypotheses
2. **Start from bottom** - Network layer before application
3. **Isolate variables** - One change at a time
4. **Document** - Track what you've tried
5. **Use minimal pods** - busybox, curlimages for testing

### Prevention

1. **Health probes** - Appropriate liveness and readiness
2. **Resource limits** - Avoid OOMKilled
3. **ConfigMap/Secret** - Not hardcoded
4. **Minimal RBAC** - Least privilege
5. **NetworkPolicy** - Default deny where appropriate

## Hands-On Exercise

To consolidate your knowledge:

1. Create a scenario with 5 different problems
2. Solve each problem documenting the workflow
3. Prepare a runbook for future reference
4. Simulate escalation with complete ticket
5. Test recovery procedures

## Conclusion

Troubleshooting is a critical skill for CKAD and production. In this module you learned:

- Systematic debug methodology
- Common problem resolution
- RBAC and networking debugging
- Effective escalation preparation

Congratulations on completing all 10 modules of the CKAD course!
