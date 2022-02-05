const sqlite3 = require('sqlite3').verbose();
const data = require('./database_insert_data.json');
// open the database
const db = new sqlite3.Database('medical_data.db', function (err) {
    if (err) {
        console.error(err.message);
        throw err
    } else console.log('Connected to the medical_data database.');
});

db.serialize(() => {
    for (const [key, values] of Object.entries(data)) {
        db.run(values[0], function (err) {
                if (err) {
                    console.error(err)
                } else {
                    console.log(`${key} table created`);
                }
            }
        ).run(`INSERT INTO ${key} (${values[1]}) VALUES${values[2].map(row => `(${row.map(()=>'?').join(',')})`).join(',')}`, values[2].flat(), function (err) {
            if (err) {
                console.error(`INSERT INTO ${key} (${values[1]}) VALUES${values[2].map(row => `(${row.map(()=>'?').join(',')})`).join(',')}`, values[2].flat(), err)
            } else {
                console.log('data added')
            }
        })
    }
})
// export as module, called db
module.exports = db
