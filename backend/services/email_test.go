package services

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"strings"
	"testing"
	"time"
)

type roundTripFunc func(*http.Request) (*http.Response, error)

func (f roundTripFunc) RoundTrip(r *http.Request) (*http.Response, error) { return f(r) }
func TestEmailEscapesInputAndUsesWITA(t *testing.T) {
	service := NewEmailService("test-key", "test@example.com", "owner@example.com")
	service.Client = &http.Client{Transport: roundTripFunc(func(r *http.Request) (*http.Response, error) {
		var data struct {
			HTML string `json:"html"`
		}
		if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
			t.Fatal(err)
		}
		if strings.Contains(data.HTML, "<script>") || !strings.Contains(data.HTML, "&lt;script&gt;") || !strings.Contains(data.HTML, "05 Dec 2026 10:00 WITA") {
			t.Fatal("escaping or WITA time incorrect")
		}
		return &http.Response{StatusCode: 200, Body: io.NopCloser(strings.NewReader(`{}`)), Header: http.Header{}}, nil
	})}
	err := service.SendRSVPNotification(context.Background(), RSVPData{Name: "<script>", Status: "not_attending", Guests: 0, Timestamp: time.Date(2026, 12, 5, 2, 0, 0, 0, time.UTC)})
	if err != nil {
		t.Fatal(err)
	}
}
