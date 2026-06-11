let mySalonId = null;
let allAppointments = [];
let revenueChart = null;

// =====================
// LOGIN
// =====================

function doLogin(){
const email = document.getElementById("email").value;
const password = document.getElementById("password").value;
const salonId = document.getElementById("salonId").value.trim().toLowerCase();

if(!email || !password || !salonId){
alert("Preencha todos os campos");
return;
}

auth.signInWithEmailAndPassword(email, password)
.then(() => {
mySalonId = salonId;
document.getElementById("loginSection").style.display = "none";
document.getElementById("dashboardSection").style.display = "block";
document.getElementById("dashTitle").innerText = "Painel - " + salonId;
loadAllData();
loadBlockedSlots();
loadAdminGallery();
})
.catch(err => {
alert("Erro no login: " + err.message);
});
}

function doLogout(){
auth.signOut().then(() => {
location.reload();
});
}

// =====================
// CARREGAR DADOS
// =====================

async function loadAllData(){
const snapshot = await db.collection("appointments")
.doc(mySalonId)
.collection("items")
.orderBy("createdAt","desc")
.get();

allAppointments = [];

snapshot.forEach(doc => {
allAppointments.push({
id: doc.id,
...doc.data()
});
});

renderDashboard(allAppointments);
renderList(allAppointments);
renderChart(allAppointments);
}

// =====================
// FILTRO POR DATA
// =====================

function filterByDate(){
const date = document.getElementById("filterDate").value;
if(!date) return;

const filtered = allAppointments.filter(a => a.date === date);
renderList(filtered);
}

// =====================
// DASHBOARD NÚMEROS
// =====================

function renderDashboard(data){

const today = new Date().toISOString().split("T")[0];
const currentMonth = new Date().getMonth();
const currentYear = new Date().getFullYear();

let totalRev = 0;
let monthRev = 0;
let todayRev = 0;
let todayC = 0;

data.forEach(a => {
totalRev += a.price || 0;

if(a.date === today){
todayRev += a.price || 0;
todayC++;
}

if(a.date){
const d = new Date(a.date);
if(d.getMonth() === currentMonth && d.getFullYear() === currentYear){
monthRev += a.price || 0;
}
}
});

const avg = data.length > 0 ? (totalRev / data.length).toFixed(2) : 0;

document.getElementById("totalRevenue").innerText = "R$ " + totalRev.toFixed(2);
document.getElementById("monthRevenue").innerText = "R$ " + monthRev.toFixed(2);
document.getElementById("todayRevenue").innerText = "R$ " + todayRev.toFixed(2);
document.getElementById("totalCount").innerText = data.length;
document.getElementById("todayCount").innerText = todayC;
document.getElementById("avgTicket").innerText = "R$ " + avg;
}

// =====================
// LISTA DE AGENDAMENTOS
// =====================

function renderList(data){
let html = "";

if(data.length === 0){
html = "<p>Nenhum agendamento encontrado.</p>";
}

data.forEach(a => {
html += `
<div class="appointment-item">
<div class="appt-info">
<strong>${a.name}</strong><br>
${a.service}<br>
${a.date} às ${a.time}<br>
Tel: ${a.phone}<br>
<span class="appt-price">R$ ${a.price}</span>
</div>
<div class="appt-actions">
<button onclick="deleteAppointment('${a.id}','${a.date}_${a.time}')" class="btn-danger">Excluir</button>
</div>
</div>
`;
});

document.getElementById("appointmentsList").innerHTML = html;
}

// =====================
// EXCLUIR AGENDAMENTO
// =====================

async function deleteAppointment(id, slotId){
if(!confirm("Excluir este agendamento?")) return;

await db.collection("appointments")
.doc(mySalonId)
.collection("items")
.doc(id)
.delete();

await db.collection("blockedSlots")
.doc(mySalonId)
.collection("slots")
.doc(slotId)
.delete();

loadAllData();
loadBlockedSlots();
}

// =====================
// BLOQUEAR HORÁRIO
// =====================

async function blockSlot(){
const date = document.getElementById("blockDate").value;
const time = document.getElementById("blockTime").value;

if(!date){
alert("Escolha uma data");
return;
}

const slotId = date + "_" + time;

await db.collection("blockedSlots")
.doc(mySalonId)
.collection("slots")
.doc(slotId)
.set({
date,
time,
manual: true
});

alert("Horário bloqueado!");
loadBlockedSlots();
}

// =====================
// LISTAR BLOQUEIOS
// =====================

async function loadBlockedSlots(){
const snapshot = await db.collection("blockedSlots")
.doc(mySalonId)
.collection("slots")
.get();

let html = "";

snapshot.forEach(doc => {
const data = doc.data();
const type = data.manual ? "Manual" : "Agendamento";

html += `
<div class="blocked-item">
${data.date} - ${data.time} (${type})
<button onclick="unblockSlot('${doc.id}')" class="btn-small">Liberar</button>
</div>
`;
});

document.getElementById("blockedList").innerHTML = html || "<p>Nenhum horário bloqueado.</p>";
}

// =====================
// LIBERAR HORÁRIO
// =====================

async function unblockSlot(slotId){
await db.collection("blockedSlots")
.doc(mySalonId)
.collection("slots")
.doc(slotId)
.delete();

loadBlockedSlots();
}

// =====================
// GRÁFICO MENSAL
// =====================

function renderChart(data){

const months = {};

data.forEach(a => {
if(a.date){
const key = a.date.substring(0,7);
months[key] = (months[key] || 0) + (a.price || 0);
}
});

const sorted = Object.keys(months).sort();
const labels = sorted;
const values = sorted.map(k => months[k]);

if(revenueChart){
revenueChart.destroy();
}

const ctx = document.getElementById("revenueChart").getContext("2d");

revenueChart = new Chart(ctx, {
type: "bar",
data: {
labels: labels,
datasets: [{
label: "Faturamento (R$)",
data: values,
backgroundColor: "#c9527a",
borderRadius: 8
}]
},
options: {
responsive: true,
scales: {
y: {
beginAtZero: true
}
}
}
});
}

// =====================
// UPLOAD FOTO
// =====================

async function uploadPhoto(){
const file = document.getElementById("photoFile").files[0];
if(!file){
alert("Escolha uma imagem");
return;
}

const ref = firebase.storage().ref("gallery/" + mySalonId + "/" + Date.now() + "_" + file.name);
await ref.put(file);
const url = await ref.getDownloadURL();

await db.collection("gallery")
.doc(mySalonId)
.collection("photos")
.add({
url,
createdAt: firebase.firestore.FieldValue.serverTimestamp()
});

alert("Foto enviada!");
loadAdminGallery();
}

// =====================
// GALERIA ADMIN
// =====================

async function loadAdminGallery(){
const snapshot = await db.collection("gallery")
.doc(mySalonId)
.collection("photos")
.get();

let html = "";

snapshot.forEach(doc => {
const data = doc.data();
html += `
<div class="gallery-item">
<img src="${data.url}">
<button onclick="deletePhoto('${doc.id}')" class="btn-small btn-danger">Excluir</button>
</div>
`;
});

document.getElementById("adminGallery").innerHTML = html || "<p>Nenhuma foto.</p>";
}

// =====================
// EXCLUIR FOTO
// =====================

async function deletePhoto(photoId){
if(!confirm("Excluir esta foto?")) return;

await db.collection("gallery")
.doc(mySalonId)
.collection("photos")
.doc(photoId)
.delete();

loadAdminGallery();
}
