/**
 * ==========================================================
 * TO DO SOLO
 * SETTINGS UI
 * ==========================================================
 */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeSettingsUI();

    }
);


/**
 * ==========================================================
 * LANGUAGE
 * ==========================================================
 */

function getSettingsLanguage() {

    return (
        document.documentElement.lang ||
        "en"
    );

}


/**
 * ==========================================================
 * TEXT
 * ==========================================================
 */

function getSettingsText(key) {

    const translations = {

        en: {

            notificationGranted:
                "Notifications are enabled.",

            notificationDenied:
                "Notifications are blocked.",

            notificationDefault:
                "Permission not requested.",

            notificationUnsupported:
                "Notifications are not supported.",

            notificationEnabled:
                "Notifications enabled successfully.",

            soundPlayed:
                "Test sound played.",

        },

        ar: {

            notificationGranted:
                "تم تفعيل الإشعارات.",

            notificationDenied:
                "الإشعارات محظورة.",

            notificationDefault:
                "لم يتم طلب إذن الإشعارات.",

            notificationUnsupported:
                "الإشعارات غير مدعومة.",

            notificationEnabled:
                "تم تفعيل الإشعارات بنجاح.",

            soundPlayed:
                "تم تشغيل الصوت التجريبي.",

        },

    };


    const language =
        getSettingsLanguage();


    return (
        translations[language] ||
        translations.en
    )[key];

}


/**
 * ==========================================================
 * INITIALIZE
 * ==========================================================
 */

function initializeSettingsUI() {

    initializeTheme();

    initializeSound();

    initializeNotifications();

    initializeLanguage();

}


/**
 * ==========================================================
 * THEME
 * ==========================================================
 */

function initializeTheme() {

    const themeButton =
        document.querySelector(
            "[data-theme-toggle]"
        );


    if (!themeButton) {
        return;
    }


    updateThemeButton();


    themeButton.addEventListener(
        "click",
        () => {

            if (
                !window.ToDoSoloTheme ||
                typeof window.ToDoSoloTheme.toggle !==
                    "function"
            ) {

                return;

            }


            const theme =
                window.ToDoSoloTheme.toggle();


            updateThemeButton(
                theme
            );

        }
    );

}


function updateThemeButton(
    theme = null
) {

    const button =
        document.querySelector(
            "[data-theme-toggle]"
        );


    if (!button) {
        return;
    }


    const currentTheme =
        theme ||
        window.ToDoSoloTheme?.get?.() ||
        "light";


    button.setAttribute(
        "aria-pressed",
        String(
            currentTheme === "dark"
        )
    );


    button.dataset.theme =
        currentTheme;

}


/**
 * ==========================================================
 * SOUND
 * ==========================================================
 */

function initializeSound() {

    const soundButton =
        document.querySelector(
            "[data-sound-test]"
        );


    if (!soundButton) {
        return;
    }


    soundButton.addEventListener(
        "click",
        () => {

            if (
                !window.ToDoSoloSounds ||
                typeof window.ToDoSoloSounds.success !==
                    "function"
            ) {

                return;
            }


            try {

                window.ToDoSoloSounds.success();


                showSettingsToast(
                    getSettingsText(
                        "soundPlayed"
                    ),
                    "success"
                );

            }
            catch (error) {

                console.error(
                    "Failed to play sound:",
                    error
                );

            }

        }
    );

}


/**
 * ==========================================================
 * NOTIFICATIONS
 * ==========================================================
 */

function initializeNotifications() {

    const enableButton =
        document.querySelector(
            "[data-notification-enable]"
        );


    const statusElement =
        document.querySelector(
            "[data-notification-status]"
        );


    if (
        !enableButton &&
        !statusElement
    ) {

        return;

    }


    updateNotificationStatus();


    if (!enableButton) {
        return;
    }


    enableButton.addEventListener(
        "click",
        async () => {

            if (
                !window.ToDoSoloNotifications
            ) {

                return;

            }


            const permission =
                await window.ToDoSoloNotifications
                    .requestPermission();


            updateNotificationStatus();


            if (
                permission === "granted"
            ) {

                showSettingsToast(
                    getSettingsText(
                        "notificationEnabled"
                    ),
                    "success"
                );


                await window.ToDoSoloNotifications
                    .show(
                        "To Do Solo",
                        {
                            body:
                                getSettingsText(
                                    "notificationGranted"
                                ),
                        }
                    );

            }

        }
    );

}


