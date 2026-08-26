/**
 * ==========================================================
 * TO DO SOLO
 * TASKS API
 * ==========================================================
 */

const TasksAPI = {

    /**
     * ======================================================
     * GET ALL TASKS
     * ======================================================
     */

    async getTasks() {

        const response = await fetch(
            "/api/tasks/",
            {
                method: "GET",

                headers: {
                    "Accept": "application/json",
                },

                credentials: "same-origin",
            }
        );


        if (!response.ok) {

            throw new Error(
                `Failed to load tasks (${response.status})`
            );

        }


        return await response.json();

    },


    /**
     * ======================================================
     * CREATE TASK
     * ======================================================
     */

    async createTask(taskData = {}) {

        const csrfToken =
            this.getCSRFToken();


        const response = await fetch(
            "/api/tasks/create/",
            {
                method: "POST",

                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken,
                },

                credentials: "same-origin",

                body: JSON.stringify(
                    taskData
                ),
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data?.detail ||
                data?.message ||
                `Failed to create task (${response.status})`
            );

        }


        return data;

    },


    /**
     * ======================================================
     * UPDATE TASK
     * ======================================================
     */

    async updateTask(
        taskId,
        taskData = {}
    ) {

        const csrfToken =
            this.getCSRFToken();


        const response = await fetch(
            `/api/tasks/${taskId}/update/`,
            {
                method: "PUT",

                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken,
                },

                credentials: "same-origin",

                body: JSON.stringify(
                    taskData
                ),
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data?.detail ||
                data?.message ||
                `Failed to update task (${response.status})`
            );

        }


        return data;

    },


    /**
     * ======================================================
     * TOGGLE TASK COMPLETION
     * ======================================================
     */

    async toggleTask(taskId) {

        const csrfToken =
            this.getCSRFToken();


        const response = await fetch(
            `/api/tasks/${taskId}/toggle/`,
            {
                method: "POST",

                headers: {
                    "Accept": "application/json",
                    "X-CSRFToken": csrfToken,
                },

                credentials: "same-origin",
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data?.detail ||
                data?.message ||
                `Failed to toggle task (${response.status})`
            );

        }


        return data;

    },


    /**
     * ======================================================
     * DELETE TASK
     * ======================================================
     */

    async deleteTask(taskId) {

        const csrfToken =
            this.getCSRFToken();


        const response = await fetch(
            `/api/tasks/${taskId}/delete/`,
            {
                method: "POST",

                headers: {
                    "Accept": "application/json",
                    "X-CSRFToken": csrfToken,
                },

                credentials: "same-origin",
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data?.detail ||
                data?.message ||
                `Failed to delete task (${response.status})`
            );

        }


        return data;

    },


    /**
     * ======================================================
     * CSRF TOKEN
     * ======================================================
     */

    getCSRFToken() {

        const cookies =
            document.cookie
                .split(";")
                .map(
                    cookie => cookie.trim()
                );


        for (const cookie of cookies) {

            if (
                cookie.startsWith(
                    "csrftoken="
                )
            ) {

                return decodeURIComponent(
                    cookie.substring(
                        "csrftoken=".length
                    )
                );

            }

        }


        return "";

    },

};


// ==========================================================
// GLOBAL EXPORT
// ==========================================================

window.TasksAPI = TasksAPI;
