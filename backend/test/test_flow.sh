#!/usr/bin/env sh
# Basic smoke test for backend contact flow
BASE=${BASE:-http://localhost:3002}
echo "Running smoke tests against $BASE"

NAME="smoke-$(date +%s)"
PAYLOAD="{\"name\":\"$NAME\",\"email\":\"$NAME@local.test\",\"message\":\"smoke test\"}"

echo "POST /api/contact -> should return ok:true"
curl -s -X POST "$BASE/api/contact" -H "Content-Type: application/json" -d "$PAYLOAD" | jq || true

echo "GET /api/messages without ADMIN_TOKEN -> should be 403"
curl -s -i "$BASE/api/messages" | sed -n '1,4p'

if [ -n "$ADMIN_TOKEN" ]; then
  echo "GET /api/messages with ADMIN_TOKEN -> should return messages"
  curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "$BASE/api/messages" | jq '.messages | length'
else
  echo "No ADMIN_TOKEN set, skipping authorized messages check. To test include ADMIN_TOKEN env var"
fi

echo "Done"
