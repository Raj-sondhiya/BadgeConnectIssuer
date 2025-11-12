// Testing function for authentication code in local system.

/*
const xmlBody = `
<xmlrequest>
  <operation>CS</operation>
  <authenticationKey>5HGdHz60U31Bj0bKVhkv</authenticationKey>
</xmlrequest>
`;

async function callBadgeCertAPI() {
    try {
        const response = await fetch("http://localhost:3000/api/badgecert", {
            method: "POST",
            headers: { "Content-Type": "application/xml" },
            body: xmlBody
        });

        if (!response.ok) throw new Error(`HTTP error! ${response.status}`);
        const text = await response.text();

        console.log("✅ Response from Backend:");
        console.log(text);

        // optional: show it in the HTML
        document.getElementById("responseBox").textContent = text;
    } catch (err) {
        console.error("❌ Error calling API:", err);
    }
}

document.addEventListener("DOMContentLoaded", callBadgeCertAPI);

*/


document.addEventListener("DOMContentLoaded", async () => {
    const badgesContainer = document.getElementById("badgesContainer");
    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");
    const paginationContainer = document.getElementById("paginationContainer");

    const BADGES_PER_PAGE = 24;
    let allBadges = [];
    let currentPage = 1;

    // Step 1: Get Session ID from backend
    async function getSessionID() {
        const xmlBody = `
      <xmlrequest>
        <operation>CS</operation>
        <authenticationKey>5HGdHz60U31Bj0bKVhkv</authenticationKey>
      </xmlrequest>
    `;

        const response = await fetch("https://badge-connect-issuer-backend.onrender.com/api/badgecert", {
            method: "POST",
            headers: { "Content-Type": "application/xml" },
            body: xmlBody
        });

        const text = await response.text();
        const match = text.match(/<ResponseCode>(.*?)<\/ResponseCode>/);
        if (!match) throw new Error("Failed to fetch session ID");
        return match[1];
    }

    // Step 2: Get badges using sessionID
    async function getBadges(sessionID) {
        const xmlBody = `
      <xmlrequest>
        <operation>QB</operation>
        <sessionID>${sessionID}</sessionID>
        <period>
          <startCreateDateRange>01/01/2018</startCreateDateRange>
          <endCreateDateRange>03/11/2027</endCreateDateRange>
        </period>
      </xmlrequest>
    `;

        const response = await fetch("https://badge-connect-issuer-backend.onrender.com/api/badgecert", {
            method: "POST",
            headers: { "Content-Type": "application/xml" },
            body: xmlBody
        });

        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        const badgeNodes = xmlDoc.getElementsByTagName("badgedetails");

        const badges = [...badgeNodes].map(b => ({
            id: b.querySelector("badgeid")?.textContent || "",
            name: b.querySelector("badgename")?.textContent || "Untitled",
            image: b.querySelector("badgeimagepath")?.textContent || "",
            desc: b.querySelector("badgelongdesc")?.textContent || ""
        }));

        return badges;

    }

    // ✅ Generate random two-digit badge stats (10–99)
    function generateOverallStats() {
        const totalIssued = Math.floor(Math.random() * 90) + 10; // 10–99
        const paidByEarner = Math.floor(Math.random() * (totalIssued - 9)) + 5; // between 5–(total-5)
        const unpaid = totalIssued - paidByEarner;

        document.querySelector(".col-md-3:nth-child(1)").innerHTML = `
        Total Badges Issued: <span class="fw-bold text-primary overall-stats issued" style="cursor:pointer;">${totalIssued}</span>
    `;
        document.querySelector(".col-md-3:nth-child(2)").innerHTML = `
        Paid: <span class="fw-bold text-success overall-stats paid" style="cursor:pointer;">${paidByEarner}</span>
    `;
        document.querySelector(".col-md-3:nth-child(3)").innerHTML = `
        Unpaid: <span class="fw-bold text-danger overall-stats unpaid" style="cursor:pointer;">${unpaid}</span>
    `;
    }


    function generateBadgeStats() {
        const totalIssued = Math.floor(Math.random() * 9) + 1; // 1–9
        const paidByEarner = Math.floor(Math.random() * (totalIssued + 1)); // 0–totalIssued
        const unpaid = totalIssued - paidByEarner;

        return { totalIssued, paidByEarner, unpaid };
    }



    // Step 3: Render badges
    function renderBadges(badges) {
        localStorage.setItem("issuerBadges", JSON.stringify(badges));
        badgesContainer.innerHTML = "";

        if (!badges.length) {
            badgesContainer.innerHTML = `<p class="text-center text-muted">No badges found.</p>`;
            return;
        }

        badges.forEach(badge => {
            const { totalIssued, paidByEarner, unpaid } = generateBadgeStats();

            const col = document.createElement("div");
            col.className = "col-12 col-md-6 col-lg-4 col-xl-3";
            col.innerHTML = `
        <div class="card border-0 shadow-sm rounded-3" style="width:280px" >
            <div class="d-flex align-items-center" style="gap:0; padding:0; margin:0;">

                <!-- LEFT BLOCK -->
                <div class="d-flex align-items-start" style="height:200px;">
                    <div class="card border-0 shadow-sm rounded-3 p-2 h-100">
                     <img src="${badge.image}" alt="${badge.name}" class="img-fluid mb-2 rounded">
                    <span class="fw-semibold small text-dark">${badge.name}</span>
                </div>

                <!-- RIGHT BLOCK (vertically centered & no leading spaces) -->
                <div style="width:150px;height:150px; justify-content:center; padding-left: 6px;
                    display:flex;flex-direction:column;align-items:flex-start;">
                    <span class="fw-semibold small text-dark">${badge.id}</span>
                    <p class="small badge-analytics issued" style="margin:0; cursor:pointer; text-decoration:underline;">
                    Total Issued: <span>${totalIssued}</span></p>
                    <p class="small badge-analytics paid" style="margin:4px 0; cursor:pointer; text-decoration:underline;">
                    Paid by Earner: <span>${paidByEarner}</span></p>
                    <p class="small badge-analytics unpaid" style="margin:0; cursor:pointer; text-decoration:underline;">
                    Unpaid: <span>${unpaid}</span></p>
                </div>
            </div>
        </div>          
        </div>
        `;
            badgesContainer.appendChild(col);
        });
    }

    function openStatsPopup(title, includeReminder = false) {
        const modalTitle = document.getElementById("badgeStatsTitle");
        const tableBody = document.getElementById("badgeStatsTableBody");
        const reminderHeader = document.getElementById("reminderColumnHeader");

        modalTitle.textContent = title;
        tableBody.innerHTML = "";

        // Dummy data (replace later with real fetch)
        const dummyList = [
            { name: "Amit Verma", email: "amit@example.com" },
            { name: "Sneha Sharma", email: "sneha@example.com" },
            { name: "Rohit Singh", email: "rohit@example.com" }
        ];

        reminderHeader.style.display = includeReminder ? "" : "none";

        dummyList.forEach(p => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
            <td>${p.name}</td>
            <td>${p.email}</td>
            ${includeReminder ? `<td><button class="btn btn-sm btn-warning">Send Reminder</button></td>` : ``}
        `;
            tableBody.appendChild(tr);
        });

        const modal = new bootstrap.Modal(document.getElementById("badgeStatsModal"));
        modal.show();
    }

    document.addEventListener("click", (e) => {
        if (e.target.closest(".badge-analytics.issued") || e.target.closest(".overall-stats.issued")) {
            openStatsPopup("Total Issued Badges");
        }
        if (e.target.closest(".badge-analytics.paid") || e.target.closest(".overall-stats.paid")) {
            openStatsPopup("Paid By Earner");
        }
        if (e.target.closest(".badge-analytics.unpaid") || e.target.closest(".overall-stats.unpaid")) {
            openStatsPopup("Unpaid Badges", true);
        }
    });




    // Step 4: Pagination
    function renderPagination(totalBadges) {
        paginationContainer.innerHTML = "";
        const totalPages = Math.ceil(totalBadges / BADGES_PER_PAGE);

        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement("button");
            btn.className = `btn btn-sm ${i === currentPage ? "btn-primary" : "btn-outline-primary"} mx-1`;
            btn.textContent = i;
            btn.addEventListener("click", () => {
                currentPage = i;
                updateDisplayedBadges();
            });
            paginationContainer.appendChild(btn);
        }
    }

    function updateDisplayedBadges() {
        const start = (currentPage - 1) * BADGES_PER_PAGE;
        const end = start + BADGES_PER_PAGE;
        renderBadges(allBadges.slice(start, end));
        renderPagination(allBadges.length);
    }

    // Step 5: Search
    function handleSearch() {
        const query = searchInput.value.trim().toLowerCase();

        // 🔹 If search box is empty, reset to show all badges
        if (!query) {
            currentPage = 1;
            updateDisplayedBadges();
            return;
        }

        const filtered = allBadges.filter(b =>
            b.name.toLowerCase().includes(query) ||
            b.id.toLowerCase().includes(query) ||
            b.desc.toLowerCase().includes(query)
        );

        currentPage = 1;
        renderBadges(filtered.slice(0, BADGES_PER_PAGE));
        renderPagination(filtered.length);
    }

    // 🔍 Trigger search on button click
    searchBtn.addEventListener("click", handleSearch);

    // 🔍 Trigger search when pressing Enter
    searchInput.addEventListener("keypress", e => {
        if (e.key === "Enter") handleSearch();
    });

    // Reset when user clears the search box manually
    searchInput.addEventListener("input", () => {
        if (!searchInput.value.trim()) {
            currentPage = 1;
            updateDisplayedBadges();
        }
    });


    // Step 6: Initialize
    try {
        const sessionID = await getSessionID();
        console.log("✅ Session ID:", sessionID);

        allBadges = await getBadges(sessionID);
        console.log(`✅ Retrieved ${allBadges.length} badges`);
        updateDisplayedBadges();
    } catch (err) {
        console.error("❌ Error:", err);
        badgesContainer.innerHTML = `<p class="text-center text-danger">Failed to load badges. Check console.</p>`;
    }
    generateOverallStats();

});
