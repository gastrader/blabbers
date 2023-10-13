package main

import (
	"context"
	"log"
	"net/http"
)

func main() {
	setupAPI()
	log.Fatal(http.ListenAndServeTLS("localhost:8080", "server.crt", "server_rsa.key", nil))
}

func setupAPI() {
	ctx := context.Background()
	manager := NewManager(ctx)

	http.Handle("/", http.FileServer(http.Dir("./frontend")))
	http.HandleFunc("/ws", manager.serverWS)
	http.HandleFunc("/login", manager.loginHandler)
}
