#!/usr/bin/env bash
set -euo pipefail

# Script helper para arrancar SAM local del BFF intentando varios sockets/contextos.
# Uso: ./scripts/start-bff-local.sh [port]

PORT=${1:-3000}
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TEMPLATE="$REPO_ROOT/motivador-app-bff/template.yml"

echo "Repository root: $REPO_ROOT"

function can_contact_docker() {
  # $1 is the docker -H value (e.g. unix:///path)
  if docker -H "$1" info >/dev/null 2>&1; then
    return 0
  fi
  return 1
}

echo "Comprobando docker (cliente y daemon)..."

# 1) Si docker info sin -H funciona, lo usamos
if docker info >/dev/null 2>&1; then
  echo "Docker responde (sin DOCKER_HOST). Usando configuración por defecto."
  unset DOCKER_HOST
  sam --debug local start-api --template "$TEMPLATE" --port "$PORT"
  exit 0
fi

# 2) Si DOCKER_HOST ya está exportado, pruebo con él
if [[ -n "${DOCKER_HOST-}" ]]; then
  echo "DOCKER_HOST está seteado a: $DOCKER_HOST — comprobando..."
  if can_contact_docker "$DOCKER_HOST"; then
    export DOCKER_HOST
    echo "Docker responde vía DOCKER_HOST. Arrancando SAM..."
    sam --debug local start-api --template "$TEMPLATE" --port "$PORT"
    exit 0
  else
    echo "DOCKER_HOST no responde: $DOCKER_HOST"
  fi
fi

# 3) Intenta usar el contexto 'desktop-linux' si existe
if docker context ls 2>/dev/null | grep -q "desktop-linux"; then
  echo "Intentando activar context 'desktop-linux' y comprobar daemon..."
  docker context use desktop-linux >/dev/null 2>&1 || true
  if docker info >/dev/null 2>&1; then
    echo "Docker responde vía context 'desktop-linux'. Arrancando SAM..."
    unset DOCKER_HOST
    sam --debug local start-api --template "$TEMPLATE" --port "$PORT"
    exit 0
  fi
fi

# 4) Probar sockets conocidos (usuario-local y docker run socket)
SOCKS=("$HOME/.docker/run/docker.sock" "$HOME/Library/Containers/com.docker.docker/Data/docker-cli.sock" "/var/run/docker.sock")
for sock in "${SOCKS[@]}"; do
  if [[ -S "$sock" ]]; then
    echo "Probando socket: $sock"
    DOCKER_H="unix://$sock"
    if can_contact_docker "$DOCKER_H"; then
      export DOCKER_HOST="$DOCKER_H"
      echo "Docker responde vía socket $sock. DOCKER_HOST='$DOCKER_HOST'"
      sam --debug local start-api --template "$TEMPLATE" --port "$PORT"
      exit 0
    else
      echo "No responde en socket: $sock"
    fi
  else
    echo "Socket no encontrado: $sock"
  fi
done

echo "No se pudo contactar al daemon Docker usando los métodos automáticos."
echo "Salida diagnóstica:"
echo "- DOCKER_HOST=$DOCKER_HOST"
echo "- docker --version:"
docker --version || true
echo "- docker context ls:"
docker context ls || true
echo "- Sockets verificados:" 
for sock in "${SOCKS[@]}"; do ls -la "$sock" || true; done

echo "Sugerencias:"
echo "- Asegúrate Docker Desktop está corriendo (abre la app y espera)."
echo "- Si quieres forzar un socket válido, exporta DOCKER_HOST antes de ejecutar este script, por ejemplo:" 
echo "  export DOCKER_HOST=unix:///Users/davidzea/.docker/run/docker.sock"
echo "- O ejecuta: docker context use desktop-linux && sam local start-api --template $TEMPLATE --port $PORT"

exit 1
