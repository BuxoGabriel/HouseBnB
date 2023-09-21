type Message = {
    id?: number,
    //conversation id
    cid: number,
    fromid: number,
    toid: number,
    text: string,
    created?: Date
}

export default Message