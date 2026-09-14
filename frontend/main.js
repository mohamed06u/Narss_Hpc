/* ==========================================================
   TAIF / NARSS HPC Lab — Shared Site Script
   يحتوي على: تبديل اللغة (عربي/إنجليزي/فرنساوي) + قائمة الموبايل
   + حركات الظهور عند السكرول + فلتر البحث عن الخدمات
   ========================================================== */

/* ------------------------------------------------------------
   1) قاموس الترجمة — عربي / إنجليزي / فرنساوي
   كل عنصر في الصفحة عليه data-i18n="key" بيتغير نصه هنا
   ------------------------------------------------------------ */

   // دالة لجلب البيانات وعرضها
async function loadSampleDescription() {
  try {
    const response = await fetch('http://192.168.3.253:5000/api/sample-data');
    if (!response.ok) {
      throw new Error('تعذر جلب البيانات من الخادم');
    }
    
    const data = await response.json();
    
    // عرض الوصف داخل العنصر المخصص في الواجهة
    document.getElementById('file-description').innerText = data.description;
  } catch (error) {
    console.error('حدث خطأ:', error);
  }
}

// استدعاء الدالة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', loadSampleDescription);
const translations = {
    ar: {
        "nav.data": "إستعراض البيانات",
        "nav.services": "الخدمات",
        "nav.focusAreas": "مجالات التركيز",
        "nav.aiTraining": "تدريب الذكاء الاصطناعي",
        "nav.cloudComputing": "الحوسبة السحابية",
        "nav.subsidence": "رصد هبوط الأرض",
        "nav.oilSpill": "كشف التسربات",
        "nav.about": "عن المعمل",
        "nav.login": "دخول",
        "nav.signup": "حساب جديد",
        "nav.contact": "تواصل معنا",

        "hero.side1Title": "أقمار صناعية متعددة",
        "hero.side1Sub": "Sentinel • Landsat • وغيرها",
        "hero.side2Title": "ذكاء اصطناعي متقدم",
        "hero.side2Sub": "نماذج تعلم عميق وتحليلات ذكية",
        "hero.side3Title": "حوسبة عالية الأداء",
        "hero.side3Sub": "معمل الحوسبة عالية الأداء (HPC)",
        "hero.side4Title": "تحليلات ونمذجة متطورة",
        "hero.side4Sub": "نمذجة بيئية وجيومكانية",
        "hero.side5Title": "رصد وتشغيل مستمر",
        "hero.side5Sub": "منتجات يومية وتشغيل آلي",
        "hero.tagline": "حلول جيومكانية ذكية",
        "hero.slogan": "من بيانات الفضاء إلى قرارات أكثر ذكاءً",
        "hero.f1": "بيانات دقيقة",
        "hero.f2": "نماذج تنبؤية",
        "hero.f3": "تحليلات ذكية",
        "hero.f4": "قرارات أفضل",
        "hero.operatorLabel": "تطوير وتشغيل",
        "hero.operatorName": "معمل الحوسبة عالية الأداء NARSS – (HPC)",
        "hero.btnMain": "استعرض المنتجات والخدمات",
        "hero.btnSecondary": "عن المنصة",

        "services.tag": "خدماتنا",
        "services.title": "خدمات طيف الجيومكانية",
        "services.subtitle": "اختر من بين خدمات الحوسبة ومعالجة البيانات المتاحة حسب التصنيف",
        "services.searchPlaceholder": "ابحث عن خدمة أو تقنية...",
        "services.cat1": "المراقبة البحرية والساحلية",
        "services.cat2": "المراقبة البرية",
        "services.cat3": "المراقبة الجوية",
        "services.cat4": "خدمات صور الأقمار الصناعية",
        "services.cat5": "التخطيط",
        "services.cat6": "خدمات الحوسبة عالية الأداء",

        "why.tag": "💡 لماذا نحن؟",
        "why.title": "لماذا معمل NARSS للحوسبة عالية الأداء؟",
        "why.subtitle": "بنية تحتية متطورة للحوسبة الفائقة تدعم أحدث الأبحاث والتطبيقات",
        "why.card1": "أحدث وحدات المعالجة لتسريع التدريب والنمذجة",
        "why.card2": "معالجة كميات ضخمة من البيانات الجيومكانية بكفاءة",
        "why.card3": "تطوير نماذج ذكاء اصطناعي لتحليل صور الأقمار الصناعية",
        "why.card4": "دمج نظم المعلومات الجغرافية لاتخاذ قرارات دقيقة",

        "footer.desc": "الهيئة القومية للاستشعار عن بعد وعلوم الفضاء - وحدة الحوسبة الفائقة",
        "footer.quickLinks": "روابط سريعة",
        "footer.location": "القاهرة، مصر",
        "footer.rights": "جميع الحقوق محفوظة © 2026 | وحدة الحوسبة الفائقة",

        "contact.bannerTitle": "تواصل معنا",
        "contact.bannerSub": "يسعدنا تواصلك معنا لأي استفسار عن خدماتنا أو للتعاون العلمي والبحثي",
        "contact.formTitle": "أرسل لنا رسالة",
        "contact.name": "الاسم بالكامل",
        "contact.namePlaceholder": "اكتب اسمك",
        "contact.email": "البريد الإلكتروني",
        "contact.emailPlaceholder": "example@email.com",
        "contact.subject": "الموضوع",
        "contact.subjectPlaceholder": "موضوع الرسالة",
        "contact.message": "الرسالة",
        "contact.messagePlaceholder": "اكتب رسالتك هنا...",
        "contact.send": "إرسال الرسالة",
        "contact.infoTitle": "معلومات التواصل",
        "contact.emailLabel": "البريد الإلكتروني",
        "contact.phoneLabel": "الهاتف",
        "contact.addressLabel": "العنوان",
        "contact.addressValue": "الهيئة القومية للاستشعار عن بعد وعلوم الفضاء، القاهرة، مصر",
        "contact.mapNote": "خريطة الموقع"
    },
    en: {
        "nav.data": "Data Explorer",
        "nav.services": "Services",
        "nav.focusAreas": "Focus Areas",
        "nav.aiTraining": "AI Training",
        "nav.cloudComputing": "Cloud Computing",
        "nav.subsidence": "Land Subsidence Monitoring",
        "nav.oilSpill": "Oil Spill Detection",
        "nav.about": "About the Lab",
        "nav.login": "Login",
        "nav.signup": "Sign Up",
        "nav.contact": "Contact",

        "hero.side1Title": "Multiple Satellites",
        "hero.side1Sub": "Sentinel • Landsat • and more",
        "hero.side2Title": "Advanced AI",
        "hero.side2Sub": "Deep learning models & smart analytics",
        "hero.side3Title": "High Performance Computing",
        "hero.side3Sub": "NARSS High Performance Computing Lab",
        "hero.side4Title": "Advanced Analytics & Modeling",
        "hero.side4Sub": "Environmental and geospatial modeling",
        "hero.side5Title": "Continuous Monitoring",
        "hero.side5Sub": "Daily products & automated operations",
        "hero.tagline": "Smart Geospatial Solutions",
        "hero.slogan": "From space data to smarter decisions",
        "hero.f1": "Accurate Data",
        "hero.f2": "Predictive Models",
        "hero.f3": "Smart Analytics",
        "hero.f4": "Better Decisions",
        "hero.operatorLabel": "Developed & Operated by",
        "hero.operatorName": "NARSS High Performance Computing Lab (HPC)",
        "hero.btnMain": "Browse Products & Services",
        "hero.btnSecondary": "About the Platform",

        "services.tag": "Our Services",
        "services.title": "TAIF Geospatial Services",
        "services.subtitle": "Choose from computing and data processing services available by category",
        "services.searchPlaceholder": "Search for a service or technology...",
        "services.cat1": "Marine & Coastal Monitoring",
        "services.cat2": "Land Monitoring",
        "services.cat3": "Atmospheric Monitoring",
        "services.cat4": "Satellite Imagery Services",
        "services.cat5": "Planning",
        "services.cat6": "High Performance Computing Services",

        "why.tag": "💡 Why Us?",
        "why.title": "Why NARSS HPC Lab?",
        "why.subtitle": "Advanced supercomputing infrastructure supporting the latest research and applications",
        "why.card1": "Latest processing units to accelerate training and modeling",
        "why.card2": "Efficiently processing massive volumes of geospatial data",
        "why.card3": "Developing AI models to analyze satellite imagery",
        "why.card4": "Integrating GIS systems for accurate decision-making",

        "footer.desc": "National Authority for Remote Sensing and Space Sciences - High Performance Computing Unit",
        "footer.quickLinks": "Quick Links",
        "footer.location": "Cairo, Egypt",
        "footer.rights": "All Rights Reserved © 2026 | High Performance Computing Unit",

        "contact.bannerTitle": "Contact Us",
        "contact.bannerSub": "We'd love to hear from you — for service inquiries or scientific & research collaboration",
        "contact.formTitle": "Send Us a Message",
        "contact.name": "Full Name",
        "contact.namePlaceholder": "Enter your name",
        "contact.email": "Email Address",
        "contact.emailPlaceholder": "example@email.com",
        "contact.subject": "Subject",
        "contact.subjectPlaceholder": "Message subject",
        "contact.message": "Message",
        "contact.messagePlaceholder": "Write your message here...",
        "contact.send": "Send Message",
        "contact.infoTitle": "Contact Information",
        "contact.emailLabel": "Email",
        "contact.phoneLabel": "Phone",
        "contact.addressLabel": "Address",
        "contact.addressValue": "National Authority for Remote Sensing and Space Sciences, Cairo, Egypt",
        "contact.mapNote": "Location Map"
    },
    fr: {
        "nav.data": "Explorateur de données",
        "nav.services": "Services",
        "nav.focusAreas": "Domaines d'intérêt",
        "nav.aiTraining": "Formation en IA",
        "nav.cloudComputing": "Informatique en nuage",
        "nav.subsidence": "Surveillance de l'affaissement",
        "nav.oilSpill": "Détection des marées noires",
        "nav.about": "À propos du laboratoire",
        "nav.login": "Connexion",
        "nav.signup": "Inscription",
        "nav.contact": "Contact",

        "hero.side1Title": "Satellites multiples",
        "hero.side1Sub": "Sentinel • Landsat • et plus",
        "hero.side2Title": "IA avancée",
        "hero.side2Sub": "Modèles d'apprentissage profond et analyses intelligentes",
        "hero.side3Title": "Calcul haute performance",
        "hero.side3Sub": "Laboratoire HPC de la NARSS",
        "hero.side4Title": "Analyses et modélisation avancées",
        "hero.side4Sub": "Modélisation environnementale et géospatiale",
        "hero.side5Title": "Surveillance continue",
        "hero.side5Sub": "Produits quotidiens et opérations automatisées",
        "hero.tagline": "Solutions géospatiales intelligentes",
        "hero.slogan": "Des données spatiales à des décisions plus intelligentes",
        "hero.f1": "Données précises",
        "hero.f2": "Modèles prédictifs",
        "hero.f3": "Analyses intelligentes",
        "hero.f4": "Meilleures décisions",
        "hero.operatorLabel": "Développé et exploité par",
        "hero.operatorName": "Laboratoire HPC de la NARSS",
        "hero.btnMain": "Découvrir les produits et services",
        "hero.btnSecondary": "À propos de la plateforme",

        "services.tag": "Nos services",
        "services.title": "Services géospatiaux TAIF",
        "services.subtitle": "Choisissez parmi les services de calcul et de traitement de données disponibles par catégorie",
        "services.searchPlaceholder": "Rechercher un service ou une technologie...",
        "services.cat1": "Surveillance marine et côtière",
        "services.cat2": "Surveillance terrestre",
        "services.cat3": "Surveillance atmosphérique",
        "services.cat4": "Services d'imagerie satellite",
        "services.cat5": "Planification",
        "services.cat6": "Services de calcul haute performance",

        "why.tag": "💡 Pourquoi nous ?",
        "why.title": "Pourquoi le laboratoire HPC de la NARSS ?",
        "why.subtitle": "Une infrastructure de supercalcul avancée soutenant la recherche et les applications les plus récentes",
        "why.card1": "Les unités de traitement les plus récentes pour accélérer l'entraînement et la modélisation",
        "why.card2": "Traitement efficace de volumes massifs de données géospatiales",
        "why.card3": "Développement de modèles d'IA pour l'analyse d'images satellite",
        "why.card4": "Intégration des systèmes SIG pour des décisions précises",

        "footer.desc": "Autorité nationale de télédétection et des sciences spatiales - Unité de calcul haute performance",
        "footer.quickLinks": "Liens rapides",
        "footer.location": "Le Caire, Égypte",
        "footer.rights": "Tous droits réservés © 2026 | Unité de calcul haute performance",

        "contact.bannerTitle": "Contactez-nous",
        "contact.bannerSub": "Nous serions ravis de vous entendre — pour toute demande de service ou collaboration scientifique",
        "contact.formTitle": "Envoyez-nous un message",
        "contact.name": "Nom complet",
        "contact.namePlaceholder": "Entrez votre nom",
        "contact.email": "Adresse e-mail",
        "contact.emailPlaceholder": "example@email.com",
        "contact.subject": "Sujet",
        "contact.subjectPlaceholder": "Sujet du message",
        "contact.message": "Message",
        "contact.messagePlaceholder": "Écrivez votre message ici...",
        "contact.send": "Envoyer le message",
        "contact.infoTitle": "Informations de contact",
        "contact.emailLabel": "E-mail",
        "contact.phoneLabel": "Téléphone",
        "contact.addressLabel": "Adresse",
        "contact.addressValue": "Autorité nationale de télédétection et des sciences spatiales, Le Caire, Égypte",
        "contact.mapNote": "Carte de localisation"
    }
};

