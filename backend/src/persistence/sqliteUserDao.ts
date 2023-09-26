import User from "../model/user";
import { UserDao } from "./daoInterface";
import SQLiteDB from "./sqlite";

/**
 * SQLiteUserDao built to provide user interaction abstraction on top of SQLiteDB class
 */
export default class SQLiteUserDao implements UserDao {
    // The db that is interfaced with
    private sqlDB: SQLiteDB

    /**
     * Initializes the SQLiteUserDao object
     * 
     * @param {SQLiteDB} db the database that the userdao will interface with. Expects this db to already be initialized with .init() 
     */
    constructor(db: SQLiteDB) {
        this.sqlDB = db
    }

    /**
     * @inheritdoc 
     */
    init(): Promise<void> {
        return new Promise((res, rej) => {
            this.sqlDB.run(
                `CREATE TABLE IF NOT EXISTS Users(
                    id INTEGER NOT NULL PRIMARY KEY,
                    firstname VARCHAR(32) NOT NULL,
                    lastname VARCHAR(32) NOT NULL,
                    email VARCHAR(32) UNIQUE NOT NULL,
                    username VARCHAR(32) UNIQUE NOT NULL,
                    password VARCHAR(60) NOT NULL,
                    salt VARCHAR(40) NOT NULL,
                    registerdate DATE NOT NULL DEFAULT (DATETIME('now')));`,
                [])
                .then(val => {
                    console.log("Users table initialized")
                    return res()})
                .catch(err => {
                    return rej(err)
                })
        })
    }

    /**
     * @inheritdoc
     */
    getUser(id: number): Promise<User | undefined> {
        return new Promise((res, rej) => {
            this.sqlDB.get<User>("SELECT id, firstname, lastname, email, username, registerDate FROM Users WHERE id = ?;", [id])
                .then(user => {
                    if(user) user.registerdate = new Date(user.registerdate)
                    return res(user)
                })
                .catch(err => rej(err))
        })
    }

    /**
     * @inheritdoc
     */
    createUser(user: User): Promise<User> {
        return new Promise((res, rej) => {
            this.sqlDB.run("INSERT INTO Users(firstname, lastname, email, username, password, salt, registerdate) VALUES (?, ?, ?, ?, ?, ?, ?);", 
                [user.firstname, user.lastname, user.email, user.username, user.password, user.salt, user.registerdate])
                .then(runRes => {
                    user.id = runRes.lastID
                    res(user)
                })
                .catch(err => rej(err))
        })
    }

    /**
     * @inheritdoc
     */
    updateUser(newUser: User): Promise<User> {
        return new Promise((res, rej) => {
            this.sqlDB.run("UPDATE Users SET firstname = ?, lastname = ?, email = ?, username = ?, password = ? WHERE id = ?;",
                [newUser.firstname, newUser.lastname, newUser.email, newUser.username, newUser.password, newUser.id])
                .then(val => res(newUser))
                .catch(err => rej(err))
        })
    }

    /**
     * @inheritdoc
     */
    deleteUser(id: number): Promise<User | undefined> {
      return new Promise((res, rej) => {
        this.sqlDB.get<User>("SELECT * FROM Users WHERE id = ?", [id])
            .then(user => {
                if(!user) return res(undefined)
                return this.sqlDB.run("DELETE FROM Users WHERE id = ?", [id])
                    .then(val => res(user))
                    .catch(err => rej(err))
            })
            .catch(err => rej(err))
      })  
    }

    /**
     * @inheritdoc
     */
    verify(username: string, password: string): Promise<boolean> {
        return new Promise((res, rej) => {
            this.sqlDB.get<{count: number}>("SELECT COUNT(*) as count FROM Users WHERE username = ? AND password = ?", [username, password])
                .then(val => val && val.count > 0? res(true): res(false))
                .catch(err => rej(err))
        })
    }
}