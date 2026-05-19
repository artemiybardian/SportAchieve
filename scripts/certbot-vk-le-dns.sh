#!/usr/bin/env bash
# Выпуск Let's Encrypt для sportachieve-vk.duckdns.org через DNS-01 (DuckDNS API).
# Обход проблем HTTP-01: у LE бывают таймауты/SERVFAIL при резолве *.duckdns.org.
#
# Требуется: pip-пакет certbot-dns-duckdns (уже ставили: pip3 install --break-system-packages certbot-dns-duckdns)
# Токен: личный кабинет https://www.duckdns.org/ → «token»
#
#   export DUCKDNS_TOKEN='ваш_токен'
#   sudo -E ./scripts/certbot-vk-le-dns.sh
#
# Учётные данные сохраняются в /etc/letsencrypt/duckdns-credentials.ini (chmod 600) — нужно для certbot renew.

set -euo pipefail

DOMAIN="${1:-sportachieve-vk.duckdns.org}"
EMAIL="${CERTBOT_EMAIL:-admin@${DOMAIN}}"
CRED_FILE="/etc/letsencrypt/duckdns-credentials.ini"

if [[ -z "${DUCKDNS_TOKEN:-}" ]]; then
  echo "Задайте DUCKDNS_TOKEN (см. duckdns.org) и запустите с sudo -E:"
  echo "  export DUCKDNS_TOKEN='…'"
  echo "  sudo -E $0"
  exit 1
fi

umask 077
printf 'dns_duckdns_token = %s\n' "${DUCKDNS_TOKEN}" >"$CRED_FILE"
chmod 600 "$CRED_FILE"

certbot certonly \
  --non-interactive \
  --agree-tos \
  -m "$EMAIL" \
  --authenticator dns-duckdns \
  --dns-duckdns-credentials "$CRED_FILE" \
  --dns-duckdns-propagation-seconds 90 \
  -d "$DOMAIN"

certbot install \
  --nginx \
  --cert-name "$DOMAIN" \
  -d "$DOMAIN" \
  --non-interactive

echo "Готово: проверьте https://${DOMAIN}/ и sudo nginx -t"
