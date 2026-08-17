const API_URL = "/api/reports";


// ======================================================
// LOAD REPORTS
// ======================================================

async function loadReports() {

    try {

        const response = await fetch(API_URL);

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        displayReports(result.data);

        updateStatistics(result.data);

    } catch (error) {

        console.error(error);

        showPopup(
            "Error",
            "Unable to load reports."
        );
    }
}


// ======================================================
// DISPLAY REPORTS
// ======================================================

function displayReports(reports) {

    const container =
        document.getElementById("reportsContainer");

    const search =
        document.getElementById("searchInput")
            .value
            .toLowerCase();

    const filter =
        document.getElementById("filterType").value;


    const filteredReports = reports.filter(report => {

        const matchesSearch =
            report.reportName.toLowerCase().includes(search) ||
            report.transactionId.toLowerCase().includes(search) ||
            report.incidentType.toLowerCase().includes(search);


        const matchesFilter =
            filter === "All" ||
            report.incidentType === filter;


        return matchesSearch && matchesFilter;

    });


    if (filteredReports.length === 0) {

        container.innerHTML = `
            <div class="report-card">
                <h3>No Reports Found</h3>
                <p>No fraud reports match your search.</p>
            </div>
        `;

        return;
    }


    container.innerHTML = filteredReports.map(report => {

        return `
            <div class="report-card">

                <h3>
                    ${escapeHTML(report.incidentType)}
                </h3>

                <p>
                    <strong>Report ID:</strong>
                    ${report.id}
                </p>

                <p>
                    <strong>Name:</strong>
                    ${escapeHTML(report.reportName)}
                </p>

                <p>
                    <strong>Contact:</strong>
                    ${escapeHTML(report.contact)}
                </p>

                <p>
                    <strong>Date:</strong>
                    ${escapeHTML(report.incidentDate)}
                </p>

                <p>
                    <strong>Transaction ID:</strong>
                    ${escapeHTML(report.transactionId)}
                </p>

                <p>
                    <strong>Amount:</strong>
                    ₹${Number(report.amount).toLocaleString("en-IN")}
                </p>

                <p>
                    <strong>Description:</strong>
                    ${escapeHTML(report.description)}
                </p>

                <p>
                    <strong>Status:</strong>
                    <span class="status">
                        ${escapeHTML(report.status)}
                    </span>
                </p>

                <div class="card-buttons">

                    <button
                        class="edit-btn"
                        onclick="editReport(${report.id})">
                        Edit
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteReport(${report.id})">
                        Delete
                    </button>

                </div>

            </div>
        `;

    }).join("");
}


// ======================================================
// SUBMIT REPORT
// ======================================================

document
    .getElementById("reportForm")
    .addEventListener("submit", async function(event) {

        event.preventDefault();


        const reportName =
            document.getElementById("reportName").value.trim();

        const contact =
            document.getElementById("contact").value.trim();

        const incidentDate =
            document.getElementById("incidentDate").value;

        const transactionId =
            document.getElementById("transactionId").value.trim();

        const amount =
            document.getElementById("amount").value;

        const incidentType =
            document.getElementById("incidentType").value;

        const description =
            document.getElementById("description").value.trim();

        const additionalInfo =
            document.getElementById("additionalInfo").value.trim();


        // Frontend validation

        if (reportName.length < 2) {

            showPopup(
                "Validation Error",
                "Please enter a valid name."
            );

            return;
        }


        if (contact.length < 5) {

            showPopup(
                "Validation Error",
                "Please enter valid contact information."
            );

            return;
        }


        if (!incidentDate) {

            showPopup(
                "Validation Error",
                "Please select the incident date."
            );

            return;
        }


        if (transactionId.length < 3) {

            showPopup(
                "Validation Error",
                "Please enter a valid transaction ID."
            );

            return;
        }


        if (Number(amount) <= 0) {

            showPopup(
                "Validation Error",
                "Amount must be greater than zero."
            );

            return;
        }


        if (!incidentType) {

            showPopup(
                "Validation Error",
                "Please select the incident type."
            );

            return;
        }


        if (description.length < 5) {

            showPopup(
                "Validation Error",
                "Description must contain at least 5 characters."
            );

            return;
        }


        const reportData = {

            reportName,
            contact,
            incidentDate,
            transactionId,
            amount,
            incidentType,
            description,
            additionalInfo

        };


        try {

            const response = await fetch(API_URL, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(reportData)

            });


            const result = await response.json();


            if (!response.ok) {

                throw new Error(result.message);

            }


            showPopup(
                "Success",
                "Fraud report submitted successfully!"
            );


            document
                .getElementById("reportForm")
                .reset();


            loadReports();


            document
                .getElementById("reports")
                .scrollIntoView();


        } catch (error) {

            showPopup(
                "Error",
                error.message
            );

        }

    });


