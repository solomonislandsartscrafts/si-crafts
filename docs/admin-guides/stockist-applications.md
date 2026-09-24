# Stockist Applications — Admin Guide

A plain-language walkthrough of what happens when someone applies to become a
wholesale stockist, what you do to approve or reject them, and how to confirm
the whole thing is working.

Written for SIAC volunteers. You do not need to understand the code to follow
this.

---

## The big picture (30 seconds)

1. A shop fills in the public **Apply** form on the website.
2. The website emails **them** ("we got it") and emails **you** ("new application").
3. You open the **admin Stockists page**, read the application, and click **Approve** or **Reject**.
4. **Approve** → the shop gets an email with a link to set their own password, then they can log in and see wholesale prices.
   **Reject** → the shop gets a polite "not at this time" email. No account is created.

That's it. The rest of this guide is the detail and how to test it.

---

## Part 1 — What the applicant does

The shop goes to the website and opens the apply page:

> **`/stockist/apply`** — also linked from the Wholesale page.

They fill in six required fields:

- Business name
- ABN (must be 11 digits)
- Contact name
- Email
- Phone
- A short description of their business (up to 500 characters)

When they submit, they see an **"Application received"** message on screen.

**What you should know:**

- One application per email address. If they try again with the same email,
  they get a clear message telling them we already have their application —
  not a confusing error.
- Submitting does **not** create a login. It only creates a pending
  application for you to review.

---

## Part 2 — The two emails that go out immediately

As soon as an application is submitted, **two** emails are sent automatically:

| Email | Goes to | Subject | Purpose |
|-------|---------|---------|---------|
| Confirmation | The applicant | "We received your stockist application" | Reassures them, explains the next steps and the 2–3 business day timeframe. |
| Notification | The admin inbox | "New stockist application: {business}" | Tells you there's something to review, with a link to the admin Stockists page. |

If the emails don't arrive, that's a configuration problem, not a normal
outcome — see **Part 6: Troubleshooting**.

---

## Part 3 — Reviewing an application (this is your job)

1. Log in to the admin area: **`/admin/login`**.
2. Go to **Stockists** in the admin menu (**`/admin/stockists`**).
   - You can also get there from the admin **dashboard**, which shows a
     "_N_ stockist applications to review" reminder when any are waiting.
3. Applications waiting for you appear **at the top** of the list, and the page
   shows a banner like "**2 applications awaiting review**".
4. Click a row to **expand** it and read the full application — business name,
   contact, email, phone, ABN, and their description.
5. Decide: **Approve** or **Reject**.

### Approving

1. Click **Approve**.
2. A confirmation box appears explaining it will create a login and email the
   applicant. Confirm it.
3. Behind the scenes this:
   - sets the stockist to **Approved**,
   - creates their login account,
   - emails them a link to **set their own password** (valid for 7 days).
4. You'll see a short success message confirming what happened.

> **Note:** We never email anyone a password. We email a secure link they use
> to set their own. This is deliberate and correct — if an approved stockist
> says "I never got a password", point them at the approval email's link, or
> use the forgot-password flow below.

### Rejecting

1. Click **Reject**.
2. Confirm the box that appears.
3. The applicant is set to **Rejected** and gets a polite email saying we can't
   approve them at this time and inviting them to get in touch. **No login
   account is created.**

---

## Part 4 — The other buttons (after approval)

Once a stockist is approved you may also see:

- **Suspend** — pauses their access. They can't log in until you re-enable them.
  Use this instead of deleting if the pause might be temporary.
- **Enable** — un-pauses a suspended stockist.
- **Delete** — permanently removes the stockist **and** their login account.
  This can't be undone. Prefer Suspend unless you're sure.

There's also an **Add Stockist** button at the top of the page. This lets you
create an already-approved stockist directly, skipping the application form —
useful for a shop you've already dealt with offline. You can set their password
yourself or have the system email them the set-password link.

---

## Part 5 — The status labels, explained

