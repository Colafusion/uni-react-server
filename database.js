const sqlite3 = require('sqlite3').verbose();
const data = require('./database_insert_data.json');
// open the database
const db = new sqlite3.Database('medical_data.db', function (err) {
    if (err) {
        console.error(err.message);
        throw err
    } else console.log('Connected to the medical_data database.');
});
//add the data to the database
//json format:
//table_name:create table statement, [list of columns in table], [[nested lists of rows]]
db.serialize(() => {
    for (const [key, values] of Object.entries(data)) {
        //first create the tables. Will throw errors to console if already present, but will work fine.
        db.run(values[0], function (err) {
                if (err) {
                    console.error(err)
                } else {
                    console.log(`${key} table created`);
                }
            }
            //then bulk insert the data
            //this little set of logic basically states the columns to be added (and their order), then maps the applicable number of values. e.g.:
            //INSERT INTO allergies (allergy_id,description) VALUES(?,?),(?,?),(?,?) [ 1, 'None', 2, 'Hayfever', 3, 'Hayfever - Acute' ]
            //note the flattened list of rows, as sqlite doesn't like nested lists
        ).run(`INSERT INTO ${key} (${values[1]}) VALUES${values[2].map(row => `(${row.map(()=>'?').join(',')})`).join(',')}`, values[2].flat(), function (err) {
            if (err) {
                console.error(`INSERT INTO ${key} (${values[1]}) VALUES${values[2].map(row => `(${row.map(()=>'?').join(',')})`).join(',')}`, values[2].flat(), err)
            } else {
                console.log(`INSERT INTO ${key} (${values[1]}) VALUES${values[2].map(row => `(${row.map(()=>'?').join(',')})`).join(',')}`, values[2].flat())
                console.log('data added')
            }
        })
    }
})
// export as module, called db
module.exports = db
