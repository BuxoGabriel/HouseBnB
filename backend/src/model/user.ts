type User = {
    id?: number,
    firstname: string,
    lastname: string,
    username: string,
    password?: string,
    salt?: string,
    email: string,
    registerdate: Date
}

export default User