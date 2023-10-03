import express, { Router } from "express"
import asyncHandler from "express-async-handler"
import { body, validationResult } from "express-validator"

import { MessageDao } from "../persistence/daoInterface";
import Message from "../model/message";
import Conversation from "../model/conversation";

export default function getMsgRouter(msgDao: MessageDao): Router {
    const messageController = new MessageController(msgDao)
    const messageRouter = express.Router()

    messageRouter.post("/", messageController.postMessage)
    messageRouter.put("/", messageController.editMessage)
    messageRouter.delete("/:id", messageController.deleteMessage)
    messageRouter.get("/convo", messageController.getConvo)
    messageRouter.post("/convo", messageController.postConvo)
    messageRouter.get("/convo/:uid", messageController.getUserConvos)
    messageRouter.delete("/convo/:cid", messageController.deleteConvo)
    return messageRouter
}

class MessageController{
    private msgDao: MessageDao
    constructor(msgDao: MessageDao) {
        this.msgDao = msgDao
    }

    /**
     * create a conversation
     */
    postConvo = [
        body("iid")
            .trim()
            .isNumeric()
            .isLength({min: 1})
            .escape(),

        body("hid")
            .trim()
            .isNumeric()
            .isLength({min: 1})
            .escape(),
        
        asyncHandler(async (req, res, next) => {
            const errors = validationResult(req)
            if(!errors.isEmpty()) {res.sendStatus(400); return}
            const {iid, hid}: Conversation = req.body
            if(iid === hid) {res.sendStatus(400); return}
            try {
                let convo = await this.msgDao.createConversation(iid, hid)
                res.json(convo)
                return
            }
            catch(err) {
                console.error(err)
                res.sendStatus(500)
                return
            }
        })
    ]

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
                const convos = await this.msgDao.getUserConversations(message.fromid)
                if(!convos.some(convo => convo.id == message.cid)) {res.sendStatus(400); return}
                message = await this.msgDao.createMessage(message.cid!, message.fromid, message.text)
                res.json(message)
                return
            }
            catch(err) {
                console.error(err)
                res.sendStatus(500)
                return
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
        if(typeof req.query.cid !== "string") {res.sendStatus(400); return}
        if(typeof req.query.page !== "string") {res.sendStatus(400); return}
        let id = parseInt(req.query.cid)
        let page = parseInt(req.query.page)
        if(isNaN(id) || isNaN(page)) {res.sendStatus(400); return}
        try{
            let convo = await this.msgDao.getConversation(id, page)
            res.json(convo)
        }
        catch(err) {
            console.error(err)
            res.sendStatus(500)
        }
    })

    getUserConvos = asyncHandler(async (req, res, next) => {
        let uid = parseInt(req.params.uid)
        if(isNaN(uid)) {res.sendStatus(400); return}
        try{
            let convos = await this.msgDao.getUserConversations(uid)
            res.json(convos)
        } catch(err) {
            console.error(err)
            res.sendStatus(500)
        }
    })

    deleteConvo = asyncHandler(async (req, res, next) => {
        let cid = parseInt(req.params.cid)
        if(isNaN(cid)) {res.sendStatus(400); return}
        try{
            let convo = await this.msgDao.deleteConversation(cid)
            if(convo) {res.json(convo)}
            else {res.sendStatus(400)}
        } catch(err) {
            res.sendStatus(500)
        }
    })
}