import SQLiteDB from "../persistence/sqlite"
import * as fs from "fs"


describe("SQLiteDB", () => {
    const logSpy = jest.spyOn(console, "log")

    test("initializes and prints", async () => {
        const db = new SQLiteDB()

        await expect(db.init()).resolves.toBe(undefined)
        expect(logSpy).toHaveBeenCalledWith("database initialized!")
        })

    test("second init throws error", async () => {
        const db = new SQLiteDB()
        await db.init()

        await expect(db.init()).rejects.toThrow("Database already exists")
    })

    test("teardown", async () => {
        const db = new SQLiteDB()
        await db.init()

        await expect(db.teardown()).resolves.toBe(undefined)
        await expect(db.teardown()).rejects.toThrow("Database does not exist")
    })

    describe("functions", () => {
        const db = new SQLiteDB()
        beforeAll(async () => await db.init())
        beforeEach(async () => {
            await db.run("CREATE TABLE IF NOT EXISTS People(firstname VARCHAR(16), lastname VARCHAR(16))", [])
            await db.run("INSERT INTO People(firstname, lastname) VALUES(?, ?)", ["Gabriel", "Buxo"])
            await db.run("INSERT INTO People(firstname, lastname) VALUES(?, ?)", ["John", "Doe"])
        })
        
        afterEach(async () => await db.run("DROP TABLE People", []))
        afterAll(async () => await db.teardown())

        test("run", async () => {
            await expect(db.run("Insert INTO People(firstname, lastname) VALUES(?, ?);", ["Joe", "Shmoe"])).resolves.toHaveProperty("changes", 1)
            await expect(db.run("DELETE FROM People WHERE firstname = ?;", ["Joe"])).resolves.toHaveProperty("changes", 1)
        })

        test("run bad sql", async () => {
            await expect(db.run("S: *  FR SQLITE_SC;", [])).rejects.toThrowError()
        })

        test("get", async () => {
            let schema = await db.get("SELECT * FROM People", [])
            expect(schema).toHaveProperty("firstname")
            expect(schema).toHaveProperty("lastname")
        })

        test("get non-existant", async () => {
            let schema = await db.get("SELECT * FROM People WHERE firstname = ?", ["Billy"])
            expect(schema).toBe(undefined)
        })

        test("get bad sql", async () => {
            await expect(db.get("SELECT m:l * ;", [])).rejects.toThrowError()
        })

        test("getAll", async () => {
            let rows = await db.getAll("SELECT * FROM People;", [])
            expect(rows).not.toBe(undefined)
            expect(rows![0]).toHaveProperty("firstname", "Gabriel")
            expect(rows![0]).toHaveProperty("lastname", "Buxo")
            expect(rows![1]).toHaveProperty("firstname", "John")
            expect(rows![1]).toHaveProperty("lastname", "Doe")
        })

        test("getAll non-existant", async () => {
            let rows = await db.getAll("SELECT * FROM People WHERE lastname = ?;", ["Smith"])
            expect(rows).toStrictEqual([])
        })

        test("getAll bad sql", async () => {
            await expect(db.getAll("SELECT m:l * ;", [])).rejects.toThrowError()
        })

        test("transaction rollback", async () => {
            // create transaction
            await expect(db.startTransaction()).resolves.toBeUndefined()
            //delete from transaction
            await expect(db.run("DELETE FROM People WHERE firstname = ?;", ["John"])).resolves.toHaveProperty("changes", 1)
            // should not exist
            await expect(db.get("SELECT * FROM People WHERE firstname = ?", ["John"])).resolves.toBeUndefined()
            // roll back transaction
            await expect(db.rollbackTransaction()).resolves.toBeUndefined()
            // should exist again
            await expect(db.get("SELECT * FROM People WHERE firstname = ?", ["John"])).resolves.not.toBeUndefined()
            // delete again
            // commit transaction
            //should not exist
        })

        test("transaction commit", async () => {
            // create transaction
            await expect(db.startTransaction()).resolves.toBeUndefined()
            //delete in transaction
            await expect(db.run("DELETE FROM People WHERE firstname = ?;", ["John"])).resolves.toHaveProperty("changes", 1)
            // should not exist
            await expect(db.get("SELECT * FROM People WHERE firstname = ?", ["John"])).resolves.toBeUndefined()
            // commit transaction
            await expect(db.commitTransaction()).resolves.toBeUndefined()
            //should not exist
            await expect(db.get("SELECT * FROM People WHERE firstname = ?", ["John"])).resolves.toBeUndefined()
        })

        test("nestedTransactionsFail", async () => {
            await expect(db.startTransaction()).resolves.toBeUndefined()
            await expect(db.startTransaction()).rejects.toThrowError()
            await expect(db.rollbackTransaction()).resolves.toBeUndefined()
        })
    })
})