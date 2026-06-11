function masterLogin(){

const email = document.getElementById("masterEmail").value;
const password = document.getElementById("masterPassword").value;

auth.signInWithEmailAndPassword(email,password)
.then(()=>{
document.getElementById("loginBox").style.display="none";
document.getElementById("masterDashboard").style.display="block";
loadMasterDashboard();
})
.catch(()=>alert("Erro no login"));
}

async function loadMasterDashboard(){

const salonsSnapshot = await db.collection("salons").get();

let totalSalons = salonsSnapshot.size;
let active = 0;
let inactive = 0;
let globalRevenue = 0;

for(const doc of salonsSnapshot.docs){

const salon = doc.data();
const salonId = doc.id;

if(isExpired(salon.dueDate)){
await db.collection("salons").doc(salonId).update({
status:"inactive"
});
}

if(salon.status==="active") active++;
else inactive++;

const appointments = await db.collection("appointments")
.doc(salonId)
.collection("items")
.get();

appointments.forEach(a=>{
globalRevenue += a.data().price;
});
}

document.getElementById("totalSalons").innerText = totalSalons;
document.getElementById("activeSalons").innerText = active;
document.getElementById("inactiveSalons").innerText = inactive;
document.getElementById("globalRevenue").innerText = globalRevenue;

loadSalonsList();
}

function isExpired(dueDate){

if(!dueDate) return true;

const today = new Date();
const due = new Date(dueDate);

return today > due;
}

async function createSalon(){

const salonId = document.getElementById("salonId").value.trim();
const name = document.getElementById("salonName").value;
const owner = document.getElementById("ownerName").value;
const whatsapp = document.getElementById("whatsapp").value;
const dueDate = document.getElementById("dueDate").value;

if(!salonId || !name || !owner || !whatsapp || !dueDate){
alert("Preencha todos os campos");
return;
}

await db.collection("salons").doc(salonId).set({
name,
owner,
whatsapp,
plan:"basic",
price:40,
status:"active",
dueDate
});

alert("Salão criado!");
loadMasterDashboard();
}

async function loadSalonsList(){

const snapshot = await db.collection("salons").get();
let html="";

snapshot.forEach(doc=>{
const d = doc.data();
html += `
<div style="border-bottom:1px solid #ddd;padding:10px;">
<b>${d.name}</b><br>
Status: ${d.status}<br>
Plano: R$${d.price}<br>
Vencimento: ${d.dueDate}<br>
<button onclick="toggleStatus('${doc.id}','${d.status}')">
${d.status==="active"?"Desativar":"Ativar"}
</button>
</div>
`;
});

document.getElementById("salonsList").innerHTML = html;
}

async function toggleStatus(id,status){

await db.collection("salons").doc(id).update({
status: status==="active"?"inactive":"active"
});

loadMasterDashboard();
}
