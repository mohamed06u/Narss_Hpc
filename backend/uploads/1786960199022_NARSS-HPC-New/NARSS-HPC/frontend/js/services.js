const services = [
    {
        title: "🧠 AI Model Development & Training",
        description: "تدريب وتحسين نماذج التعلم العميق باستخدام موارد GPU.",
        link: "services/ai-training.html"
    },
    {
        title: "📊 Data Analytics",
        description: "تحليل ومعالجة البيانات المكانية وبيانات الاستشعار عن بعد.",
        link: "services/data-analytics.html"
    },
    {
        title: "🌍 Land Subsidence",
        description: "متابعة وتحليل هبوط سطح الأرض باستخدام بيانات الاستشعار عن بعد.",
        link: "services/land-subsidence.html"
    },
    {
        title: "🌊 Oil Spill Detection",
        description: "تحليل الصور الفضائية لاكتشاف ومتابعة بقع الزيت.",
        link: "services/oil-spill.html"
    },
    {
        title: "⚙️ On-Demand Computing",
        description: "طلب موارد الحوسبة الفائقة للمهام العلمية والحسابية.",
        link: "services/ondemand-computing.html"
    }
];

function renderServices() {
    const container = document.getElementById("services-container");
    if (!container) return;

    container.innerHTML = services.map(service => `
        <article class="service-card">
            <div>
                <h3>${service.title}</h3>
                <p>${service.description}</p>
            </div>
            <a class="btn-service" href="${service.link}">فتح الخدمة ➜</a>
        </article>
    `).join("");
}

document.addEventListener("DOMContentLoaded", renderServices);
