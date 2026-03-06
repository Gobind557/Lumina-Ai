# Brevo API – Transactional email guide

This app can send transactional emails (campaigns, one-off sends) via **Brevo’s API** instead of SMTP. When you set **BREVO_API_KEY**, the app uses Brevo for sending and for **open tracking** (no need for a public URL or our own pixel). Brevo’s free tier includes **5,000 emails/month**.

---

## Step 1: Create a Brevo account and get an API key

1. Sign up at **[brevo.com](https://www.brevo.com)** (free account is enough).
2. Log in and open **Settings** (gear or your profile) → **SMTP & API** → **API Keys** (or go to [app.brevo.com/settings/keys/api](https://app.brevo.com/settings/keys/api)).
3. Click **Generate a new API key**.
4. Give it a name (e.g. “Sales Copilot”) and click **Generate**.
5. **Copy the key immediately** — Brevo only shows it once. Store it somewhere safe (e.g. password manager).
6. In your project, add it to `backend/api/.env`:
   ```env
   BREVO_API_KEY=xkeysib-xxxxxxxxxxxxxxxxxxxxxxxx
   ```
7. Restart your API (e.g. `npm run dev:all`). From now on, all queued emails are sent via Brevo’s API, not SMTP.

---

## Step 2: Add and verify a sender (required to send)

Brevo requires at least one **verified sender** before the API can send.

1. In Brevo: **Settings** → **Senders, Domains & Dedicated IPs** (or **Senders & IP**).
2. Under **Senders**, click **Add a sender**.
3. Enter the **email** and **name** you want in the “From” field (e.g. `noreply@yourdomain.com`, “Sales Copilot”).
4. Confirm the sender via the email Brevo sends you, or follow their domain/DKIM steps if they ask.
5. In your app, make sure the **from** address used when sending (e.g. in campaigns or compose) matches this verified sender (or another verified sender). Otherwise Brevo may reject the send.

---

## Step 3: Configure the webhook (open tracking)

So that **opens** show up in your dashboard and campaign metrics, Brevo must call your backend when someone opens an email.

1. In Brevo: **Settings** → **SMTP & API** → **Webhooks**.  
   **Important:** Use **Transactional** webhooks (for API-sent emails). Do **not** use Marketing webhooks — our app sends via the transactional API, so open events are delivered only to transactional webhooks.
2. Click **Create a new webhook** (or **Add a webhook**).
3. Set:
   - **Notify URL:**  
     `https://YOUR-BACKEND-URL/api/webhooks/brevo`  
     **Important:** Routes are under `/api`, so the path is `/api/webhooks/brevo`, not `/webhooks/brevo`.  
     Examples:
     - Production: `https://api.yourdomain.com/api/webhooks/brevo`
     - Local (ngrok): `https://abc123.ngrok-free.dev/api/webhooks/brevo`  
     Brevo cannot call `http://localhost`.
   - **Description:** e.g. “Sales Copilot – open tracking”.
   - **Events:** enable at least:
     - **Opened**
     - **First opening** (unique open)
     - Optionally: **Delivered**, **Hard bounce**, **Soft bounce** for future use.
4. Save. Brevo will send a POST request to that URL for each event. Our app handles `opened` and `unique_opened` and updates your metrics.

No need to set **APP_URL** for open tracking when using Brevo; Brevo’s own tracking is used.

---

## Step 4: Test the flow

1. Ensure your API and workers are running: `npm run dev:all` (so the email worker and analytics/campaign consumers run).
2. Send a test email (e.g. from a campaign or the compose screen).
3. Open that email in your inbox. After a short delay, the open should appear in your dashboard/campaign metrics (Brevo → your webhook → our event → analytics consumer).
4. If it doesn’t:
   - Check Brevo **Logs** or **Transactional** → **Statistics** to see if the email was sent and opened.
   - Check that the webhook URL is reachable from the internet and returns HTTP 200.
   - Check your API logs for errors when Brevo calls `/webhooks/brevo`.

---

## Step 5 (optional): Reply tracking

Replies are **not** reported by Brevo as a “replied” event. To update reply counts and “Replied” status in campaigns:

1. Use **Brevo Inbound** (or your domain’s MX/forwarding) so replies to your sending address are received by Brevo.
2. Configure Brevo to send incoming messages to your app (e.g. webhook or inbound URL).
3. Your backend must then call your own `POST /webhooks/email/reply` with body:  
   `{ "email_id": "<uuid-of-original-email>", "reply_subject": "...", "reply_body": "..." }`.  
   You may need a small adapter that maps Brevo’s inbound payload to this shape (e.g. match by message-id or custom header to get `email_id`).

If you don’t set this up, reply counts only update when something else calls `/webhooks/email/reply` (e.g. another tool or a manual test).

---

## Summary

| What                | Action |
|---------------------|--------|
| **Send via Brevo API** | Set `BREVO_API_KEY` in `.env` and add a verified sender in Brevo. |
| **Open tracking**      | Create a webhook in Brevo pointing to `https://your-api/webhooks/brevo` and subscribe to Opened / First opening. |
| **Reply tracking**    | Optional: set up Brevo Inbound and forward to your app, then POST to `/webhooks/email/reply` with `email_id` and reply content. |

| Env                     | Sending           | Open tracking        |
|-------------------------|-------------------|----------------------|
| `BREVO_API_KEY` unset   | SMTP + our pixel  | Our pixel (needs public `APP_URL`) |
| `BREVO_API_KEY` set     | Brevo API         | Brevo webhook → `POST /webhooks/brevo` |

- With Brevo, we do **not** inject our own tracking pixel; Brevo handles opens.
- Your existing dashboard, campaign metrics, and consumers keep working; they react to `EMAIL_OPENED` and `EMAIL_REPLIED` from the event bus.
