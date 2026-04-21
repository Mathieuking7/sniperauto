/**
 * Email service — Resend
 */
const { Resend } = require("resend");
const { generateClientAttachments } = require("./client-attachments");

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

const FROM = process.env.FROM_EMAIL || "SniperAuto <onboarding@resend.dev>";
const ADMIN_EMAILS = ["contact@sniperauto.fr", "mathieugaillac4@gmail.com"];

async function sendSubscriptionConfirmation(userInfo, plan, billing) {
  const { firstName = "", lastName = "", email } = userInfo;
  const planName = plan === "pro" ? "Pro" : "Essentiel";
  const price = plan === "pro"
    ? (billing === "annual" ? "470" : "49")
    : (billing === "annual" ? "278" : "29");
  const period = billing === "annual" ? "an" : "mois";
  const setupFee = plan === "pro" ? "20" : "50";
  const prenom = firstName || "cher client";

  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `Bienvenue sur SniperAuto — Plan ${planName} activé 🎉`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #ffffff;">

          <!-- Header -->
          <div style="text-align: center; margin-bottom: 36px;">
            <div style="display: inline-block; background: #007AFF; color: white; font-size: 13px; font-weight: 700; padding: 6px 16px; border-radius: 20px; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 16px;">SniperAuto</div>
            <h1 style="font-size: 30px; font-weight: 800; color: #1a1a1a; margin: 0 0 8px;">Bienvenue, ${prenom} ! 🎉</h1>
            <p style="color: #666; font-size: 16px; margin: 0;">Votre abonnement <strong>Plan ${planName}</strong> est confirmé.</p>
          </div>

          <!-- Récap commande -->
          <div style="background: #f5f5f7; border-radius: 20px; padding: 28px; margin-bottom: 28px;">
            <h2 style="font-size: 16px; font-weight: 700; color: #1a1a1a; margin: 0 0 20px; text-transform: uppercase; letter-spacing: 0.05em;">Récapitulatif</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #e0e0e0;">
                <td style="padding: 10px 0; color: #888; font-size: 14px;">Plan</td>
                <td style="padding: 10px 0; text-align: right; font-weight: 700; color: #1a1a1a;">${planName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e0e0e0;">
                <td style="padding: 10px 0; color: #888; font-size: 14px;">Tarif</td>
                <td style="padding: 10px 0; text-align: right; font-weight: 700; color: #1a1a1a;">${price} € / ${period}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #888; font-size: 14px;">Frais de mise en service</td>
                <td style="padding: 10px 0; text-align: right; font-weight: 700; color: #1a1a1a;">${setupFee} €</td>
              </tr>
            </table>
          </div>

          <!-- Prochaine étape -->
          <div style="background: linear-gradient(135deg, #007AFF 0%, #5856d6 100%); border-radius: 20px; padding: 28px; text-align: center; margin-bottom: 28px;">
            <p style="color: rgba(255,255,255,0.8); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 8px;">Prochaine étape</p>
            <p style="color: white; font-size: 18px; font-weight: 700; margin: 0 0 10px;">Notre équipe vous contacte sous 24h</p>
            <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 0; line-height: 1.6;">
              Nous vous appellerons ou enverrons un message WhatsApp pour configurer vos alertes, vos critères de recherche et activer votre compte.
            </p>
          </div>

          <!-- Ce qui vous attend -->
          <div style="margin-bottom: 28px;">
            <h3 style="font-size: 16px; font-weight: 700; color: #1a1a1a; margin: 0 0 16px;">Ce que vous obtenez avec le Plan ${planName} :</h3>
            ${plan === "pro" ? `
            <div style="display: flex; gap: 10px; margin-bottom: 10px; align-items: flex-start;">
              <span style="color: #34c759; font-weight: 700; font-size: 16px; margin-top: 2px;">✓</span>
              <span style="color: #333; font-size: 14px; line-height: 1.5;">Alertes illimitées — toutes les sources (Auto1, LBC, Aramis, La Centrale, Facebook)</span>
            </div>
            <div style="display: flex; gap: 10px; margin-bottom: 10px; align-items: flex-start;">
              <span style="color: #34c759; font-weight: 700; font-size: 16px; margin-top: 2px;">✓</span>
              <span style="color: #333; font-size: 14px; line-height: 1.5;">Scan en temps réel (&lt; 30 secondes)</span>
            </div>
            <div style="display: flex; gap: 10px; margin-bottom: 10px; align-items: flex-start;">
              <span style="color: #34c759; font-weight: 700; font-size: 16px; margin-top: 2px;">✓</span>
              <span style="color: #333; font-size: 14px; line-height: 1.5;">WhatsApp + Email + filtres avancés</span>
            </div>
            <div style="display: flex; gap: 10px; margin-bottom: 10px; align-items: flex-start;">
              <span style="color: #34c759; font-weight: 700; font-size: 16px; margin-top: 2px;">✓</span>
              <span style="color: #333; font-size: 14px; line-height: 1.5;">Support prioritaire WhatsApp</span>
            </div>
            ` : `
            <div style="display: flex; gap: 10px; margin-bottom: 10px; align-items: flex-start;">
              <span style="color: #34c759; font-weight: 700; font-size: 16px; margin-top: 2px;">✓</span>
              <span style="color: #333; font-size: 14px; line-height: 1.5;">Alertes illimitées — 1 canal au choix</span>
            </div>
            <div style="display: flex; gap: 10px; margin-bottom: 10px; align-items: flex-start;">
              <span style="color: #34c759; font-weight: 700; font-size: 16px; margin-top: 2px;">✓</span>
              <span style="color: #333; font-size: 14px; line-height: 1.5;">Scan toutes les heures</span>
            </div>
            <div style="display: flex; gap: 10px; margin-bottom: 10px; align-items: flex-start;">
              <span style="color: #34c759; font-weight: 700; font-size: 16px; margin-top: 2px;">✓</span>
              <span style="color: #333; font-size: 14px; line-height: 1.5;">Alertes WhatsApp · Support par email</span>
            </div>
            `}
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #f0f0f0; padding-top: 20px; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              Des questions ? Répondez à cet email ou contactez-nous sur WhatsApp.<br>
              <strong style="color: #555;">SniperAuto</strong> · contact@sniperauto.fr
            </p>
          </div>
        </div>
      `,
    });
    console.log(`[Email] Confirmation envoyée à ${email}`);
  } catch (err) {
    console.error("[Email] Erreur confirmation:", err.message);
  }
}

async function sendAdminNotification(userInfo, plan, billing) {
  const { firstName = "", lastName = "", email = "", phone = "", companyName = "" } = userInfo;
  const planName = plan === "pro" ? "Pro" : "Essentiel";
  const price = plan === "pro"
    ? (billing === "annual" ? "470" : "49")
    : (billing === "annual" ? "278" : "29");
  const period = billing === "annual" ? "an" : "mois";
  const setupFee = plan === "pro" ? "20" : "50";

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 20px; background: #ffffff;">
      <div style="background: #007AFF; color: white; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 28px;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 800;">🎉 Nouvel abonné SniperAuto !</h1>
        <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.85;">Plan ${planName} · ${price} € / ${period}</p>
      </div>

      <!-- Infos client -->
      <div style="background: #f5f5f7; border-radius: 16px; padding: 24px; margin-bottom: 20px;">
        <h2 style="font-size: 15px; font-weight: 700; color: #1a1a1a; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 0.05em;">Informations client</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #e0e0e0;">
            <td style="padding: 10px 0; color: #888; font-size: 14px; width: 40%;">Prénom</td>
            <td style="padding: 10px 0; font-weight: 600; color: #1a1a1a; font-size: 14px;">${firstName || "—"}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e0e0e0;">
            <td style="padding: 10px 0; color: #888; font-size: 14px;">Nom</td>
            <td style="padding: 10px 0; font-weight: 600; color: #1a1a1a; font-size: 14px;">${lastName || "—"}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e0e0e0;">
            <td style="padding: 10px 0; color: #888; font-size: 14px;">Email</td>
            <td style="padding: 10px 0; font-weight: 600; color: #007AFF; font-size: 14px;"><a href="mailto:${email}" style="color: #007AFF;">${email || "—"}</a></td>
          </tr>
          <tr style="border-bottom: 1px solid #e0e0e0;">
            <td style="padding: 10px 0; color: #888; font-size: 14px;">WhatsApp</td>
            <td style="padding: 10px 0; font-weight: 600; color: #1a1a1a; font-size: 14px;">${phone || "—"}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #888; font-size: 14px;">Entreprise</td>
            <td style="padding: 10px 0; font-weight: 600; color: #1a1a1a; font-size: 14px;">${companyName || "—"}</td>
          </tr>
        </table>
      </div>

      <!-- Récap abonnement -->
      <div style="background: #f5f5f7; border-radius: 16px; padding: 24px; margin-bottom: 20px;">
        <h2 style="font-size: 15px; font-weight: 700; color: #1a1a1a; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 0.05em;">Abonnement</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #e0e0e0;">
            <td style="padding: 10px 0; color: #888; font-size: 14px;">Plan</td>
            <td style="padding: 10px 0; font-weight: 600; color: #1a1a1a; font-size: 14px;">${planName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e0e0e0;">
            <td style="padding: 10px 0; color: #888; font-size: 14px;">Facturation</td>
            <td style="padding: 10px 0; font-weight: 600; color: #1a1a1a; font-size: 14px;">${billing === "annual" ? "Annuelle" : "Mensuelle"}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e0e0e0;">
            <td style="padding: 10px 0; color: #888; font-size: 14px;">Montant</td>
            <td style="padding: 10px 0; font-weight: 700; color: #007AFF; font-size: 14px;">${price} € / ${period}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #888; font-size: 14px;">Frais de mise en service</td>
            <td style="padding: 10px 0; font-weight: 600; color: #1a1a1a; font-size: 14px;">${setupFee} €</td>
          </tr>
        </table>
      </div>

      <div style="background: #fffbeb; border: 1px solid #fcd34d; border-radius: 12px; padding: 16px; text-align: center;">
        <p style="font-size: 14px; font-weight: 700; color: #92400e; margin: 0;">⏰ À contacter sous 24h pour configurer ses alertes WhatsApp</p>
      </div>

      <div style="margin-top: 20px; text-align: center;">
        <p style="color: #999; font-size: 12px; margin: 0;">${new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" })} · SniperAuto</p>
      </div>
    </div>
  `;

  for (const adminEmail of ADMIN_EMAILS) {
    try {
      await resend.emails.send({
        from: FROM,
        to: adminEmail,
        subject: `🎉 Nouvel abonné SniperAuto — ${firstName} ${lastName} (Plan ${planName})`,
        html,
      });
      console.log(`[Email] Notification admin envoyée à ${adminEmail}`);
    } catch (err) {
      console.error(`[Email] Erreur notification admin à ${adminEmail}:`, err.message);
    }
  }
}

async function sendContactRequest(name, email, message) {
  for (const adminEmail of ADMIN_EMAILS) {
    try {
      await resend.emails.send({
        from: FROM,
        to: adminEmail,
        replyTo: email,
        subject: `[SniperAuto] Contact de ${name}`,
        html: `
          <div style="font-family: -apple-system, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h2>Nouvelle demande de contact</h2>
            <p><strong>Nom :</strong> ${name}</p>
            <p><strong>Email :</strong> ${email}</p>
            <p><strong>Message :</strong></p>
            <div style="background: #f5f5f7; border-radius: 12px; padding: 16px; white-space: pre-wrap;">${message}</div>
          </div>
        `,
      });
    } catch (err) {
      console.error("[Email] Erreur contact:", err.message);
    }
  }
  console.log(`[Email] Contact de ${name} (${email}) transmis`);
}

async function sendClientSetupConfirmation(data) {
  const {
    firstName = "", email,
    city = "", radius = "",
    minPrice = 0, maxPrice = "",
    minKm = 0, maxKm = "",
    minYear = "", maxYear = "",
    vehicleType = [], platforms = [],
  } = data;

  const budgetDisplay = (minPrice && minPrice !== 0)
    ? `${minPrice} → ${maxPrice} €`
    : `${maxPrice} €`;

  const anneeDisplay = (maxYear && maxYear !== minYear)
    ? `${minYear} → ${maxYear}`
    : `${minYear}`;

  const vehiclesDisplay = Array.isArray(vehicleType) ? vehicleType.join(", ") : vehicleType;
  const sourcesDisplay = Array.isArray(platforms) ? platforms.join(", ") : platforms;

  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `SniperAuto — Vos alertes sont configurées, ${firstName} !`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #ffffff;">

          <!-- Header -->
          <div style="background: #007AFF; border-radius: 16px; padding: 28px; text-align: center; margin-bottom: 28px;">
            <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff;">Vos alertes SniperAuto sont configurées !</h1>
          </div>

          <!-- Greeting -->
          <p style="font-size: 16px; color: #1a1a1a; margin: 0 0 16px;">Bonjour ${firstName},</p>
          <p style="font-size: 15px; color: #444; line-height: 1.6; margin: 0 0 28px;">Nous avons bien reçu vos critères. Notre équipe va activer vos alertes sous 24h et vous contactera sur WhatsApp pour confirmer.</p>

          <!-- Summary box -->
          <div style="background: #f5f5f7; border-radius: 16px; padding: 24px; margin-bottom: 28px;">
            <h2 style="font-size: 15px; font-weight: 700; color: #1a1a1a; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 0.05em;">Récapitulatif de vos critères</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #e0e0e0;">
                <td style="padding: 10px 0; color: #888; font-size: 14px; width: 40%;">Zone</td>
                <td style="padding: 10px 0; font-weight: 600; color: #1a1a1a; font-size: 14px;">${city}${radius ? ` · ${radius} km` : ""}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e0e0e0;">
                <td style="padding: 10px 0; color: #888; font-size: 14px;">Budget</td>
                <td style="padding: 10px 0; font-weight: 600; color: #1a1a1a; font-size: 14px;">${budgetDisplay}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e0e0e0;">
                <td style="padding: 10px 0; color: #888; font-size: 14px;">Kilométrage</td>
                <td style="padding: 10px 0; font-weight: 600; color: #1a1a1a; font-size: 14px;">${maxKm} km</td>
              </tr>
              <tr style="border-bottom: 1px solid #e0e0e0;">
                <td style="padding: 10px 0; color: #888; font-size: 14px;">Année</td>
                <td style="padding: 10px 0; font-weight: 600; color: #1a1a1a; font-size: 14px;">${anneeDisplay}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e0e0e0;">
                <td style="padding: 10px 0; color: #888; font-size: 14px;">Véhicules</td>
                <td style="padding: 10px 0; font-weight: 600; color: #1a1a1a; font-size: 14px;">${vehiclesDisplay || "—"}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #888; font-size: 14px;">Sources</td>
                <td style="padding: 10px 0; font-weight: 600; color: #1a1a1a; font-size: 14px;">${sourcesDisplay || "—"}</td>
              </tr>
            </table>
          </div>

          <!-- CTA box -->
          <div style="background: linear-gradient(135deg, #007AFF 0%, #5856d6 100%); border-radius: 16px; padding: 24px; margin-bottom: 28px;">
            <p style="color: rgba(255,255,255,0.85); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 8px;">Soyez prêt</p>
            <p style="color: #ffffff; font-size: 15px; line-height: 1.6; margin: 0;">Les meilleures affaires partent en moins d'une heure. Dès qu'une annonce correspond, vous recevrez un message WhatsApp avec photo, prix et lien direct.</p>
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #f0f0f0; padding-top: 20px; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              Des questions ? Répondez à cet email ou WhatsApp<br>
              <strong style="color: #555;">SniperAuto</strong> · contact@sniperauto.fr
            </p>
          </div>
        </div>
      `,
    });
    console.log(`[Email] Confirmation setup envoyée à ${email}`);
  } catch (err) {
    console.error("[Email] Erreur confirmation setup client:", err.message);
  }
}

async function sendClientSetupAdminNotification(data) {
  const {
    firstName = "", lastName = "", email = "", phone = "",
    city = "", radius = "",
    minPrice = 0, maxPrice = "",
    minKm = 0, maxKm = "",
    minYear = "", maxYear = "",
    vehicleType = [], fuel = [], platforms = [],
    sellerType = "", notes = "",
    firstOwner, noAccident, ctValid, zeroDefects,
    evoCities = [], preferredBrands = [], excludedBrands = [],
    keywords = [], excludeKeywords = [],
    gearbox = "",
  } = data;

  const budgetDisplay = (minPrice && minPrice !== 0)
    ? `${minPrice} → ${maxPrice} €`
    : `${maxPrice} €`;

  const anneeDisplay = (maxYear && maxYear !== minYear)
    ? `${minYear} → ${maxYear}`
    : `${minYear}`;

  const qualityFlags = [
    firstOwner ? "1ère main" : null,
    noAccident ? "Sans accident" : null,
    ctValid ? "CT valide" : null,
    zeroDefects ? "Zéro défaut" : null,
  ].filter(Boolean);

  const vehiclesDisplay = Array.isArray(vehicleType) ? vehicleType.join(", ") : vehicleType;
  const fuelDisplay = Array.isArray(fuel) ? fuel.join(", ") : fuel;
  const sourcesDisplay = Array.isArray(platforms) ? platforms.join(", ") : platforms;
  const evoCitiesDisplay = Array.isArray(evoCities) ? evoCities.join(", ") : evoCities;
  const preferredBrandsDisplay = Array.isArray(preferredBrands) ? preferredBrands.join(", ") : preferredBrands;
  const excludedBrandsDisplay = Array.isArray(excludedBrands) ? excludedBrands.join(", ") : excludedBrands;
  const keywordsDisplay = Array.isArray(keywords) ? keywords.join(", ") : keywords;
  const excludeKeywordsDisplay = Array.isArray(excludeKeywords) ? excludeKeywords.join(", ") : excludeKeywords;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 20px; background: #ffffff;">

      <!-- Header -->
      <div style="background: #007AFF; color: white; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 28px;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 800;">Nouveau client à activer</h1>
        <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.85;">${firstName} ${lastName}</p>
      </div>

      <!-- Client info -->
      <div style="background: #f5f5f7; border-radius: 16px; padding: 24px; margin-bottom: 20px;">
        <h2 style="font-size: 15px; font-weight: 700; color: #1a1a1a; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 0.05em;">Informations client</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #e0e0e0;">
            <td style="padding: 10px 0; color: #888; font-size: 14px; width: 40%;">Prénom</td>
            <td style="padding: 10px 0; font-weight: 600; color: #1a1a1a; font-size: 14px;">${firstName || "—"}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e0e0e0;">
            <td style="padding: 10px 0; color: #888; font-size: 14px;">Nom</td>
            <td style="padding: 10px 0; font-weight: 600; color: #1a1a1a; font-size: 14px;">${lastName || "—"}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e0e0e0;">
            <td style="padding: 10px 0; color: #888; font-size: 14px;">Téléphone</td>
            <td style="padding: 10px 0; font-weight: 600; font-size: 14px;"><a href="tel:${phone}" style="color: #007AFF;">${phone || "—"}</a></td>
          </tr>
          <tr style="border-bottom: 1px solid #e0e0e0;">
            <td style="padding: 10px 0; color: #888; font-size: 14px;">Email</td>
            <td style="padding: 10px 0; font-weight: 600; font-size: 14px;"><a href="mailto:${email}" style="color: #007AFF;">${email || "—"}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #888; font-size: 14px;">Type de profil</td>
            <td style="padding: 10px 0; font-weight: 600; color: #1a1a1a; font-size: 14px;">${sellerType || "—"}</td>
          </tr>
        </table>
      </div>

      <!-- Critères -->
      <div style="background: #f5f5f7; border-radius: 16px; padding: 24px; margin-bottom: 20px;">
        <h2 style="font-size: 15px; font-weight: 700; color: #1a1a1a; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 0.05em;">Critères de recherche</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #e0e0e0;">
            <td style="padding: 10px 0; color: #888; font-size: 14px; width: 40%;">Zone</td>
            <td style="padding: 10px 0; font-weight: 600; color: #1a1a1a; font-size: 14px;">${city}${radius ? ` · ${radius} km` : ""}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e0e0e0;">
            <td style="padding: 10px 0; color: #888; font-size: 14px;">Budget</td>
            <td style="padding: 10px 0; font-weight: 600; color: #1a1a1a; font-size: 14px;">${budgetDisplay}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e0e0e0;">
            <td style="padding: 10px 0; color: #888; font-size: 14px;">Km max</td>
            <td style="padding: 10px 0; font-weight: 600; color: #1a1a1a; font-size: 14px;">${maxKm} km</td>
          </tr>
          <tr style="border-bottom: 1px solid #e0e0e0;">
            <td style="padding: 10px 0; color: #888; font-size: 14px;">Année</td>
            <td style="padding: 10px 0; font-weight: 600; color: #1a1a1a; font-size: 14px;">${anneeDisplay}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e0e0e0;">
            <td style="padding: 10px 0; color: #888; font-size: 14px;">Types véhicules</td>
            <td style="padding: 10px 0; font-weight: 600; color: #1a1a1a; font-size: 14px;">${vehiclesDisplay || "—"}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e0e0e0;">
            <td style="padding: 10px 0; color: #888; font-size: 14px;">Carburant</td>
            <td style="padding: 10px 0; font-weight: 600; color: #1a1a1a; font-size: 14px;">${fuelDisplay || "—"}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e0e0e0;">
            <td style="padding: 10px 0; color: #888; font-size: 14px;">Boîte</td>
            <td style="padding: 10px 0; font-weight: 600; color: #1a1a1a; font-size: 14px;">${gearbox || "—"}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #888; font-size: 14px;">Vendeur</td>
            <td style="padding: 10px 0; font-weight: 600; color: #1a1a1a; font-size: 14px;">${sellerType || "—"}</td>
          </tr>
        </table>
      </div>

      ${qualityFlags.length > 0 ? `
      <!-- Qualité -->
      <div style="background: #f5f5f7; border-radius: 16px; padding: 20px 24px; margin-bottom: 20px;">
        <h2 style="font-size: 15px; font-weight: 700; color: #1a1a1a; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.05em;">Qualité</h2>
        <p style="font-size: 14px; color: #1a1a1a; font-weight: 600; margin: 0;">${qualityFlags.join(" · ")}</p>
      </div>
      ` : ""}

      <!-- Sources -->
      <div style="background: #f5f5f7; border-radius: 16px; padding: 20px 24px; margin-bottom: 20px;">
        <h2 style="font-size: 15px; font-weight: 700; color: #1a1a1a; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.05em;">Sources</h2>
        <p style="font-size: 14px; color: #1a1a1a; font-weight: 600; margin: 0 0 ${evoCitiesDisplay ? "8px" : "0"};">${sourcesDisplay || "—"}</p>
        ${evoCitiesDisplay ? `<p style="font-size: 13px; color: #888; margin: 0;">Villes évo : ${evoCitiesDisplay}</p>` : ""}
      </div>

      ${(preferredBrandsDisplay || excludedBrandsDisplay) ? `
      <!-- Marques -->
      <div style="background: #f5f5f7; border-radius: 16px; padding: 20px 24px; margin-bottom: 20px;">
        <h2 style="font-size: 15px; font-weight: 700; color: #1a1a1a; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.05em;">Marques</h2>
        ${preferredBrandsDisplay ? `<p style="font-size: 14px; color: #1a1a1a; margin: 0 0 6px;"><span style="color: #888;">Préférées :</span> <strong>${preferredBrandsDisplay}</strong></p>` : ""}
        ${excludedBrandsDisplay ? `<p style="font-size: 14px; color: #1a1a1a; margin: 0;"><span style="color: #888;">Exclues :</span> <strong>${excludedBrandsDisplay}</strong></p>` : ""}
      </div>
      ` : ""}

      ${(keywordsDisplay || excludeKeywordsDisplay) ? `
      <!-- Mots-clés -->
      <div style="background: #f5f5f7; border-radius: 16px; padding: 20px 24px; margin-bottom: 20px;">
        <h2 style="font-size: 15px; font-weight: 700; color: #1a1a1a; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.05em;">Mots-clés</h2>
        ${keywordsDisplay ? `<p style="font-size: 14px; color: #1a1a1a; margin: 0 0 6px;"><span style="color: #888;">Inclus :</span> <strong>${keywordsDisplay}</strong></p>` : ""}
        ${excludeKeywordsDisplay ? `<p style="font-size: 14px; color: #1a1a1a; margin: 0;"><span style="color: #888;">Exclus :</span> <strong>${excludeKeywordsDisplay}</strong></p>` : ""}
      </div>
      ` : ""}

      ${notes ? `
      <!-- Notes -->
      <div style="background: #f5f5f7; border-radius: 16px; padding: 20px 24px; margin-bottom: 20px;">
        <h2 style="font-size: 15px; font-weight: 700; color: #1a1a1a; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.05em;">Notes</h2>
        <p style="font-size: 14px; color: #444; line-height: 1.6; margin: 0; white-space: pre-wrap;">${notes}</p>
      </div>
      ` : ""}

      <!-- Warning -->
      <div style="background: #fffbeb; border: 1px solid #fcd34d; border-radius: 12px; padding: 16px; text-align: center; margin-bottom: 20px;">
        <p style="font-size: 14px; font-weight: 700; color: #92400e; margin: 0;">A activer sous 24h — contacter le client sur WhatsApp</p>
      </div>

      <!-- Timestamp -->
      <div style="text-align: center;">
        <p style="color: #999; font-size: 12px; margin: 0;">${new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" })} · SniperAuto</p>
      </div>
    </div>
  `;

  // Generate PDF + CSV attachments
  let attachments = [];
  try {
    attachments = await generateClientAttachments(data);
    console.log(`[Email] Attachments générés: ${attachments.map((a) => a.filename).join(", ")}`);
  } catch (err) {
    console.error("[Email] Erreur génération PDF/CSV:", err.message);
  }

  for (const adminEmail of ADMIN_EMAILS) {
    try {
      await resend.emails.send({
        from: FROM,
        to: adminEmail,
        subject: `[SniperAuto] Nouveau client — ${firstName} ${lastName}`,
        html,
        attachments,
      });
      console.log(`[Email] Notification setup admin envoyée à ${adminEmail} (${attachments.length} pièce(s) jointe(s))`);
    } catch (err) {
      console.error(`[Email] Erreur notification setup admin à ${adminEmail}:`, err.message);
    }
  }
}

module.exports = { sendSubscriptionConfirmation, sendAdminNotification, sendContactRequest, sendClientSetupConfirmation, sendClientSetupAdminNotification };
