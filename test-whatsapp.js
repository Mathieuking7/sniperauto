require("dotenv").config();
const { sendWhatsApp } = require("./whatsapp");

async function main() {
  const ok = await sendWhatsApp("🚗 Test Auto1 Monitor\n\nSi tu reçois ce message, le monitoring fonctionne !");
  console.log("Résultat:", ok);
}
main();
