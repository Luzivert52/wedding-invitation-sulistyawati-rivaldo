package handlers

import (
	"net"
	"net/http"
	"sync"
	"time"

	"golang.org/x/time/rate"
)

// PerIPRateLimit uses the connection IP; arbitrary X-Forwarded-For is not trusted.
// Deployments behind a proxy should configure an edge limit for the real client IP.
func PerIPRateLimit(rpm int) func(http.Handler) http.Handler {
	if rpm < 1 {
		rpm = 10
	}
	type visitor struct {
		limiter *rate.Limiter
		seen    time.Time
	}
	visitors := map[string]*visitor{}
	var mu sync.Mutex
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ip, _, err := net.SplitHostPort(r.RemoteAddr)
			if err != nil {
				ip = r.RemoteAddr
			}
			now := time.Now()
			mu.Lock()
			for key, v := range visitors {
				if now.Sub(v.seen) > 5*time.Minute {
					delete(visitors, key)
				}
			}
			v := visitors[ip]
			if v == nil && len(visitors) < 10000 {
				v = &visitor{limiter: rate.NewLimiter(rate.Every(time.Minute/time.Duration(rpm)), rpm)}
				visitors[ip] = v
			}
			allowed := false
			if v != nil {
				v.seen = now
				allowed = v.limiter.Allow()
			}
			mu.Unlock()
			if !allowed {
				w.Header().Set("Retry-After", "60")
				writeJSON(w, http.StatusTooManyRequests, apiResponse{Success: false, Message: "Terlalu banyak permintaan. Silakan coba lagi nanti."})
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
