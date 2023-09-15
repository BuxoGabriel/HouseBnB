type User = {
    id: number | undefined,
    firstname: string,
    lastname: string,
    username: string,
    password: string | undefined,
    email: string,
    registerDate: Date
}

export default User