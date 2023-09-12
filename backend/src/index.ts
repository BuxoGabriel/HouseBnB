import dbI from "./persistence/dbI"
import SQLiteDB from "./persistence/sqlite"

const express = require("express")
const app = express()
const PORT = process.env.PORT || 3000

app.use(express.static(__dirname + "/static"))
let db: dbI = new SQLiteDB()

db.init().then(() => {
    app.listen(PORT, () => console.log("listening on port: " + PORT))
}).catch((err: any) => {
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