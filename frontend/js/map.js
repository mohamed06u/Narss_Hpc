/* =========================
   NARSS HPC MAP - Single Active Map with Tab Switching
========================= */

if (typeof window.API_BASE_URL === "undefined") {
    window.API_BASE_URL = "http://localhost:3000/api";
}

// Independent map instances and layer controls
const maps = {
    satellite: null,
    geographic: null,
    gis: null
};

const layerControls = {
    satellite: null,
    geographic: null,
    gis: null
};

// Map titles mapping for Topbar update
const mapTitles = {
    satellite: "Satellite Imagery",
    geographic: "Geographic Map",
    gis: "GIS Analysis"
};

document.addEventListener("DOMContentLoaded", function () {
    const centerEgypt = [26.8206, 30.8025]; // Center coordinates of Egypt
    const defaultZoom = 6;

    // 1. Initialize Map 1 — Satellite Map (Visible by default)
    maps.satellite = L.map("map-satellite").setView(centerEgypt, defaultZoom);
    const satelliteBasemap = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }).addTo(maps.satellite);
    layerControls.satellite = L.control.layers({ "Satellite Imagery": satelliteBasemap }, {}).addTo(maps.satellite);

    // 2. Initialize Map 2 — Geographic / Street Map (Hidden initially)
    maps.geographic = L.map("map-geographic").setView(centerEgypt, defaultZoom);
    const osmBasemap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(maps.geographic);
    layerControls.geographic = L.control.layers({ "OpenStreetMap": osmBasemap }, {}).addTo(maps.geographic);

    // 3. Initialize Map 3 — GIS Analysis Map (Hidden initially)
    maps.gis = L.map("map-gis").setView(centerEgypt, defaultZoom);
    const topoBasemap = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
        maxZoom: 17,
        attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)'
    }).addTo(maps.gis);
    layerControls.gis = L.control.layers({ "Topographic GIS": topoBasemap }, {}).addTo(maps.gis);

    // 4. Setup Tab Switching Logic
    const tabButtons = document.querySelectorAll(".map-tab-btn");
    tabButtons.forEach(btn => {
        btn.addEventListener("click", function () {
            const targetMapKey = this.getAttribute("data-map");

            // Update active tab buttons
            tabButtons.forEach(b => b.classList.remove("active"));
            this.classList.add("active");

            // Update active panes
            document.querySelectorAll(".map-pane").forEach(pane => pane.classList.remove("active"));
            document.getElementById(`pane-${targetMapKey}`).classList.add("active");

            // Update topbar title
            const titleEl = document.getElementById("topbarTitle");
            if (titleEl && mapTitles[targetMapKey]) {
                titleEl.textContent = mapTitles[targetMapKey];
            }

            // Invalidate size of the activated map to render correctly
            if (maps[targetMapKey]) {
                setTimeout(() => {
                    maps[targetMapKey].invalidateSize();
                }, 100);
            }
        });
    });

    // 5. Set up Buttons & Upload Handlers
    document.getElementById("uploadShapefileBtn").addEventListener("click", uploadShapefile);
    document.getElementById("logoutBtn").addEventListener("click", logout);

    // Initial size fix for active map
    setTimeout(() => {
        if (maps.satellite) maps.satellite.invalidateSize();
    }, 250);
});

async function uploadShapefile() {
    const input = document.getElementById("shapefileInput");
    const button = document.getElementById("uploadShapefileBtn");

    if (!input || !input.files || input.files.length === 0) {
        showUploadStatus("Please select a ZIP file first.", "error");
        return;
    }

    const file = input.files[0];
    button.disabled = true;
    showUploadStatus("Reading and processing Shapefile...", "loading");

    try {
        const buffer = await file.arrayBuffer();
        const geojson = await shp(buffer);

        const layerName = file.name.replace(/\.[^/.]+$/, "");

        if (Array.isArray(geojson)) {
            geojson.forEach((gJson, index) => {
                const subLayerName = `${layerName}_${index + 1}`;
                addLayerToAllMaps(gJson, subLayerName);
            });
        } else {
            addLayerToAllMaps(geojson, layerName);
        }

        showUploadStatus("Shapefile uploaded and displayed successfully.", "success");
        input.value = "";
    } catch (error) {
        console.error("Shapefile parsing error:", error);
        showUploadStatus("Failed to parse Shapefile. Make sure it's a valid ZIP.", "error");
    } finally {
        button.disabled = false;
    }
}

function addLayerToAllMaps(geojson, layerName) {
    if (!geojson) return;

    // Add layer to all map instances so it's accessible across all views
    Object.keys(maps).forEach(mapKey => {
        const currentMap = maps[mapKey];
        const currentControl = layerControls[mapKey];

        if (!currentMap) return;

        const newLayer = L.geoJSON(geojson, {
            style: function () {
                return {
                    color: "#2563eb",
                    weight: 3,
                    opacity: 0.9,
                    fillColor: "#60a5fa",
                    fillOpacity: 0.3
                };
            },
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, {
                    radius: 6,
                    color: "#2563eb",
                    weight: 2,
                    fillColor: "#60a5fa",
                    fillOpacity: 0.8
                });
            },
            onEachFeature: function (feature, layer) {
                if (feature.properties && Object.keys(feature.properties).length > 0) {
                    layer.bindPopup(createPropertiesPopup(feature.properties));
                }
            }
        });

        newLayer.addTo(currentMap);

        if (currentControl) {
            currentControl.addOverlay(newLayer, layerName);
        }

        try {
            const bounds = newLayer.getBounds();
            if (bounds.isValid()) {
                currentMap.fitBounds(bounds, { padding: [40, 40] });
            }
        } catch (err) {
            console.warn("Could not fit bounds on map:", err);
        }
    });
}

function createPropertiesPopup(properties) {
    let html = `<div><table class="property-table"><tbody>`;
    for (const key in properties) {
        let value = properties[key] !== null && properties[key] !== undefined ? properties[key] : "";
        html += `<tr><th>${escapeHtml(key)}</th><td>${escapeHtml(String(value))}</td></tr>`;
    }
    return html + `</tbody></table></div>`;
}

function escapeHtml(value) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function showUploadStatus(message, type) {
    const status = document.getElementById("uploadStatus");
    if (!status) return;
    status.textContent = message;
    status.style.color = type === "success" ? "#15803d" : type === "error" ? "#dc2626" : "#2563eb";
}

function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}