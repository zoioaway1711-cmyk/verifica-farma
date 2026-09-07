import { getStore } from "@netlify/blobs";

const json = (statusCode, body) =>
  new Response(JSON.stringify(body), {
    status: statusCode,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
const text = (value, max) =>
  String(value || "")
    .trim()
    .slice(0, max);

export default async (request, context) => {
  if (request.method !== "POST")
    return json(405, { error: "method_not_allowed" });
  let input;
  try {
    input = await request.json();
  } catch {
    return json(400, { error: "invalid_json" });
  }
  const serial = text(input.serial, 32);
  if (!/^[0-9]{5,8}$/.test(serial))
    return json(400, { error: "invalid_serial" });
  const activatedAt = new Date().toISOString();
  const ip = text(
    request.headers.get("x-nf-client-connection-ip") || context.ip || "unknown",
    64,
  );
  const record = {
    id: crypto.randomUUID(),
    activatedAt,
    ip,
    serial,
    profileId: text(input.profileId, 64) || "anonymous",
    product: text(input.product, 160),
    maker: text(input.maker, 120),
    lot: text(input.lot, 80),
    status: ["authentic", "invalid", "not_found"].includes(input.status)
      ? input.status
      : "not_found",
    credited: Boolean(input.credited),
    language: text(input.language, 8),
    userAgent: text(request.headers.get("user-agent"), 300),
  };
  const store = getStore({
    name: "verification-events",
    consistency: "strong",
  });
  await store.setJSON(`event:${activatedAt}:${record.id}`, record);
  return json(201, { saved: true, id: record.id, activatedAt });
};
