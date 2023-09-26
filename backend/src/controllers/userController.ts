
import express, { Router, Request, Response } from "express"
import asyncHandler from "express-async-handler"
import { body, validationResult } from "express-validator"
import * as bcrypt from "bcrypt"

import { UserDao } from "../persistence/daoInterface"
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
    userRouter.delete("/:id", userController.userDelete)

    return userRouter
}

class UserController {
    private userDao: UserDao
    public static saltRounds: number = 10;
    constructor(userDao: UserDao) {
        this.userDao = userDao
    }

    userGet = asyncHandler(async (req, res, next) => {
        let id = Number(req.params.id)
        let user = await this.userDao.getUser(id)
        res.json(user)
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
            .isLength({min: 1})
            .escape(),
        body("email")
            .trim()
            .isLength({min: 1})
            .matches(/(([A-Za-z])*(@){1}([a-zA-Z])*(.com){1})/),

        asyncHandler(async (req, res, next) => {
            const errors = validationResult(req)
            if(!errors.isEmpty()) {
                const error: any = new Error(JSON.stringify(errors))
                error.status = 400
                return next(error)
            }
            
            try {
                // get salt and hash the password
                let salt = await bcrypt.genSalt(UserController.saltRounds)
                let hashPass = await bcrypt.hash(req.body.password, salt)

                const user: User = {
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    username: req.body.username,
                    password: hashPass,
                    salt: salt,
                    email: req.body.email,
                    registerdate: new Date()
                }

                let newUser = await this.userDao.createUser(user)
                if(newUser == undefined) {
                    const error: any = new Error("username or password taken")
                    return next(error)
                }
                else res.send(newUser); return
            }
            catch(err) {
                const error: any = new Error("Could not create this user")
                error.status = 400
                return next(error)
            }
        })
    ]

    userDelete = asyncHandler(async (req, res, next) => {
        let id = Number(req.params.id)
        let user = await this.userDao.deleteUser(id)
        res.json(user)
    })
}