import sqlite3, { Database } from "sqlite3"
import fs from "fs"
import { dbI } from "./daoInterface";

const DB_LOCATION = process.env.NODE_ENV == 'test'? '/database/housebnb.test.db': process.env.DB_LOCATION || '/database/housebnb.db'

export default class SQLiteDB implements dbI {
    private location: string
    private db?: Database;
    constructor() {
        this.location = DB_LOCATION
        this.db;
    }

    init(): Promise<void> {
        return new Promise((res, rej) => {
            if (this.db) return rej(new Error("Database already exists"))

            const dirName = require('path').dirname(this.location)
            if (!fs.existsSync(dirName)) {
                console.log("database file does not exist, creating...")
                fs.mkdirSync(dirName, { recursive: true })
            }

            this.db = new sqlite3.Database(DB_LOCATION, (err) => {
                if (err) return rej(err)
                console.log("database initialized!")
                res()
            })
        })
    }

    teardown(): Promise<void> {
        return new Promise((res, rej) => {
            if (!this.db) return rej(new Error("Database does not exist"))
            this.db.close((err) => {
                if (err) return rej(err)
                else {
                    this.db = undefined
                    res()
                }
            })
        })
    }

    run(query: string, params: any): Promise<void> {
        return new Promise((res, rej) => {
            if (!this.db) return rej("Database does not exist")
            this.db.run(query, params, (err) => {
                if (err) return rej(err)
                else res()
            })
        })
    }

    get<T>(query: string, params: any): Promise<T> {
        return new Promise((res, rej) => {
            if (!this.db) return rej("Database does not exist")
            this.db.get(query, params, (err, row: T) => {
                if (err) return rej(err)
                else res(row)
            })
        })
    }

    getAll<T>(query: string, params: any): Promise<T[]> {
        return new Promise((res, rej) => {
            if (!this.db) return rej("Database does not exist")
            this.db.all(query, params, (err, rows: T[]) => {
                if (err) return rej(err)
                else return res(rows)
            })
        })
    }
}
