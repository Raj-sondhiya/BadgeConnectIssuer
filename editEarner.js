document.addEventListener("DOMContentLoaded", () => {
    const draft = JSON.parse(localStorage.getItem("earnerEditDraft") || "{}");
    if (!draft.record) {
        alert("No earner record found to edit.");
        window.location.href = "earnerList.html";
        return;
    }

    const { record, index } = draft;

    // Pre-fill form fields
    document.getElementById("firstName").value =
        record.firstName || record["First name"] || "";
    document.getElementById("lastName").value =
        record.lastName || record["Last name"] || "";
    document.getElementById("email").value =
        record.email || record["email"] || "";
    document.getElementById("mobile").value =
        record.mobile || record["Mobile Number"] || "";

    // Handle cancel
    document.getElementById("cancelBtn").addEventListener("click", () => {
        if (confirm("Discard changes and go back?")) {
            window.location.href = "earnerList.html";
        }
    });

    // Handle update
    document.getElementById("editEarnerForm").addEventListener("submit", e => {
        e.preventDefault();

        const updated = {
            ...record,
            firstName: document.getElementById("firstName").value.trim(),
            lastName: document.getElementById("lastName").value.trim(),
            email: document.getElementById("email").value.trim(),
            mobile: document.getElementById("mobile").value.trim()
        };

        const data = JSON.parse(localStorage.getItem("earners") || "[]");
        data[index] = updated;
        localStorage.setItem("earners", JSON.stringify(data));
        localStorage.removeItem("earnerEditDraft");

        alert("Earner details updated successfully!");
        window.location.href = "earnerList.html";
    });
});
