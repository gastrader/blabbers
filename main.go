package main

import (
	"context"
	"log"
	"net/http"
)

func main() {
	setupAPI()
	log.Fatal(http.ListenAndServe(":3002", nil))
}

func setupAPI() {
	ctx := context.Background()
	manager := NewManager(ctx)

	http.Handle("/", http.FileServer(http.Dir("./frontend")))
	http.HandleFunc("/ws", manager.serverWS)
	http.HandleFunc("/login", manager.loginHandler)

}
