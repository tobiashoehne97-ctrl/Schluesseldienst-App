const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "Schlüsseldienst Höhne <onboarding@resend.dev>";

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const { email, entry, html } = JSON.parse(event.body || "{}");

    if (!RESEND_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "E-Mail-Service ist noch nicht konfiguriert. RESEND_API_KEY fehlt in Netlify." })
      };
    }

    if (!email || !entry || !html) {
      return { statusCode: 400, body: JSON.stringify({ error: "E-Mail-Adresse oder Regiebericht fehlt." }) };
    }

    const customer = [entry.vorname, entry.nachname].filter(Boolean).join(" ") || "Kunde";
    const date = entry.datum ? entry.datum.split("-").reverse().join(".") : "";

    const emailHtml = `
      <div style="font-family:Arial,Helvetica,sans-serif;color:#172033;line-height:1.5">
        <h2 style="color:#164b7d">Schlüsseldienst Christian Höhne</h2>
        <p>Guten Tag ${customer},</p>
        <p>anbei erhalten Sie den Regiebericht zu unserem Einsatz vom ${date}.</p>
        <p>Mit freundlichen Grüßen<br><strong>Schlüsseldienst Christian Höhne</strong></p>
      </div>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + RESEND_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject: "Regiebericht – Schlüsseldienst Christian Höhne",
        html: emailHtml
      })
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: result.message || result.name || "E-Mail-Versand fehlgeschlagen." })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, id: result.id || null })
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Unbekannter Fehler beim E-Mail-Versand." })
    };
  }
};
