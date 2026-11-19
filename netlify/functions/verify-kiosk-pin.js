const crypto = require("crypto");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const expected = process.env.KIOSK_PIN;
  if (!expected) {
    return { statusCode: 503, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "Die Mitarbeiter-PIN ist in Netlify noch nicht eingerichtet." }) };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const supplied = String(body.pin || "");
    if (!/^\d{4,8}$/.test(supplied)) {
      return { statusCode: 401, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "PIN ist falsch." }) };
    }

    const a = Buffer.from(supplied);
    const b = Buffer.from(expected);
    const valid = a.length === b.length && crypto.timingSafeEqual(a, b);
    if (!valid) {
      return { statusCode: 401, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "PIN ist falsch." }) };
    }

    return { statusCode: 200, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }, body: JSON.stringify({ success: true }) };
  } catch (error) {
    return { statusCode: 400, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "Ungültige Anfrage." }) };
  }
};