const langMeta = {
    ar: { flag: "🇪🇬", label: "العربية", dir: "rtl" },
    en: { flag: "🇬🇧", label: "English", dir: "ltr" },
    fr: { flag: "🇫🇷", label: "Français", dir: "ltr" }
};

/* ------------------------------------------------------------
   2) تطبيق اللغة على الصفحة
   ------------------------------------------------------------ */
function applyLanguage(lang) {
    if (!translations[lang]) lang = "ar";
    const dict = translations[lang];

    // النصوص العادية
    document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        if (dict[key]) el.textContent = dict[key];
    });

    // الـ placeholder في الحقول
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
        const key = el.getAttribute("data-i18n-placeholder");
        if (dict[key]) el.setAttribute("placeholder", dict[key]);
    });

    // اتجاه الصفحة (عربي = RTL / إنجليزي وفرنساوي = LTR)
    const meta = langMeta[lang];
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", meta.dir);
    document.body.classList.toggle("english-mode", meta.dir === "ltr");

    // شكل زرار اللغة في التوب بار
    const flagIcon = document.getElementById("langFlagIcon");
    const langLabel = document.getElementById("langLabel");
    if (flagIcon) flagIcon.textContent = meta.flag;
    if (langLabel) langLabel.textContent = meta.label;

    // تحديد العنصر النشط في القائمة المنسدلة
    document.querySelectorAll(".lang-menu-item").forEach((btn) => {
        btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
    });

    localStorage.setItem("taif-lang", lang);
}

