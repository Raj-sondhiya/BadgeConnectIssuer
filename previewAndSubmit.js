document.addEventListener("DOMContentLoaded", () => {
    initMassUploadPreview();
    initSingleEarnerPreview();
});

// ==========================
// MASS UPLOAD PREVIEW LOGIC
// ==========================
function initMassUploadPreview() {
    const csvInput = document.getElementById("csvFileInput");
    const selectBtn = document.getElementById("selectFileBtn");
    const validateBtn = document.getElementById("validateCsvBtn");
    const previewContainer = document.getElementById("csvPreviewContainer");
    const previewTable = document.getElementById("csvPreviewTable");
    const submitBtn = document.getElementById("uploadValidatedBtn");

    if (!csvInput || !selectBtn || !validateBtn || !previewContainer) return;

    selectBtn.addEventListener("click", () => csvInput.click());

    csvInput.addEventListener("change", () => {
        if (!csvInput.files.length) return;
        validateBtn.classList.remove("d-none");
        selectBtn.textContent = "Change File";
    });

    validateBtn.addEventListener("click", () => {
        const fileName = csvInput.files[0]?.name || "sample.csv";

        previewContainer.classList.remove("d-none");

        previewTable.innerHTML = `
            <thead>
                <tr>
                    <th>FirstName</th>
                    <th>LastName</th>
                    <th>EmailAddress</th>
                    <th>BadgeId</th>
                    <th>IssueDate</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Demo</td>
                    <td>User</td>
                    <td>demo@example.com</td>
                    <td>12345</td>
                    <td>01/01/2024</td>
                </tr>
            </tbody>
        `;

        submitBtn.disabled = false;
    });

    submitBtn.addEventListener("click", () => {
        const data = JSON.parse(localStorage.getItem("earners")) || [];
        data.push({
            firstName: "Demo",
            lastName: "User",
            email: "demo@example.com",
            badgeId: "12345",
            issueDate: "01/01/2024"
        });
        localStorage.setItem("earners", JSON.stringify(data));
        window.location.href = "earnerList.html";
    });
}

// ==============================
// SINGLE EARNER PREVIEW LOGIC
// ==============================
function initSingleEarnerPreview() {
    const form = document.getElementById("earnerForm");
    const validateBtn = document.getElementById("validateEarnerBtn");
    const previewContainer = document.getElementById("singlePreviewContainer");
    const previewTable = document.getElementById("singlePreviewTable");
    const submitBtn = document.getElementById("submitSingleBtn");

    if (!form || !validateBtn || !previewContainer) return;

    document.getElementById("nextTabBtn")?.addEventListener("click", () => {
        const active = document.querySelector("#earnerFormTabs .nav-link.active");
        if (active?.id === "tab-org") {
            validateBtn.classList.remove("d-none");
        }
    });

    validateBtn.addEventListener("click", () => {
        const f = form;

        previewContainer.classList.remove("d-none");
        previewTable.innerHTML = `
            <thead>
                <tr>
                    <th>Field</th><th>Value</th>
                </tr>
            </thead>
            <tbody>
                <tr><td>First Name</td><td>${f.firstName.value}</td></tr>
                <tr><td>Last Name</td><td>${f.lastName.value}</td></tr>
                <tr><td>Email</td><td>${f.email.value}</td></tr>
                <tr><td>Mobile</td><td>${f.mobile.value}</td></tr>
                <tr><td>Badge ID</td><td>${f.badgeId.value}</td></tr>
                <tr><td>Issue Date</td><td>${f.issueDate.value}</td></tr>
                <tr><td>Organization</td><td>${f.orgName.value}</td></tr>
                <tr><td>Location</td><td>${f.orgLocation.value}</td></tr>
            </tbody>
        `;

        submitBtn.disabled = false;
    });

    submitBtn.addEventListener("click", () => {
        const f = form;
        const data = JSON.parse(localStorage.getItem("earners")) || [];

        data.push({
            firstName: f.firstName.value,
            lastName: f.lastName.value,
            email: f.email.value,
            contact: f.mobile.value,
            badgeId: f.badgeId.value,
            issueDate: f.issueDate.value,
            organization: f.orgName.value,
            location: f.orgLocation.value
        });

        localStorage.setItem("earners", JSON.stringify(data));
        window.location.href = "earnerList.html";
    });
}
