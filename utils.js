function getSalonIdFromURL() {
  const path = window.location.pathname;
  const parts = path.split("/s/");
  return parts[1] || null;
}

function todayTimestamp() {
  return new Date().getTime();
}
