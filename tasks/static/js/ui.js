export function editTask(id) {

    const title = document.getElementById(`task-title-${id}`);
    const input = document.getElementById(`edit-input-${id}`);
    const saveBtn = document.getElementById(`save-btn-${id}`);
    const editBtn = document.getElementById(`edit-btn-${id}`);

    if (!title || !input || !saveBtn || !editBtn) {
        console.error("Task elements not found:", id);
        return;
    }

    title.style.display = "none";

    input.style.display = "inline-block";

    editBtn.style.display = "none";

    saveBtn.style.display = "inline-block";

    input.focus();

    input.select();

}