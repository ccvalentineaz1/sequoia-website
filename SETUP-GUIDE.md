# Sequoia website editor: setup guide (for you, the site owner)

Nothing here changes the live website until Part 6. Parts 1-5 use a separate test site.

What you need: your GitHub account, your Netlify account, and the client's email address.

---

## Part 1: Put the project on GitHub (private)

1. Unzip `sequoia-cms.zip` on your computer.
2. Go to github.com and sign in. Click the **+** (top right) > **New repository**.
3. Name it `sequoia-assisted-living-site`. Choose **Private**. Leave every checkbox empty (no README). Click **Create repository**.
4. On the next page click **uploading an existing file**.
5. Open the unzipped folder, select everything inside it (the folders `admin`, `content`, `developer`, `images`, `templates` and the files `build.js`, `netlify.toml`, and the two guides) and drag it all into the browser window.
6. Wait for the upload to finish, then click **Commit changes**.

Write down the repo name exactly as GitHub shows it: `YOUR-GITHUB-NAME/sequoia-assisted-living-site`.

## Part 2: Create the "sign-in" connection (GitHub OAuth app)

This is what lets the editor ask GitHub "is this person allowed to edit?".

1. On GitHub click your profile picture > **Settings** > scroll to the bottom of the left menu > **Developer settings** > **OAuth Apps** > **New OAuth App**.
2. Fill in:
   - Application name: `Sequoia Website Editor`
   - Homepage URL: `https://sequoiaassistedliving.com` (any valid address works)
   - Authorization callback URL: `https://api.netlify.com/auth/done` (type this exactly)
3. Click **Register application**.
4. Copy the **Client ID**. Click **Generate a new client secret** and copy the secret right away. GitHub will not show it again. Keep both somewhere private.

## Part 3: Build a TEST site on Netlify (the live site is not touched)

1. In Netlify click **Add new project** > **Import an existing project** > **GitHub**.
2. If asked, allow Netlify to access GitHub and choose **only** the `sequoia-assisted-living-site` repo.
3. Pick that repo. The build settings fill in by themselves (`node build.js`, publish folder `dist`). Click **Deploy**.
4. When it finishes, note the test address (something like `https://cheerful-name-123.netlify.app`).
5. In this test site open **Project configuration > Environment variables** > **Add a variable**:
   - Key: `CMS_REPO`
   - Value: `YOUR-GITHUB-NAME/sequoia-assisted-living-site` (exactly as in Part 1)
6. Still in Project configuration, open **Security** (it may be labelled **Access & security**) and find **OAuth** > **Authentication Providers** > **Install provider** > **GitHub**. Paste the Client ID and Client Secret from Part 2 and save.
7. Go to **Deploys** > **Trigger deploy** > **Deploy project without cache** so the repo name is picked up.

## Part 4: Check that sign-in works (do this before going live)

1. Visit `https://YOUR-TEST-SITE.netlify.app/` and confirm the site looks right.
2. Visit `https://YOUR-TEST-SITE.netlify.app/admin/` and click **Login with GitHub**. Allow pop-ups if your browser asks.
3. GitHub asks you to **Authorize Sequoia Website Editor**. Click authorize. The editor should open with a list called **Website Content**.
4. Open **1. Top of Page**, add a word to the headline, click **Publish > Publish now**.
5. Within a minute: GitHub shows a new commit, Netlify shows a new deploy, and the test site shows your change.
6. Change the headline back and publish again.

If all of that worked, sign-in is verified. If something went wrong, see "If something goes wrong" below.

## Part 5: Give your client access (editing only)

1. Your client creates their own free GitHub account (github.com > Sign up) and turns on two-step sign-in (Settings > Password and authentication).
2. In your repo go to **Settings > Collaborators > Add people**, enter their GitHub username or email, and choose the **Write** role.
3. They accept the invitation email from GitHub.
4. They go to `/admin` on the site, click **Login with GitHub**, and authorize the app once.

What they get: the ability to edit and publish website content. What they do not get: no Netlify account or seat, no billing, no domain or DNS settings, no repo settings, no access to your OAuth secret.

An honest limit: "Write" access means that, in theory, someone who knows GitHub could edit any file in the repo directly, not just through the editor. The editor is a convenience, not a lock. To remove access at any time: repo **Settings > Collaborators** > remove them.

## Part 6: Switch the real website over (only after you approve)

1. In your **existing live** Netlify site open **Project configuration > Build & deploy > Continuous deployment** (it may be under **Developer settings**) > **Link repository** > GitHub > your repo, branch `main`.
2. Add the `CMS_REPO` variable here too (same as Part 3, step 5).
3. Install the GitHub OAuth provider on this site too (same as Part 3, step 6). The setting belongs to each Netlify site separately. You can reuse the same Client ID and secret.
4. Deploy. The first build replaces the live site with the new build. In testing it was pixel-identical to the current one at desktop, tablet and phone widths.
5. Visit `https://sequoiaassistedliving.com/admin/` and repeat the Part 4 sign-in check.
6. Delete the test site (its **Project configuration > General > Delete project**).

## If something goes wrong

- **Editor says it can't load settings / repo not found:** `CMS_REPO` is missing or mistyped. Fix it and redeploy without cache.
- **Pop-up shows a Netlify error about the provider:** the OAuth provider isn't installed on that Netlify site, or the Client ID/secret was pasted wrong. Reinstall it.
- **Signed in but the editor shows nothing or errors:** the GitHub account isn't a collaborator with Write access yet, or the invitation wasn't accepted.
- **Nothing happens when clicking Login:** the browser blocked the pop-up. Allow it and try again.
- **Sign-in still fails after those checks:** tell me. The fallback is a small free sign-in helper on Cloudflare, which I can add to the project.

## Undo a bad edit

GitHub repo > **Commits** > click the commit > **Revert**, or in Netlify > **Deploys**, open an older successful deploy and click **Publish deploy**.

## Good to know

- Every Publish is one commit and one Netlify deploy. Third-party sources report that new Netlify Free accounts get 300 credits a month and each successful production deploy costs about 15, so roughly 20 publishes a month. Check **Usage** in your Netlify account for your own plan. Failed builds don't cost credits.
- The contact form still sends to the address in `developer/settings.json`. The client cannot change that in the editor.
- Footer services list: it shows the first four services using the optional "short name" on each service card (so it reads "Personal Care", "Memory Care", and so on, exactly like today). If a short name is blank it uses the full card title.
- The copyright year now updates itself every January.
