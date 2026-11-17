# MajdataDocs

本项目使用了[NapCatDocs](https://github.com/NapNeko/NapCatDocs)的主题, 并为了干净的提交树, 开了一条新的提交树. 本项目采用和原项目一致的开源协议, 并保留了原项目的署名.

## Thanks

[NapCatDocs](https://github.com/NapNeko/NapCatDocs)

## Deployment

Pushes to `main` build the site and deploy it to Cloudflare Pages through `.github/workflows/deploy.yml`.

Configure these repository secrets and variables:

- Secret `CLOUDFLARE_API_TOKEN`
- Secret `CLOUDFLARE_ACCOUNT_ID`
- Optional variable `CLOUDFLARE_PAGES_PROJECT` (defaults to `majdata-docs`)

The Cloudflare Pages project must exist beforehand, and `docs.majdata.net` should be attached to it in the Cloudflare dashboard. CI does not change DNS records.
