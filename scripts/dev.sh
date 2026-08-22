#!/usr/bin/env bash
# Local dev orchestration for Play.Frontend and its sibling repos.
#
# Starts Play.Infra (mongo/rabbitmq/seq/jaeger/prometheus via docker compose),
# the four .NET microservices (Catalog, Identity, Inventory, Trading), then
# runs the frontend dev server in the foreground. Ctrl+C stops the .NET
# services; the docker infra is left running (stop it with `dev.sh down`).
#
# Usage:
#   scripts/dev.sh [up]         Start infra + backend services + frontend (default)
#   scripts/dev.sh down         Stop backend services and docker infra
#   scripts/dev.sh status       Show what's currently running
#   scripts/dev.sh logs <name>  Tail a backend service's log (catalog|identity|inventory|trading)
#
# Flags (for `up`):
#   --skip-infra   Don't touch docker compose (assume mongo/rabbitmq already running)
#
# Written against bash 3.2 (macOS default) — no associative arrays.

set -euo pipefail

FRONTEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ROOT_DIR="$(cd "$FRONTEND_DIR/.." && pwd)"
INFRA_DIR="$ROOT_DIR/Play.Infra"
DEV_DIR="$FRONTEND_DIR/.dev"
LOG_DIR="$DEV_DIR/logs"
PID_DIR="$DEV_DIR/pids"

SERVICE_NAMES="catalog identity inventory trading"

service_repo() {
  case "$1" in
    catalog) echo "Play.Catalog" ;;
    identity) echo "Play.Identity" ;;
    inventory) echo "Play.Inventory" ;;
    trading) echo "Play.Trading" ;;
    *) return 1 ;;
  esac
}

service_project() {
  case "$1" in
    catalog) echo "src/Play.Catalog.Service/Play.Catalog.Service.csproj" ;;
    identity) echo "src/Play.Identity.Service/Play.Identity.Service.csproj" ;;
    inventory) echo "src/Play.Inventory.Service/Play.Inventory.Service.csproj" ;;
    trading) echo "src/Play.Trading.Service/Play.Trading.Service.csproj" ;;
    *) return 1 ;;
  esac
}

service_profile() {
  case "$1" in
    catalog) echo "https" ;;
    identity) echo "Play.Identity.Service" ;;
    inventory) echo "Play.Inventory.Service" ;;
    trading) echo "Play.Trading.Service" ;;
    *) return 1 ;;
  esac
}

service_url() {
  case "$1" in
    catalog) echo "https://localhost:5001/swagger" ;;
    identity) echo "https://localhost:5003/swagger" ;;
    inventory) echo "https://localhost:5005/swagger" ;;
    trading) echo "https://localhost:5007/swagger" ;;
    *) return 1 ;;
  esac
}

log()  { printf '\033[1;34m[dev]\033[0m %s\n' "$1"; }
warn() { printf '\033[1;33m[dev]\033[0m %s\n' "$1"; }
err()  { printf '\033[1;31m[dev]\033[0m %s\n' "$1" >&2; }

