import Queue from "./queue"

// lock that notifies when done unlocking the next waiter
export default class Lock {
    // "mutex" this code exists to prevent race conditions.
    // However, this isnt a real mutex so multiple worker threads can still mess this up but single thread concurrency should not be able to
    private locked: boolean
    private waitingQ: Queue<(value: void) => void>
    constructor() {
        this.locked = false
        this.waitingQ = new Queue()
    }

    lock(): void {
        this.locked = true
    }

    unlock(): void {
        this.locked = false
        if(!this.waitingQ.isEmpty()) {
            (this.waitingQ.pop())()
        }
    }

    isLocked(): boolean {
        return this.locked
    }

    wait(): Promise<void> {
        return new Promise(res => {
            this.waitingQ.push(res)
        });
    }
}