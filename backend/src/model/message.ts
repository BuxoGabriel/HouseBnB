type Message = {
    id?: number,
    //conversation id
    cid: number,
    fromid: number,
    toid: number,
    text: string,
    visible?: boolean,
    timesent?: Date
}

export default Message