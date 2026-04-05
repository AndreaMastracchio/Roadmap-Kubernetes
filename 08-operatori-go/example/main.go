package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"path/filepath"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/client-go/util/homedir"
)

func main() {
	var kubeconfig *string
	if home := homedir.HomeDir(); home != "" {
		kubeconfig = flag.String("kubeconfig", filepath.Join(home, ".kube", "config"), "(optional) absolute path to the kubeconfig file")
	} else {
		kubeconfig = flag.String("kubeconfig", "", "absolute path to the kubeconfig file")
	}
	flag.Parse()

	// Crea la configurazione dal file kubeconfig
	config, err := clientcmd.BuildConfigFromFlags("", *kubeconfig)
	if err != nil {
		fmt.Printf("Errore nel caricamento della configurazione: %v\n", err)
		os.Exit(1)
	}

	// Crea il client per l'API di Kubernetes
	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		fmt.Printf("Errore nella creazione del client: %v\n", err)
		os.Exit(1)
	}

	// Elenca i Pod in tutti i namespace
	pods, err := clientset.CoreV1().Pods("").List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		fmt.Printf("Errore nell'elenco dei Pod: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("Ci sono %d Pod nel cluster\n", len(pods.Items))

	for _, pod := range pods.Items {
		fmt.Printf("Pod: %s (Namespace: %s)\n", pod.Name, pod.Namespace)
	}
}
