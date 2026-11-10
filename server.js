
const express = require("express");
const db = require("./database/database");

const app = express();

app.use(express.json());

const PORT = 3000;

// Home route
app.get("/", (req, res) => {
    res.send("Welcome to SeedShare Garden API!");
});

// Database test route
app.get("/test-db", (req, res) => {
    try {
        const result = db.prepare("SELECT 1 AS status").get();

        res.json({
            message: "Database connected successfully!",
            database_status: result.status
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});


// GET all gardeners
app.get("/api/gardeners", (req, res) => {
    try {
        const gardeners = db.prepare(
            "SELECT * FROM gardeners"
        ).all();

        res.status(200).json(gardeners);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});


// POST - Add a new gardener
app.post("/api/gardeners", (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                error: "Gardener name is required"
            });
        }

        const result = db.prepare(
            "INSERT INTO gardeners (name) VALUES (?)"
        ).run(name.trim());

        res.status(201).json({
            message: "Gardener added successfully!",
            gardener_id: result.lastInsertRowid,
            name: name.trim()
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

// POST - Add a new garden plot
app.post("/api/plots", (req, res) => {
    try {
        const { name, soil } = req.body;

        // Check required fields
        if (!name || !name.trim() || !soil) {
            return res.status(400).json({
                error: "Plot name and soil are required"
            });
        }

        // Allowed soil values
        const allowedSoils = ["Loam", "Sandy", "Clay"];

        // Validate soil
        if (!allowedSoils.includes(soil)) {
            return res.status(400).json({
                error: "Invalid soil type. Allowed values are: Loam, Sandy, Clay"
            });
        }

        // Insert plot into database
        const result = db.prepare(
            "INSERT INTO plots (name, soil) VALUES (?, ?)"
        ).run(name.trim(), soil);

        // Send success response
        res.status(201).json({
            message: "Plot added successfully!",
            plot_id: result.lastInsertRowid,
            name: name.trim(),
            soil: soil
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

// GET - All plots with optional soil search
app.get("/api/plots", (req, res) => {
    try {
        const { soil } = req.query;

        const allowedSoils = ["Loam", "Sandy", "Clay"];

        if (soil && !allowedSoils.includes(soil)) {
            return res.status(400).json({
                error: "Invalid soil type. Allowed values are: Loam, Sandy, Clay"
            });
        }

        let plots;

        if (soil) {
            plots = db.prepare(
                "SELECT * FROM plots WHERE soil = ?"
            ).all(soil);
        } else {
            plots = db.prepare(
                "SELECT * FROM plots"
            ).all();
        }

        res.status(200).json(plots);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});


// GET - Retrieve one plot by ID
app.get("/api/plots/:id", (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: "Invalid plot ID"
            });
        }

        const plot = db.prepare(
            "SELECT * FROM plots WHERE id = ?"
        ).get(id);

        if (!plot) {
            return res.status(404).json({
                error: "Plot not found"
            });
        }

        res.status(200).json(plot);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

// PUT - Update an existing plot
app.put("/api/plots/:id", (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name, soil } = req.body;

        // Validate plot ID
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: "Invalid plot ID"
            });
        }

        // Check required fields
        if (typeof name !== "string" || !name.trim() ||
            typeof soil !== "string" || !soil.trim()) {
            return res.status(400).json({
                error: "Plot name and soil are required"
            });
        }

        // Allowed soil values
        const allowedSoils = ["Loam", "Sandy", "Clay"];

        // Validate soil
        if (!allowedSoils.includes(soil)) {
            return res.status(400).json({
                error: "Invalid soil type. Allowed values are: Loam, Sandy, Clay"
            });
        }

        // Check whether plot exists
        const existingPlot = db.prepare(
            "SELECT * FROM plots WHERE id = ?"
        ).get(id);

        if (!existingPlot) {
            return res.status(404).json({
                error: "Plot not found"
            });
        }

        // Update plot
        db.prepare(
            "UPDATE plots SET name = ?, soil = ? WHERE id = ?"
        ).run(name.trim(), soil, id);

        res.status(200).json({
            message: "Plot updated successfully!",
            plot_id: id,
            name: name.trim(),
            soil: soil
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

// DELETE - Remove a plot
app.delete("/api/plots/:id", (req, res) => {
    try {
        const id = Number(req.params.id);

        // Validate plot ID
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: "Invalid plot ID"
            });
        }

        // Check whether plot exists
        const existingPlot = db.prepare(
            "SELECT * FROM plots WHERE id = ?"
        ).get(id);

        if (!existingPlot) {
            return res.status(404).json({
                error: "Plot not found"
            });
        }

        // Delete plot
        db.prepare(
            "DELETE FROM plots WHERE id = ?"
        ).run(id);

        res.status(200).json({
            message: "Plot deleted successfully!",
            deleted_plot: existingPlot
        });

    } catch (error) {
        if (error.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
            return res.status(409).json({
                error: "Cannot delete this plot because it is referenced by a lease."
            });
        }

        res.status(500).json({
            error: error.message
        });
    }
});


// GET - Display leases with gardener and plot names
app.get("/api/leases", (req, res) => {
    try {
        const leases = db.prepare(`
            SELECT
                leases.id AS lease_id,
                gardeners.name AS gardener_name,
                plots.name AS plot_name
            FROM leases
            JOIN gardeners
                ON leases.gardener_id = gardeners.id
            JOIN plots
                ON leases.plot_id = plots.id
        `).all();

        res.json(leases);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});


// POST - Create a new lease
app.post("/api/leases", (req, res) => {
    try {
        const { gardener_id, plot_id } = req.body;

        if (!gardener_id || !plot_id) {
            return res.status(400).json({
                error: "Gardener ID and Plot ID are required"
            });
        }

        const gardener = db.prepare(
            "SELECT id FROM gardeners WHERE id = ?"
        ).get(gardener_id);

        const plot = db.prepare(
            "SELECT id FROM plots WHERE id = ?"
        ).get(plot_id);

        if (!gardener || !plot) {
            return res.status(400).json({
                error: "Invalid gardener ID or plot ID"
            });
        }

        const result = db.prepare(`
            INSERT INTO leases (gardener_id, plot_id)
            VALUES (?, ?)
        `).run(gardener_id, plot_id);

        res.status(201).json({
            message: "Lease created successfully!",
            lease_id: result.lastInsertRowid
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});


// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
