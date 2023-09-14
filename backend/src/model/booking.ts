import House from "./house"

type Booking = {
    id: number
    bookerId: number
    houseId: number
    fromDate: Date
    toDate: Date
    confirmed: boolean
    paid: boolean,
    house?: House
}

export default Booking