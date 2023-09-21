import Booking from "../model/booking"
import Conversation from "../model/conversation"
import House from "../model/house"
import Message from "../model/message"
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
 * The interface for abstracting interacting with SQLite user data.
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
     * @returns {Promise<User>} A Promise the resolves to the updated user information or rejects to an Error if one is encountered(including if uid not found)
     */
    updateUser(newUser: User): Promise<User>
    
    /**
     * Deletes a user from the database.
     * 
     * BEWARE: THIS CASCADES INTO THEIR CONVERSATIONS AND MESSAGES
     * 
     * @param {number} id the id of the user that you would like to delete
     * @returns {Promise<User | undefined>} A promise that resolves to the deleted user on success.
     * If the user can not be found it resolves to undefined instead, and something fails it rejects to an error instead.
     */
    deleteUser(id: number): Promise<User | undefined>

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

/**
 * An interface abstracting interfacing with message data
 */
export interface MessageDao {
    /**
     * Initializes Messages Table
     * 
     * @returns {Promise<void>} A promise that resolves when the messages table is done initializing
     */
    init(): Promise<void>

    /**
     * Creates a conversation between 2 people(or returns a conversation if it already) and is a prerequisit for sending a message
     * 
     * @param {number} iid the id of the inquiring user 
     * @param {number} hid the id of the host that the user is inquiring about
     * @returns {Promise<Conversation>} A promise that resolves to a conversation if successfull.
     * Otherwise, rejects to an Error
     */
    createConversation(iid: number, hid: number): Promise<Conversation>

    /**
     * deletes a conversation and all messages sent within it from the database
     * 
     * @param {number} cid the id of the conversation that you would like to delete
     * @returns A promise if it is successfull or rejects to an error if an unexpected error occurs
     */
    deleteConversation(cid: number): Promise<Conversation | undefined>

    /**
     * Gets 20 messages in a conversation by its id. Returns less if there is less that 20 messages.
     * 
     * @param {number} cid the id of the conversation you would like to fetch
     * @param {number} page 0 indexed what group of 20 messages you would like from newest to oldest
     * @returns {Promise<Message[]>} a promise that resolves to an array of 20 messages from the database
     * or undefined if there is no conversation with the provided cid or rejects with an error if an unexpected error is encountered
     */
    getConversation(cid: number, page: number): Promise<Message[]>

    /**
     * Gets all conversations that a user is engaged in sorted by last message date
     * 
     * @param {number} uid the id of the inquiring user
     * @returns {Promise<Conversation[]>} a promise that resolves to an array of conversations or undefined if the user is not
     * engaged in any conversations. Also rejects to an error if an unexpected error is encountered
     */
    getUserConversations(uid: number): Promise<Conversation[]>

    /**
     * Gets all conversations that have been started by users inquiring about you as a host sorted by last message date
     * 
     * @param {number} hostid the id of the host looking for conversations
     * @returns {Promise<Conversation[]>} a promise that resolves to an array of conversations or undefined if the host has no inquirers
     */
    getHostConversations(hostid: number): Promise<Conversation[]>
    
    /**
     * Sends a messege from one user to another without checking if a conversation exists first. Generates the time of sending inside before storage.
     * 
     * @param {number} cid the conversation id
     * @param {number} fromid the sender's id
     * @param {number} toid the reciever's id
     * @param {string} text the contents of the message
     * @returns A promise that resolves to the sent message if it is successfull and rejects to an error if it is not
     */
    createMessage(cid: number, fromid: number, toid: number, text: string): Promise<Message>

    /**
     * Edits the contents of a messege.
     * 
     * @param {number} mid the id of the message that you would like to change
     * @param {string} newText the updated text of the message 
     * @returns A promise that resolves to the updated message on success.
     * Also resolves to undefined if the message can not be found or rejects to an error if an unexpected error occurs
     */
    editMessage(mid: number, newText: string): Promise<Message | undefined>

    /**
     * Deletes a msg from the database
     * 
     * @param {number} mid the id of the message that you would like to delete
     * @returns A promise that resolves once the delete operation is complete.
     * Also rejects to an error if an unexpected error occurs
     */
    deleteMessage(mid: number): Promise<void>
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