# Travel RFQ Marketplace (User End)

A lightweight user-facing website prototype for a **controlled travel marketplace** (not a booking engine), covering:

- Flight RFQ (One-way, Round-trip, Multi-city)
- Visa Processing
- Tour/Hajj/Umrah Package Requests
- Work Visa Request + CV upload
- Bus/Train transport requests

## Highlights implemented

- Register/Login modal triggered from action buttons.
- Register flow with email/password and OTP verification step (demo OTP: `123456`).
- Login validation messages for:
  - unregistered email
  - wrong password
- Client-side simulated JWT issuance and session storage.
- Role stored in session (`customer`) for protected submit actions.
- Request submission per module with:
  - unique request ID
  - default `Pending` status
  - placeholder `assignedAgent`
- Local request history panel (`My Requests`).

## Notes

This is a **frontend prototype** with localStorage-backed state to validate user flow quickly.
For production, connect these forms to backend APIs and replace simulated auth/JWT/OTP logic.

