// قاموس النصوص للتطبيقات الثابتة
const translations = {
    ar: {
        title: "NARSS HPC Lab",
        logo: "🛰️ خدمات معمل NARSS HPC",
        login: "تسجيل الدخول",
        register: "حساب جديد",
        heroTitle: "معمل الحوسبة الفائقة للاستشعار عن بعد (NARSS HPC)",
        heroDesc: "تسريع أبحاث الذكاء الاصطناعي ومعالجة علوم الأرض لدعم اتخاذ القرارات البيئية المتقدمة.",
        heroBtn: "استعرض الخريطة التفاعلية ➜",
        servicesTitle: "خدمات المنصة الإلكترونية",
        loading: "جاري تحميل الخدمات...",
        footer: "جميع الحقوق محفوظة © الهيئة القومية للاستشعار عن بعد وعلوم الفضاء (NARSS) 2026",
        langBtn: "English"
    },
    en: {
        title: "NARSS HPC Lab",
        logo: "🛰️ NARSS HPC Lab Services",
        login: "Login",
        register: "Register",
        heroTitle: "Remote Sensing High-Performance Computing Lab (NARSS HPC)",
        heroDesc: "Accelerating AI research and Earth science processing to support advanced environmental decision-making.",
        heroBtn: "Explore Interactive Map ➜",
        servicesTitle: "E-Platform Services",
        loading: "Loading services...",
        footer: "All rights reserved © National Authority for Remote Sensing and Space Sciences (NARSS) 2026",
        langBtn: "عربي"
    }
};

// جلب اللغة المخزنة أو اعتماد العربية كافتراضية
let currentLang = localStorage.getItem("app_lang") || "ar";

function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem("app_lang", lang);

    // تغيير اتجاه ولغة الصفحة HTML
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

    // ترجمة العناصر الثابتة التي تحتوي على خاصية data-i18n
    document.querySelectorAll("[data-i18n]").forEach(element => {
        const key = element.getAttribute("data-i18n");
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });

    // تحديث نص زر التبديل
    const langBtn = document.getElementById("lang-toggle");
    if (langBtn) {
        langBtn.textContent = translations[lang].langBtn;
    }

    // إرسال تنبيه للملفات الأخرى برمز اللغة الحالي
    window.dispatchEvent(new CustomEvent("languageChanged", { detail: { lang } }));
}

// تشغيل الوظيفة عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
    applyLanguage(currentLang);

    const langBtn = document.getElementById("lang-toggle");
    if (langBtn) {
        langBtn.addEventListener("click", () => {
            const newLang = currentLang === "ar" ? "en" : "ar";
            applyLanguage(newLang);
        });
    }
});