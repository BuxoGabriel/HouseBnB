import { MockDB, MockMessageDao, MockUserDao } from "../tests/mocks/mockDao";
import { MessageDao, UserDao, dbI } from "./daoInterface";
import SQLiteDB from "./sqlite";
import SQLiteMessageDao from "./sqliteMsgDao";
import SQLiteUserDao from "./sqliteUserDao";

export default function initDB() {
    let dao: {db: dbI, userDao: UserDao, msgDao: MessageDao}
    switch(process.env.NODE_ENV) {
        case 'test':
            dao = {
                db: new MockDB(),
                userDao: new MockUserDao(),
                msgDao: new MockMessageDao()
            }
            break;
        default:
            let db = new SQLiteDB()
            dao = {
                db,
                userDao: new SQLiteUserDao(db),
                msgDao: new SQLiteMessageDao(db)
            }
            break;
    }
    return dao
}