import express, { Router } from "express"
import logger from "morgan"
import getUserRouter from "./controllers/userController"
import { UserDao, dbI } from "./persistence/daoInterface"

export default function makeApp(db: dbI, userDao: UserDao) {
    const app = express()
    
    const userRouter: Router = getUserRouter(userDao)
    
    app.use('/user', userRouter)
    app.use(logger('dev'))
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))
    
    return {app, gracefulShutdown: () => gracefulShutdown(db)}
}

/**
 * closes the db connection as expected
 */
function gracefulShutdown(db: dbI) {
    db.teardown()
        .catch(() => { })
        .then(() => process.exit());
}