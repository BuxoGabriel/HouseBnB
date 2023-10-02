import express, { Router } from "express"
import logger from "morgan"
import getUserRouter from "./controllers/userController"
import { MessageDao, UserDao, dbI } from "./persistence/daoInterface"
import getMsgRouter from "./controllers/msgController"
import initDB from "./persistence"

export default function makeApp(db: dbI, userDao: UserDao, msgDao: MessageDao) {
    const app = express()
    
    const userRouter: Router = getUserRouter(userDao)
    const messageRouter: Router = getMsgRouter(msgDao)
    
    app.use(logger('dev'))
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))
    app.use('/user', userRouter)
    app.use('/message', messageRouter)
    
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