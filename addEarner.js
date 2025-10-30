document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname || "/";
    if (!path.includes("addEarner.html") && !path.includes("add-earner")) return;

    initMassUpload();
    initSingleEarnerForm();
});

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
        if (!file) return alert("Please select a CSV file first.");

        const reader = new FileReader();
        reader.onload = () => {
            parsedRows = parseCSV(reader.result);
            if (!parsedRows.length) return alert("Empty or invalid CSV file.");
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
            <button class="btn btn-success" id="uploadCsvFinalBtn">Upload</button>
            <button class="btn btn-secondary" id="cancelCsvFinalBtn">Cancel</button>
        `;
        previewContainer.querySelector(".card-body").appendChild(footer);

        // Upload → Save to localStorage
        document.getElementById("uploadCsvFinalBtn").addEventListener("click", () => {
            const existing = JSON.parse(localStorage.getItem("earners") || "[]");
            localStorage.setItem("earners", JSON.stringify([...existing, ...parsedRows]));
            alert(`✅ ${parsedRows.length} earners saved successfully.`);
            window.location.href = "earnerList.html";
        });

        // Cancel → reload
        document.getElementById("cancelCsvFinalBtn").addEventListener("click", () => location.reload());
    }

    // Cancel before validation → reload
    cancelBtn.addEventListener("click", () => location.reload());
}

/* -------------------- SINGLE EARNER FORM -------------------- */
function initSingleEarnerForm() {
    const tabs = [...document.querySelectorAll("#earnerFormTabs .nav-link")];
    const nextBtn = document.getElementById("nextTabBtn");
    const prevBtn = document.getElementById("prevTabBtn");
    const validateBtn = document.getElementById("validateEarnerBtn");
    const form = document.getElementById("earnerForm");
    const previewContainer = document.getElementById("singlePreviewContainer");
    const previewTable = document.getElementById("singlePreviewTable");

    if (!form) return;

    let currentPreview = null;

    function showTab(index) {
        tabs[index].click();
        prevBtn.classList.toggle("d-none", index === 0);
        nextBtn.classList.toggle("d-none", index === tabs.length - 1);
        validateBtn.classList.toggle("d-none", index !== tabs.length - 1);
    }

    nextBtn.addEventListener("click", () => {
        const idx = tabs.findIndex((t) => t.classList.contains("active"));
        if (idx < tabs.length - 1) showTab(idx + 1);
    });

    prevBtn.addEventListener("click", () => {
        const idx = tabs.findIndex((t) => t.classList.contains("active"));
        if (idx > 0) showTab(idx - 1);
    });

    tabs.forEach((t, i) => t.addEventListener("shown.bs.tab", () => showTab(i)));

    // Step 1: Validate on last tab
    validateBtn.addEventListener("click", () => {
        const inputs = form.querySelectorAll("input, select, textarea");
        const row = {};
        inputs.forEach((i) => (row[i.id] = i.value.trim()));

        if (!row.firstName || !row.lastName || !row.email || !row.badgeId || !row.issueDate || !row.orgLocation) {
            return alert("Please fill in all required fields before validating.");
        }

        currentPreview = row;

        // Step 2: Show preview with Upload + Cancel
        previewContainer.classList.remove("d-none");
        previewTable.innerHTML = "";

        const thead = document.createElement("thead");
        const tbody = document.createElement("tbody");
        const trHead = document.createElement("tr");
        const trBody = document.createElement("tr");

        for (const [key, val] of Object.entries(row)) {
            trHead.innerHTML += `<th>${escapeHtml(key)}</th>`;
            trBody.innerHTML += `<td>${escapeHtml(val)}</td>`;
        }

        thead.appendChild(trHead);
        tbody.appendChild(trBody);
        previewTable.appendChild(thead);
        previewTable.appendChild(tbody);

        // Add Upload + Cancel buttons dynamically
        const footer = document.createElement("div");
        footer.className = "d-flex justify-content-center mt-3 gap-2";
        footer.innerHTML = `
            <button class="btn btn-success" id="uploadSingleFinalBtn">Upload</button>
            <button class="btn btn-secondary" id="cancelSingleFinalBtn">Cancel</button>
        `;
        previewContainer.querySelector(".card-body").appendChild(footer);

        // Upload → Save to localStorage
        document.getElementById("uploadSingleFinalBtn").addEventListener("click", () => {
            const existing = JSON.parse(localStorage.getItem("earners") || "[]");
            existing.push(currentPreview);
            localStorage.setItem("earners", JSON.stringify(existing));
            alert("✅ Earner saved successfully.");
            window.location.href = "earnerList.html";
        });

        // Cancel → reload
        document.getElementById("cancelSingleFinalBtn").addEventListener("click", () => location.reload());
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
