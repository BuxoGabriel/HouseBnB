import { MessageDao, UserDao, dbI } from "../../persistence/daoInterface";
import User from "../../model/user";
import Conversation from "../../model/conversation";
import Message from "../../model/message";

export class MockDB implements dbI {
    constructor() {}
    init(): Promise<void> {
        return new Promise((res) => res())
    }

    teardown(): Promise<void> {
        return new Promise((res) => res())
    }
}

export class MockUserDao implements UserDao {
    private users: any

    constructor() {
        this.users = {}
    }

    init(): Promise<void> {
        return new Promise(res => res())
    }

    getUser(id: number): Promise<User | undefined> {
        return new Promise(res => res(this.users[id]))
    }

    createUser(user: User): Promise<User> {
        return new Promise((res, rej) => {
            if(this.users[user.id!]) return rej()
            else {
                this.users[user.id!] = user
                return res(user)
            }
        })
    }

    updateUser(newUser: User): Promise<User> {
        return new Promise((res, rej) => {
            let id = newUser.id!
            if(this.users[id]) {
                this.users[id] = newUser
                return res(newUser)
            }
            else return rej()
        })
    }

    deleteUser(id: number): Promise<User | undefined> {
        return new Promise((res, rej) => {
            if(this.users[id]) {
                let user = this.users[id]
                this.users[id] = undefined
                return res(user)
            }
            else res(undefined)
        })
    }

    verify(username: string, password: string): Promise<boolean> {
        return new Promise(res => {
            for(const [key, val] of Object.entries<User>(this.users)) {
                if(val.username == username && val.password == password) return res(true)
            }
            return res(false)
        })
    }

    reset(): void {
        this.users = {}
    }
}

export class MockMessageDao implements MessageDao {
    private convos: (Conversation | undefined)[]
    private messages: (Message | undefined)[]
    constructor() {
        this.convos = []
        this.messages = []
    }

    init(): Promise<void> {
        return new Promise(res => res())
    }

    createConversation(iid: number, hid: number): Promise<Conversation> {
        return new Promise(res => {
            const index = this.convos.findIndex(convo => convo && convo.iid === iid && convo.hid === hid)
            if(index == -1) {
                let newConvo: Conversation = { id: this.convos.length, iid, hid, created: new Date() }
                this.convos[newConvo.id!] = newConvo
                return res(newConvo)
            }
            else return res(this.convos[index]!)
        })
    }

    deleteConversation(cid: number): Promise<Conversation | undefined> {
        return new Promise(res => {
            this.messages = this.messages.filter(msg => msg?.cid != cid)
            let convo = this.convos[cid]
            this.convos[cid] = undefined
            res(convo)
        })
    }

    getUserConversations(uid: number): Promise<Conversation[]> {
        return new Promise(res => {
            res(this.convos.filter(convo => convo && convo.iid == uid) as Conversation[])
        })
    }

    getHostConversations(hostid: number): Promise<Conversation[]> {
        return new Promise(res => {
            res(this.convos.filter(convo => convo && convo.hid == hostid) as Conversation[])
        })
    }

    getConversation(cid: number, page: number = 0): Promise<Message[]> {
        return new Promise(res => {
            res(this.messages.filter(msg => msg!.cid == cid).splice(page * 20, 20) as Message[])
        })
    }

    createMessage(cid: number, fromid: number, text: string): Promise<Message> {
        return new Promise(res => {
            let msg: Message = { cid, fromid, text}
            msg.id = this.messages.length
            this.messages.push(msg)
            res(msg)
        })
    }

    editMessage(mid: number, newText: string): Promise<Message | undefined> {
        return new Promise(res => {
            let index = this.messages.findIndex(msg => msg!.id == mid)
            if(index == -1) return res(undefined)
            this.messages[index]!.text = newText
            return res(this.messages[index])
        })
    }

    deleteMessage(mid: number): Promise<void> {
        return new Promise(res => {
            this.messages[mid] = undefined
            res()
        })
    }

    clear() {
        this.convos = []
        this.messages = []
    }
}