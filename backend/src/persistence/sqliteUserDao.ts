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
                    id INTEGER PRIMARY KEY,
                    firstname VARCHAR(32) NOT NULL,
                    lastname VARCHAR(32) NOT NULL,
                    email VARCHAR(32) UNIQUE NOT NULL,
                    username VARCHAR(32) UNIQUE NOT NULL,
                    password VARCHAR(32) NOT NULL,
                    registerDate DATE);`,
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
        return this.sqlDB.get("SELECT * FROM Users WHERE id = ?;", [id])
    }

    /**
     * @inheritdoc
     */
    createUser(user: User): Promise<User> {
        return new Promise((res, rej) => {
            this.sqlDB.run("INSERT INTO Users(firstname, lastname, email, username, password, registerDate) VALUES (?, ?, ?, ?, ?, ?);", 
                [user.firstname, user.lastname, user.email, user.username, user.password, user.registerDate])
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
    verify(username: string, password: string): Promise<boolean> {
        return new Promise((res, rej) => {
            this.sqlDB.get<{count: number}>("SELECT COUNT(*) as count FROM Users WHERE username = ? AND password = ?", [username, password])
                .then(val => val && val.count > 0? res(true): res(false))
                .catch(err => rej(err))
        })
    }
}