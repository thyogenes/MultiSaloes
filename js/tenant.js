let currentSalon = null;

async function loadSalon() {
  const salonId = getSalonIdFromURL();
  if (!salonId) return;

  const doc = await db.collection("salons").doc(salonId).get();

  if (!doc.exists) {
    document.body.innerHTML = "<h2>Salão não encontrado</h2>";
    return;
  }

  currentSalon = doc.data();

  if (currentSalon.status !== "active") {
    document.body.innerHTML = "<h2>Plano vencido. Contate o administrador.</h2>";
    return;
  }

  document.title = currentSalon.name;
}
