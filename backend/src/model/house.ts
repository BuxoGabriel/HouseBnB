import Address from "./address"
import Image from "./image"

export default class House {
    public id: number
    public name: string
    public ownerId: number
    public address: Address
    public images: Image[]
    constructor(id: number, name: string, ownerId: number, address: Address) {
        this.id = id
        this.name = name
        this.ownerId = ownerId
        this.address = address
        this.images = []
    }

    addImage(img: Image) {
        this.images.push(img)
    }

    removeImage(index: number) {
        this.images = [...this.images.splice(0, index), ...this.images.splice(index + 1)]
    }
}