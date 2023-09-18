type Message = {
    id: number,
    //conversation id
    cid: number,
    fromId: number,
    toId: number,
    text: string,
    visible: boolean,
    timeSent: Date
}

export default Message