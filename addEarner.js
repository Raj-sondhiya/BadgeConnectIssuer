document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname || "/";
    if (!path.includes("addEarner.html") && !path.includes("add-earner")) return;

    initMassUpload();
    initSingleEarnerForm();
    initPopovers();
    initMassUploadToggle();
});

// Popup for question mark icons
function initPopovers() {
    // Initialize all popovers
    const popoverElements = document.querySelectorAll('[data-bs-toggle="popover"]');
    const popovers = [...popoverElements].map(el => new bootstrap.Popover(el, {
        trigger: 'click',
        placement: 'right',
        html: true,
    }));

    // Close all popovers when clicking outside
    document.addEventListener('click', (event) => {
        popoverElements.forEach((el) => {
            const popover = bootstrap.Popover.getInstance(el);
            if (!popover) return;

            // If click target is outside both the popover trigger and popover content
            if (!el.contains(event.target) && !document.querySelector('.popover')?.contains(event.target)) {
                popover.hide();
            }
        });
    });
}



/* -------------------- MASS UPLOAD -------------------- */
function initMassUpload() {
    const fileInput = document.getElementById("csvFileInput");
    const uploadBtn = document.getElementById("selectFileBtn");
    const actions = document.getElementById("uploadActions");
    const validateBtn = document.getElementById("validateCsvBtn");
    const cancelBtn = document.getElementById("cancelCsvBtn");

    const previewContainer = document.getElementById("csvPreviewContainer");
    const table = document.getElementById("csvPreviewTable");

    if (!fileInput || !uploadBtn) return;

    let parsedRows = [];

    // Step 1: When user selects file, show Validate + Cancel
    uploadBtn.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", () => {
        if (fileInput.files.length) {
            uploadBtn.classList.add("d-none");
            actions.classList.remove("d-none");
        }
    });

    // Step 2: Validate CSV
    validateBtn.addEventListener("click", () => {
        const file = fileInput.files[0];
        if (!file) {
            Swal.fire({
                icon: "warning",
                title: "No File Selected",
                text: "Please select a CSV file first.",
            });
            return;
        }


        const reader = new FileReader();
        reader.onload = () => {
            parsedRows = parseCSV(reader.result);
            if (!parsedRows.length) {
                Swal.fire({
                    icon: "error",
                    title: "Invalid CSV",
                    text: "The selected CSV is empty or improperly formatted.",
                });
                return;
            }

            showCsvPreview(parsedRows);
        };
        reader.readAsText(file);
    });

    // Step 3: Show preview with Upload + Cancel
    function showCsvPreview(rows) {
        previewContainer.classList.remove("d-none");
        actions.classList.add("d-none"); // hide Validate/Cancel
        table.innerHTML = "";

        const keys = Object.keys(rows[0]);
        const thead = document.createElement("thead");
        thead.innerHTML = `<tr>${keys.map((k) => `<th>${escapeHtml(k)}</th>`).join("")}</tr>`;
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        rows.forEach((row) => {
            const tr = document.createElement("tr");
            tr.innerHTML = keys.map((k) => `<td>${escapeHtml(row[k])}</td>`).join("");
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        // Replace bottom buttons with Upload + Cancel
        const footer = document.createElement("div");
        footer.className = "d-flex justify-content-center mt-3 gap-2";
        footer.innerHTML = `
            <button class="btn btn-primary" id="uploadCsvFinalBtn">Issue</button>
            <button class="btn btn-secondary" id="cancelCsvFinalBtn">Cancel</button>
        `;
        previewContainer.querySelector(".card-body").appendChild(footer);

        // Upload → Save to localStorage
        document.getElementById("uploadCsvFinalBtn").addEventListener("click", () => {
            const existing = JSON.parse(localStorage.getItem("earners") || "[]");
            localStorage.setItem("earners", JSON.stringify([...existing, ...parsedRows]));
            Swal.fire({
                icon: "success",
                title: "Badge Issued Successfully",
                text: `${parsedRows.length} earners saved successfully.`,
                timer: 2000,
                showConfirmButton: false
            }).then(() => window.location.href = "earnerList.html");
            return;

            window.location.href = "earnerList.html";
        });

        // Cancel → reload
        document.getElementById("cancelCsvFinalBtn").addEventListener("click", () => location.reload());
    }

    // Cancel before validation → reload
    cancelBtn.addEventListener("click", () => location.reload());
}

/* -------------------- SINGLE EARNER FORM (Accordion Version) -------------------- */
function initSingleEarnerForm() {
    const panels = ["earnerTab", "badgeTab", "orgTab"];
    const nextBtn = document.getElementById("nextTabBtn");
    const prevBtn = document.getElementById("prevTabBtn");
    const issueBtn = document.getElementById("validateEarnerBtn");
    const accordion = document.getElementById("earnerAccordion");

    if (!accordion) return;
    let currentIndex = 0;

    // Show accordion section by index
    function showSection(index) {
        panels.forEach((id, i) => {
            const section = document.getElementById(id);
            const headerButton = document.querySelector(`[data-bs-target="#${id}"]`);
            if (!section || !headerButton) return;
            const instance = bootstrap.Collapse.getOrCreateInstance(section, { toggle: false });

            if (i === index) {
                instance.show();
                headerButton.classList.remove("collapsed");
            } else {
                instance.hide();
                headerButton.classList.add("collapsed");
            }
        });

        prevBtn.classList.toggle("d-none", index === 0);
        nextBtn.classList.toggle("d-none", index === panels.length - 1);
        issueBtn.classList.toggle("d-none", index !== panels.length - 1);
    }

    // Move between accordion sections
    nextBtn.addEventListener("click", () => {
        if (currentIndex < panels.length - 1) {
            currentIndex++;
            showSection(currentIndex);
        }
    });

    prevBtn.addEventListener("click", () => {
        if (currentIndex > 0) {
            currentIndex--;
            showSection(currentIndex);
        }
    });

    // Sync buttons when user clicks accordion headers
    document.addEventListener("shown.bs.collapse", (e) => {
        const idx = panels.indexOf(e.target.id);
        if (idx >= 0) {
            currentIndex = idx;
            showSection(currentIndex);
        }
    });

    // Issue button: validate and save
    issueBtn.addEventListener("click", () => {
        const requiredFields = [
            "firstName",
            "lastName",
            "email",
            "badgeId",
            "issueDate",
            "orgLocation",
        ];

        let missing = [];
        const data = {};

        requiredFields.forEach((id) => {
            const el = document.getElementById(id);
            const value = el ? el.value.trim() : "";
            data[id] = value;
            if (!value) missing.push(id);
        });

        // Optional fields
        ["mobile", "orgName"].forEach((id) => {
            const el = document.getElementById(id);
            data[id] = el ? el.value.trim() : "";
        });

        if (missing.length > 0) {
            Swal.fire({
                icon: "warning",
                title: "Missing Fields",
                text: "Please fill all required fields before issuing the badge.",
            });
            return;
        }

        // Save to localStorage
        const earners = JSON.parse(localStorage.getItem("earners") || "[]");
        earners.push(data);
        localStorage.setItem("earners", JSON.stringify(earners));

        Swal.fire({
            icon: "success",
            text: "Badge issued successfully.",
            timer: 2000,
            showConfirmButton: false,
        }).then(() => {
            window.location.href = "earnerList.html";
        });
    });

    showSection(currentIndex);
}



// ✅ Initialize Flatpickr for date fields
flatpickr("#issueDate", {
    dateFormat: "d-m-Y",
    allowInput: true
});

// =========================
// MASS UPLOAD TOGGLE (shared small helper)
// =========================
function initMassUploadToggle() {
    const section = document.getElementById("massUploadSection");
    const form = document.getElementById("singleEarnerForm");
    if (!section || !form) return;

    document.getElementById("addSingleEarnerBtn")?.addEventListener("click", () => {
        section.classList.add("d-none");
        form.classList.remove("d-none");
    });

    document.getElementById("backToUploadBtn")?.addEventListener("click", () => {
        form.classList.add("d-none");
        section.classList.remove("d-none");
    });
}



/* -------------------- UTILITIES -------------------- */
function parseCSV(text) {
    const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
    if (!lines.length) return [];
    const header = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
    return lines.slice(1).map((line) => {
        const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
        const obj = {};
        header.forEach((k, i) => (obj[k || `col${i}`] = cols[i] || ""));
        return obj;
    });
}

function escapeHtml(s) {
    return s?.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;") ?? s;
}
