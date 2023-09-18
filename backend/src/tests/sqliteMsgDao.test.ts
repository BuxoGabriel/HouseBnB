import * as fs from "fs"
import SQLiteDB from "../persistence/sqlite"
import SQLiteMessageDao from "../persistence/sqliteMsgDao"

describe("SQLiteMsgDao", () => {
    const logSpy = jest.spyOn(console, "log")
    const testDBLoc = "/database/housebnb.test.db"
    if (fs.existsSync(testDBLoc)) {
        console.log("testdb already exists!")
        fs.writeFileSync(testDBLoc, "")
        console.log("wiped test db!")
    }
    const db = new SQLiteDB()

    beforeEach(async () => await db.init())
    afterEach(async () => await db.teardown())

    test("init", async () => {
        const MsgDao = new SQLiteMessageDao(db)

        await expect(MsgDao.init()).resolves.toBeUndefined()
    })
})