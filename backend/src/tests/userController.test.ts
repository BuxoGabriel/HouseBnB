import makeApp from "../app"
import { MockDB, MockUserDao } from "./mocks/mockDao"

describe("userController", () => {
    const mockDB = new MockDB()
    let mockUserDao = new MockUserDao()

    let app = makeApp(mockDB, mockUserDao)
    
    test("postUser", async () => {

    })
})