function updateNotificationStatus() {

    const statusElement =
        document.querySelector(
            "[data-notification-status]"
        );


    if (!statusElement) {
        return;
    }


    if (
        !window.ToDoSoloNotifications ||
        typeof window.ToDoSoloNotifications
            .getPermission !==
            "function"
    ) {

        return;
    }


    const permission =
        window.ToDoSoloNotifications
            .getPermission();


    if (
        permission === "granted"
    ) {

        statusElement.textContent =
            getSettingsText(
                "notificationGranted"
            );

        return;

    }


    if (
        permission === "denied"
    ) {

        statusElement.textContent =
            getSettingsText(
                "notificationDenied"
            );

        return;

    }


    if (
        permission === "unsupported"
    ) {

        statusElement.textContent =
            getSettingsText(
                "notificationUnsupported"
            );

        return;

    }


    statusElement.textContent =
        getSettingsText(
            "notificationDefault"
        );

}


/**
 * ==========================================================
 * LANGUAGE
 * ==========================================================
 */

function initializeLanguage() {

    const languageSelect =
        document.querySelector(
            "#settings-language"
        );


    if (!languageSelect) {
        return;
    }


    languageSelect.addEventListener(
        "change",
        () => {

            changeLanguage(
                languageSelect.value
            );

        }
    );

}


async function changeLanguage(
    language
) {

    if (
        !language ||
        !["en", "ar"].includes(language)
    ) {

        return;

    }


    const csrfToken =
        getCSRFToken();


    const body =
        new URLSearchParams();


    body.append(
        "language",
        language
    );


    body.append(
        "next",
        window.location.pathname +
        window.location.search
    );


    try {

        const response =
            await fetch(
                "/i18n/setlang/",
                {
                    method: "POST",

                    credentials:
                        "same-origin",

                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded;charset=UTF-8",

                        "X-CSRFToken":
                            csrfToken,

                        "Accept":
                            "text/html,application/xhtml+xml",
                    },

                    body:
                        body.toString(),
                }
            );


        if (
            !response.ok
        ) {

            throw new Error(
                `Language change failed (${response.status})`
            );

        }


        /*
         * Django normally redirects after a successful
         * language change. Fetch follows the redirect,
         * so reload the current page to render the
         * newly selected language.
         */

        window.location.reload();

    }
    catch (error) {

        console.error(
            "Failed to change language:",
            error
        );

    }

}


/**
 * ==========================================================
 * CSRF
 * ==========================================================
 */

function getCSRFToken() {

    const cookie =
        document.cookie
            .split("; ")
            .find(
                row =>
                    row.startsWith(
                        "csrftoken="
                    )
            );


    if (!cookie) {
        return "";
    }


    return decodeURIComponent(
        cookie.substring(
            "csrftoken=".length
        )
    );

}


/**
 * ==========================================================
 * TOAST
 * ==========================================================
 */

function showSettingsToast(
    message,
    type = "success"
) {

    if (
        window.ToDoSoloToast &&
        typeof window.ToDoSoloToast.show ===
            "function"
    ) {

        window.ToDoSoloToast.show(
            message,
            type
        );

        return;
    }


    /*
     * Fallback only when toast.js is unavailable.
     */

    const existingToast =
        document.querySelector(
            ".todo-solo-toast"
        );


    if (existingToast) {
        existingToast.remove();
    }


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        `todo-solo-toast todo-solo-toast-${type}`;


    toast.textContent =
        message;


    document.body.appendChild(
        toast
    );


    requestAnimationFrame(
        () => {

            toast.classList.add(
                "is-visible"
            );

        }
    );


    setTimeout(
        () => {

            toast.classList.remove(
                "is-visible"
            );


            setTimeout(
                () => {

                    toast.remove();

                },
                250
            );

        },
        2500
    );

}


/**
 * ==========================================================
 * PUBLIC API
 * ==========================================================
 */

window.ToDoSoloSettingsUI = {

    initialize:
        initializeSettingsUI,

    refreshNotifications:
        updateNotificationStatus,

    refreshTheme:
        updateThemeButton,

};

