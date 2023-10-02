import SQLiteDB from "../persistence/sqlite"
import SQLiteMessageDao from "../persistence/sqliteMsgDao"
import Conversation from "../model/conversation"
import User from "../model/user"
import SQLiteUserDao from "../persistence/sqliteUserDao"
import Message from "../model/message"

describe("SQLiteMsgDao", () => {
    const logSpy = jest.spyOn(console, "log")

    const db = new SQLiteDB()

    beforeAll(async () => await db.init())
    afterAll(async () => await db.teardown())

    test("init", async () => {
        const msgDao = new SQLiteMessageDao(db)

        await expect(msgDao.init()).resolves.toBeUndefined()
    })

    describe("functions", () => {
        const userDao = new SQLiteUserDao(db)
        const msgDao = new SQLiteMessageDao(db)
        let larry: User = {
            firstname: "larry",
            lastname: "smith",
            username: "lar21",
            password: "password",
            salt: "salty",
            email: "lar@mail.com",
            registerdate: new Date()
        }
        let dave: User = {
            firstname: "dave",
            lastname: "smith",
            username: "dav12",
            password: "password",
            salt: "salty",
            email: "david@mail.com",
            registerdate: new Date()
        }

        let convo: Conversation

        beforeEach(async () => {
            // Set up UserDao bc msg table depends on user table
            await userDao.init()
            await msgDao.init()
            await db.startTransaction()
            // Create dummy users
            larry = await userDao.createUser(larry)
            dave = await userDao.createUser(dave)
            // create conversation between users
            convo = await msgDao.createConversation(larry.id!, dave.id!)
            expect(convo).toHaveProperty("id")
        })
        afterEach(async () => await db.rollbackTransaction())

        test("getUserConversations", async () => {
            // try to retrieve conversation
            let convos = await msgDao.getUserConversations(convo.iid)
            expect(convos).not.toBeUndefined()
            expect(convos).toHaveProperty("length", 1)
        })

        test("getHostConversations", async () => {
            // try to retrieve conversation
            let convos = await msgDao.getUserConversations(convo.iid!)
            expect(convos).not.toBeUndefined()
            expect(convos).toHaveProperty("length", 1)
        })

        test("deleteConvo", async () => {
            let conv = await db.get<Conversation>("SELECT * FROM Conversations WHERE iid = ? AND hid = ?", [convo.iid, convo.hid])
            expect(conv).not.toBeUndefined()
            await expect(msgDao.deleteConversation(conv!.id!)).resolves.toHaveProperty("id")
        })

        test("deleteNonExistantConvo", async () => {
            await expect(msgDao.deleteConversation(-1)).resolves.toBeUndefined()
        })

        test("getEmptyUserConversations", async () => {
            let convos = await msgDao.getUserConversations(-1)
            expect(convos).not.toBeUndefined()
            expect(convos).toStrictEqual([])
        })


        test("getEmptyUserConversations", async () => {
            let convos = await msgDao.getHostConversations(-1)
            expect(convos).not.toBeUndefined()
            expect(convos).toStrictEqual([])
        })

        test("getEmptyConversation", async () => {
            //get convo which should be empty
            let conv: any = await msgDao.getUserConversations(larry.id!)
            conv = conv[0]
            const msgs = await msgDao.getConversation(convo.id!, 0)
            expect(msgs).toStrictEqual([])
        })

        test("createMsg", async () => {
            const MSGTEXT = "HELLO FRIEND!"
            let msg: Message = {
                cid: convo.id!,
                fromid: convo.iid,
                text: MSGTEXT
            }
            await expect(msgDao.createMessage(msg.cid, msg.fromid, msg.text)).resolves.toHaveProperty("id")
            expect(db.get<Message>("SELECT * FROM Messages WHERE text = ?", [MSGTEXT])).resolves.toBeDefined()
        })

        test("getConversation", async () => {
            // setup
            const MSGTEXT = "HELLO FRIEND!"
            let msg: Message = {
                cid: convo.id!,
                fromid: convo.iid,
                text: MSGTEXT
            }
            await expect(msgDao.createMessage(msg.cid, msg.fromid, msg.text)).resolves.toBeDefined()
            for(let i = 0; i < 50; i++) {
                // set up 50 alternating msgs
                msg.text = String(i)
                if(msg.fromid == larry.id) msg.fromid = dave.id!
                else msg.fromid = larry.id!
                await expect(msgDao.createMessage(msg.cid, msg.fromid, msg.text)).resolves.toBeDefined()
            }
            // test get
            let msgs = await msgDao.getConversation(convo.id!, 0)
            expect(msgs[0]).toHaveProperty("text", MSGTEXT)
            expect(msgs).toHaveProperty("length", 20)
            await expect(msgDao.getConversation(convo.id!, 2)).resolves.toHaveProperty("length", 11)
        })

        test("editMessage", async () => {
            // setup
            const MSGTEXT = "HELLO FRIEND!"
            let msg: Message = {
                cid: convo.id!,
                fromid: convo.iid,
                text: MSGTEXT
            }
            msg = await msgDao.createMessage(msg.cid, msg.fromid, msg.text)
            expect(msg).toHaveProperty("text", MSGTEXT)
            // edit the message
            const NEWTEXT = "new text"
            await expect(msgDao.editMessage(msg.id!, NEWTEXT)).resolves.toHaveProperty("text", NEWTEXT)
            // edit message that doesn't exist should fail
            await expect(msgDao.editMessage(-1, NEWTEXT)).resolves.toBeUndefined()
        })

        test("deleteMessage", async () => {
            // setup
            const MSGTEXT = "HELLO FRIEND!"
            let msg: Message = {
                cid: convo.id!,
                fromid: convo.iid,
                text: MSGTEXT
            }
            msg = await msgDao.createMessage(msg.cid, msg.fromid, msg.text)
            expect(msgDao.deleteMessage(msg.id!)).resolves.toBeUndefined()
            expect(db.get<Message>("SELECT * FROM Messages WHERE id = ?", [msg.id!])).resolves.toBeUndefined()
        })

    })
})