// ======================================================
// DELETE REPORT
// ======================================================

async function deleteReport(id) {

    const confirmDelete =
        confirm("Are you sure you want to delete this report?");


    if (!confirmDelete) {
        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method: "DELETE"
            }
        );


        const result = await response.json();


        if (!response.ok) {

            throw new Error(result.message);

        }


        showPopup(
            "Success",
            "Report deleted successfully."
        );


        loadReports();


    } catch (error) {

        showPopup(
            "Error",
            error.message
        );

    }
}


// ======================================================
// EDIT REPORT
// ======================================================

async function editReport(id) {

    try {

        const response =
            await fetch(`${API_URL}/${id}`);

        const result =
            await response.json();


        if (!response.ok) {
            throw new Error(result.message);
        }


        const report = result.data;


        document.getElementById("reportName").value =
            report.reportName;

        document.getElementById("contact").value =
            report.contact;

        document.getElementById("incidentDate").value =
            report.incidentDate;

        document.getElementById("transactionId").value =
            report.transactionId;

        document.getElementById("amount").value =
            report.amount;

        document.getElementById("incidentType").value =
            report.incidentType;

        document.getElementById("description").value =
            report.description;

        document.getElementById("additionalInfo").value =
            report.additionalInfo;


        document
            .getElementById("report")
            .scrollIntoView();


        const form =
            document.getElementById("reportForm");


        // Change submit behaviour temporarily

        form.dataset.editId = id;

        form.querySelector(".submit-btn").textContent =
            "Update Report";


        form.onsubmit = async function(event) {

            event.preventDefault();

            await updateReport(id);

        };


    } catch (error) {

        showPopup(
            "Error",
            error.message
        );

    }
}


// ======================================================
// UPDATE REPORT
// ======================================================

async function updateReport(id) {

    const reportData = {

        reportName:
            document.getElementById("reportName").value.trim(),

        contact:
            document.getElementById("contact").value.trim(),

        incidentDate:
            document.getElementById("incidentDate").value,

        transactionId:
            document.getElementById("transactionId").value.trim(),

        amount:
            document.getElementById("amount").value,

        incidentType:
            document.getElementById("incidentType").value,

        description:
            document.getElementById("description").value.trim(),

        additionalInfo:
            document.getElementById("additionalInfo").value.trim(),

        status: "Updated"

    };


    try {

        const response = await fetch(
            `${API_URL}/${id}`,
            {

                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(reportData)

            }
        );


        const result =
            await response.json();


        if (!response.ok) {
            throw new Error(result.message);
        }


        showPopup(
            "Success",
            "Report updated successfully!"
        );


        const form =
            document.getElementById("reportForm");


        form.reset();

        form.onsubmit = null;

        form.querySelector(".submit-btn").textContent =
            "Submit Report";


        loadReports();


    } catch (error) {

        showPopup(
            "Error",
            error.message
        );

    }
}


// ======================================================
// SEARCH
// ======================================================

document
    .getElementById("searchInput")
    .addEventListener("input", loadReports);


document
    .getElementById("filterType")
    .addEventListener("change", loadReports);


// ======================================================
// STATISTICS
// ======================================================

function updateStatistics(reports) {

    document.getElementById("totalReports").textContent =
        reports.length;


    const totalAmount =
        reports.reduce(
            (sum, report) =>
                sum + Number(report.amount),
            0
        );


    document.getElementById("totalAmount").textContent =
        "₹" + totalAmount.toLocaleString("en-IN");


    const underReview =
        reports.filter(
            report => report.status === "Under Review"
        ).length;


    document.getElementById("reviewReports").textContent =
        underReview;
}


// ======================================================
// POPUP
// ======================================================

function showPopup(title, message) {

    document.getElementById("popupTitle")
        .textContent = title;

    document.getElementById("popupMessage")
        .textContent = message;

    document.getElementById("popup")
        .style.display = "flex";
}


function closePopup() {

    document.getElementById("popup")
        .style.display = "none";
}


// ======================================================
// BASIC HTML SECURITY
// ======================================================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ======================================================
// INITIAL LOAD
// ======================================================

loadReports();