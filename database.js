const sqlite3 = require('sqlite3').verbose();

// open the database
let db = new sqlite3.Database('mybooks.db', (err) => {
    if (err) {
      console.error(err.message);
      throw err
    }
    else
        console.log('Connected to the mybooks database.');
  });


// create table 'book'
const sql='CREATE TABLE book(name text)';
  db.run(sql, (err) => {
    if (err) {
        // Table already created
        console.log('Table already created.');
    }else{
      console.log('Table created.');
      
      // First time Table created, insert some rows
      console.log('First time Table created, creating some rows.');
      
      var insert = 'INSERT INTO book(name) VALUES(?)';
      db.run(insert, ['JavaScript Programming']);
      db.run(insert, ['React with Hooks']);
    }
  });


// export as module, called db
module.exports = db
