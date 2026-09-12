/**
 * ==========================================================
 * TO DO SOLO
 * TASK FORM UI
 * ==========================================================
 */

document.addEventListener(
    "DOMContentLoaded",
    () => {
        initializeTaskForm();
    }
);


/**
 * ==========================================================
 * LANGUAGE
 * ==========================================================
 */

function getCurrentLanguage() {

    return (
        document.documentElement.lang ||
        "en"
    );

}


function getFormText(key) {

    const translations = {

        en: {

            titleRequired:
                "Task title is required.",

            creating:
                "Creating...",

            saving:
                "Saving...",

        },

        ar: {

            titleRequired:
                "عنوان المهمة مطلوب.",

            creating:
                "جارٍ الإنشاء...",

            saving:
                "جارٍ الحفظ...",

        },

    };


    const language =
        getCurrentLanguage();


    return (
        translations[language] ||
        translations.en
    )[key];

}


/**
 * ==========================================================
 * INITIALIZE TASK FORM
 * ==========================================================
 */

function initializeTaskForm() {

    const form =
        document.querySelector(
            ".js-task-form"
        );


    if (!form) {
        return;
    }


    initializeReminderUI(form);


    form.addEventListener(
        "submit",
        handleTaskFormSubmit
    );

}


/**
 * ==========================================================
 * REMINDER UI
 * ==========================================================
 */

function initializeReminderUI(form) {

    const reminderType =
        form.querySelector(
            "#id_reminder_type"
        );


    if (!reminderType) {
        return;
    }


    /*
     * Apply the correct state
     * immediately.
     */

    updateReminderFields(
        form,
        reminderType.value
    );


    /*
     * Update whenever the
     * reminder type changes.
     */

    reminderType.addEventListener(
        "change",
        () => {

            updateReminderFields(
                form,
                reminderType.value
            );

        }
    );

}


/**
 * ==========================================================
 * UPDATE REMINDER FIELDS
 * ==========================================================
 */

function updateReminderFields(
    form,
    reminderType
) {

    const reminderDate =
        form.querySelector(
            "#id_reminder_date"
        );


    const reminderTime =
        form.querySelector(
            "#id_reminder_time"
        );


    const weekdaysContainer =
        form.querySelector(
            ".reminder-weekdays"
        );


    const dateField =
        reminderDate?.closest(
            ".form-field"
        );


    const timeField =
        reminderTime?.closest(
            ".form-field"
        );


    const weekdaysField =
        weekdaysContainer?.closest(
            ".form-field"
        );


    /*
     * Hide everything first.
     */

    setFieldVisibility(
        dateField,
        false
    );

    setFieldVisibility(
        timeField,
        false
    );

    setFieldVisibility(
        weekdaysField,
        false
    );


    /*
     * ONCE
     *
     * Example:
     * September 20
     * 08:30 PM
     */

    if (
        reminderType === "once"
    ) {

        setFieldVisibility(
            dateField,
            true
        );

        setFieldVisibility(
            timeField,
            true
        );

        return;
    }


    /*
     * DAILY
     *
     * Example:
     * Every day
     * 08:30 PM
     */

    if (
        reminderType === "daily"
    ) {

        setFieldVisibility(
            timeField,
            true
        );

        return;
    }


    /*
     * WEEKLY
     *
     * Example:
     * Monday + Wednesday
     * 08:30 PM
     */

    if (
        reminderType === "weekly"
    ) {

        setFieldVisibility(
            weekdaysField,
            true
        );

        setFieldVisibility(
            timeField,
            true
        );

    }

}


/**
 * ==========================================================
 * FIELD VISIBILITY
 * ==========================================================
 */

function setFieldVisibility(
    field,
    visible
) {

    if (!field) {
        return;
    }


    if (visible) {

        field.removeAttribute(
            "hidden"
        );

        field.classList.add(
            "is-visible"
        );

    }
    else {

        field.setAttribute(
            "hidden",
            ""
        );

        field.classList.remove(
            "is-visible"
        );

    }

}


/**
 * ==========================================================
 * SUBMIT
 * ==========================================================
 */

function handleTaskFormSubmit(event) {

    const form =
        event.currentTarget;


    const submitButton =
        form.querySelector(
            ".js-task-form-submit"
        );


    const titleInput =
        form.querySelector(
            "#id_title"
        );


    const title =
        titleInput?.value.trim() ||
        "";


    /*
     * Validate title.
     */

    if (!title) {

        event.preventDefault();


        showFormToast(
            getFormText(
                "titleRequired"
            ),
            "error"
        );


        titleInput?.focus();


        return;
    }


    /*
     * Keep normal Django form
     * submission.
     */

    if (submitButton) {

        submitButton.disabled =
            true;


        const mode =
            form.dataset.mode;


        submitButton.textContent =
            mode === "edit"
                ? getFormText("saving")
                : getFormText("creating");

    }

}


/**
 * ==========================================================
 * TOAST
 * ==========================================================
 */

function showFormToast(
    message,
    type = "success"
) {

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


    requestAnimationFrame(() => {

        toast.classList.add(
            "is-visible"
        );

    });


    setTimeout(() => {

        toast.classList.remove(
            "is-visible"
        );


        setTimeout(() => {

            toast.remove();

        }, 250);

    }, 2500);

}