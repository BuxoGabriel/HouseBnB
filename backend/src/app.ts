import express, { Router } from "express"
import logger from "morgan"

import { UserDao } from "./persistence/daoInterface"
import SQLiteDB from "./persistence/sqlite"
import SQLiteUserDao from "./persistence/sqliteUserDao"
import getUserRouter from "./controllers/userController"

const app = express()
    
// set up DAO
const db = new SQLiteDB()
const userDao: UserDao = new SQLiteUserDao(db)

db.init()
    .then(() => userDao.init())
    .catch((err) => {
        console.error(err)
        process.exit(1)
})

const userRouter: Router = getUserRouter(userDao)

app.use('/user', userRouter)
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

/**
 * closes the db connection as expected
 */
function gracefulShutdown() {
    db.teardown()
        .catch(() => { })
        .then(() => process.exit());
}

export {app, gracefulShutdown}