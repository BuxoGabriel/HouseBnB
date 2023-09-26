import 'dotenv/config'

import express, { Router } from "express"
import logger from "morgan"

import { UserDao } from "./persistence/daoInterface"
import SQLiteDB from "./persistence/sqlite"
import SQLiteUserDao from "./persistence/sqliteUserDao"
import getUserRouter from "./controllers/userController"

const app = express()
const PORT = process.env.PORT || 3000


// set up DAO
let db = new SQLiteDB()
let userDao: UserDao = new SQLiteUserDao(db)

const userRouter: Router = getUserRouter(userDao)

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/user', userRouter)

db.init()
    .then(() => userDao.init())
    .then(() => app.listen(PORT, () => console.log("listening on port: " + PORT)))
    .catch((err) => {
        console.error(err)
        process.exit(1)
    })

/**
 * closes the db connection as expected
 */
function gracefulShutdown() {
    db.teardown()
        .catch(() => { })
        .then(() => process.exit());
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown); // Sent by nodemon