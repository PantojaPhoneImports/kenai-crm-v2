#!/usr/bin/env bash
# Instala a infraestrutura da Central WhatsApp em Ubuntu 24.04.
# Execute como root: bash install-kenai-vps.sh
set -Eeuo pipefail

BASE_DIR="/opt/kenai"
EVOLUTION_DIR="$BASE_DIR/evolution"
POSTGRES_DIR="$BASE_DIR/postgres"
REDIS_DIR="$BASE_DIR/redis"
NGINX_DIR="$BASE_DIR/nginx"
BACKUP_DIR="$BASE_DIR/backups"
LOG_DIR="$BASE_DIR/logs"
COMPOSE_FILE="$BASE_DIR/docker-compose.yml"
ENV_FILE="$BASE_DIR/.env"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Execute como root: sudo bash install-kenai-vps.sh" >&2
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y ca-certificates curl gnupg lsb-release ufw nginx certbot python3-certbot-nginx openssl
timedatectl set-timezone America/Belem

if ! command -v docker >/dev/null 2>&1; then
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" > /etc/apt/sources.list.d/docker.list
  apt-get update
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi
systemctl enable --now docker

install -d -m 0750 "$EVOLUTION_DIR" "$POSTGRES_DIR" "$REDIS_DIR" "$NGINX_DIR" "$BACKUP_DIR" "$LOG_DIR"

if [[ ! -f "$ENV_FILE" ]]; then
  POSTGRES_PASSWORD=$(openssl rand -hex 32)
  EVOLUTION_API_KEY=$(openssl rand -hex 32)
  cat > "$ENV_FILE" <<EOF
# Altere EVOLUTION_DOMAIN antes de emitir o certificado SSL.
EVOLUTION_DOMAIN=api.seu-dominio.com.br
LETSENCRYPT_EMAIL=admin@seu-dominio.com.br
POSTGRES_DB=evolution
POSTGRES_USER=evolution
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
EVOLUTION_API_KEY=${EVOLUTION_API_KEY}
EOF
  chmod 600 "$ENV_FILE"
fi

cat > "$BASE_DIR/.env.example" <<'EOF'
EVOLUTION_DOMAIN=api.seu-dominio.com.br
LETSENCRYPT_EMAIL=admin@seu-dominio.com.br
POSTGRES_DB=evolution
POSTGRES_USER=evolution
POSTGRES_PASSWORD=gere-uma-senha-forte
EVOLUTION_API_KEY=gere-uma-chave-api-forte
EOF

cat > "$COMPOSE_FILE" <<'EOF'
services:
  postgres:
    image: postgres:16-alpine
    container_name: kenai-postgres
    restart: always
    env_file: .env
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      TZ: America/Belem
    volumes:
      - /opt/kenai/postgres:/var/lib/postgresql/data
    networks: [kenai-internal]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB"]
      interval: 10s
      timeout: 5s
      retries: 10

  redis:
    image: redis:7-alpine
    container_name: kenai-redis
    restart: always
    command: redis-server --appendonly yes --save 60 1000
    volumes:
      - /opt/kenai/redis:/data
    networks: [kenai-internal]
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 10

  evolution:
    image: evoapicloud/evolution-api:latest
    container_name: kenai-evolution
    restart: always
    env_file: .env
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      SERVER_TYPE: http
      SERVER_PORT: 8080
      SERVER_URL: https://${EVOLUTION_DOMAIN}
      CORS_ORIGIN: "*"
      CORS_METHODS: GET,POST,PUT,DELETE,PATCH
      CORS_CREDENTIALS: "true"
      AUTHENTICATION_TYPE: apikey
      AUTHENTICATION_API_KEY: ${EVOLUTION_API_KEY}
      AUTHENTICATION_EXPOSE_IN_FETCH_INSTANCES: "true"
      DATABASE_ENABLED: "true"
      DATABASE_PROVIDER: postgresql
      DATABASE_CONNECTION_URI: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      DATABASE_CONNECTION_CLIENT_NAME: kenai_evolution
      DATABASE_SAVE_DATA_INSTANCE: "true"
      DATABASE_SAVE_DATA_NEW_MESSAGE: "true"
      CACHE_REDIS_ENABLED: "true"
      CACHE_REDIS_URI: redis://redis:6379/1
      CACHE_REDIS_PREFIX_KEY: kenai
      LOG_LEVEL: ERROR,WARN,LOG
      TZ: America/Belem
    volumes:
      - /opt/kenai/evolution:/evolution/instances
      - /opt/kenai/logs:/evolution/logs
    ports:
      - "127.0.0.1:8080:8080"
    expose:
      - "8080"
    networks: [kenai-internal]
    healthcheck:
      test: ["CMD-SHELL", "node -e \"require('http').get('http://127.0.0.1:8080', r => process.exit(r.statusCode < 500 ? 0 : 1)).on('error', () => process.exit(1))\""]
      interval: 20s
      timeout: 10s
      retries: 10
      start_period: 45s

