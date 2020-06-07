const express=require("express");
const chatFacebookConytrollers=require('../controllers/chatFacebookControllers');

const router=express.Router()

router.post('/webhook',chatFacebookConytrollers.postWebHook)
.get('/webhook',chatFacebookConytrollers.getWebHook)

module.exports=router;