function initLanguageSwitcher() {
    const savedLang = localStorage.getItem("taif-lang") || "ar";
    applyLanguage(savedLang);

    const switcher = document.getElementById("langSwitcher");
    const dropdownBtn = document.getElementById("langDropdownBtn");
    if (!switcher || !dropdownBtn) return;

    dropdownBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = switcher.classList.toggle("open");
        dropdownBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    switcher.querySelectorAll(".lang-menu-item").forEach((item) => {
        item.addEventListener("click", () => {
            applyLanguage(item.getAttribute("data-lang"));
            switcher.classList.remove("open");
            dropdownBtn.setAttribute("aria-expanded", "false");
        });
    });

    document.addEventListener("click", () => {
        switcher.classList.remove("open");
        dropdownBtn.setAttribute("aria-expanded", "false");
    });
}

/* ------------------------------------------------------------
   3) حركات الظهور عند السكرول
   ------------------------------------------------------------ */
function initScrollReveal() {
    const revealEls = document.querySelectorAll(".reveal");
    if (revealEls.length && "IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                    } else {
                        entry.target.classList.remove("is-visible");
                    }
                });
            },
            { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
        );
        revealEls.forEach((el) => revealObserver.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add("is-visible"));
    }
}

/* ------------------------------------------------------------
   4) قائمة الموبايل
   ------------------------------------------------------------ */
