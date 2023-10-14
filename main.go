package main

import (
	"context"
	"log"
	"net/http"
)

func main() {
	mux := setupAPI()
	log.Fatal(http.ListenAndServe(":3000", mux))
}

func setupAPI() *http.ServeMux {
	ctx := context.Background()
	manager := NewManager(ctx)

	mux := http.NewServeMux()

	mux.Handle("/", http.FileServer(http.Dir("./frontend")))
	mux.HandleFunc("/ws", manager.serverWS)
	mux.HandleFunc("/login", manager.loginHandler)

	return mux
}
