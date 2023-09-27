import { UserDao, dbI } from "../../persistence/daoInterface";
import User from "../../model/user";

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
}