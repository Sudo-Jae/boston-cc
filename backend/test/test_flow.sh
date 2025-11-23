#!/usr/bin/env sh
# Basic smoke test for backend contact flow
BASE=${BASE:-http://localhost:3002}
echo "Running smoke tests against $BASE"

NAME="smoke-$(date +%s)"
PAYLOAD="{\"name\":\"$NAME\",\"email\":\"$NAME@local.test\",\"message\":\"smoke test\"}"

echo "POST /api/contact -> should return ok:true"
curl -s -X POST "$BASE/api/contact" -H "Content-Type: application/json" -d "$PAYLOAD" || true

echo "GET /api/messages without token -> should show an unauthorized response (401)"
curl -s -i "$BASE/api/messages" | sed -n '1,4p' || true

echo "GET /api/content -> should return content object"
curl -s -i "$BASE/api/content" | sed -n '1,8p' || true

# Default ADMIN_TOKEN used by the dev server if none provided
ADMIN_TOKEN=${ADMIN_TOKEN:-101}
if [ -n "$ADMIN_TOKEN" ]; then
  echo "GET /api/messages with ADMIN_TOKEN -> should return messages"
  curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "$BASE/api/messages" || true
  # Try PUT content
  echo "PUT /api/content with ADMIN_TOKEN -> should save content"
  curl -s -X PUT "$BASE/api/content" -H "Content-Type: application/json" -H "x-admin-token: $ADMIN_TOKEN" -d '{"heroTitle":{"html":"smoke updates"},"heroSubtitle":{"html":"updated via test"},"aboutText":{"html":"<p>saved via test</p>"}}' || true
  echo "GET /api/content (after PUT) -> verify"
  curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "$BASE/api/content" || true
else
  echo "No ADMIN_TOKEN set, skipping authorized messages check. To test include ADMIN_TOKEN env var"
fi

echo "Done"