function initMobileMenu() {
    const mobileToggle = document.getElementById("mobileToggle");
    const navMenu = document.getElementById("navMenu");
    const navActions = document.getElementById("navActions");

    if (mobileToggle && navMenu && navActions) {
        mobileToggle.addEventListener("click", () => {
            const isFlex = navMenu.style.display === "flex";
            navMenu.style.display = isFlex ? "none" : "flex";
            navActions.style.display = isFlex ? "none" : "flex";
        });
    }
}

/* ------------------------------------------------------------
   5) فلتر البحث عن الخدمات (index.html فقط)
   ------------------------------------------------------------ */
function initServicesSearch() {
    const servicesSearch = document.getElementById("servicesSearch");
    if (!servicesSearch) return;

    servicesSearch.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        const cards = document.querySelectorAll(".category-card");

        cards.forEach((card) => {
            const subServices = card.querySelectorAll(".subservice-item");
            let hasVisible = false;

            subServices.forEach((item) => {
                const title = item.querySelector("h4").textContent.toLowerCase();
                const desc = item.querySelector("p").textContent.toLowerCase();

                if (title.includes(query) || desc.includes(query)) {
                    item.style.display = "flex";
                    hasVisible = true;
                } else {
                    item.style.display = "none";
                }
            });

            card.style.display = hasVisible ? "block" : "none";
        });
    });
}

/* ------------------------------------------------------------
   Init
   ------------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", () => {
    initLanguageSwitcher();
    initScrollReveal();
    initMobileMenu();
    initServicesSearch();
});