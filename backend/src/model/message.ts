type Message = {
    id?: number,
    //conversation id
    cid: number,
    fromid: number,
    text: string,
    created?: Date
}

export default Message