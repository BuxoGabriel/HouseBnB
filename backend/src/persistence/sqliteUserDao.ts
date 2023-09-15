import User from "../model/user";
import { UserDao } from "./daoInterface";
import SQLiteDB from "./sqlite";

export default class SQLiteUserDao implements UserDao {
    private sqlDB: SQLiteDB
    constructor(db: SQLiteDB) {
        this.sqlDB = db
    }

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

    getUser(id: number): Promise<User | undefined> {
        return this.sqlDB.get("SELECT * FROM Users WHERE id = ?;", [id])
    }

    createUser(user: User): Promise<User> {
        return new Promise((res, rej) => {
            this.sqlDB.run("INSERT INTO Users(firstname, lastname, email, username, password, registerDate) VALUES (?, ?, ?, ?, ?, ?);", 
                [user.firstName, user.lastName, user.email, user.username, user.password, user.registerDate])
                .then(runRes => {
                    user.id = runRes.lastID
                    res(user)
                })
                .catch(err => rej(err))
        })
    }

    updateUser(newUser: User): Promise<User> {
        return new Promise((res, rej) => {
            this.sqlDB.run("UPDATE Users SET firstname = ?, lastname = ?, email = ?, username = ?, password = ? WHERE, id = ?;",
                [newUser.firstName, newUser.lastName, newUser.email, newUser.username, newUser.password, newUser.id])
                .then(val => res(newUser))
                .catch(err => rej(err))
        })
    }

    verify(username: string, password: string): Promise<boolean> {
        return new Promise((res, rej) => {
            this.sqlDB.get("SELECT COUNT(*) FROM Users WHERE username = ? AND password = ?", [username, password])
                .then(val => val? res(true): res(false))
                .catch(err => rej(err))
        })
    }
}