package config

import (
	"os"
	"strconv"
)

type Config struct {
	Port            string
	ResendAPIKey    string
	EmailFrom       string
	EmailTo         string
	AllowedOrigin   string
	RateLimitRPM    int // requests per minute
	RSVPStoragePath string
}

func Load() *Config {
	rpm := 10
	if v := os.Getenv("RATE_LIMIT_RPM"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			rpm = n
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	storagePath := os.Getenv("RSVP_STORAGE_PATH")
	if storagePath == "" {
		storagePath = "data/rsvps.json"
	}

	return &Config{
		Port:            port,
		ResendAPIKey:    os.Getenv("RESEND_API_KEY"),
		EmailFrom:       os.Getenv("EMAIL_FROM"),
		EmailTo:         os.Getenv("EMAIL_TO"),
		AllowedOrigin:   os.Getenv("ALLOWED_ORIGIN"),
		RateLimitRPM:    rpm,
		RSVPStoragePath: storagePath,
	}
}
