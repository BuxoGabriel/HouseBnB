import { RunResult } from "sqlite3";
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
                iid INTEGER NOT NULL FOREIGN KEY REFERENCES Users(id),
                hid INTEGER NOT NULL FOREIGN KEY REFERENCES Users(id),
                created DATE NOT NULL DEFAULT (DATETIME('now'))
                );`, [])
                .then(val => {
                    return this.db.run(`CREATE TABLE IF NOT EXISTS Messeges(
                        id INTEGER PRIMARY KEY NOT NULL,
                        cid INTEGER NOT NULL FOREIGN KEY REFERENCES Conversations(id) ON DELETE CASCADE,
                        fromid INTEGER NOT NULL FOREIGN KEY REFERENCES Users(id),
                        toid INTEGER NOT NULL FOREIGN KEY REFERENCES Users(id),
                        visible INTEGER NOT NULL DEFAULT TRUE,
                        created DATE NOT NULL DEFAULT (DATETIME('now')),
                        text TEXT NOT NULL
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
                return this.db.get<Conversation>("SELECT * FROM CONVERSATIONS WHERE id = ", [val.lastID])
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
    deleteConversation(cid: number): Promise<void> {
        return new Promise((res, rej) => {
            // cascade in msgs should automatically take care of all messeges
            this.db.run(`DELETE FROM Conversations WHERE id = ?`, [cid])
                .then(val => res())
                .catch(err => rej(err))
        })
    }

    /**
     * @inheritdoc
     */
    getConversation(cid: number, page: number): Promise<Message[] | undefined> {
        let offset = page * PAGE_SIZE
        return this.db.getAll<Message>(`SELECT * FROM Messages WHERE cid = ? ORDER BY timesent LIMIT ? OFFSET ?`,
            [cid, PAGE_SIZE, offset])
    }

    /**
     * @inheritdoc
     */
    getUserConversations(uid: number): Promise<Conversation[] | undefined> {
        return this.db.getAll<Conversation>(`SELECT * FROM Conversations WHERE iid = ?`, [uid])
    }

    /**
     * @inheritdoc
     */
    getHostConversations(hostid: number): Promise<Conversation[] | undefined> {
        return this.db.getAll<Conversation>(`SELECT * FROM Conversations WHERE hid = ?`, [hostid])
    }

    /**
     * @inheritdoc
     */
    createMessage(cid: number, fromid: number, toid: number, text: string): Promise<Message> {
        let msg: Message = {cid, fromid, toid, text, timesent: new Date()}
        return new Promise((res, rej) => {
            this.db.run(`INSERT INTO Messeges(cid, fromid, toid, text, timesent) VALUES (?, ?, ?, ?, ?)`, [cid, fromid, toid, text, msg.timesent])
            .then(val => {
                msg.id = val.lastID
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
    hideMessege(mid: number): Promise<Message | undefined> {
        return new Promise((res, rej) => {
            this.db.get<Message>(`SELECT * FROM Messages WHERE id = ?`, [mid])
                .then(msg => {
                    if(!msg) return res(undefined)
                    return this.db.run(`UPDATE Messages SET visible = ? WHERE id = ?`, [false, mid])
                        .then(val => this.db.get<Message>(`SELECT * FROM Messages WHERE id = ?`, [mid]))
                        .then(updatedMsg => res(updatedMsg))
                })
                .catch(err => rej(err))
        })
    }
}