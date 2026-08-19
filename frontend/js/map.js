/* =========================
   NARSS HPC MAP
========================= */

// ضبط المسار الرئيسي للـ API
if (typeof window.API_BASE_URL === "undefined") {
    window.API_BASE_URL = "http://localhost:3000/api";
}

// المتغيرات العامة للخريطة والطبقة الحالية
let map = null;
let currentShapefileLayer = null;

/* =========================
   GET TOKEN
========================= */
function getToken() {
    return localStorage.getItem("token");
}

/* =========================
   INITIALIZE MAP ON DOM LOAD
========================= */
document.addEventListener("DOMContentLoaded", function () {

    // 1. إنشاء الخريطة وتحديد المركز الافتراضي (مصر)
    map = L.map("map").setView([30.0444, 31.2357], 6);

    // 2. تحميل طبقة OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // 3. إعادة حساب الأبعاد لحل مشكلة المربع الرمادي عند التحميل
    setTimeout(() => {
        if (map) {
            map.invalidateSize();
        }
    }, 250);

    // إعادة حساب الأبعاد تلقائياً عند تغيير حجم الشاشة أو فتح الـ DevTools
    window.addEventListener("resize", () => {
        if (map) {
            map.invalidateSize();
        }
    });

    // 4. ربط الأزرار بالأحداث
    const uploadButton = document.getElementById("uploadShapefileBtn");
    const logoutButton = document.getElementById("logoutBtn");

    if (uploadButton) {
        uploadButton.addEventListener("click", uploadShapefile);
    }

    if (logoutButton) {
        logoutButton.addEventListener("click", logout);
    }
});

/* =========================
   SHAPEFILE UPLOAD
========================= */
async function uploadShapefile() {
    const input = document.getElementById("shapefileInput");
    const button = document.getElementById("uploadShapefileBtn");

    if (!input || !input.files || input.files.length === 0) {
        showUploadStatus("Please select a ZIP file first.", "error");
        return;
    }

    const file = input.files[0];

    if (!file.name.toLowerCase().endsWith(".zip")) {
        showUploadStatus("Please select a ZIP file.", "error");
        input.value = "";
        return;
    }

    const token = getToken();
    if (!token) {
        showUploadStatus("Please login first.", "error");
        return;
    }

    const formData = new FormData();
    formData.append("shapefile", file);

    if (button) {
        button.disabled = true;
        button.textContent = "Uploading...";
    }

    showUploadStatus("Uploading Shapefile...", "loading");

    try {
        const response = await fetch(`${window.API_BASE_URL}/shapefile/upload`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        });

        // التأكد من أن الاستجابة JSON وليست صفحة HTML لتجنب SyntaxError
        const contentType = response.headers.get("content-type");
        let data;

        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            throw new Error(`Server error (${response.status}). Ensure backend server is running on port 3000.`);
        }

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Shapefile upload failed.");
        }

        showUploadStatus("Shapefile uploaded successfully.", "success");

        if (data.geojson) {
            addShapefileToMap(data.geojson, data.filename);
        }

        input.value = "";
    } catch (error) {
        console.error("Shapefile upload error:", error);
        showUploadStatus(error.message || "Failed to upload Shapefile.", "error");
    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = "Upload Shapefile";
        }
    }
}

/* =========================
   ADD GEOJSON TO MAP
========================= */
function addShapefileToMap(geojson, filename) {
    if (!map) return;

    // مسح الطبقة القديمة إن وجدت للحد من تداخل البيانات
    if (currentShapefileLayer) {
        map.removeLayer(currentShapefileLayer);
    }

    // إنشاء طبقة الـ GeoJSON الجديدة
    currentShapefileLayer = L.geoJSON(geojson, {
        style: function () {
            return {
                color: "#2563eb",
                weight: 3,
                opacity: 0.9,
                fillColor: "#60a5fa",
                fillOpacity: 0.25
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
            const properties = feature.properties;
            if (properties && Object.keys(properties).length > 0) {
                layer.bindPopup(createPropertiesPopup(properties));
            }
        }
    });

    currentShapefileLayer.addTo(map);

    // فحص نظام الإحداثيات وتجنب انهيار الخريطة عند استخدام UTM الأمتار
    try {
        const bounds = currentShapefileLayer.getBounds();
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();

        // التحقق من أن الإحداثيات جغرافية قياسية (WGS84 Lat/Lng)
        const isWGS84 = Math.abs(sw.lat) <= 90 && Math.abs(ne.lat) <= 90 &&
                        Math.abs(sw.lng) <= 180 && Math.abs(ne.lng) <= 180;

        if (bounds.isValid() && isWGS84) {
            map.fitBounds(bounds, { padding: [30, 30] });
        } else {
            console.warn("Coordinates are projected (e.g. UTM meters), not WGS84.");
            showUploadStatus("الملف يعتمد إحداثيات مترية (UTM)؛ يفضل استخدام WGS84 لعرض دقيق.", "error");
            
            // تثبيت الخريطة على المركز الافتراضي
            map.setView([30.0444, 31.2357], 6);
        }
    } catch (err) {
        console.warn("Could not fit bounds:", err);
    }

    // إعادة ضبط الحجم فوراً لمنع التمدد المزدوج
    map.invalidateSize();
}

/* =========================
   CREATE POPUP
========================= */
function createPropertiesPopup(properties) {
    let html = `<div><table class="property-table"><tbody>`;

    for (const key in properties) {
        if (!Object.prototype.hasOwnProperty.call(properties, key)) continue;
        let value = properties[key];
        if (value === null || value === undefined) value = "";

        html += `
            <tr>
                <th>${escapeHtml(key)}</th>
                <td>${escapeHtml(String(value))}</td>
            </tr>
        `;
    }

    html += `</tbody></table></div>`;
    return html;
}

/* =========================
   ESCAPE HTML
========================= */
function escapeHtml(value) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* =========================
   UPLOAD STATUS
========================= */
function showUploadStatus(message, type) {
    const status = document.getElementById("uploadStatus");
    if (!status) return;

    status.textContent = message;

    if (type === "success") {
        status.style.color = "#15803d";
    } else if (type === "error") {
        status.style.color = "#dc2626";
    } else {
        status.style.color = "#2563eb";
    }
}

/* =========================
   LOGOUT
========================= */
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "index.html";
}