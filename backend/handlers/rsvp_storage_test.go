package handlers

import (
	"encoding/json"
	"errors"
	"floral-wedding-backend/services"
	"net/http/httptest"
	"path/filepath"
	"strings"
	"testing"
)

func TestRSVPWorksWithoutEmailAndDoesNotExposePrivateFields(t *testing.T) {
	store, err := services.NewRSVPStore(filepath.Join(t.TempDir(), "rsvps.json"))
	if err != nil {
		t.Fatal(err)
	}
	h := &RSVPHandler{Store: store}
	body := `{"name":"Tamu Publik","email":"private@example.invalid","whatsapp":"08123456789","status":"attending","guests":2,"message":"Doa baik","publish":true,"request_id":"one"}`
	if r := submit(h, body); r.Code != 200 {
		t.Fatalf("save without email: %d %s", r.Code, r.Body.String())
	}
	if r := submit(h, body); r.Code != 200 {
		t.Fatal(r.Body.String())
	}
	if r := submit(h, `{"name":"Tamu Privat","status":"not_attending","guests":0,"message":"Pesan privat","publish":false,"request_id":"two"}`); r.Code != 200 {
		t.Fatal(r.Body.String())
	}
	r := httptest.NewRecorder()
	h.HandleWishes(r, httptest.NewRequest("GET", "/api/wishes", nil))
	var result struct {
		Wishes []services.PublicWish `json:"wishes"`
	}
	if err := json.Unmarshal(r.Body.Bytes(), &result); err != nil {
		t.Fatal(err)
	}
	if len(result.Wishes) != 1 || result.Wishes[0].Name != "Tamu Publik" {
		t.Fatal(r.Body.String())
	}
	for _, secret := range []string{"email", "whatsapp", "guests", "attendance", "private@example.invalid", "Tamu Privat", "Pesan privat"} {
		if strings.Contains(r.Body.String(), secret) {
			t.Fatalf("public endpoint leaked %s", secret)
		}
	}
}

func TestEmailFailureDoesNotLosePersistedRSVP(t *testing.T) {
	path := filepath.Join(t.TempDir(), "rsvps.json")
	store, err := services.NewRSVPStore(path)
	if err != nil {
		t.Fatal(err)
	}
	notifier := &fakeNotifier{err: errors.New("provider unavailable")}
	h := &RSVPHandler{Store: store, EmailService: notifier}
	body := `{"name":"Tamu","status":"attending","guests":1,"message":"Doa","publish":true,"request_id":"same-request"}`
	if r := submit(h, body); r.Code != 200 {
		t.Fatal(r.Body.String())
	}
	if r := submit(h, body); r.Code != 200 {
		t.Fatal(r.Body.String())
	}
	if notifier.called != 1 {
		t.Fatalf("duplicate notification: %d", notifier.called)
	}
	reloaded, err := services.NewRSVPStore(path)
	if err != nil || len(reloaded.Wishes()) != 1 {
		t.Fatalf("lost RSVP: %v", err)
	}
}
