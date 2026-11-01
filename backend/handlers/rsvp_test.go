package handlers

import (
	"context"
	"errors"
	"floral-wedding-backend/services"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

type fakeNotifier struct {
	called int
	data   services.RSVPData
	err    error
}

func (f *fakeNotifier) SendRSVPNotification(_ context.Context, data services.RSVPData) error {
	f.called++
	f.data = data
	return f.err
}
func submit(h *RSVPHandler, body string) *httptest.ResponseRecorder {
	w := httptest.NewRecorder()
	h.HandleRSVP(w, httptest.NewRequest("POST", "/api/rsvp", strings.NewReader(body)))
	return w
}
func TestNonAttendanceHasZeroGuests(t *testing.T) {
	f := &fakeNotifier{}
	h := &RSVPHandler{EmailService: f}
	r := submit(h, `{"name":"Tamu Uji","status":"not_attending","guests":0,"email":"","whatsapp":"","message":"Doa baik"}`)
	if r.Code != 200 || f.called != 1 || f.data.Guests != 0 {
		t.Fatalf("zero-guest RSVP: %d %s calls=%d", r.Code, r.Body.String(), f.called)
	}
}
func TestInvalidRequestsDoNotSendEmail(t *testing.T) {
	for _, body := range []string{`{"name":"Tamu","status":"attending","guests":0}`, `{"name":"Tamu","status":"not_attending","guests":1}`, `{"name":"Tamu","status":"attending","guests":1,"email":"bukan-email"}`, `{"name":"Tamu","status":"attending","guests":1} {}`, `{"name":" ","status":"attending","guests":1}`} {
		f := &fakeNotifier{}
		r := submit(&RSVPHandler{EmailService: f}, body)
		if r.Code != 400 || f.called != 0 {
			t.Fatalf("invalid request sent email: %d %s", r.Code, body)
		}
	}
}
func TestEmailFailureDoesNotClaimSuccess(t *testing.T) {
	f := &fakeNotifier{err: errors.New("provider unavailable")}
	r := submit(&RSVPHandler{EmailService: f}, `{"name":"Tamu","status":"attending","guests":2}`)
	if r.Code != 500 || !strings.Contains(r.Body.String(), `"success":false`) {
		t.Fatal(r.Body.String())
	}
}
func TestPerIPLimitIsIndependent(t *testing.T) {
	handler := PerIPRateLimit(1)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(200) }))
	for _, tc := range []struct {
		addr string
		code int
	}{{"192.0.2.1:1000", 200}, {"192.0.2.1:1001", 429}, {"192.0.2.2:1002", 200}} {
		r := httptest.NewRequest("POST", "/api/rsvp", nil)
		r.RemoteAddr = tc.addr
		w := httptest.NewRecorder()
		handler.ServeHTTP(w, r)
		if w.Code != tc.code {
			t.Fatalf("%s: got %d want %d", tc.addr, w.Code, tc.code)
		}
	}
}
