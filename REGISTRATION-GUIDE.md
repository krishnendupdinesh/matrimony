# Registration guide (frontend + backend contract)

The form is in `app/register/`. The Node + Express backend must implement the endpoints below.

## How the flow keeps fake accounts out

| Layer | What it does |
|---|---|
| Mobile OTP (required) | Account stays `pending` until a 6 digit SMS code is verified. One account per mobile number (UNIQUE). |
| Email verification | Send a link after sign-up. Unverified emails cannot message anyone. |
| Age and gender rules | Server rejects under 21 (male) / 18 (female) and impossible birth dates. |
| Rate limits | `express-rate-limit`: e.g. 5 register/hour per IP, 3 OTP sends/hour per mobile, 5 wrong OTPs then lock for 30 min. |
| Bot protection | Honeypot field (already in the form) + Cloudflare Turnstile or reCAPTCHA token checked on the server. |
| Block throwaway data | Reject disposable email domains and VoIP / virtual numbers. |
| Photo + ID check | After sign-up, user uploads photo and a govt ID. Profile is `status = pending_review` and is NOT searchable until an admin approves. |
| Trust badges | Show "Verified" only after ID is approved. |
| Abuse controls | Report/block buttons, admin ban, limit new users to ~10 interests/day until approved. |
| Password safety | Hash with `argon2` or `bcrypt` (cost 12+). Never log passwords or OTPs. Store only the OTP hash. |
| Sessions | httpOnly + Secure + SameSite=Lax cookie holding a JWT/session id. CORS allows only your frontend origin with credentials. |

## Can TiDB store images?

Technically yes (`MEDIUMBLOB`), but do not. Large blobs make the database slow and expensive, and TiDB has a
6 MB default row-size limit (`txn-entry-size-limit`). Instead:

1. Upload images to object storage: Cloudinary, AWS S3, Cloudflare R2 or Supabase Storage.
2. Save only the URL/key in TiDB (`photos.url`).
3. Keep ID documents in a **private** bucket and serve them only to admins through short-lived signed URLs.
4. Validate on the server: type (jpeg/png/webp by file signature, not extension), max 5 MB, re-encode with `sharp`
   to strip EXIF/GPS data.

## TiDB schema (MySQL compatible)

```sql
CREATE TABLE users (
  id            BIGINT PRIMARY KEY AUTO_RANDOM,
  profile_for   VARCHAR(20)  NOT NULL,
  name          VARCHAR(100) NOT NULL,
  gender        ENUM('male','female') NOT NULL,
  dob           DATE NOT NULL,
  religion      VARCHAR(30)  NOT NULL,
  mobile        CHAR(10)     NOT NULL,
  email         VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  status        ENUM('pending_otp','active','pending_review','approved','suspended') NOT NULL DEFAULT 'pending_otp',
  mobile_verified_at TIMESTAMP NULL,
  email_verified_at  TIMESTAMP NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_mobile (mobile),
  UNIQUE KEY uq_email (email)
);

CREATE TABLE otps (
  id         BIGINT PRIMARY KEY AUTO_RANDOM,
  user_id    BIGINT NOT NULL,
  code_hash  VARCHAR(255) NOT NULL,
  attempts   TINYINT NOT NULL DEFAULT 0,
  expires_at TIMESTAMP NOT NULL,
  INDEX (user_id)
);

CREATE TABLE photos (
  id BIGINT PRIMARY KEY AUTO_RANDOM, user_id BIGINT NOT NULL,
  url VARCHAR(500) NOT NULL, is_primary BOOLEAN DEFAULT FALSE,
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  INDEX (user_id)
);

CREATE TABLE id_documents (
  id BIGINT PRIMARY KEY AUTO_RANDOM, user_id BIGINT NOT NULL,
  storage_key VARCHAR(500) NOT NULL,           -- private bucket key, never a public URL
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  reviewed_by BIGINT NULL, reviewed_at TIMESTAMP NULL
);
```

## Endpoints the form calls

`POST /api/auth/register` body: `profileFor, name, gender, dob, religion, mobile, email, password, agree, website`
- 400 invalid (also if `website` honeypot is non-empty, or captcha fails), 409 mobile/email exists, 429 rate limited.
- On success: insert user `pending_otp`, store hashed OTP (10 min expiry), send SMS (MSG91 / Twilio / Fast2SMS with DLT).
  If the mobile exists but is still `pending_otp`, update that row and resend instead of returning 409.

`POST /api/auth/verify-otp` body: `mobile, otp` → set `status='pending_review'`, `mobile_verified_at`, set the login cookie. 401/429 on failure.

`POST /api/auth/resend-otp` body: `mobile` → max 3 per hour, 30 s gap.

## Env

Frontend `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:5000`
Backend: `TIDB_*` credentials (TiDB Cloud requires TLS), `JWT_SECRET`, `SMS_API_KEY`, `FRONTEND_ORIGIN`, storage keys.
