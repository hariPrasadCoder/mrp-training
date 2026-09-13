# Deploy MyRealProduct on Coolify

The application is prepared as a standalone Next.js Docker container. The production address is `https://app.myrealproduct.com`.

## Before you begin

- Make sure the latest project changes are committed and pushed to the Git repository connected to Coolify.
- Keep `coolify.env` private. It contains production secrets and is intentionally ignored by Git.
- The current Neon database already contains the application schema and the two Cal.com links. If you switch to a different database, apply the schema and save the links again from the coach workspace.

## 1. Add the application in Coolify

1. Create a new **Application** and connect the `mrp-training` Git repository.
2. Select the branch you want to deploy, normally `main`.
3. Choose **Dockerfile** as the build pack.
4. Set the Dockerfile location to `/Dockerfile` if Coolify asks for it.
5. Set the exposed container port to `3000`.
6. Do not add a custom start command; the Docker image already starts the standalone Next.js server.

## 2. Paste the environment variables

Open the local `coolify.env` file, copy all five lines, switch Coolify's environment-variable screen to **Developer View**, and paste them into the plain-text editor. Keep **Build Variable** disabled: these values are needed only by the running container and must not enter the image build.

The required variables are:

- `DATABASE_URL` — the pooled Neon Postgres connection string.
- `NEON_AUTH_BASE_URL` — the Neon Auth endpoint ending in `/neondb/auth`.
- `NEON_AUTH_COOKIE_SECRET` — a new production-only random secret.
- `ADMIN_EMAILS` — comma-separated coach email addresses.
- `LEARNER_EMAILS` — comma-separated invited learner email addresses.

Do not add the removed Cal.com API or webhook variables. The booking cards use links stored in the database.

## 3. Add the domain and port

1. Add `https://app.myrealproduct.com` as the application domain in Coolify.
2. Set **Ports Exposes** to `3000`. The application already listens on `0.0.0.0:3000`.
3. Enable HTTPS/certificate provisioning in Coolify.

The Dockerfile already defines its own health check against `/api/health`, with a 15-second start period and a 30-second interval. Coolify detects and uses a Dockerfile health check automatically, so you do not need to create a second check in **Configuration → Healthcheck**.

## 4. Point DNS to Coolify

At the DNS provider for `myrealproduct.com`, create the record Coolify recommends for the `app` subdomain. This is commonly an `A` record pointing to the Coolify server's public IPv4 address. If Coolify provides a hostname instead, use its recommended `CNAME` record.

Wait until `app.myrealproduct.com` resolves to the Coolify server before expecting certificate provisioning to complete.

## 5. Allow the production origin in Neon Auth

In Neon Auth, add this exact trusted origin:

`https://app.myrealproduct.com`

Also allow this password-reset return URL if Neon Auth has a separate redirect or callback allowlist:

`https://app.myrealproduct.com/auth/sign-in`

Do not include a trailing slash in the trusted origin.

## 6. Deploy and verify

1. Deploy the application in Coolify.
2. Open `https://app.myrealproduct.com/api/health`. It should return a JSON response with `"status":"ok"` and HTTP 200.
3. If it returns HTTP 503, the response lists the missing environment-variable names without revealing their values.
4. Sign in with the coach email.
5. Confirm both Cal.com links appear under **Admin view → Scheduling**.
6. Sign in with an invited learner email and test the Week 0 flow and both booking cards.
7. Try an email that is not allowlisted and confirm that access is denied.
8. Test sign-out and password reset from the production domain.

## Updating the deployment later

- Push code changes to the connected branch and redeploy, or enable Coolify's automatic deployment for that branch.
- To invite a learner, add their email to `LEARNER_EMAILS` and restart or redeploy the application.
- To remove access, remove the email and restart or redeploy.
- Change booking links from **Admin view → Scheduling**; no deployment is required for those changes.
