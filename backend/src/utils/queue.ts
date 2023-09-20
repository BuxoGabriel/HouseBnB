type node<T> = {val: T, next: node<T>} | undefined

// basic queue class for lock class
export default class Queue<T> {
    // next in line in queue
    private first: node<T>
    // last in queue
    private last: node<T>
    // num of elements in the queue
    private length: number
    /**
     * Initializes the queue to be empty no args
     */
    constructor() {
        this.first = undefined
        this.last = undefined
        this.length = 0
    }
    /**
     * Checks if the queue is empty. Should be a prerequisite for popping queue
     * @returns {boolean} true if the queue is empty and false otherwise
     */
    isEmpty(): boolean {
        if(this.length == 0) return true
        else return false
    }

    /**
     * Pushes a value onto the queue
     * @param value the value that you would like to add to the queue
     */
    push(value: T) {
        let node = {val: value, next: undefined}
        if(this.isEmpty()) {
            this.first = node
        } else {
            this.last!.next = node
        }
        this.last = node
        this.length++
    }

    /**
     * removes an item from the front of the queue. 
     * 
     * Expects queue to be non-empty. Can be checked with Queue.prototype.isEmpty()
     * 
     * @returns the top item on the queue and undefined if the queue is empty
     */
    pop(): T {
        let val = this.first!.val
        this.first = this.first!.next;
        this.length--
        return val
    }
}