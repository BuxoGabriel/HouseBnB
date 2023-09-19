import * as fs from "fs"
import SQLiteDB from "../persistence/sqlite"
import SQLiteUserDao from "../persistence/sqliteUserDao"
import User from "../model/user"

describe("SQLiteUserDao", () => {
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
        const userDao = new SQLiteUserDao(db)
        await expect(userDao.init()).resolves.toBe(undefined)
    })

    describe('functions', () => {
        const userDao = new SQLiteUserDao(db)
        const billy: User = {
            firstname: "Billy",
            lastname: "Bob",
            username: "user1",
            email: "billybob@mail.com",
            password: "password",
            registerDate: new Date(),
            id: 0
        }
        beforeEach(async () => {
            await userDao.init()
            await expect(db.run("INSERT INTO Users(id, firstname, lastname, email, username, password, registerDate) VALUES (?, ?, ?, ?, ?, ?, ?);",
                [billy.id, billy.firstname, billy.lastname, billy.email, billy.username, billy.password, billy.registerDate])).resolves.toHaveProperty("changes", 1)
        })
        afterEach(async () => {
            await expect(db.run("DELETE FROM Users WHERE id = 0", [])).resolves.toHaveProperty("changes", 1)
        })

        test("getUser", async () => {
            let result = await userDao.getUser(billy.id!)
            expect(result).toHaveProperty("username", billy.username)
            result = await userDao.getUser(-2)
            expect(result).toBe(undefined)
        })

        test("createUser", async () => {
            let joe: User = {
                firstname: "Joe",
                lastname: "Smith",
                username: "user2",
                email: "joe@mail.com",
                password: "password",
                registerDate: new Date(),
                id: undefined
            }
            joe = await userDao.createUser(joe)
            expect(joe).not.toBeUndefined()
            expect(joe.id).not.toBeUndefined()
            await expect(userDao.getUser(joe.id!)).resolves.not.toBe(undefined)
        })

        test("createDupUsername", async () => {
            let joe: User = {
                firstname: "Joseph",
                lastname: "Smithson",
                username: "user2",
                email: "joeseph@mail.com",
                password: "password",
                registerDate: new Date(),
                id: undefined
            }
            await expect(userDao.createUser(joe)).rejects.toThrowError()
        })

        test("createDupEmail", async () => {
            let joe: User = {
                firstname: "Josephine",
                lastname: "Smithsonian",
                username: "user3",
                email: "joe@mail.com",
                password: "password",
                registerDate: new Date(),
                id: undefined
            }
            await expect(userDao.createUser(joe)).rejects.toThrowError()
        })

        test("updateUser", async () => {
            let b = await userDao.getUser(billy.id!)
            expect(b).not.toBeUndefined()
            b!.firstname = "billium"
            b!.password = "secret"
            await expect(userDao.updateUser(b!)).resolves.toHaveProperty("password", "secret")
            b = await userDao.getUser(b!.id!)
            expect(b).toHaveProperty("firstname", "billium")
        })

        test("updateUserInvalid", async () => {
            // user2 with email joe@mail.com already exists so updating billy like this should break the unique properties
            let joe: User = {
                firstname: "Joe",
                lastname: "Smith",
                username: "user2",
                email: "joe@mail.com",
                password: "password",
                registerDate: new Date(),
                id: billy.id
            }
            await expect(userDao.updateUser(joe)).rejects.toThrowError()
        })

        test("deleteUser", async () => {
            let josh: User = {
                firstname: "Josh",
                lastname: "Smith",
                username: "user3",
                email: "josh@mail.com",
                password: "password",
                registerDate: new Date(),
                id: undefined
            }
            josh = await userDao.createUser(josh)
            await expect(userDao.deleteUser(josh.id!)).resolves.toHaveProperty("id", josh.id)
        })

        test("verify success", async () => {
            await expect(userDao.verify(billy.username, billy.password!)).resolves.toBe(true)
        })

        test("verify unsuccessfull", async () => {
            await expect(userDao.verify("", "")).resolves.toBe(false)
        })
    })
})