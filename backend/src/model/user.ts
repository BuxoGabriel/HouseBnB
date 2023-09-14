type User = {
    id: number | undefined,
    firstName: string,
    lastName: string,
    username: string,
    password: string | undefined,
    email: string,
    registerDate: Date
}

export default User