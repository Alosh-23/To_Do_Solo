/**
 * ==========================================================
 * TO DO SOLO
 * TASK UI
 * ==========================================================
 */

document.addEventListener("DOMContentLoaded", () => {

    initializeTaskButtons();

});


/**
 * ==========================================================
 * LANGUAGE
 * ==========================================================
 */

function getCurrentLanguage() {

    return document.documentElement.lang || "en";

}


function getTaskText(key) {

    const language = getCurrentLanguage();

    const translations = {

        en: {

            markIncomplete:
                "Mark task as incomplete",

            markComplete:
                "Mark task as complete",

            completed:
                "✓ Completed",

            incomplete:
                "Incomplete",

            taskCompleted:
                "✓ Task completed successfully",

            taskIncomplete:
                "Task marked as incomplete",

            taskDeleted:
                "✓ Task deleted successfully",

            error:
                "Something went wrong. Please try again.",

            deleteError:
                "Unable to delete the task.",

        },

        ar: {

            markIncomplete:
                "وضع المهمة كغير مكتملة",

            markComplete:
                "وضع المهمة كمكتملة",

            completed:
                "✓ مكتملة",

            incomplete:
                "غير مكتملة",

            taskCompleted:
                "✓ تم إكمال المهمة بنجاح",

            taskIncomplete:
                "تم وضع المهمة كغير مكتملة",

            taskDeleted:
                "✓ تم حذف المهمة بنجاح",

            error:
                "حدث خطأ. حاول مرة أخرى.",

            deleteError:
                "تعذر حذف المهمة.",

        },

    };


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

function initializeTaskButtons() {

    const completeButtons =
        document.querySelectorAll(
            ".js-task-complete"
        );

    completeButtons.forEach((button) => {

        button.addEventListener(
            "click",
            handleTaskToggle
        );

    });


    const deleteButtons =
        document.querySelectorAll(
            ".js-task-delete"
        );

    deleteButtons.forEach((button) => {

        button.addEventListener(
            "click",
            handleTaskDelete
        );

    });

}


/**
 * ==========================================================
 * TOGGLE TASK
 * ==========================================================
 */

async function handleTaskToggle(event) {

    event.preventDefault();

    const button =
        event.currentTarget;

    
    const previousUser =
        window.ToDoSoloState?.getUser?.() ||
        null;

    const previousLevel =
        Number(
            previousUser?.level || 1
        );

    const container =
        button.closest(
            ".task-complete-form"
        );


    if (!container) {
        return;
    }


    const taskId =
        container.dataset.taskId;


    if (!taskId || button.disabled) {
        return;
    }


    button.disabled = true;


    try {

        const response =
            await window.TasksAPI.toggleTask(
                taskId
            );


        if (!response.success) {

            throw new Error(
                "Task update failed."
            );

        }


        const task =
            response.task;

/* ==================================================
   IN-APP NOTIFICATIONS
================================================== */

const newLevel =
    Number(
        response.profile?.level ||
        previousLevel
    );


/* --------------------------------------------------
   LEVEL UP
-------------------------------------------------- */

if (
    task.completed &&
    newLevel > previousLevel &&
    window.ToDoSoloNotifications
) {

    window.ToDoSoloNotifications.add(
        getCurrentLanguage() === "ar"
            ? "ترقية المستوى"
            : "Level Up",

        getCurrentLanguage() === "ar"
            ? `وصلت إلى المستوى ${newLevel}!`
            : `You reached Level ${newLevel}!`,

        "🎉"
    );

}


/* --------------------------------------------------
   ACHIEVEMENTS
-------------------------------------------------- */

if (
    task.completed &&
    Array.isArray(
        response.unlocked_achievements
    ) &&
    window.ToDoSoloNotifications
) {

    response.unlocked_achievements
        .forEach(
            (achievement) => {

                const label =
                    achievement.label ||
                    achievement.key;


                window.ToDoSoloNotifications.add(
                    getCurrentLanguage() === "ar"
                        ? "إنجاز جديد!"
                        : "Achievement Unlocked!",

                    label,

                    "🏆"
                );

            }
        );

}

        // ==================================================
        // UPDATE STATE
        // ==================================================

        if (
            response.profile &&
            window.ToDoSoloState
        ) {

            window.ToDoSoloState.updateUser(
                response.profile
            );

        }


        // ==================================================
        // UPDATE BUTTON
        // ==================================================

        if (task.completed) {

            button.classList.add(
                "is-completed"
            );

            button.textContent = "✓";

            button.setAttribute(
                "aria-label",
                getTaskText(
                    "markIncomplete"
                )
            );

        }
        else {

            button.classList.remove(
                "is-completed"
            );

            button.textContent = "";

            button.setAttribute(
                "aria-label",
                getTaskText(
                    "markComplete"
                )
            );

        }


        // ==================================================
        // UPDATE TASK CARD
        // ==================================================

        const taskCard =
            container.closest(
                ".task-card"
            );


        if (taskCard) {

            updateTaskStatus(
                taskCard,
                task.completed
            );

        }


        // ==================================================
        // UPDATE DASHBOARD
        // ==================================================

        if (
            window.ToDoSoloDashboard &&
            typeof window.ToDoSoloDashboard.refresh === "function"
        ) {

            window.ToDoSoloDashboard.refresh();

        }


        // ==================================================
        // UPDATE STATISTICS
        // ==================================================

        if (
            window.ToDoSoloStats &&
            typeof window.ToDoSoloStats.refresh === "function"
        ) {

            window.ToDoSoloStats.refresh();

        }


        // ==================================================
        // SUCCESS TOAST
        // ==================================================

        showToast(

            task.completed
                ? getTaskText("taskCompleted")
                : getTaskText("taskIncomplete"),

            "success"

        );


    }
    catch (error) {

        console.error(
            "Failed to toggle task:",
            error
        );


        showToast(
            getTaskText("error"),
            "error"
        );

    }
    finally {

        button.disabled = false;

    }

}


/**
 * ==========================================================
 * DELETE TASK
 * ==========================================================
 */

async function handleTaskDelete(event) {

    event.preventDefault();

    const button =
        event.currentTarget;


    const container =
        button.closest(
            ".task-delete-form"
        );


    if (!container) {
        return;
    }


    const taskId =
        container.dataset.taskId;


    if (!taskId || button.disabled) {
        return;
    }


    const taskCard =
        container.closest(
            ".task-card"
        );


    if (!taskCard) {
        return;
    }


    button.disabled = true;


    try {

        const response =
            await window.TasksAPI.deleteTask(
                taskId
            );


        if (!response.success) {

            throw new Error(
                "Task deletion failed."
            );

        }


        // ==================================================
        // REMOVE TASK FROM UI
        // ==================================================

        taskCard.remove();


        // ==================================================
        // UPDATE DASHBOARD
        // ==================================================

        if (
            window.ToDoSoloDashboard &&
            typeof window.ToDoSoloDashboard.refresh === "function"
        ) {

            window.ToDoSoloDashboard.refresh();

        }


        // ==================================================
        // UPDATE STATISTICS
        // ==================================================

        if (
            window.ToDoSoloStats &&
            typeof window.ToDoSoloStats.refresh === "function"
        ) {

            window.ToDoSoloStats.refresh();

        }


        // ==================================================
        // SUCCESS TOAST
        // ==================================================

        showToast(

            getTaskText(
                "taskDeleted"
            ),

            "success"

        );


    }
    catch (error) {

        console.error(
            "Failed to delete task:",
            error
        );


        showToast(

            getTaskText(
                "deleteError"
            ),

            "error"

        );


        button.disabled = false;

    }

}


/**
 * ==========================================================
 * UPDATE TASK STATUS
 * ==========================================================
 */

function updateTaskStatus(
    taskCard,
    completed
) {

    const metaItems =
        taskCard.querySelectorAll(
            ".task-card-meta span"
        );


    if (!metaItems.length) {
        return;
    }


    const statusElement =
        metaItems[
            metaItems.length - 1
        ];


    statusElement.textContent =
        completed
            ? getTaskText("completed")
            : getTaskText("incomplete");

}


/**
 * ==========================================================
 * TOAST
 * ==========================================================
 */

function showToast(
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
