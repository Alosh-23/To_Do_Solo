/**
 * ==========================================================
 * TO DO SOLO
 * TASK FORM UI
 * ==========================================================
 */

document.addEventListener("DOMContentLoaded", () => {

    initializeTaskForm();

});


/**
 * ==========================================================
 * LANGUAGE
 * ==========================================================
 */

function getCurrentLanguage() {

    return document.documentElement.lang || "en";

}


function getFormText(key) {

    const translations = {

        en: {

            titleRequired:
                "Task title is required.",

            createSuccess:
                "✓ Task created successfully",

            updateSuccess:
                "✓ Task updated successfully",

            error:
                "Something went wrong. Please try again.",

            saving:
                "Saving...",

            creating:
                "Creating...",

            createTask:
                "Create Task",

            saveChanges:
                "Save Changes",

        },

        ar: {

            titleRequired:
                "عنوان المهمة مطلوب.",

            createSuccess:
                "✓ تم إنشاء المهمة بنجاح",

            updateSuccess:
                "✓ تم تحديث المهمة بنجاح",

            error:
                "حدث خطأ. حاول مرة أخرى.",

            saving:
                "جارٍ الحفظ...",

            creating:
                "جارٍ الإنشاء...",

            createTask:
                "إنشاء مهمة",

            saveChanges:
                "حفظ التغييرات",

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
 * INITIALIZE
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


    form.addEventListener(
        "submit",
        handleTaskFormSubmit
    );

}


/**
 * ==========================================================
 * SUBMIT
 * ==========================================================
 */

async function handleTaskFormSubmit(event) {

    event.preventDefault();


    const form =
        event.currentTarget;


    const submitButton =
        form.querySelector(
            ".js-task-form-submit"
        );


    if (
        !submitButton ||
        submitButton.disabled
    ) {

        return;

    }


    const titleInput =
        form.querySelector(
            "#id_title"
        );


    const descriptionInput =
        form.querySelector(
            "#id_description"
        );


    const dueDateInput =
        form.querySelector(
            "#id_due_date"
        );


    const title =
        titleInput?.value.trim() || "";


    const description =
        descriptionInput?.value.trim() || "";


    const dueDate =
        dueDateInput?.value || null;


    // ======================================================
    // VALIDATION
    // ======================================================

    if (!title) {

        showFormToast(
            getFormText(
                "titleRequired"
            ),
            "error"
        );

        titleInput?.focus();

        return;

    }


    const mode =
        form.dataset.mode;


    const taskId =
        form.dataset.taskId;


    const taskData = {

        title,

        description,

        due_date:
            dueDate || null,

    };


    // ======================================================
    // DISABLE SUBMIT
    // ======================================================

    submitButton.disabled = true;


    submitButton.textContent =
        mode === "edit"
            ? getFormText("saving")
            : getFormText("creating");


    try {

        let response;


        // ==================================================
        // EDIT
        // ==================================================

        if (
            mode === "edit" &&
            taskId
        ) {

            response =
                await window.TasksAPI.updateTask(
                    taskId,
                    taskData
                );

        }

        // ==================================================
        // CREATE
        // ==================================================

        else {

            response =
                await window.TasksAPI.createTask(
                    taskData
                );

        }


        // ==================================================
        // VALIDATE RESPONSE
        // ==================================================

        if (!response.success) {

            throw new Error(
                response.message ||
                "Task operation failed."
            );

        }


        // ==================================================
        // UPDATE USER STATE
        // ==================================================

        if (
            window.ToDoSoloState &&
            response.profile
        ) {

            window.ToDoSoloState.updateUser(
                response.profile
            );

        }


        // ==================================================
        // SUCCESS TOAST
        // ==================================================

        showFormToast(

            mode === "edit"
                ? getFormText("updateSuccess")
                : getFormText("createSuccess"),

            "success"

        );


        // ==================================================
        // RETURN TO TASKS
        // ==================================================

        setTimeout(() => {

            window.location.href =
                "/tasks/";

        }, 700);

    }
    catch (error) {

        console.error(
            "Task form error:",
            error
        );


        showFormToast(
            getFormText("error"),
            "error"
        );


        submitButton.disabled = false;


        submitButton.textContent =
            mode === "edit"
                ? getFormText(
                    "saveChanges"
                )
                : getFormText(
                    "createTask"
                );

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