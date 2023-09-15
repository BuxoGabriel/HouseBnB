import Booking from "../model/booking"
import House from "../model/house"
import Messege from "../model/messege"
import Review from "../model/review"
import User from "../model/user"

export interface dbI {
    init(): Promise<void>,
    teardown(): Promise<void>
}

export interface UserDao {
    init(): Promise<void>
    getUser(id: number): Promise<User | undefined>
    createUser(user: User): Promise<User>
    updateUser(newUser: User): Promise<User>
    verify(username: string, password: string): Promise<boolean>
}

export interface MessegeDao {
    init(): Promise<void>
    getConversation(fromId: number, toId: number): Promise<Messege[] | undefined>
    createMessege(text: string, timeSent: Date): Promise<Messege>
    editMessege(newMessege: Messege): Promise<Messege>
    hideMessege(id: number): Promise<Messege>
}

export interface BookingDao {
    init(): Promise<void>
    getBooking(id: number): Promise<Booking | undefined>
    getUserBookings(userId: number): Promise<Booking[] | undefined>
    getUserBookingHistory(userId: number): Promise<Booking[] | undefined>
    createBooking(booking: Booking): Promise<Booking>
    editBooking(newBooking: Booking): Promise<Booking>
    cancelBooking(id: number):Promise<Booking>
}

export interface HouseDao {
    init(): Promise<void>
    getHouse(id: number): Promise<House | undefined>
    getUserHouses(userId: number): Promise<House[] | undefined>
    getUserBookmarkedHouses(userId: number): Promise<House[] | undefined>
    createHouse(house: House): Promise<House>
    editHouse(newHouse: House): Promise<House>
    bookmarkHouse(houseId: number): Promise<House>
}

export interface ReviewDao {
    init(): Promise<void>
    getReview(id: number): Promise<Review | undefined>
    getHouseReviews(houseId: number): Promise<Review[] | undefined>
    createReview(review: Review): Promise<Review>
    editReview(newReview: Review): Promise<Review>
}