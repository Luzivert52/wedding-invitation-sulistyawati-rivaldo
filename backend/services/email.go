package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"html"
	"net/http"
	"time"
)

type EmailService struct {
	APIKey    string
	FromEmail string
	ToEmail   string
	Client    *http.Client
}

type RSVPData struct {
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	WhatsApp  string    `json:"whatsapp"`
	Guests    int       `json:"guests"`
	Status    string    `json:"status"`
	Message   string    `json:"message"`
	Timestamp time.Time `json:"timestamp"`
}

func NewEmailService(apiKey, from, to string) *EmailService {
	return &EmailService{
		APIKey:    apiKey,
		FromEmail: from,
		ToEmail:   to,
		Client: &http.Client{
			Timeout: 15 * time.Second,
		},
	}
}

func (s *EmailService) SendRSVPNotification(ctx context.Context, data RSVPData) error {
	if s.APIKey == "" || s.FromEmail == "" || s.ToEmail == "" {
		return fmt.Errorf("email configuration incomplete")
	}

	statusLabel := map[string]string{
		"attending":     "Hadir",
		"not_attending": "Tidak Hadir",
		"maybe":         "Belum Pasti",
	}
	statusText := statusLabel[data.Status]
	if statusText == "" {
		statusText = data.Status
	}

	// Sanitize for HTML email
	name := html.EscapeString(data.Name)
	email := html.EscapeString(data.Email)
	whatsapp := html.EscapeString(data.WhatsApp)
	message := html.EscapeString(data.Message)
	if message == "" {
		message = "-"
	}
	if email == "" {
		email = "-"
	}
	if whatsapp == "" {
		whatsapp = "-"
	}

	htmlBody := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Georgia, serif; background: #FFF9F2; color: #5a4a4a; margin: 0; padding: 20px; }
    .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(199,131,152,0.15); }
    .header { background: linear-gradient(135deg, #F5DDE3, #C78398); padding: 28px 24px; text-align: center; }
    .header h1 { margin: 0; color: #fff; font-size: 22px; font-weight: normal; letter-spacing: 1px; }
    .body { padding: 28px 24px; }
    .row { margin-bottom: 14px; border-bottom: 1px solid #F5DDE3; padding-bottom: 10px; }
    .label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.8px; color: #A8B89A; margin-bottom: 4px; }
    .value { font-size: 16px; color: #5a4a4a; }
    .footer { text-align: center; padding: 16px; font-size: 12px; color: #A8B89A; background: #FFF9F2; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Konfirmasi Kehadiran Baru</h1>
    </div>
    <div class="body">
      <div class="row">
        <div class="label">Nama Tamu</div>
        <div class="value">%s</div>
      </div>
      <div class="row">
        <div class="label">Email</div>
        <div class="value">%s</div>
      </div>
      <div class="row">
        <div class="label">WhatsApp</div>
        <div class="value">%s</div>
      </div>
      <div class="row">
        <div class="label">Jumlah Tamu</div>
        <div class="value">%d orang</div>
      </div>
      <div class="row">
        <div class="label">Status Kehadiran</div>
        <div class="value">%s</div>
      </div>
      <div class="row">
        <div class="label">Ucapan & Doa</div>
        <div class="value">%s</div>
      </div>
      <div class="row" style="border-bottom:none;">
        <div class="label">Waktu Pengiriman</div>
        <div class="value">%s</div>
      </div>
    </div>
    <div class="footer">
      Notifikasi dari Undangan Pernikahan Digital
    </div>
  </div>
</body>
</html>
`, name, email, whatsapp, data.Guests, statusText, message, data.Timestamp.In(time.FixedZone("WITA", 8*60*60)).Format("02 Jan 2006 15:04 MST"))

	payload := map[string]interface{}{
		"from":    s.FromEmail,
		"to":      []string{s.ToEmail},
		"subject": fmt.Sprintf("RSVP: %s — %s", data.Name, statusText),
		"html":    htmlBody,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to encode email payload: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", "https://api.resend.com/emails", bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+s.APIKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.Client.Do(req)
	if err != nil {
		return fmt.Errorf("email request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		var errBody map[string]interface{}
		_ = json.NewDecoder(resp.Body).Decode(&errBody)
		return fmt.Errorf("email provider returned status %d", resp.StatusCode)
	}

	return nil
}
