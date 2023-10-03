import Conversation from "../model/conversation";
import Message from "../model/message";
import { MessageDao } from "./daoInterface";
import SQLiteDB from "./sqlite";

const PAGE_SIZE = 20

/**
 * Abstraction for interfacing with messages in SQLite Database
 */
export default class SQLiteMessageDao implements MessageDao {
    private db: SQLiteDB
    constructor(db: SQLiteDB) {
        this.db = db
    }

    /**
     * @inheritdoc
     */
    init(): Promise<void> {
        return new Promise((res, rej) => {
            this.db.run(`CREATE TABLE IF NOT EXISTS Conversations(
                id INTEGER PRIMARY KEY NOT NULL,
                iid INTEGER NOT NULL,
                hid INTEGER NOT NULL,
                created DATE NOT NULL DEFAULT (DATETIME('now')),
                FOREIGN KEY(iid) REFERENCES Users(id) ON DELETE CASCADE,
                FOREIGN KEY(hid) REFERENCES Users(id) ON DELETE CASCADE,
                CONSTRAINT unq_conv UNIQUE (iid, hid)
                );`, [])
                .then(val => {
                    return this.db.run(`CREATE TABLE IF NOT EXISTS Messages(
                        id INTEGER PRIMARY KEY NOT NULL,
                        cid INTEGER NOT NULL,
                        fromid INTEGER NOT NULL,
                        created DATE NOT NULL DEFAULT (DATETIME('now')),
                        text TEXT NOT NULL,
                        FOREIGN KEY(cid) REFERENCES Conversations(id) ON DELETE CASCADE,
                        FOREIGN KEY(fromid) REFERENCES Users(id)
                        );`, [])
                })
                .then(val => res())
                .catch(err => rej(err))
        })
    }

    /**
     * @inheritdoc
     */
    createConversation(iid: number, hid: number): Promise<Conversation> {
        return new Promise((res, rej) => {
            this.db.run(`INSERT INTO Conversations(iid, hid) VALUES (?, ?)`, [iid, hid])
            .then(val => {
                return this.db.get<Conversation>("SELECT * FROM CONVERSATIONS WHERE id = ?", [val.lastID])
            })
            .then((convo) => {
                if(!convo) return rej(new Error("Could not create conversation"))
                return res(convo)
            })
            .catch((err) => rej(err))
        }) 
    }

    /**
     * @inheritdoc
     */
    deleteConversation(cid: number): Promise<Conversation | undefined> {
        return new Promise((res, rej) => {
            this.db.get<Conversation>("SELECT * FROM Conversations WHERE id = ?", [cid])
                .then(convo => {
                    if(!convo) return res(undefined)
                    // cascade in msgs should automatically take care of all messeges
                    return this.db.run(`DELETE FROM Conversations WHERE id = ?`, [cid])
                        .then(val => res(convo))
                        .catch(err => rej(err))
                })
                .catch(err => rej(err))
        })
    }

    /**
     * @inheritdoc
     */
    getConversation(cid: number, page: number = 0): Promise<Message[]> {
        let offset = page * PAGE_SIZE
        return this.db.getAll<Message>(`SELECT * FROM Messages WHERE cid = ? ORDER BY created LIMIT ? OFFSET ?`,
            [cid, PAGE_SIZE, offset])
    }

    /**
     * @inheritdoc
     */
    getUserConversations(uid: number): Promise<Conversation[]> {
        return this.db.getAll<Conversation>(`SELECT * FROM Conversations WHERE iid = ? OR hid = ?`, [uid, uid])
    }

    /**
     * @inheritdoc
     */
    createMessage(cid: number, fromid: number, text: string): Promise<Message> {
        let msg: Message = {cid, fromid, text, created: new Date()}
        return new Promise((res, rej) => {
            this.db.run(`INSERT INTO Messages(cid, fromid, text, created) VALUES (?, ?, ?, ?)`, [cid, fromid, text, msg.created])
            .then(runRes => {
                msg.id = runRes.lastID
                return res(msg)
            })
            .catch(err => rej(err))
        })
    }

    /**
     * @inheritdoc
     */
    editMessage(mid: number, newText: string): Promise<Message | undefined> {
        return new Promise((res, rej) => {
            this.db.get<Message>(`SELECT * FROM Messages WHERE id = ?`, [mid])
                .then(msg => {
                    if(!msg) return res(undefined)
                    return this.db.run(`UPDATE Messages SET text = ? WHERE id = ?`, [newText, mid])
                        .then(val => this.db.get<Message>(`SELECT * FROM Messages WHERE id = ?`, [mid]))
                        .then(updatedMsg => res(updatedMsg))
                })
                .catch(err => rej(err))
        })
    }

    /**
     * @inheritdoc
     */
    deleteMessage(mid: number): Promise<void> {
        return new Promise((res, rej) => {
            return this.db.run(`DELETE FROM Messages WHERE id = ?`, [mid])
                .then(val => res())
        })
    }
}