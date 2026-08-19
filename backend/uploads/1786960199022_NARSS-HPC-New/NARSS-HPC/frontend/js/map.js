const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}

let currentMarker = null;
let currentLang = "ar";

const osmLayer = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    { maxZoom: 19, attribution: "© OpenStreetMap contributors" }
);

const satelliteLayer = L.tileLayer(
    "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
    { maxZoom: 20, attribution: "© Google Maps Satellite" }
);

const map = L.map("map", {
    center: [30.0444, 31.2357],
    zoom: 13,
    layers: [osmLayer]
});

L.control.layers({
    "🗺️ خريطة الشوارع": osmLayer,
    "🛰️ الأقمار الصناعية": satelliteLayer
}, null, { collapsed: false }).addTo(map);

currentMarker = L.marker([30.0444, 31.2357])
    .addTo(map)
    .bindPopup("<b>القاهرة</b><br>النقطة الرئيسية.")
    .openPopup();

function flyToLocation(lat, lng, zoomLevel, title, desc) {
    map.flyTo([lat, lng], zoomLevel, { duration: 1.5 });

    if (currentMarker) {
        map.removeLayer(currentMarker);
        currentMarker = null;
    }

    if (zoomLevel > 7) {
        currentMarker = L.marker([lat, lng]).addTo(map);
        currentMarker.bindPopup(`<b>${title}</b><br>${desc}`).openPopup();
    }
}

function toggleDropdown() {
    const dropdown = document.getElementById("servicesDropdown");
    const arrow = document.getElementById("arrow-icon");

    dropdown.classList.toggle("active");
    arrow.textContent = dropdown.classList.contains("active") ? "▲" : "▼";
}

function openPdfModal() {
    document.getElementById("pdfModal").classList.add("active");
}

function closePdfModal() {
    document.getElementById("pdfModal").classList.remove("active");
}

window.addEventListener("click", (event) => {
    const modal = document.getElementById("pdfModal");
    if (event.target === modal) closePdfModal();
});

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    window.location.href = "login.html";
}

function toggleLanguage() {
    const root = document.getElementById("html-root");
    const title = document.getElementById("app-title");

    if (currentLang === "ar") {
        currentLang = "en";
        root.dir = "ltr";
        root.lang = "en";
        title.textContent = "🗺️ NARSS System";
    } else {
        currentLang = "ar";
        root.dir = "rtl";
        root.lang = "ar";
        title.textContent = "🗺️ نظام الهيئة (NARSS)";
    }
}
