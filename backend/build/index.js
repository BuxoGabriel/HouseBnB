"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite_1 = __importDefault(require("./persistence/sqlite"));
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static(__dirname + "/static"));
let db = new sqlite_1.default();
db.init().then(() => {
    app.listen(PORT, () => console.log("listening on port: " + PORT));
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
function gracefulShutdown() {
    db.teardown()
        .catch(() => { })
        .then(() => process.exit());
}
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown); // Sent by nodemon
