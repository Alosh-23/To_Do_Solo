// ================= SECTIONS =================

const sections = document.querySelectorAll("main section");

function hideAllSections() {

    sections.forEach(section => {

        section.style.display = "none";

    });

}

function showSection(id) {

    hideAllSections();

    const section = document.getElementById(id);

    if (section) {

        section.style.display = "block";

    }

}


// ================= SIDEBAR =================

document.addEventListener("DOMContentLoaded", () => {

    // فتح وإغلاق السايدبار

    const menuBtn = document.getElementById("menu-toggle");

    const sidebar = document.querySelector(".sidebar");

    if (menuBtn && sidebar) {

        menuBtn.addEventListener("click", () => {

            sidebar.classList.toggle("hidden");

        });

    }

    // جميع أزرار السايدبار

    const buttons = {

        "dashboard-btn": "dashboard-section",

        "tasks-btn": "tasks-section",

        "quests-btn": "quests-section",

        "missions-btn": "missions-section",

        "achievements-btn": "achievements-section",

        "stats-btn": "stats-section",

        "settings-btn": "settings-section"

    };

    Object.keys(buttons).forEach(id => {

        const btn = document.getElementById(id);

        if (!btn) return;

        btn.addEventListener("click", () => {

            showSection(buttons[id]);

        });

    });

    // الصفحة الافتراضية

    if (document.getElementById("dashboard-section")) {

        showSection("dashboard-section");

    }

});