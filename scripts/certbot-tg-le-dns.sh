#!/usr/bin/env bash
# Let's Encrypt для sportachieve-tg.duckdns.org (DNS-01 / DuckDNS). См. certbot-vk-le-dns.sh.
set -euo pipefail
exec "$(dirname "$0")/certbot-vk-le-dns.sh" sportachieve-tg.duckdns.org
