package services

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"time"
)

type StoredRSVP struct {
	ID string `json:"id"`
	RSVPData
	Publish bool `json:"publish"`
}
type PublicWish struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Message   string    `json:"message"`
	CreatedAt time.Time `json:"created_at"`
}
type RSVPStore struct {
	mu      sync.Mutex
	path    string
	records []StoredRSVP
}

func NewRSVPStore(path string) (*RSVPStore, error) {
	s := &RSVPStore{path: path, records: []StoredRSVP{}}
	data, err := os.ReadFile(path)
	if errors.Is(err, os.ErrNotExist) {
		return s, nil
	}
	if err != nil {
		return nil, err
	}
	if err := json.Unmarshal(data, &s.records); err != nil {
		return nil, fmt.Errorf("read RSVP data: %w", err)
	}
	return s, nil
}

// Save writes through a temporary file before replacing the private data file.
// The boolean is false when the same request was already saved.
func (s *RSVPStore) Save(data RSVPData, publish bool, requestID string) (bool, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if requestID == "" {
		var b [16]byte
		if _, err := rand.Read(b[:]); err != nil {
			return false, err
		}
		requestID = hex.EncodeToString(b[:])
	}
	for _, record := range s.records {
		if record.ID == requestID {
			return false, nil
		}
	}
	next := append(append([]StoredRSVP{}, s.records...), StoredRSVP{ID: requestID, RSVPData: data, Publish: publish && data.Message != ""})
	encoded, err := json.MarshalIndent(next, "", "  ")
	if err != nil {
		return false, err
	}
	if err := os.MkdirAll(filepath.Dir(s.path), 0750); err != nil {
		return false, err
	}
	f, err := os.CreateTemp(filepath.Dir(s.path), "rsvp-*.tmp")
	if err != nil {
		return false, err
	}
	temporary := f.Name()
	defer os.Remove(temporary)
	if err = f.Chmod(0600); err == nil {
		_, err = f.Write(encoded)
	}
	if err == nil {
		err = f.Sync()
	}
	closeErr := f.Close()
	if err == nil {
		err = closeErr
	}
	if err == nil {
		err = os.Rename(temporary, s.path)
	}
	if err != nil {
		return false, err
	}
	s.records = next
	return true, nil
}

func (s *RSVPStore) Wishes() []PublicWish {
	s.mu.Lock()
	defer s.mu.Unlock()
	result := make([]PublicWish, 0)
	for i := len(s.records) - 1; i >= 0 && len(result) < 50; i-- {
		r := s.records[i]
		if r.Publish && r.Message != "" {
			result = append(result, PublicWish{ID: r.ID, Name: r.Name, Message: r.Message, CreatedAt: r.Timestamp})
		}
	}
	return result
}
