package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"

	"floral-wedding-backend/config"
	"floral-wedding-backend/handlers"
	"floral-wedding-backend/services"
)

func main() {
	// Load .env if present (safe to ignore error in production)
	_ = godotenv.Load()

	cfg := config.Load()

	store, err := services.NewRSVPStore(cfg.RSVPStoragePath)
	if err != nil {
		log.Fatalf("Tidak dapat membuka penyimpanan RSVP: %v", err)
	}
	rsvpHandler := &handlers.RSVPHandler{Store: store}
	if cfg.ResendAPIKey != "" && cfg.EmailFrom != "" && cfg.EmailTo != "" {
		rsvpHandler.EmailService = services.NewEmailService(cfg.ResendAPIKey, cfg.EmailFrom, cfg.EmailTo)
	} else {
		log.Print("RSVP tersimpan secara lokal; notifikasi email opsional belum diatur")
	}

	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.RequestID)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(30 * time.Second))

	// CORS — only allow configured origin
	allowedOrigin := cfg.AllowedOrigin
	if allowedOrigin == "" {
		allowedOrigin = "http://localhost:3000"
	}
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{allowedOrigin},
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Content-Type"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	// Routes
	r.Get("/api/health", handlers.HandleHealth)
	r.Get("/api/wishes", rsvpHandler.HandleWishes)
	r.With(handlers.PerIPRateLimit(cfg.RateLimitRPM)).Post("/api/rsvp", rsvpHandler.HandleRSVP)

	addr := ":" + cfg.Port
	log.Printf("Backend running on http://localhost%s", addr)
	log.Printf("Allowed origin: %s", allowedOrigin)

	server := &http.Server{Addr: addr, Handler: r, ReadHeaderTimeout: 5 * time.Second, ReadTimeout: 10 * time.Second, WriteTimeout: 25 * time.Second, IdleTimeout: 60 * time.Second}
	stop, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()
	go func() {
		<-stop.Done()
		ctx, done := context.WithTimeout(context.Background(), 10*time.Second)
		defer done()
		_ = server.Shutdown(ctx)
	}()
	if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatal(err)
	}
}
