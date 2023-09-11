// abstraction of database
// should have init(), teardown(), getUser()

const sqlite3 = require("sqlite3").verbose()
const fs = require("fs")
const DB_LOCATION = process.env.DB_LOCATION || '/database/housebnb.db'

// singleton for database
let db

function init() {
    const dirName = require('path').dirname(DB_LOCATION)
    if(!fs.existsSync(dirName)) {
        console.log("database file does not exist, creating")
        fs.mkdirSync(dirName, { recursive: true })
    }

    return new Promise((res, rej) => {
        db = new sqlite3.Database(DB_LOCATION, (err) => {
            if (err) {
                console.error(err)
                return rej(err)
            }
            db.run(
                'CREATE TABLE IF NOT EXISTS users (id INT PRIMARY KEY)',
                (err, result) => {
                    if (err) return rej(err)
                    else {
                        console.log("database running")
                        res()
                    }
                }
            )
        })
    })
}

function teardown() {
    return new Promise((res, rej) => {
        db.close((err) => {
            if (err) {
                console.error(err)
                return rej(err)
            }
            else res()
        })
    })
}

module.exports = {
    init,
    teardown
}