Every stockist has one status. Here's what each means and what the shop can do:

| Status | What it means | Can they log in? |
|--------|---------------|------------------|
| **Pending** | Applied, waiting for your review | No |
| **Approved** | You approved them; account created | Yes, once they've set a password |
| **Suspended** | You paused their access | No |
| **Rejected** | You declined the application | No (no account exists) |

If an approved stockist tries to log in before setting their password, the
site tells them to check their approval email or reset their password — it
won't leave them stuck.

---

## Part 6 — How to confirm it's working (end-to-end test)

Do this once after any change to email settings, or any time you're unsure.
Use a real email address you can check (a personal Gmail is fine).

**Test 1 — Application + both emails**

1. Open **`/stockist/apply`** in a private/incognito window.
2. Fill it in using your test email. Use a made-up business name like
   "Test Gallery" and a valid 11-digit ABN (e.g. `12345678901`).
3. Submit. You should see "**Application received**" on screen.
4. Check your test inbox → you should get the **"We received your stockist
   application"** email within a minute or two.
5. Check the **admin inbox** → you should get the **"New stockist application"**
   email.

✅ If all three happen, application + notifications are working.

**Test 2 — Approval + set-password email**

1. Log in to **`/admin/stockists`**. Your test application should be at the top,
   marked **Pending**.
2. Expand it, check the details match what you entered, then click **Approve**.
3. Check your test inbox → you should get the **"Your stockist account has been
   approved!"** email with a **set-your-password** link.
4. Click the link, set a password.
5. Go to **`/login`**, log in with your test email and the password you set.
   You should reach the stockist area and be able to see wholesale pricing.

✅ If you can log in and see prices, the full approve flow works.

**Test 3 — Rejection email (optional)**

1. Submit another test application (use a different email — one per address).
2. In the admin, click **Reject**.
3. Check that inbox → you should get the **"Update on your stockist
   application"** email.

**Cleanup:** delete your test stockist(s) from the admin Stockists page with the
**Delete** button when you're done.

---

## Part 7 — Troubleshooting

**"The applicant didn't get any email."**

- Check your own admin inbox — did *you* get the notification? If neither email
  arrived, it's a sending problem (below). If only the applicant's is missing,
  double-check the address they typed.
- Emails can take a minute or two. Also check spam/junk.

**"No emails are sending at all."**

Email sending depends on the site's email service being configured in the
hosting dashboard (Render). The key settings are:

- `RESEND_API_KEY` — the email service key. If this is missing, emails don't send.
- `DEFAULT_FROM_EMAIL` — the "from" address; must be on the verified domain.
- `ADMIN_NOTIFICATION_EMAIL` — the inbox that receives admin notifications.

If sending has stopped, whoever manages the hosting can confirm these are set
and check the service logs. Note: a failed email **never** blocks an
application from being saved — the application is still there in the admin list
even if the email didn't go out. So if in doubt, check `/admin/stockists`
directly rather than relying on the email.

**"An approved stockist can't log in."**

- They may not have set their password yet. Ask them to use the link in their
  approval email, or the **Forgot password** link on the login page
  (**`/stockist/forgot-password`**).
- The set-password / reset links are valid for **7 days**. If theirs expired,
  the forgot-password flow sends a fresh one.
- Check their status isn't **Suspended**.

**"Someone says they applied but I don't see them."**

- Check the status filter isn't hiding them, and look for their email. If they
  used a slightly different email, there may be two entries.

---

## Quick reference — the pages

| Page | Address | Who uses it |
|------|---------|-------------|
| Apply form | `/stockist/apply` | Applicants |
| Admin login | `/admin/login` | You |
| Review applications | `/admin/stockists` | You |
| Stockist login | `/login` | Approved stockists |
| Forgot password | `/stockist/forgot-password` | Approved stockists |

---

_Last reviewed: keep this in step with the apply flow. If the emails or admin
buttons change, update this guide._
