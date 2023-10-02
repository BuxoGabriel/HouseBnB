import request from "supertest"

import makeApp from "../app"
import { MockDB, MockMessageDao, MockUserDao } from "./mocks/mockDao"
import User from "../model/user"

describe("userController", () => {
    const mockDB = new MockDB()
    const mockUserDao = new MockUserDao()
    const mockMessageDao = new MockMessageDao()

    let {app, gracefulShutdown} = makeApp(mockDB, mockUserDao, mockMessageDao)

    const user = {
        firstname: "dave", 
        lastname: "evad", 
        username: "davinator", 
        password: "password",
        email: "dave@mail.com", 
        registerdate: new Date(), 
        id: 1
    }

    beforeEach(async () => await mockUserDao.createUser(user))

    afterEach(() => mockUserDao.reset())

    test("getUser", async () => {
        const response = await request(app).get("/user/1")
        expect(response.statusCode).toBe(200)
        expect(response.body.username).toBe(user.username)
    })

    test("getUserDoesNotExist", async () => {
        const response = await request(app).get("/user/-1")
        expect(response.statusCode).toBe(400)
    })

    test("postUser", async () => {
        const user2: User = {
            id: 2,
            firstname: "Mary",
            lastname: "Jane",
            username: "Mar1sa",
            password: "password",
            email: "mary@.com",
            registerdate: new Date()
        }
        const response = await request(app)
            .post("/user/")
            .send(user2)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
        expect(response.statusCode).toBe(200)
        expect(response.body).toHaveProperty("username")
    })

    test("postBadUser", async () => {
        const user3: User = {
            id: 3,
            firstname: "Marty",
            lastname: "Jane",
            username: "Mar1sa",
            password: "pass",
            email: "mart",
            registerdate: new Date()
        }

        const response = await request(app)
            .post("/user/")
            .send(user3)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
        expect(response.statusCode).toBe(400)
    })

    test("deleteUser", async () => {
        const response = await request(app).delete("/user/1")
        expect(response.statusCode).toBe(200)
        expect(response.body).toHaveProperty("username")
    })

    test("deleteUserDoesNotExist", async () => {
        const response = await request(app).delete("/user/-1")
        expect(response.statusCode).toBe(400)
        expect(response.body).not.toHaveProperty("username")
    })
})