check_prereqs() {
  local missing=()
  command -v dotnet >/dev/null 2>&1 || missing+=("dotnet")
  command -v npm >/dev/null 2>&1 || missing+=("npm")
  command -v docker >/dev/null 2>&1 || missing+=("docker")
  if [ ${#missing[@]} -gt 0 ]; then
    err "Missing required tools: ${missing[*]}"
    exit 1
  fi
  for name in $SERVICE_NAMES; do
    local repo_dir="$ROOT_DIR/$(service_repo "$name")"
    if [ ! -d "$repo_dir" ]; then
      err "Expected sibling repo not found: $repo_dir"
      exit 1
    fi
  done
  if [ ! -d "$INFRA_DIR" ]; then
    err "Expected sibling repo not found: $INFRA_DIR"
    exit 1
  fi
}

wait_for_port() {
  local host="$1" port="$2" label="$3" tries=60
  until (exec 3<>"/dev/tcp/$host/$port") 2>/dev/null; do
    tries=$((tries - 1))
    if [ "$tries" -le 0 ]; then
      err "Timed out waiting for $label on $host:$port"
      return 1
    fi
    sleep 1
  done
  exec 3<&- 3>&- 2>/dev/null || true
}

start_infra() {
  log "Starting Play.Infra (mongo, rabbitmq, seq, jaeger, prometheus)..."
  (cd "$INFRA_DIR" && docker compose up -d)
  log "Waiting for mongo (27017) and rabbitmq (5672)..."
  wait_for_port localhost 27017 mongo
  wait_for_port localhost 5672 rabbitmq
}

start_service() {
  local name="$1"
  local repo_dir="$ROOT_DIR/$(service_repo "$name")"
  local project="$repo_dir/$(service_project "$name")"
  local profile
  profile="$(service_profile "$name")"
  local log_file="$LOG_DIR/$name.log"
  local pid_file="$PID_DIR/$name.pid"

  if [ -f "$pid_file" ] && kill -0 "$(cat "$pid_file")" 2>/dev/null; then
    warn "$(service_repo "$name") already running (pid $(cat "$pid_file")), skipping."
    return
  fi

  log "Starting $(service_repo "$name") (log: .dev/logs/$name.log)..."
  (
    cd "$repo_dir"
    dotnet run --project "$project" --launch-profile "$profile" \
      > "$log_file" 2>&1 &
    echo $! > "$pid_file"
  )
}

start_backend() {
  mkdir -p "$LOG_DIR" "$PID_DIR"
  for name in $SERVICE_NAMES; do
    start_service "$name"
  done
  log "Backend services starting in the background. First run may take a while to build."
  for name in $SERVICE_NAMES; do
    log "  $(service_repo "$name"): $(service_url "$name")"
  done
}

stop_backend() {
  if [ ! -d "$PID_DIR" ]; then
    return
  fi
  for name in $SERVICE_NAMES; do
    local pid_file="$PID_DIR/$name.pid"
    if [ -f "$pid_file" ]; then
      local pid
      pid="$(cat "$pid_file")"
      if kill -0 "$pid" 2>/dev/null; then
        log "Stopping $(service_repo "$name") (pid $pid)..."
        kill "$pid" 2>/dev/null || true
        wait "$pid" 2>/dev/null || true
      fi
      rm -f "$pid_file"
    fi
  done
}

cmd_up() {
  local skip_infra=false
  for arg in "$@"; do
    case "$arg" in
      --skip-infra) skip_infra=true ;;
      *) err "Unknown flag: $arg"; exit 1 ;;
    esac
  done

  check_prereqs
  if [ "$skip_infra" = false ]; then
    start_infra
  else
    log "Skipping docker infra (--skip-infra)."
  fi
  start_backend

  trap 'echo; log "Stopping backend services (infra left running — use \"dev.sh down\" to stop it too)..."; stop_backend' EXIT INT TERM

  log "Starting frontend dev server (http://localhost:3000)..."
  (cd "$FRONTEND_DIR" && npm start)
}

cmd_down() {
  stop_backend
  if [ -d "$INFRA_DIR" ]; then
    log "Stopping Play.Infra..."
    (cd "$INFRA_DIR" && docker compose down)
  fi
}

cmd_status() {
  for name in $SERVICE_NAMES; do
    local pid_file="$PID_DIR/$name.pid"
    if [ -f "$pid_file" ] && kill -0 "$(cat "$pid_file")" 2>/dev/null; then
      printf '%-10s running (pid %s) — %s\n' "$name" "$(cat "$pid_file")" "$(service_url "$name")"
    else
      printf '%-10s stopped\n' "$name"
    fi
  done
  echo
  (cd "$INFRA_DIR" && docker compose ps) 2>/dev/null || true
}

cmd_logs() {
  local name="${1:-}"
  if [ -z "$name" ] || ! service_repo "$name" >/dev/null 2>&1; then
    err "Usage: dev.sh logs <${SERVICE_NAMES// /|}>"
    exit 1
  fi
  tail -f "$LOG_DIR/$name.log"
}

main() {
  local cmd="${1:-up}"
  [ $# -gt 0 ] && shift
  case "$cmd" in
    up) cmd_up "$@" ;;
    down) cmd_down "$@" ;;
    status) cmd_status "$@" ;;
    logs) cmd_logs "$@" ;;
    *) err "Unknown command: $cmd"; exit 1 ;;
  esac
}

main "$@"
