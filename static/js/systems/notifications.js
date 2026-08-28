/**
 * ==========================================================
 * TO DO SOLO
 * NOTIFICATIONS SYSTEM
 * ==========================================================
 */

const Notifications = {

    STORAGE_KEY:
        "to_do_solo_notifications",

    MAX_NOTIFICATIONS:
        30,


    /* ======================================================
       BROWSER NOTIFICATIONS
    ====================================================== */

    isSupported() {

        return (
            "Notification" in
            window
        );

    },


    getPermission() {

        if (!this.isSupported()) {
            return "unsupported";
        }

        return Notification.permission;

    },


    async requestPermission() {

        if (!this.isSupported()) {
            return "unsupported";
        }

        return Notification.requestPermission();

    },


    async show(
        title,
        options = {}
    ) {

        if (!this.isSupported()) {
            return false;
        }


        if (
            Notification.permission !==
            "granted"
        ) {

            await this.requestPermission();

        }


        if (
            Notification.permission !==
            "granted"
        ) {

            return false;

        }


        new Notification(
            title,
            options
        );


        return true;

    },


    /* ======================================================
       STORAGE
    ====================================================== */

    getAll() {

        try {

            const stored =
                localStorage.getItem(
                    this.STORAGE_KEY
                );


            if (!stored) {
                return [];
            }


            const notifications =
                JSON.parse(stored);


            return Array.isArray(
                notifications
            )
                ? notifications
                : [];

        } catch (error) {

            console.error(
                "Failed to read notifications:",
                error
            );

            return [];

        }

    },


    saveAll(notifications) {

        try {

            localStorage.setItem(
                this.STORAGE_KEY,
                JSON.stringify(
                    notifications
                )
            );

        } catch (error) {

            console.error(
                "Failed to save notifications:",
                error
            );

        }

    },


    /* ======================================================
       ADD NOTIFICATION
    ====================================================== */

    add(
        title,
        message,
        icon = "🔔"
    ) {

        const notifications =
            this.getAll();


        notifications.unshift({

            id:
                Date.now() +
                Math.random(),

            title:
                String(title),

            message:
                String(message),

            icon:
                String(icon),

            read:
                false,

            createdAt:
                new Date().toISOString(),

        });


        notifications.splice(
            this.MAX_NOTIFICATIONS
        );


        this.saveAll(
            notifications
        );


        this.render();

        this.updateBadge();


        return notifications[0];

    },


    /* ======================================================
       READ / CLEAR
    ====================================================== */

    markAllRead() {

        const notifications =
            this.getAll();


        notifications.forEach(
            (notification) => {

                notification.read =
                    true;

            }
        );


        this.saveAll(
            notifications
        );


        this.render();

        this.updateBadge();

    },


    clearAll() {

        this.saveAll([]);

        this.render();

        this.updateBadge();

    },


    getUnreadCount() {

        return this.getAll()
            .filter(
                notification =>
                    !notification.read
            )
            .length;

    },


    /* ======================================================
       BELL
    ====================================================== */

    initializeBell() {

        const bell =
            document.querySelector(
                "[data-notifications-toggle]"
            );


        if (!bell) {
            return;
        }


        if (
            bell.dataset.notificationsInitialized ===
            "true"
        ) {

            return;

        }


        bell.dataset.notificationsInitialized =
            "true";


        /*
         * Open / close notification panel.
         */

        bell.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                event.stopPropagation();

                this.togglePanel();

            }
        );


        /*
         * Close the panel when clicking
         * outside the notification area.
         */

        document.addEventListener(
            "click",
            (event) => {

                const wrapper =
                    document.querySelector(
                        ".todo-solo-notifications"
                    );


                if (!wrapper) {
                    return;
                }


                if (
                    event.target === bell ||
                    bell.contains(
                        event.target
                    )
                ) {

                    return;

                }


                if (
                    !wrapper.contains(
                        event.target
                    )
                ) {

                    this.closePanel();

                }

            }
        );


        /*
         * Recalculate panel position
         * when the viewport changes.
         */

        window.addEventListener(
            "resize",
            () => {

                const wrapper =
                    document.querySelector(
                        ".todo-solo-notifications"
                    );


                if (
                    wrapper &&
                    wrapper.classList.contains(
                        "is-open"
                    )
                ) {

                    this.positionPanel();

                }

            }
        );


        /*
         * Initialize the notification UI.
         */

        this.render();

        this.updateBadge();

    },


    /* ======================================================
       CREATE WRAPPER
    ====================================================== */

    ensureWrapper() {

        let wrapper =
            document.querySelector(
                ".todo-solo-notifications"
            );


        if (wrapper) {
            return wrapper;
        }


        const bell =
            document.querySelector(
                "[data-notifications-toggle]"
            );


        if (!bell) {
            return null;
        }


        wrapper =
            document.createElement(
                "div"
            );


        wrapper.className =
            "todo-solo-notifications";


        /*
         * Add the wrapper beside the bell
         * without moving the bell itself.
         */

        bell.parentElement.appendChild(
            wrapper
        );


        const panel =
            document.createElement(
                "div"
            );


        panel.className =
            "todo-solo-notifications__panel";


        panel.innerHTML = `
            <div class="todo-solo-notifications__header">

                <strong
                    data-notifications-title
                >
                    Notifications
                </strong>

                <button
                    type="button"
                    class="todo-solo-notifications__read-all"
                    data-notifications-read
                >
                    Mark all as read
                </button>

            </div>

            <div
                class="todo-solo-notifications__list"
                data-notifications-list
            ></div>
        `;


        wrapper.appendChild(
            panel
        );


        const readButton =
            wrapper.querySelector(
                "[data-notifications-read]"
            );


        if (readButton) {

            readButton.addEventListener(
                "click",
                (event) => {

                    event.preventDefault();

                    event.stopPropagation();

                    this.markAllRead();

                }
            );

        }


        return wrapper;

    },


    /* ======================================================
       TOGGLE PANEL
    ====================================================== */

    togglePanel() {

        const wrapper =
            this.ensureWrapper();


        if (!wrapper) {
            return;
        }


        const isOpen =
            wrapper.classList.toggle(
                "is-open"
            );


        if (isOpen) {

            this.positionPanel();

        }

    },


    /* ======================================================
       POSITION PANEL
    ====================================================== */

    positionPanel() {

        const bell =
            document.querySelector(
                "[data-notifications-toggle]"
            );


        const wrapper =
            document.querySelector(
                ".todo-solo-notifications"
            );


        if (!bell || !wrapper) {
            return;
        }


        const panel =
            wrapper.querySelector(
                ".todo-solo-notifications__panel"
            );


        if (!panel) {
            return;
        }


        const bellRect =
            bell.getBoundingClientRect();


        /*
         * Make the panel visible temporarily
         * so the browser can measure it correctly.
         */

        const wasHidden =
            !wrapper.classList.contains(
                "is-open"
            );


        if (wasHidden) {

            panel.style.visibility =
                "hidden";

            panel.style.opacity =
                "0";

            panel.style.display =
                "block";

        }


        const panelWidth =
            panel.offsetWidth || 360;


        const panelHeight =
            panel.offsetHeight || 300;


        const spacing =
            10;


        /*
         * Position directly below the bell.
         */

        let top =
            bellRect.bottom +
            spacing;


        /*
         * Align the panel with the
         * right edge of the bell.
         */

        let right =
            window.innerWidth -
            bellRect.right;


        /*
         * Keep the panel inside viewport.
         */

        const minimumRight =
            16;


        const maximumRight =
            window.innerWidth -
            panelWidth -
            16;


        right =
            Math.max(
                minimumRight,
                Math.min(
                    right,
                    maximumRight
                )
            );


        /*
         * Keep the panel vertically visible.
         */

        const maximumTop =
            window.innerHeight -
            panelHeight -
            16;


        if (
            top >
            maximumTop
        ) {

            top =
                Math.max(
                    16,
                    maximumTop
                );

        }


        panel.style.top =
            `${top}px`;


        panel.style.right =
            `${right}px`;


        /*
         * Restore normal CSS visibility.
         */

        if (wasHidden) {

            panel.style.removeProperty(
                "visibility"
            );

            panel.style.removeProperty(
                "opacity"
            );

            panel.style.removeProperty(
                "display"
            );

        }

    },


    /* ======================================================
       CLOSE PANEL
    ====================================================== */

    closePanel() {

        const wrapper =
            document.querySelector(
                ".todo-solo-notifications"
            );


        if (!wrapper) {
            return;
        }


        wrapper.classList.remove(
            "is-open"
        );

    },


    /* ======================================================
       RENDER
    ====================================================== */

    render() {

        const wrapper =
            this.ensureWrapper();


        if (!wrapper) {
            return;
        }


        const list =
            wrapper.querySelector(
                "[data-notifications-list]"
            );


        if (!list) {
            return;
        }


        const notifications =
            this.getAll();


        const language =
            document.documentElement.lang ||
            "en";


        const readAllText =
            language === "ar"
                ? "وضع الكل كمقروء"
                : "Mark all as read";


        const titleText =
            language === "ar"
                ? "الإشعارات"
                : "Notifications";


        const emptyText =
            language === "ar"
                ? "لا توجد إشعارات جديدة."
                : "No notifications yet.";


        const timeText =
            language === "ar"
                ? "الآن"
                : "Just now";


        const title =
            wrapper.querySelector(
                "[data-notifications-title]"
            );


        if (title) {

            title.textContent =
                titleText;

        }


        const readButton =
            wrapper.querySelector(
                "[data-notifications-read]"
            );


        if (readButton) {

            readButton.textContent =
                readAllText;

        }


        if (!notifications.length) {

            list.innerHTML = `
                <div class="todo-solo-notifications__empty">
                    ${emptyText}
                </div>
            `;

            return;

        }


        list.innerHTML =
            notifications
                .map(
                    (notification) => {

                        return `
                            <button
                                type="button"
                                class="
                                    todo-solo-notification
                                    ${
                                        notification.read
                                            ? ""
                                            : "is-unread"
                                    }
                                "
                                data-notification-id="${notification.id}"
                            >

                                <span
                                    class="todo-solo-notification__icon"
                                >
                                    ${this.escapeHtml(
                                        notification.icon
                                    )}
                                </span>

                                <span
                                    class="todo-solo-notification__content"
                                >

                                    <strong>
                                        ${this.escapeHtml(
                                            notification.title
                                        )}
                                    </strong>

                                    <span>
                                        ${this.escapeHtml(
                                            notification.message
                                        )}
                                    </span>

                                    <small>
                                        ${timeText}
                                    </small>

                                </span>

                            </button>
                        `;

                    }
                )
                .join("");


        /*
         * Notification click handling.
         */

        list
            .querySelectorAll(
                "[data-notification-id]"
            )
            .forEach(
                (item) => {

                    item.addEventListener(
                        "click",
                        (event) => {

                            event.preventDefault();

                            event.stopPropagation();


                            const id =
                                Number(
                                    item.dataset.notificationId
                                );


                            const current =
                                this.getAll();


                            current.forEach(
                                (notification) => {

                                    if (
                                        Number(
                                            notification.id
                                        ) === id
                                    ) {

                                        notification.read =
                                            true;

                                    }

                                }
                            );


                            this.saveAll(
                                current
                            );


                            item.classList.remove(
                                "is-unread"
                            );


                            this.updateBadge();

                        }
                    );

                }
            );

    },


    /* ======================================================
       BADGE
    ====================================================== */

    updateBadge() {

        const bell =
            document.querySelector(
                "[data-notifications-toggle]"
            );


        if (!bell) {
            return;
        }


        let badge =
            bell.querySelector(
                ".todo-solo-notifications__badge"
            );


        const unread =
            this.getUnreadCount();


        if (unread <= 0) {

            if (badge) {
                badge.remove();
            }

            return;

        }


        if (!badge) {

            badge =
                document.createElement(
                    "span"
                );


            badge.className =
                "todo-solo-notifications__badge";


            bell.appendChild(
                badge
            );

        }


        badge.textContent =
            unread > 99
                ? "99+"
                : String(unread);

    },


    /* ======================================================
       ESCAPE HTML
    ====================================================== */

    escapeHtml(value) {

        return String(value)

            .replace(
                /&/g,
                "&amp;"
            )

            .replace(
                /</g,
                "&lt;"
            )

            .replace(
                />/g,
                "&gt;"
            )

            .replace(
                /"/g,
                "&quot;"
            )

            .replace(
                /'/g,
                "&#039;"
            );

    },

};


/* ==========================================================
   INITIALIZATION
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        Notifications.initializeBell();

    }
);


/* ==========================================================
   GLOBAL EXPORT
========================================================== */

window.ToDoSoloNotifications =
    Notifications;

