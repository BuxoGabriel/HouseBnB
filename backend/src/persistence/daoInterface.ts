import Booking from "../model/booking"
import House from "../model/house"
import Messege from "../model/messege"
import Review from "../model/review"
import User from "../model/user"

/**
 * Database interface.
 * Should be initialized up before all the daos which are dependent on it
 */
export interface dbI {
    /**
     * Initializes the database.
     * 
     * @returns {Promise<void>} a promise that resolves on success and otherwise rejects with an error
     */
    init(): Promise<void>,

    /**
     * Cleans up the database
     * This should be run when the server shuts down.
     * 
     * @returns {Promise<void>} a promise that resolves on successfull shutdown else rejects with an error
     */
    teardown(): Promise<void>
}

/**
 * The interface for abstracting interacting with user data.
 */
export interface UserDao {
    /**
     * Initializes User Data.
     * 
     * @returns {Promise<void>} A promise that resolves when the user data initializes and rejects with an error on failure
     */
    init(): Promise<void>

    /**
     * Gets a user by Id
     * 
     * @param {number} id the id of the user
     * @returns {Promise<User | undefined>} A promise that resolves to the fetched user or to undefined if the User does not exist.
     * Can also reject to an Error if there is an issue fetching the data from the db
     */
    getUser(id: number): Promise<User | undefined>

    /**
     * Creates a new user and stores it in the database
     * 
     * @param {User} user a user to create, fields should not be undefined except id
     * @returns {Promise<User>} the created user.
     */
    createUser(user: User): Promise<User>

    /**
     * Updates a user to have new information
     * 
     * @param {User} newUser A user with the id of the user that you are trying to change and the username, password, email, firstname, and lastname
     * @returns {Promise<User>} A Promise the resolves to the updated user information or rejects to an Error if one is encountered
     */
    updateUser(newUser: User): Promise<User>

    /**
     * Verifies that a username and password is in the database
     * 
     * @param {string} username user's username
     * @param {String} password user's password
     * @returns {Promise<boolean>} A Promise that resolves to true if a user is found with the provided username and password else resolves to false.
     * Can also reject with an error if an unexpected error is encountered
     */
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
    cancelBooking(id: number): Promise<Booking>
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