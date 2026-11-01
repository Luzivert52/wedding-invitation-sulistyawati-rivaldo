package handlers

import (
	"context"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"net/mail"
	"strings"
	"time"
	"unicode/utf8"

	"floral-wedding-backend/services"
)

type RSVPNotifier interface {
	SendRSVPNotification(context.Context, services.RSVPData) error
}

type RSVPHandler struct {
	EmailService RSVPNotifier
	Store        *services.RSVPStore
}

type rsvpRequest struct {
	Name      string `json:"name"`
	Email     string `json:"email"`
	WhatsApp  string `json:"whatsapp"`
	Guests    int    `json:"guests"`
	Status    string `json:"status"`
	Message   string `json:"message"`
	Publish   bool   `json:"publish"`
	RequestID string `json:"request_id"`
}

type apiResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

func (h *RSVPHandler) HandleRSVP(w http.ResponseWriter, r *http.Request) {
	// Limit request body size to 8 KB
	r.Body = http.MaxBytesReader(w, r.Body, 8<<10)

	var req rsvpRequest
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, apiResponse{
			Success: false,
			Message: "Data tidak valid. Periksa kembali formulir Anda.",
		})
		return
	}

	var trailing any
	if err := decoder.Decode(&trailing); err != io.EOF {
		writeJSON(w, http.StatusBadRequest, apiResponse{Success: false, Message: "Data formulir tidak valid."})
		return
	}

	// Server-side validation
	req.Name = strings.TrimSpace(req.Name)
	req.Email = strings.TrimSpace(req.Email)
	req.WhatsApp = strings.TrimSpace(req.WhatsApp)
	req.Message = strings.TrimSpace(req.Message)
	req.Status = strings.TrimSpace(req.Status)
	if len(req.RequestID) > 100 {
		writeJSON(w, http.StatusBadRequest, apiResponse{Success: false, Message: "Identitas pengiriman tidak valid."})
		return
	}

	if req.Name == "" || utf8.RuneCountInString(req.Name) > 100 {
		writeJSON(w, http.StatusBadRequest, apiResponse{
			Success: false,
			Message: "Nama wajib diisi (maksimal 100 karakter).",
		})
		return
	}

	validStatus := map[string]bool{
		"attending":     true,
		"not_attending": true,
		"maybe":         true,
	}
	if !validStatus[req.Status] {
		writeJSON(w, http.StatusBadRequest, apiResponse{
			Success: false,
			Message: "Status kehadiran tidak valid.",
		})
		return
	}

	if (req.Status == "not_attending" && req.Guests != 0) || (req.Status != "not_attending" && (req.Guests < 1 || req.Guests > 20)) {
		writeJSON(w, http.StatusBadRequest, apiResponse{Success: false, Message: "Jumlah tamu harus 0 untuk tidak hadir, atau 1–20 untuk hadir/belum pasti."})
		return
	}

	address, emailErr := mail.ParseAddress(req.Email)
	if req.Email != "" && (len(req.Email) > 150 || emailErr != nil || address.Address != req.Email) {
		writeJSON(w, http.StatusBadRequest, apiResponse{
			Success: false,
			Message: "Format email tidak valid.",
		})
		return
	}

	if utf8.RuneCountInString(req.Message) > 500 {
		writeJSON(w, http.StatusBadRequest, apiResponse{
			Success: false,
			Message: "Ucapan maksimal 500 karakter.",
		})
		return
	}

	if utf8.RuneCountInString(req.WhatsApp) > 20 {
		writeJSON(w, http.StatusBadRequest, apiResponse{
			Success: false,
			Message: "Nomor WhatsApp terlalu panjang.",
		})
		return
	}

	data := services.RSVPData{
		Name:      req.Name,
		Email:     req.Email,
		WhatsApp:  req.WhatsApp,
		Guests:    req.Guests,
		Status:    req.Status,
		Message:   req.Message,
		Timestamp: time.Now(),
	}

	if h.EmailService == nil && h.Store == nil {
		writeJSON(w, http.StatusServiceUnavailable, apiResponse{Success: false, Message: "Layanan konfirmasi belum tersedia. Silakan coba kembali."})
		return
	}

	if h.Store != nil {
		inserted, err := h.Store.Save(data, req.Publish, req.RequestID)
		if err != nil {
			writeJSON(w, http.StatusServiceUnavailable, apiResponse{Success: false, Message: "Konfirmasi belum dapat disimpan. Silakan coba lagi."})
			return
		}
		if !inserted {
			writeJSON(w, http.StatusOK, apiResponse{Success: true, Message: "Konfirmasi Anda sudah tersimpan. Terima kasih!"})
			return
		}
	}
	if h.EmailService != nil {
		if err := h.EmailService.SendRSVPNotification(r.Context(), data); err != nil {
			if h.Store != nil {
				log.Print("RSVP tersimpan; notifikasi email belum terkirim")
			} else {
				writeJSON(w, http.StatusInternalServerError, apiResponse{
					Success: false,
					Message: "Gagal mengirim konfirmasi. Silakan coba lagi beberapa saat.",
				})
				return
			}
		}
	}

	writeJSON(w, http.StatusOK, apiResponse{
		Success: true,
		Message: "Terima kasih! Konfirmasi kehadiran Anda telah diterima dan tersimpan.",
	})
}

func (h *RSVPHandler) HandleWishes(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-store")
	if h.Store == nil {
		w.WriteHeader(http.StatusServiceUnavailable)
		_ = json.NewEncoder(w).Encode(map[string]any{"message": "Buku tamu belum tersedia."})
		return
	}
	_ = json.NewEncoder(w).Encode(map[string]any{"wishes": h.Store.Wishes()})
}

func writeJSON(w http.ResponseWriter, status int, payload apiResponse) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}
