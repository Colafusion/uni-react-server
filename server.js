const express = require("express")
const cors = require('cors');
const bodyParser = require("body-parser");
const db = require("./database.js")
const data = require("./server_setup_data.json");


const app = express()

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Server port
const HTTP_PORT = 8080

// Start server
app.listen(HTTP_PORT, () => {
    console.log("Server running on http://localhost:%PORT%".replace("%PORT%", HTTP_PORT))
});


// Root endpoint
app.get("/", (req, res, next) => {
    res.json({"message": "Ok"})
});

for (const [key, values] of Object.entries(data)) {

    app.get(`/${key}/`, (req, res, next) => {
        let sql = `SELECT * FROM ${key} ORDER BY ${values[0]}`;
        console.log(sql)
        const params = []
        db.all(sql, params, (err, rows) => {
            if (err) {
                res.status(400).json({"error": err.message});
                return;
            }
            res.json({
                "message": "success",
                "data": rows
            })
        });
    });

    app.get(`/${key}/search/`, (req, res, next) => {
        let queries = {}
        values.map(val => queries[val] = req.query[val])

        console.log(queries)
        let valid_queries = {}
        Object.keys(queries).map(key => (queries[key] ? key : null)).filter(val => val != null).map(key => valid_queries[key] = queries[key])

        console.log(valid_queries)
        let sql = `SELECT * FROM patients WHERE ${Object.keys(valid_queries).map(key => `${key} = ?`).join(' AND ')}`
        console.log(sql, Object.values(valid_queries))
        db.get(sql, Object.values(valid_queries), (err, row) => {
            if (err) {
                res.status(400).json({"error": err.message});
                return;
            }
            res.json({
                "message": "success",
                "data": row
            })
        });
    });
}


// Default response for any other request
app.use(function (req, res) {
    res.status(404);
});