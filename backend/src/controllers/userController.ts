import { UserDao } from "../persistence/daoInterface"
import express, { Router, Request, Response } from "express"
import asyncHandler from "express-async-handler"
import { body, validationResult } from "express-validator"
import User from "../model/user"

/**
 * Makes a router for processing requests at the user endpoint
 * 
 * @param {UserDao} userDao a userdao for interacting with the database
 * @returns an express router with functionality 
 */
export default function getUserRouter(userDao: UserDao): Router {
    const userController = new UserController(userDao)
    const userRouter = express.Router()

    userRouter.get("/:id", userController.userGet)
    userRouter.post("/", userController.userPost)

    return userRouter
}

class UserController {
    private userDao: UserDao
    constructor(userDao: UserDao) {
        this.userDao = userDao
    }

    userGet = asyncHandler(async (req, res, next) => {
        let id = Number(req.params.id)
        let user = await this.userDao.getUser(id)
        res.send(JSON.stringify(user))
    })

    userPost = [
        body("firstname")
            .trim()
            .isLength({min: 1})
            .escape(),
        body("lastname")
            .trim()
            .isLength({min: 1})
            .escape(),
        body("username")
            .trim()
            .isLength({min: 1})
            .escape(),
        body("password")
            .trim()
            .isLength({min: 8})
            .matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/)
            .escape(),
        body("email")
            .trim()
            .isLength({min: 1})
            .matches(/(([A-Za-z])*(@){1}([a-zA-Z])*(.com){1})/),

        asyncHandler(async (req, res, next) => {
            const errors = validationResult(req)
            const user: User = {
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                username: req.body.username,
                password: req.body.password,
                email: req.body.email,
                registerDate: new Date()
            }
            if(errors) {
                console.error(errors)
            }
            try {
                let newUser = await this.userDao.createUser(user)
                if(newUser == undefined) {
                    const error: any = new Error("username or password taken")
                    return next(error)
                }
                else res.send(newUser); return
            }
            catch(err) {
                const error: any = new Error("Could not create this user")
                error.status = 404
                return next(error)
            }
        })
    ]


}