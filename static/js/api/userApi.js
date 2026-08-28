/**
 * ==========================================================
 * TO DO SOLO
 * USER API
 * ==========================================================
 */

const UserAPI = {

    async getProfile() {

        return requestUserJSON(
            "/api/user/"
        );

    },


    async updateProfile(
        profileData = {}
    ) {

        return requestUserJSON(
            "/api/user/update/",
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json",

                    "X-CSRFToken":
                        getUserCSRFToken(),
                },

                body:
                    JSON.stringify(
                        profileData
                    ),
            }
        );

    },

};


async function requestUserJSON(
    url,
    options = {}
) {

    const response =
        await fetch(
            url,
            {
                credentials: "same-origin",

                headers: {
                    "Accept":
                        "application/json",

                    ...(options.headers || {}),
                },

                ...options,
            }
        );


    const data =
        await response.json()
            .catch(() => null);


    if (!response.ok) {

        throw new Error(
            data?.message ||
            data?.detail ||
            `User request failed (${response.status})`
        );

    }


    return data;

}


function getUserCSRFToken() {

    const cookie =
        document.cookie
            .split("; ")
            .find(
                row =>
                    row.startsWith(
                        "csrftoken="
                    )
            );


    return cookie
        ? decodeURIComponent(
            cookie.split("=")[1]
        )
        : "";

}


window.UserAPI =
    UserAPI;