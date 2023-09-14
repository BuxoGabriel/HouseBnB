import { UserDao } from "./persistence/daoInterface"
import SQLiteDB from "./persistence/sqlite"
import SQLiteUserDao from "./persistence/sqliteUserDao"

const express = require("express")
const app = express()
const PORT = process.env.PORT || 3000

let db = new SQLiteDB()
let userDao: UserDao = new SQLiteUserDao(db)

db.init()
    .then(() => userDao.init())
    .then(() => app.listen(PORT, () => console.log("listening on port: " + PORT)))
    .catch((err) => {
        console.error(err)
        process.exit(1)
    })

function gracefulShutdown() {
    db.teardown()
        .catch(() => { })
        .then(() => process.exit());
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown); // Sent by nodemon