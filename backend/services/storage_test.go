package services

import (
	"path/filepath"
	"testing"
	"time"
)

func TestStorePersistsConsentAndAvoidsDuplicateRequests(t *testing.T) {
	path := filepath.Join(t.TempDir(), "private", "rsvps.json")
	store, err := NewRSVPStore(path)
	if err != nil {
		t.Fatal(err)
	}
	data := RSVPData{Name: "Tamu Publik", Email: "private@example.invalid", WhatsApp: "08123456789", Status: "attending", Guests: 2, Message: "Semoga bahagia.", Timestamp: time.Now()}
	if added, err := store.Save(data, true, "request-one"); err != nil || !added {
		t.Fatalf("save: %v %v", added, err)
	}
	if added, err := store.Save(data, true, "request-one"); err != nil || added {
		t.Fatalf("duplicate: %v %v", added, err)
	}
	data.Name = "Tamu Privat"
	if _, err := store.Save(data, false, "request-two"); err != nil {
		t.Fatal(err)
	}
	reloaded, err := NewRSVPStore(path)
	if err != nil {
		t.Fatal(err)
	}
	if len(reloaded.records) != 2 {
		t.Fatalf("persisted records: %d", len(reloaded.records))
	}
	wishes := reloaded.Wishes()
	if len(wishes) != 1 || wishes[0].Name != "Tamu Publik" {
		t.Fatalf("unexpected public wishes: %+v", wishes)
	}
}
