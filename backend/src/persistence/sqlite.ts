import sqlite3, { Database, RunResult } from "sqlite3"
import fs from "fs"
import { dbI } from "./daoInterface";
import Lock from "@buxogabe/conclock";

// Set database based on runtime enviroment to prevent data contamination
let DB_LOCATION: string;
if(process.env.DB_LOCATION) DB_LOCATION = process.env.DB_LOCATION
else if(process.env.NODE_ENV == 'test') DB_LOCATION = '/database/housebnb.test.db'
else if(process.env.NODE_ENV == 'dev') DB_LOCATION = '/database/housebnb.dev.db'
else if(process.env.NODE_ENV == 'production') '/database/housebnb.prod.db'
else throw new Error("NODE_ENV must be test, dev, or production")

/**
 * SQLiteDB sets up and wraps the sqlite3 Database to match the dbI interface
 */
export default class SQLiteDB implements dbI {
    // The location of the database
    private location: string
    // sqlite3 Databsae
    private db?: Database
    // static so lock is shared across multiple concurrent tests. Should not be multiple dbs at the same time anyway
    static lock: Lock = new Lock()
    /**
     * Initializes SQLiteDB object but does not initialize the database.
     * For that call this.init() and await
     */
    constructor() {
        this.location = DB_LOCATION
        SQLiteDB.lock = new Lock()
        this.db
    }

    /**
     * @inheritdoc
     */
    init(): Promise<void> {
        return new Promise((res, rej) => {
            if (this.db) return rej(new Error("Database already exists"))

            const dirName = require('path').dirname(this.location)
            if (!fs.existsSync(dirName)) {
                console.log("database file does not exist, creating...")
                fs.mkdirSync(dirName, { recursive: true })
            }

            this.db = new sqlite3.Database(this.location, (err) => {
                if (err) return rej(err)
                if(this.db) {
                    this.db.run("PRAGMA foreign_keys = true;", err => rej(err))
                    
                }
                console.log("database initialized!")
                res()
            })
        })
    }

    /**
     * @inheritdoc
     */
    teardown(): Promise<void> {
        return new Promise((res, rej) => {
            if (!this.db) return rej(new Error("Database does not exist!"))
            this.db.close((err) => {
                if (err) return rej(err)
                else {
                    this.db = undefined
                    res()
                }
            })
        })
    }

    /**
     * Begins a transaction. This transaction can be completed with commitTransaction or it can be rolled back with rollbackTransaction
     * Make sure that every transaction that starts is completed or rolled back. If one transaction is in progress All other transactions will halt
     * @returns A promise that resolves when the method is done setting up the transaction
     * @throws An error if there is aleady a transaction since they can not be nested
     */
    startTransaction(): Promise<void> {
        return new Promise((res, rej) => {
            if(SQLiteDB.lock.isLocked()) {
                return SQLiteDB.lock.wait()
                    .then(() => this.startTransaction())
            }
            SQLiteDB.lock.lock()
            if (!this.db) rej(new Error("Database does not exist!"))
            this.db!.run("BEGIN TRANSACTION;", (err) => { 
                if (err) return rej(err)
                else return res() 
            })
        })
    };

    /**
     * Rolls back a transaction to how the database was before the transaction. Great if an error occurs or for testing
     * 
     * @returns A promise that resolves once the rollback is complete
     */
    rollbackTransaction(): Promise<void> {
        return new Promise((res, rej) => {
            if (!this.db) rej(new Error("Database does not exist!"))
            this.db!.run("ROLLBACK TRANSACTION;", (err) => {
                if(err) return rej(err)
                else {
                    SQLiteDB.lock.unlock()
                    return res()
                }
            })
        })
    };

    /**
     * Commits/finalizes the transaction. This is not reversable.
     * 
     * @returns A promise that resolves once the transaction is done commiting
     */
    commitTransaction(): Promise<void> {
        return new Promise((res, rej) => {
            if (!this.db) rej(new Error("Database does not exist!"))
            this.db!.run("COMMIT TRANSACTION;", (err) => {
                if(err) return rej(err)
                else {
                    SQLiteDB.lock.unlock()
                    return res()
                }
            })
        })
    };

    /**
     * Runs a sql command in the database
     * 
     * @param {string} command the command that you would like to run.
     * Replace any interpoated values with question marks and then supply interpolated values in order in the params array.
     * @param {string} params the values that you would like to interpolate into your command.
     * @returns {Promise<RunResult>} A promise that resolves to the runresult of the sql command
     * or rejects to an error if there is an issue with the sql command.
     */
    run(command: string, params: any): Promise<RunResult> {
        return new Promise((res, rej) => {
            if (!this.db) return rej("Database does not exist")
            this.db.run(command, params, function (err) {
                if (err) return rej(err)
                else res(this)
            })
        })
    }

    /**
     * Gets the top result of a database query
     * 
     * @param {string} query the query that you would like to search for in the database
     * Replace any interpoated values with question marks and then supply interpolated values in order in the params array
     * @param {string} params the values that you would like to interpolate into your command.
     * @returns {Promise} a promise that resolves to the top result in the query.
     * This is in the form of an object with a key for each column of the table.
     * Also can reject with an error if it is provided invalid sql.
     */
    get<T>(query: string, params: any): Promise<T | undefined> {
        return new Promise((res, rej) => {
            if (!this.db) return rej("Database does not exist")
            this.db.get(query, params, (err, row: T) => {
                if (err) return rej(err)
                else res(row)
            })
        })
    }

    /**
     * Gets all results from a database query in an array
     * 
     * @param {string} query the query that you would like to search for in the database
     * Replace any interpoated values with question marks and then supply interpolated values in order in the params array
     * @param {string} params the values that you would like to interpolate into your command.
     * @returns {Promise} a promise that resolves to the an array of results from the query.
     * Each result is in the form of an object with a key for each column of the table.
     * Also can reject with an error if it is provided invalid sql.
     */
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
