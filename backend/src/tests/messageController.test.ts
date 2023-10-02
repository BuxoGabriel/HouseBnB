import request from "supertest"

import getMsgRouter from "../controllers/msgController"
import { MockDB, MockMessageDao, MockUserDao } from "./mocks/mockDao"
import makeApp from "../app"

describe("messageController", () => {
    const mockDB = new MockDB()
    const mockUserDao = new MockUserDao()
    const mockMessageDao = new MockMessageDao()

    let msgRouter = getMsgRouter(mockMessageDao)
    let {app, gracefulShutdown} = makeApp(mockDB, mockUserDao, mockMessageDao)

    afterEach(async () => await mockMessageDao.clear())

    test("", async () => {
        const response = await request(app)
    })
})