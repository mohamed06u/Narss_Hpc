const services = [

    {
        title: "🧠 AI Model Development & Training",
        description:
            "تدريب وتحسين نماذج التعلم العميق باستخدام موارد GPU.",
        link: "services/ai-training.html"
    },

    {
        title: "📊 Data Analytics",
        description:
            "تحليل ومعالجة البيانات المكانية وبيانات الاستشعار عن بعد.",
        link: "services/data-analytics.html"
    },

    {
        title: "🌍 Land Subsidence",
        description:
            "متابعة وتحليل هبوط سطح الأرض باستخدام بيانات الاستشعار عن بعد.",
        link: "services/land-subsidence.html"
    },

    {
        title: "🌊 Oil Spill Detection",
        description:
            "تحليل الصور الفضائية لاكتشاف ومتابعة بقع الزيت.",
        link: "services/oil-spill.html"
    },

    {
        title: "⚙️ On-Demand Computing",
        description:
            "طلب موارد الحوسبة الفائقة للمهام العلمية والحسابية.",
        link: "services/ondemand-computing.html"
    }
    ,
    {
        title: "Interactive GIS Map",
        description: "استعراض وتحليل البيانات المكانية وصور الأقمار الصناعية عبر الخريطة التفاعلية.",
        link: "services/interactive-map.html", // أو مسار صفحة الخريطة لديك
        color: "#0d9488", // لون تركواز مميز للخريطة
        icon: "fa-map-marked-alt"
    }

];


function renderServices() {

    const container =
        document.getElementById(
            "services-container"
        );

    if (!container) {

        return;

    }


    container.innerHTML =
        services.map(service => `

            <article class="service-card">

                <h3>
                    ${service.title}
                </h3>

                <p>
                    ${service.description}
                </p>

                <a
                    class="btn-service"
                    href="${service.link}">

                    فتح الخدمة ➜

                </a>

            </article>

        `).join("");

}


document.addEventListener(
    "DOMContentLoaded",
    renderServices
);