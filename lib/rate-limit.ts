type Bucket = { count: number; resetsAt: number };

const buckets = new Map<string, Bucket>();

export function isRateLimited(
  request: Request,
  scope: string,
  limit = 60,
  windowMs = 60_000,
) {
  const forwarded = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "unknown";
  const key = `${scope}:${ip}`;
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetsAt <= now) {
    buckets.set(key, { count: 1, resetsAt: now + windowMs });
    if (buckets.size > 5_000)
      for (const [entryKey, entry] of buckets)
        if (entry.resetsAt <= now) buckets.delete(entryKey);
    return false;
  }
  bucket.count += 1;
  return bucket.count > limit;
}
