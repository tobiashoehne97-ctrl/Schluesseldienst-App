const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "Schlüsseldienst Höhne <onboarding@resend.dev>";

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const { email, cc, entry, pdfBase64, filename } = JSON.parse(event.body || "{}");

    if (!RESEND_API_KEY) {
      return { statusCode: 500, body: JSON.stringify({ error: "E-Mail-Service ist noch nicht konfiguriert. Bitte RESEND_API_KEY in Netlify hinterlegen." }) };
    }
    if (!email || !entry || !pdfBase64) {
      return { statusCode: 400, body: JSON.stringify({ error: "Empfänger, Berichtsdaten oder PDF-Anhang fehlen." }) };
    }

    const customer = [entry.vorname, entry.nachname].filter(Boolean).join(" ").trim() || "Kunde";
    const date = entry.datum ? entry.datum.split("-").reverse().join(".") : "";
    const safeCustomer = customer.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
    const recipients = [email];
    const ccList = cc && cc !== email ? [cc] : [];

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + RESEND_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: recipients,
        ...(ccList.length ? { cc: ccList } : {}),
        subject: "Regiebericht – " + (entry.nr || "Schlüsseldienst Christian Höhne"),
        html: `
          <div style="font-family:Arial,Helvetica,sans-serif;color:#172033;line-height:1.5">
            <h2 style="color:#164b7d">Schlüsseldienst Christian Höhne</h2>
            <p>Guten Tag ${safeCustomer},</p>
            <p>anbei erhalten Sie den Regiebericht zu unserem Einsatz vom ${date} als PDF.</p>
            <p>Mit freundlichen Grüßen<br><strong>Schlüsseldienst Christian Höhne</strong></p>
          </div>
        `,
        attachments: [{
          filename: filename || "Regiebericht.pdf",
          content: pdfBase64
        }]
      })
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { statusCode: response.status, body: JSON.stringify({ error: result.message || result.name || "E-Mail-Versand fehlgeschlagen." }) };
    }

    return { statusCode: 200, body: JSON.stringify({ success: true, id: result.id || null }) };
  } catch (error) {
    console.error("Regiebericht-E-Mail:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message || "Unbekannter Fehler beim E-Mail-Versand." }) };
  }
};
