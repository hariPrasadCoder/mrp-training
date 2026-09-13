import assert from "node:assert/strict";
import test from "node:test";
import { isRateLimited } from "../lib/rate-limit";

test("limits repeated writes from the same forwarded IP", () => {
  const request = new Request("https://example.com/api", {
    headers: { "x-forwarded-for": "203.0.113.9" },
  });
  const scope = `test-${Date.now()}`;
  assert.equal(isRateLimited(request, scope, 2), false);
  assert.equal(isRateLimited(request, scope, 2), false);
  assert.equal(isRateLimited(request, scope, 2), true);
});

test("keeps rate-limit buckets separate by IP", () => {
  const scope = `test-ip-${Date.now()}`;
  const first = new Request("https://example.com/api", {
    headers: { "x-real-ip": "203.0.113.10" },
  });
  const second = new Request("https://example.com/api", {
    headers: { "x-real-ip": "203.0.113.11" },
  });
  assert.equal(isRateLimited(first, scope, 1), false);
  assert.equal(isRateLimited(first, scope, 1), true);
  assert.equal(isRateLimited(second, scope, 1), false);
});
