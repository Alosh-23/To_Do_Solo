// ================= HIDE ALL SECTIONS =================

function hideAllSections() {

    const sections = document.querySelectorAll("main section");

    sections.forEach(section => {

        section.style.display = "none";

    });

}


// ================= SHOW SECTION =================

export function showSection(sectionId) {

    hideAllSections();

    const section = document.getElementById(sectionId);

    if (section) {

        section.style.display = "block";

    }

}


// ================= AFTER PAGE LOAD =================

document.addEventListener("DOMContentLoaded", () => {

    // ================= SIDEBAR TOGGLE =================

    const menuToggle =
        document.getElementById("menu-toggle");

    const sidebar =
        document.querySelector(".sidebar");

    if (menuToggle && sidebar) {

        menuToggle.addEventListener("click", () => {

            sidebar.classList.toggle("hidden");

        });

    }


    // ================= NAVIGATION =================

    const navigation = [

        {
            button: "dashboard-btn",
            section: "dashboard-section"
        },

        {
            button: "tasks-btn",
            section: "tasks-section"
        },

        {
            button: "quests-btn",
            section: "quests-section"
        },

        {
            button: "missions-btn",
            section: "missions-section"
        },

        {
            button: "achievements-btn",
            section: "achievements-section"
        },

        {
            button: "stats-btn",
            section: "stats-section"
        },

        {
            button: "settings-btn",
            section: "settings-section"
        }

    ];


    navigation.forEach(item => {

        const button =
            document.getElementById(item.button);

        if (!button) return;

        button.addEventListener("click", () => {

            showSection(item.section);

        });

    });


    // ================= DEFAULT PAGE =================

    showSection("dashboard-section");

});