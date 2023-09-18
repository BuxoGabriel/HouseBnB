type Conversation = {
    id: number,
    // inquirer id
    iid: number,
    hostId: number
    created: Date
    // date that last message was sent in this convo
    lastMsg: Date
}

export default Conversation