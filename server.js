const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Temporary in-memory data
let reports = [
    {
        id: 1,
        reportName: "Rahul Sharma",
        contact: "rahul@gmail.com",
        incidentDate: "2026-08-10",
        transactionId: "TXN123456",
        amount: 5000,
        incidentType: "Fake UPI Request",
        description: "Received a suspicious UPI payment request.",
        additionalInfo: "Caller asked for UPI PIN.",
        status: "Under Review"
    },
    {
        id: 2,
        reportName: "Priya Patil",
        contact: "9876543210",
        incidentDate: "2026-08-12",
        transactionId: "TXN789012",
        amount: 2500,
        incidentType: "Phishing",
        description: "Received a fake payment link.",
        additionalInfo: "Payment link was sent through SMS.",
        status: "Reported"
    }
];

let nextId = 3;

// ----------------------------------------------------
// HOME
// ----------------------------------------------------

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ----------------------------------------------------
// GET ALL REPORTS
// GET /api/reports
// ----------------------------------------------------

app.get("/api/reports", (req, res) => {
    res.status(200).json({
        success: true,
        count: reports.length,
        data: reports
    });
});

// ----------------------------------------------------
// GET SINGLE REPORT
// GET /api/reports/:id
// ----------------------------------------------------

app.get("/api/reports/:id", (req, res) => {
    const id = Number(req.params.id);

    const report = reports.find(r => r.id === id);

    if (!report) {
        return res.status(404).json({
            success: false,
            message: "Report not found"
        });
    }

    res.status(200).json({
        success: true,
        data: report
    });
});

// ----------------------------------------------------
// CREATE REPORT
// POST /api/reports
// ----------------------------------------------------

app.post("/api/reports", (req, res) => {

    const {
        reportName,
        contact,
        incidentDate,
        transactionId,
        amount,
        incidentType,
        description,
        additionalInfo
    } = req.body;

    // Basic validation
    if (
        !reportName ||
        !contact ||
        !incidentDate ||
        !transactionId ||
        !amount ||
        !incidentType ||
        !description
    ) {
        return res.status(400).json({
            success: false,
            message: "Please provide all required fields"
        });
    }

    if (Number(amount) <= 0) {
        return res.status(400).json({
            success: false,
            message: "Amount must be greater than 0"
        });
    }

    const newReport = {
        id: nextId++,
        reportName,
        contact,
        incidentDate,
        transactionId,
        amount: Number(amount),
        incidentType,
        description,
        additionalInfo: additionalInfo || "",
        status: "Reported"
    };

    reports.push(newReport);

    res.status(201).json({
        success: true,
        message: "Fraud report submitted successfully",
        data: newReport
    });
});

// ----------------------------------------------------
// UPDATE REPORT
// PUT /api/reports/:id
// ----------------------------------------------------

app.put("/api/reports/:id", (req, res) => {

    const id = Number(req.params.id);

    const reportIndex = reports.findIndex(r => r.id === id);

    if (reportIndex === -1) {
        return res.status(404).json({
            success: false,
            message: "Report not found"
        });
    }

    const {
        reportName,
        contact,
        incidentDate,
        transactionId,
        amount,
        incidentType,
        description,
        additionalInfo,
        status
    } = req.body;

    if (!reportName || !contact || !incidentDate || !transactionId ||
        !amount || !incidentType || !description) {

        return res.status(400).json({
            success: false,
            message: "Required fields are missing"
        });
    }

    reports[reportIndex] = {
        id,
        reportName,
        contact,
        incidentDate,
        transactionId,
        amount: Number(amount),
        incidentType,
        description,
        additionalInfo: additionalInfo || "",
        status: status || reports[reportIndex].status
    };

    res.status(200).json({
        success: true,
        message: "Report updated successfully",
        data: reports[reportIndex]
    });
});

// ----------------------------------------------------
// DELETE REPORT
// DELETE /api/reports/:id
// ----------------------------------------------------

app.delete("/api/reports/:id", (req, res) => {

    const id = Number(req.params.id);

    const reportIndex = reports.findIndex(r => r.id === id);

    if (reportIndex === -1) {
        return res.status(404).json({
            success: false,
            message: "Report not found"
        });
    }

    const deletedReport = reports.splice(reportIndex, 1);

    res.status(200).json({
        success: true,
        message: "Report deleted successfully",
        data: deletedReport[0]
    });
});

// ----------------------------------------------------
// 404 ERROR
// ----------------------------------------------------

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found"
    });
});

// ----------------------------------------------------
// START SERVER
// ----------------------------------------------------

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});