import 'dotenv/config'

import { UserDao, dbI } from "./persistence/daoInterface"
import SQLiteDB from "./persistence/sqlite"
import SQLiteUserDao from "./persistence/sqliteUserDao"
import makeApp from "./app"

const PORT = process.env.PORT || 3000
        
// ## Set up DAO ##
const db = new SQLiteDB()
const userDao: UserDao = new SQLiteUserDao(db)
// initialize the database
db.init()
.then(() => userDao.init())
.catch((err) => {
    console.error(err)
    process.exit(1)
})

// ## Create app ##
const {app, gracefulShutdown} = makeApp(db, userDao)
// start server
app.listen(PORT, () => console.log("listening on port: " + PORT))

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown); // Sent by nodemon