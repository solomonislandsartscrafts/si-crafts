# Local Development — Playing With Data Safely

## The thing to understand first

Code and content travel by different routes:

- **Code** lives in git. It flows local → PR → `main` → production.
- **Content** (products, makers, crafts, images) lives in the **database**. It does **not** travel via git. Pushing a branch never moves content.

So to get real content onto the live site you enter it in the **production** admin. Content you create locally stays local.

## Two modes

The frontend talks to whatever `NEXT_PUBLIC_API_URL` points at.

| Mode | `.env.local` value | Admin edits/uploads go to |
|---|---|---|
| **Production** (default) | `https://si-crafts-iwcd.onrender.com` | **the live site** — be careful |
| **Local sandbox** | `http://localhost:8001` | your machine only — safe to break |

In production mode, editing content or uploading an image from your local dashboard changes the live site immediately. Image uploads post to `${NEXT_PUBLIC_API_URL}/api/upload/`, so they land in the production R2 bucket too.

Switch modes by editing `NEXT_PUBLIC_API_URL` in `.env.local` and restarting `npm run dev`.

## One-time setup for the local sandbox

Install the backend dependencies:

```bash
python3 -m venv backend/.venv
backend/.venv/bin/pip install -r backend/requirements.txt
```

## Copying production content into your sandbox

Get the connection string from Render → `siac-db` → **External Database URL**, then:

```bash
export PROD_DATABASE_URL='postgresql://...'
./scripts/sync-prod-to-local.sh
```

This dumps production content, backs up your current local database, rebuilds the
schema, and loads the production copy in. Re-run it whenever you want fresh data.

Notes:
- The snapshot (`backend/prod-snapshot.json`) contains user password hashes. It is gitignored; delete it when you're done if you prefer.
- Images keep working because production stores absolute R2 URLs, which load read-only from the public bucket.
- If `loaddata` fails on a particular model, add `--exclude app.model` to the `EXCLUDES` list in the script.

## Day-to-day

Run the backend:

```bash
cd backend && .venv/bin/python manage.py runserver 8001
```

Port 8001 is used because something else already listens on 8000. If 8000 is free
you can use it, just match `NEXT_PUBLIC_API_URL`.

Run the frontend in another terminal:

```bash
npm run dev
```

Now edit content, upload images, and break things freely. Production is untouched.

## Deploying

- Code changes: push your branch, check the preview URL, open a PR into `main`, merge. Cloudflare deploys the frontend automatically.
- Backend code changes: after merging, go to Render → `si-crafts` → **Manual Deploy** (auto-deploy is off on purpose).
- Content: enter it in the production admin.

## Troubleshooting

**Admin screens show nothing / "0 of 0 products"**

The backend isn't running, or `NEXT_PUBLIC_API_URL` points somewhere that isn't
answering. Failed reads fall back to empty data (deliberately, so builds don't
break when Render's free tier is asleep), so an unreachable backend looks the same
as an empty database.

Check the backend is up:

```bash
curl "http://localhost:8001/api/v2/products/?limit=1"
```

If that fails, start it:

```bash
cd backend && .venv/bin/python manage.py runserver 8001
```

Both servers need to be running at the same time: Django on 8001 and `npm run dev`
on 3000.

## Known limitation

Preview URLs (`https://<branch>-si-crafts.siacrafts.workers.dev`) still point at the
**production** backend, because Cloudflare's edge can't reach your localhost. Use
preview links to review layout and code changes, not to edit content. If you ever
need a shareable environment with editable throwaway content, that needs a second
Render service and database pointed at a `staging` branch.
