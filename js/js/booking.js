async function book(){

if(!currentSalon) return;

const serviceSelect = document.getElementById("service");
const serviceName = serviceSelect.options[serviceSelect.selectedIndex].text;
const price = parseFloat(serviceSelect.value);

const date = document.getElementById("date").value;
const time = document.getElementById("time").value;
const name = document.getElementById("name").value;
const phone = document.getElementById("phone").value;

if(!date || !name || !phone){
alert("Preencha todos os campos");
return;
}

const slotId = date + "_" + time;

const slotRef = db.collection("blockedSlots")
.doc(currentSalon.id)
.collection("slots")
.doc(slotId);

const existing = await slotRef.get();

if(existing.exists){
alert("Horário já reservado");
return;
}

await db.collection("appointments")
.doc(currentSalon.id)
.collection("items")
.add({
name,
phone,
service: serviceName,
price,
date,
time,
createdAt: firebase.firestore.FieldValue.serverTimestamp()
});

await slotRef.set({
date,
time
});

const message = `Olá ${currentSalon.owner}
Novo agendamento:

Cliente: ${name}
Serviço: ${serviceName}
Data: ${date}
Horário: ${time}
Total: R$${price}`;

const url = `https://wa.me/${currentSalon.whatsapp}?text=${encodeURIComponent(message)}`;
window.open(url,"_blank");

alert("Agendamento realizado com sucesso!");
}

async function loadGallery(){
const snapshot = await db.collection("gallery")
.doc(currentSalon.id)
.collection("photos")
.get();

let html = "";

snapshot.forEach(doc=>{
const data = doc.data();
html += `<img src="${data.url}" style="width:100%;margin-bottom:10px;border-radius:10px;">`;
});

document.getElementById("gallery").innerHTML = html;
}
