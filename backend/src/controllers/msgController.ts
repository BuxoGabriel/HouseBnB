import express, { Router } from "express"
import asyncHandler from "express-async-handler"
import { body, validationResult } from "express-validator"

import { MessageDao } from "../persistence/daoInterface";
import Message from "../model/message";

export default function getMsgRouter(msgDao: MessageDao): Router {
    const messageController = new MessageController(msgDao)
    const messageRouter = express.Router()

    messageRouter.post("/", messageController.postMessage)
    messageRouter.put("/", messageController.editMessage)
    messageRouter.delete("/:id", messageController.deleteMessage)
    messageRouter.get("/convo", messageController.getConvo)
    messageRouter.get("/convo/:uid", messageController.getUserConvos)
    messageRouter.delete("/convo/:id", messageController.deleteConvo)
    return messageRouter
}

class MessageController{
    private msgDao: MessageDao
    constructor(msgDao: MessageDao) {
        this.msgDao = msgDao
    }

    /**
     * Send a message with < 1000 chars in a conversation
     */
    postMessage = [
        body("cid")
            .trim()
            .isNumeric()
            .isLength({min: 1})
            .escape(),

        body("fromid")
            .trim()
            .isNumeric()
            .isLength({min: 1})
            .escape(),

        body("text")
            .isLength({min: 1, max: 1000})
            .escape(),
        
        asyncHandler(async (req, res, next) => {
            const errors = validationResult(req)
            if(!errors.isEmpty()) {
                res.sendStatus(400)
                return
            }

            let message: Message = {
                cid: req.body.cid,
                fromid: req.body.fromid,
                text: req.body.text
            }

            try {
                message = await this.msgDao.createMessage(message.cid!, message.fromid, message.text)
                res.sendStatus(200)
            }
            catch(err) {
                console.error(err)
                res.sendStatus(500)
            }
        })
    ]

    editMessage = [
        body("mid")
            .trim()
            .isNumeric()
            .isLength({min: 1})
            .escape(),

        body("newtext")
            .isLength({min: 1, max: 1000})
            .escape(),

        asyncHandler(async(req, res, next) => {
            try{
                let msg = await this.msgDao.editMessage(req.body.mid, req.body.newtext)
                if(msg) {res.json(msg); return}
                else {res.sendStatus(400); return}
            } catch(err) {
                res.sendStatus(500)
            }
        })
    ]

    deleteMessage = asyncHandler(async (req, res, next) => {
        let id = parseInt(req.params.id)
        try {
            await this.msgDao.deleteMessage(id)
            res.sendStatus(200)
        } catch (error) {
            console.error(error)
            res.sendStatus(500)
        }
    })

    getConvo = asyncHandler(async (req, res, next) => {
        if(typeof req.query.id !== "string") {res.sendStatus(400); return}
        if(typeof req.query.page !== "string") {res.sendStatus(400); return}
        let id = parseInt(req.query.id)
        let page = parseInt(req.query.page)
        if(isNaN(id) || isNaN(page)) {res.sendStatus(400); return}
        try{
            let convo = await this.msgDao.getConversation(id)
            res.json(convo)
        }
        catch(err) {
            console.error(err)
            res.sendStatus(500)
        }
    })

    getUserConvos = asyncHandler(async (req, res, next) => {
        let uid = parseInt(req.params.id)
        if(isNaN(uid)) {res.sendStatus(400); return}
        try{
            let convos = await this.msgDao.getUserConversations(uid)
            res.json(convos)
        } catch(err) {
            console.error(err)
            res.sendStatus(500)
        }
    })

    deleteConvo = asyncHandler((req, res, next) => {

    })
}