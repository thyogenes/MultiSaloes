let currentSalon = null;

async function loadSalon()applyTemplate();
applyContent();{ 

const salonId = getSalonIdFromURL();

if(!salonId){
document.body.innerHTML = "<h2>Salão não encontrado</h2>";
return;
}

const doc = await db.collection("salons").doc(salonId).get();

if(!doc.exists){
document.body.innerHTML = "<h2>Salão inexistente</h2>";
return;
}

currentSalon = doc.data();
currentSalon.id = salonId;

if(currentSalon.status !== "active"){
document.body.innerHTML = "<h2>Plano vencido. Contate o administrador.</h2>";
return;
}

}
// Aplicar cores
document.body.style.background = currentSalon.backgroundColor || "#faf7f8";

const header = document.getElementById("salonHeader");
if(header){
header.style.background = currentSalon.primaryColor || "#c9527a";
}

// Aplicar logo
if(currentSalon.logoUrl){
const logo = document.getElementById("salonLogo");
logo.src = currentSalon.logoUrl;
logo.style.display = "block";
}

// Aplicar banner
if(currentSalon.bannerUrl){
const bannerContainer = document.getElementById("bannerContainer");
bannerContainer.innerHTML = `
<img src="${currentSalon.bannerUrl}" style="width:100%;max-height:300px;object-fit:cover;">
`;
}
