#!/usr/bin/env bash
set -euo pipefail

fail() {
  echo "error: $*" >&2
  exit 1
}

: "${CLOUDFLARE_API_TOKEN:?CLOUDFLARE_API_TOKEN is required}"
: "${CLOUDFLARE_ACCOUNT_ID:?CLOUDFLARE_ACCOUNT_ID is required}"

PROJECT="${CLOUDFLARE_PAGES_PROJECT:-majdata-docs}"
DOMAIN="${CLOUDFLARE_PAGES_DOMAIN:-docs.majdata.net}"
ZONE_NAME="${CLOUDFLARE_ZONE_NAME:-majdata.net}"
ZONE_ID="${CLOUDFLARE_ZONE_ID:-}"
API="https://api.cloudflare.com/client/v4"

command -v curl >/dev/null 2>&1 || fail "curl is required"
command -v jq >/dev/null 2>&1 || fail "jq is required"
command -v pnpm >/dev/null 2>&1 || fail "pnpm is required"

[ -d "src/.vitepress/dist" ] || fail "src/.vitepress/dist does not exist; run pnpm build first"

cf() {
  local method="$1"
  local path="$2"
  local body="${3:-}"
  local response
  local args=(
    -sS
    -X "$method"
    "$API$path"
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN"
    -H "Content-Type: application/json"
  )

  if [[ -n "$body" ]]; then
    args+=(--data "$body")
  fi

  response="$(curl "${args[@]}")"
  if ! jq -e '.success == true' >/dev/null 2>&1 <<<"$response"; then
    printf '%s\n' "$response" >&2
    fail "Cloudflare API $method $path failed"
  fi
  printf '%s' "$response"
}

echo "Ensuring Cloudflare Pages project '$PROJECT' exists..."
PROJECTS="$(pnpm dlx wrangler@4 pages project list)"
if ! grep -Fq "$PROJECT" <<<"$PROJECTS"; then
  pnpm dlx wrangler@4 pages project create "$PROJECT" --production-branch=main
fi

echo "Deploying src/.vitepress/dist to Cloudflare Pages..."
pnpm dlx wrangler@4 pages deploy src/.vitepress/dist --project-name="$PROJECT" --branch=main

echo "Attaching custom domain '$DOMAIN'..."
DOMAINS="$(cf GET "/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/$PROJECT/domains")"
if ! jq -e --arg domain "$DOMAIN" '.result[]? | select(.name == $domain)' >/dev/null <<<"$DOMAINS"; then
  cf POST "/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/$PROJECT/domains" \
    "$(jq -nc --arg name "$DOMAIN" '{name: $name}')" >/dev/null
fi

if [[ -z "$ZONE_ID" ]]; then
  if ! ZONES="$(cf GET "/zones?name=$ZONE_NAME" 2>/dev/null)"; then
    fail "cannot query zone '$ZONE_NAME'; grant Zone:Read or set CLOUDFLARE_ZONE_ID"
  fi
  ZONE_ID="$(jq -r '.result[0].id // empty' <<<"$ZONES")"
fi

if [[ -z "$ZONE_ID" ]]; then
  fail "zone '$ZONE_NAME' was not found; add a CNAME manually: $DOMAIN -> $PROJECT.pages.dev"
fi

echo "Pointing '$DOMAIN' at '$PROJECT.pages.dev'..."
RECORDS="$(cf GET "/zones/$ZONE_ID/dns_records?type=CNAME&name=$DOMAIN")"
RECORD_ID="$(jq -r '.result[0].id // empty' <<<"$RECORDS")"
RECORD="$(jq -nc \
  --arg name "$DOMAIN" \
  --arg content "$PROJECT.pages.dev" \
  '{type: "CNAME", name: $name, content: $content, proxied: true, ttl: 1}')"

if [[ -n "$RECORD_ID" ]]; then
  cf PUT "/zones/$ZONE_ID/dns_records/$RECORD_ID" "$RECORD" >/dev/null
else
  cf POST "/zones/$ZONE_ID/dns_records" "$RECORD" >/dev/null
fi

echo
echo "Done."
echo "Pages URL:  https://$PROJECT.pages.dev"
echo "Custom URL: https://$DOMAIN"
echo "DNS and certificate activation can take a few minutes."
