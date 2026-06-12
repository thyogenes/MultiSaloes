let currentSalon = null;

async function loadSalon()applyTemplate();
applyContent();{ 
function applyTemplate(){

document.body.style.fontFamily = currentSalon.fontFamily || "Poppins";

const header = document.getElementById("salonHeader");

if(currentSalon.template === "luxo"){
document.body.style.background = "#111";
header.style.background = "#000";
header.style.color = "#d4af37";
}

if(currentSalon.template === "minimal"){
document.body.style.background = "#ffffff";
header.style.background = currentSalon.primaryColor || "#000";
}

if(currentSalon.template === "moderno"){
document.body.style.background = currentSalon.backgroundColor || "#f8e1ea";
header.style.background = currentSalon.primaryColor || "#c9527a";
}

if(currentSalon.buttonStyle === "square"){
document.querySelectorAll("button").forEach(btn=>{
btn.style.borderRadius = "0px";
});
}

if(currentSalon.buttonStyle === "rounded"){
document.querySelectorAll("button").forEach(btn=>{
btn.style.borderRadius = "30px";
});
}

}

function applyContent(){

if(currentSalon.aboutText){
document.getElementById("aboutSection").innerHTML =
"<h2>Sobre Mim</h2><p>"+currentSalon.aboutText+"</p>";
}

if(currentSalon.address){
document.getElementById("addressSection").innerHTML =
"<h2>Endereço</h2><p>"+currentSalon.address+"</p>";
}

if(currentSalon.instagram){
document.getElementById("instagramSection").innerHTML =
`<h2>Instagram</h2>
<a target="_blank" href="https://instagram.com/${currentSalon.instagram}">
@${currentSalon.instagram}
</a>`;
}

}
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