networks:
  kenai-internal:
    name: kenai-internal
    driver: bridge
EOF

set -a
source "$ENV_FILE"
set +a
cat > "$NGINX_DIR/nginx.conf" <<'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name __EVOLUTION_DOMAIN__;
    client_max_body_size 20m;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 300s;
    }
}
EOF
sed -i "s|__EVOLUTION_DOMAIN__|${EVOLUTION_DOMAIN}|g" "$NGINX_DIR/nginx.conf"
ln -sf "$NGINX_DIR/nginx.conf" /etc/nginx/sites-available/kenai-evolution
ln -sf /etc/nginx/sites-available/kenai-evolution /etc/nginx/sites-enabled/kenai-evolution
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable --now nginx

cat > "$BASE_DIR/backup.sh" <<'EOF'
#!/usr/bin/env bash
set -Eeuo pipefail
BASE=/opt/kenai
STAMP=$(date +%Y%m%d-%H%M%S)
DEST="$BASE/backups/$STAMP"
mkdir -p "$DEST"
set -a; source "$BASE/.env"; set +a
docker exec kenai-postgres pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc > "$DEST/evolution.postgres.dump"
tar -C "$BASE" -czf "$DEST/config-and-instances.tar.gz" evolution nginx .env docker-compose.yml
find "$BASE/backups" -mindepth 1 -maxdepth 1 -type d -mtime +30 -exec rm -rf {} +
echo "Backup criado em $DEST"
EOF
chmod 700 "$BASE_DIR/backup.sh"

cat > "$BASE_DIR/restore.sh" <<'EOF'
#!/usr/bin/env bash
set -Eeuo pipefail
[[ $# -eq 1 ]] || { echo "Uso: $0 /opt/kenai/backups/AAAAmmdd-HHMMSS"; exit 1; }
BASE=/opt/kenai; BACKUP="$1"
[[ -f "$BACKUP/evolution.postgres.dump" ]] || { echo "Backup PostgreSQL não encontrado"; exit 1; }
set -a; source "$BASE/.env"; set +a
docker compose -f "$BASE/docker-compose.yml" stop evolution
docker exec -i kenai-postgres pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists < "$BACKUP/evolution.postgres.dump"
tar -C "$BASE" -xzf "$BACKUP/config-and-instances.tar.gz"
docker compose -f "$BASE/docker-compose.yml" up -d
EOF
chmod 700 "$BASE_DIR/restore.sh"

cat > "$BASE_DIR/update.sh" <<'EOF'
#!/usr/bin/env bash
set -Eeuo pipefail
cd /opt/kenai
./backup.sh
docker compose pull
docker compose up -d --remove-orphans
docker image prune -f
EOF
chmod 700 "$BASE_DIR/update.sh"

ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

cd "$BASE_DIR"
docker compose pull
docker compose up -d
echo "Aguardando healthchecks..."
for _ in {1..18}; do
  STATUS=$(docker compose ps --format json 2>/dev/null || true)
  if echo "$STATUS" | grep -q 'kenai-evolution'; then break; fi
  sleep 5
done

echo
echo "=== VERIFICAÇÃO ==="
docker --version
docker compose version
docker compose ps
docker exec kenai-postgres pg_isready -U "$(grep '^POSTGRES_USER=' "$ENV_FILE" | cut -d= -f2)" -d "$(grep '^POSTGRES_DB=' "$ENV_FILE" | cut -d= -f2)"
docker exec kenai-redis redis-cli ping
curl -fsS -o /dev/null -w 'Evolution HTTP: %{http_code}\n' http://127.0.0.1/ || true
echo "Arquivos: $COMPOSE_FILE, $ENV_FILE, $NGINX_DIR/nginx.conf"
echo "Backup: $BASE_DIR/backup.sh | Restore: $BASE_DIR/restore.sh | Atualização: $BASE_DIR/update.sh"
echo "Antes do SSL, edite EVOLUTION_DOMAIN e LETSENCRYPT_EMAIL em $ENV_FILE; depois execute: certbot --nginx -d SEU_DOMINIO"
