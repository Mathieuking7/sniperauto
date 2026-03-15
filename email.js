/**
 * Email service — Resend
 */
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.FROM_EMAIL || "SniperAuto <onboarding@resend.dev>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "sosparebrise34.contact@gmail.com";

async function sendSubscriptionConfirmation(email, plan, billing) {
  const planName = plan === "pro" ? "Pro" : "Essentiel";
  const price = plan === "pro" ? (billing === "annual" ? "470" : "49") : (billing === "annual" ? "278" : "29");
  const period = billing === "annual" ? "an" : "mois";
  const setupFee = plan === "pro" ? "20" : "50";

  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `Bienvenue sur SniperAuto - Plan ${planName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-size: 28px; font-weight: 800; color: #1a1a1a; margin: 0;">SniperAuto</h1>
            <p style="color: #007AFF; font-size: 14px; margin-top: 4px;">Vos deals auto, livres sur WhatsApp</p>
          </div>
          <div style="background: #f5f5f7; border-radius: 16px; padding: 32px; margin-bottom: 24px;">
            <h2 style="font-size: 22px; color: #1a1a1a; margin: 0 0 16px;">Merci pour votre abonnement !</h2>
            <p style="color: #555; line-height: 1.6; margin: 0 0 20px;">
              Votre abonnement <strong>Plan ${planName}</strong> est maintenant actif.
            </p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #888; font-size: 14px;">Plan</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1a1a1a;">${planName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #888; font-size: 14px;">Tarif</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1a1a1a;">${price} EUR/${period}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #888; font-size: 14px;">Frais de mise en service</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1a1a1a;">${setupFee} EUR</td>
              </tr>
            </table>
          </div>
          <div style="background: #007AFF; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <p style="color: white; font-size: 16px; margin: 0 0 8px; font-weight: 600;">Prochaine etape</p>
            <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 0; line-height: 1.5;">
              Un membre de notre equipe vous contactera sous 24h pour configurer vos alertes WhatsApp et vos criteres de recherche.
            </p>
          </div>
          <p style="color: #999; font-size: 12px; text-align: center;">
            SniperAuto — sniperauto.fr
          </p>
        </div>
      `,
    });
    console.log(`[Email] Confirmation envoyee a ${email}`);
  } catch (err) {
    console.error("[Email] Erreur confirmation:", err.message);
  }
}

async function sendAdminNotification(email, plan, billing) {
  const planName = plan === "pro" ? "Pro" : "Essentiel";
  const price = plan === "pro" ? (billing === "annual" ? "470" : "49") : (billing === "annual" ? "278" : "29");
  const period = billing === "annual" ? "an" : "mois";

  try {
    await resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: `Nouvel abonne SniperAuto - Plan ${planName}`,
      html: `
        <div style="font-family: -apple-system, sans-serif; padding: 20px;">
          <h2>Nouvel abonne !</h2>
          <p><strong>Email :</strong> ${email}</p>
          <p><strong>Plan :</strong> ${planName}</p>
          <p><strong>Tarif :</strong> ${price} EUR/${period}</p>
          <p><strong>Date :</strong> ${new Date().toLocaleString("fr-FR")}</p>
        </div>
      `,
    });
    console.log(`[Email] Notification admin envoyee`);
  } catch (err) {
    console.error("[Email] Erreur notification admin:", err.message);
  }
}

async function sendContactRequest(name, email, message) {
  try {
    await resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      replyTo: email,
      subject: `[SniperAuto] Contact de ${name}`,
      html: `
        <div style="font-family: -apple-system, sans-serif; padding: 20px;">
          <h2>Nouvelle demande de contact</h2>
          <p><strong>Nom :</strong> ${name}</p>
          <p><strong>Email :</strong> ${email}</p>
          <p><strong>Message :</strong></p>
          <div style="background: #f5f5f7; border-radius: 12px; padding: 16px; white-space: pre-wrap;">${message}</div>
        </div>
      `,
    });
    console.log(`[Email] Contact de ${name} (${email}) transmis`);
  } catch (err) {
    console.error("[Email] Erreur contact:", err.message);
  }
}

module.exports = { sendSubscriptionConfirmation, sendAdminNotification, sendContactRequest };
