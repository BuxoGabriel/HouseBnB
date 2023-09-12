import sqlite3 from "sqlite3"
import fs from "fs"
import dbI from "./dbI";

const DB_LOCATION = process.env.DB_LOCATION || '/database/housebnb.db'

export default class SQLiteDB implements dbI {
    location: string
    db: any;
    constructor() {
        this.location = DB_LOCATION
        this.db;
    }

    init(): Promise<void> {
        const dirName = require('path').dirname(this.location)
        if (!fs.existsSync(dirName)) {
            console.log("database file does not exist, creating")
            fs.mkdirSync(dirName, { recursive: true })
        }

        return new Promise((res: (value: void) => void, rej) => {
            this.db = new sqlite3.Database(DB_LOCATION, (err: any) => {
                if (err) {
                    console.error(err)
                    return rej(err)
                }
                this.db.run(
                    'CREATE TABLE IF NOT EXISTS users (id INT PRIMARY KEY)',
                    (err: any, result: any) => {
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

    teardown(): Promise<void> {
        return new Promise((res: (val: void) => void, rej) => {
            this.db.close((err: any) => {
                if (err) {
                    console.error(err)
                    return rej(err)
                }
                else res()
            })
        })
    }
}
