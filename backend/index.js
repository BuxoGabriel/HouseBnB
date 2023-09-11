const db = require("./persistence")
const express = require("express")
const app = express()
const PORT = process.env.PORT || 3000

app.use(express.static(__dirname + "/static"))

app.use("/favicon.ico", express.static('/favicon.ico'))

db.init().then(() => {
    app.listen(PORT, () => console.log("listening on port: " + PORT))
}).catch(err => {
    console.err(err)
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