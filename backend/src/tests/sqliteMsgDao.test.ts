import * as fs from "fs"
import SQLiteDB from "../persistence/sqlite"
import SQLiteMessageDao from "../persistence/sqliteMsgDao"
import Conversation from "../model/conversation"
import User from "../model/user"
import SQLiteUserDao from "../persistence/sqliteUserDao"
import Message from "../model/message"

describe("SQLiteMsgDao", () => {
    const logSpy = jest.spyOn(console, "log")
    const testDBLoc = "/database/housebnb.test.db"
    if (fs.existsSync(testDBLoc)) {
        console.log("testdb already exists!")
        fs.writeFileSync(testDBLoc, "")
        console.log("wiped test db!")
    }
    const db = new SQLiteDB()

    beforeAll(async () => await db.init())
    afterAll(async () => await db.teardown())

    test("init", async () => {
        const MsgDao = new SQLiteMessageDao(db)

        await expect(MsgDao.init()).resolves.toBeUndefined()
    })

    describe("functions", () => {
        const userDao = new SQLiteUserDao(db)
        const MsgDao = new SQLiteMessageDao(db)
        let larry: User = {
            firstname: "larry",
            lastname: "smith",
            username: "lar21",
            password: "password",
            email: "lar@mail.com",
            registerDate: new Date()
        }
        let dave: User = {
            firstname: "dave",
            lastname: "smith",
            username: "dav12",
            password: "password",
            email: "david@mail.com",
            registerDate: new Date()
        }

        beforeEach(async () => {
            // Set up UserDao bc msg table depends on user table
            await userDao.init()
            await MsgDao.init()
            // Create dummy users
            larry = await userDao.createUser(larry)
            dave = await userDao.createUser(dave)

            const convo: Conversation = {
                id: 0,
                iid: larry.id!,
                hid: dave.id!,
                created: new Date()
            }

            const msg1: Message = {
                cid: convo.id,
                fromid: larry.id!,
                toid: dave.id!,
                text: "Hi Dave!"
            }
    
            const msg2: Message = {
                cid: convo.id,
                fromid: dave.id!,
                toid: larry.id!,
                text: "Hello Larry!"
            }

            // create conversation between users
            await db.run("INSERT INTO Conversations(id, iid, hid, created) VALUES (?, ?, ?, ?);",
                [convo.id, convo.iid, convo.hid, convo.created])
            // send a message from each user in the conversation
            await db.run("INSERT INTO Messages(cid, fromid, toid, text) VALUES (?, ?, ?, ?);",
                [msg1.cid, msg1.fromid, msg1.toid, msg1.text])
            await db.run("INSERT INTO Messages(cid, fromid, toid, text) VALUES (?, ?, ?, ?);",
                [msg2.cid, msg2.fromid, msg2.toid, msg2.text])
        })

        afterEach(async () => {
            // Deletes the users from the database which should cascade to conversations and msgs
            await userDao.deleteUser(larry.id!)
            await userDao.deleteUser(dave.id!)
        })

        test("createConvo", () => {

        })
    })
})