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
    getUser(id: number): Promise<User>
    createUser(user: User): Promise<User>
    updateUser(newUser: User): Promise<User>
    verify(username: string, password: string): Promise<boolean>
}

export interface MessegeDao {
    init(): Promise<void>
    getConversation(fromId: number, toId: number): Promise<Messege[]>
    createMessege(text: string, timeSent: Date): Promise<Messege>
    editMessege(newMessege: Messege): Promise<Messege>
    hideMessege(id: number): Promise<Messege>
}

export interface BookingDao {
    init(): Promise<void>
    getBooking(id: number): Promise<Booking>
    getUserBookings(userId: number): Promise<Booking[]>
    getUserBookingHistory(userId: number): Promise<Booking[]>
    createBooking(booking: Booking): Promise<Booking>
    editBooking(newBooking: Booking): Promise<Booking>
    cancelBooking(id: number):Promise<Booking>
}

export interface HouseDao {
    init(): Promise<void>
    getHouse(id: number): Promise<House>
    getUserHouses(userId: number): Promise<House[]>
    getUserBookmarkedHouses(userId: number): Promise<House[]>
    createHouse(house: House): Promise<House>
    editHouse(newHouse: House): Promise<House>
    bookmarkHouse(houseId: number): Promise<House>
}

export interface ReviewDao {
    init(): Promise<void>
    getReview(id: number): Promise<Review>
    getHouseReviews(houseId: number): Promise<Review[]>
    createReview(review: Review): Promise<Review>
    editReview(newReview: Review): Promise<Review>
}