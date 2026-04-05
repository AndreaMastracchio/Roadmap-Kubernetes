package main

import (
	"fmt"
	"net/http"
)

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Ciao, sono un'app Go in un container!\n")
	})

	fmt.Println("Server in ascolto sulla porta 8080...")
	http.ListenAndServe(":8080", nil)
}
