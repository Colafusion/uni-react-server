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
app.get("/", (req, res) => {
    res.json({"message": "Ok"})
});
//setup the various GET options
//we iterate through a dict with database table_name:[list of columns in table] format
for (const [key, values] of Object.entries(data)) {
    app.get(`/${key}/`, (req, res) => {
        //key = table name, values[0] = first item in the list (i.e. the primary key)
        let sql = `SELECT * FROM ${key} ORDER BY ${values[0]}`;
        console.log(sql)
        const params = []
        //perform the sql query
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
    //table search
    app.get(`/${key}/search/`, (req, res) => {
        //map the values to the queries in url. Insensitive to location in url (i.e. later columns can come before earlier ones - it'll query it fine either way)
        let queries = {}
        values.map(val => queries[val] = req.query[val])

        console.log(queries)
        let valid_queries = {}
        //filters the list to get ones that are valid queries, i.e. not just 'primary_key=' etc
        Object.keys(queries).map(key => (queries[key] ? key : null)).filter(val => val != null).map(key => valid_queries[key] = queries[key])

        console.log(valid_queries)
        //do the sql query, mapping the number of queries present to the number of ? required in the sql statement on the fly (+ ANDs)
        let sql = `SELECT * FROM ${key} WHERE ${Object.keys(valid_queries).map(key => `${key} = ?`).join(' AND ')}`
        console.log(sql, Object.values(valid_queries))
        db.get(sql, Object.values(valid_queries), (err, row) => {
            if (err) {
                res.status(400).json({"error": err.message});
                return;
            }
            //if it's not an array, return it as an array anyway. Easier to handle.
            //Useful in the cases where the query only returns one row of values
            if(!Array.isArray(row)){
                res.json({
                    "message": "success",
                    "data": [row]
                })
            }
            else{
                res.json({
                    "message": "success",
                    "data": row
                })
            }
        });
    });
}
//add to the patients table
app.post("/patients/", (req, res) => {
    console.log(req.body)
    //get the request data
    const req_data = {
        name: req.body,
    };
    //note this assumes that the json order given to it is the same as in data['patients']
    //could cause issues if the post req's dict is in a different order
    const sql = `INSERT INTO patients(${data['patients']}) VALUES(${data['patients'].map(() => '?').join(',')})`;
    const params = Object.values(req_data.name);
    console.log(sql,params)
    db.run(sql, params, function (err) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        res.json({
            "message": "success",
            "data": req_data,
        })
    });
});


// Default response for any other request
app.use(function (req, res) {
   // console.log(req)
    res.status(404);
});