# MajdataDocs

本项目使用了[NapCatDocs](https://github.com/NapNeko/NapCatDocs)的主题, 并为了干净的提交树, 开了一条新的提交树. 本项目采用和原项目一致的开源协议, 并保留了原项目的署名.

## Thanks

[NapCatDocs](https://github.com/NapNeko/NapCatDocs)

## Deployment

The site is deployed to Cloudflare Pages from GitHub Actions.

### One-time setup

1. Create a Cloudflare API token at **My Profile > API Tokens > Create Token > Custom token** with:
   - **Account > Cloudflare Pages > Edit**
   - **Zone > DNS > Edit** for `majdata.net`
   - **Zone > Zone > Read** for `majdata.net`
2. Copy the Cloudflare account ID from the dashboard.
3. In the GitHub repository, open **Settings > Secrets and variables > Actions** and add:
   - Secret `CLOUDFLARE_API_TOKEN`
   - Secret `CLOUDFLARE_ACCOUNT_ID`
   - Optional variable `CLOUDFLARE_PAGES_PROJECT` (defaults to `majdata-docs`)
4. Run the **Setup Cloudflare Pages** workflow once. It creates the Pages project, deploys the site, attaches `docs.majdata.net`, and points the DNS CNAME at `<project>.pages.dev`.

Wrangler does not expose a Pages custom-domain command, so the setup script uses Wrangler for the project and deployment, then the Cloudflare API for the custom domain and DNS record.

### Continuous deployment

Pushes to `main` build the site and deploy it through `.github/workflows/deploy.yml`. Manual runs are also available from the Actions tab.

`docs.majdata.net` currently resolves to Vercel; the setup workflow replaces that CNAME with the Pages project hostname. DNS and certificate activation can take a few minutes.
