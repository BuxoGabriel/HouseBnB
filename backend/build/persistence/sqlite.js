"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3_1 = __importDefault(require("sqlite3"));
const fs_1 = __importDefault(require("fs"));
const DB_LOCATION = process.env.DB_LOCATION || '/database/housebnb.db';
class SQLiteDB {
    constructor() {
        this.location = DB_LOCATION;
        this.db;
    }
    init() {
        const dirName = require('path').dirname(this.location);
        if (!fs_1.default.existsSync(dirName)) {
            console.log("database file does not exist, creating");
            fs_1.default.mkdirSync(dirName, { recursive: true });
        }
        return new Promise((res, rej) => {
            this.db = new sqlite3_1.default.Database(DB_LOCATION, (err) => {
                if (err) {
                    console.error(err);
                    return rej(err);
                }
                this.db.run('CREATE TABLE IF NOT EXISTS users (id INT PRIMARY KEY)', (err, result) => {
                    if (err)
                        return rej(err);
                    else {
                        console.log("database running");
                        res();
                    }
                });
            });
        });
    }
    teardown() {
        return new Promise((res, rej) => {
            this.db.close((err) => {
                if (err) {
                    console.error(err);
                    return rej(err);
                }
                else
                    res();
            });
        });
    }
}
exports.default = SQLiteDB;
