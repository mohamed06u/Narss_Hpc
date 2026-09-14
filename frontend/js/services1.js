// أضف القاموس أو البيانات باللغتين داخل كود الخدمات الخاص بك
function getTranslatedServices(lang) {
    // يمكنك تعديل هذه البيانات حسب البيانات الحقيقية من كودك الحالي
    return [
        {
            title: lang === 'ar' ? "معالجة البيانات الضخمة" : "Big Data Processing",
            desc: lang === 'ar' ? "معالجة الصور الفضائية عالية الدقة بالذكاء الاصطناعي." : "High-resolution satellite imagery processing using AI.",
            link: "service-details.html"
        }
    ];
}

function renderServices() {
    const container = document.getElementById("services-container");
    if (!container) return;

    const lang = localStorage.getItem("app_lang") || "ar";
    const services = getTranslatedServices(lang);

    container.innerHTML = services.map(s => `
        <div class="service-card">
            <h3>${s.title}</h3>
            <p>${s.desc}</p>
            <a href="${s.link}" class="btn-service">${lang === 'ar' ? 'عرض التفاصيل' : 'View Details'}</a>
        </div>
    `).join("");
}

// التشغيل عند الفتح
document.addEventListener("DOMContentLoaded", renderServices);

// إعادة العرض فوراً عند تغيير اللغة عبر زر lang.js
window.addEventListener("languageChanged", renderServices);