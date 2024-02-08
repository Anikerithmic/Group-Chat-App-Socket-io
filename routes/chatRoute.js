const express = require('express');
const chatController = require('../controllers/chatController');
const userAuthentication = require('../middleware/auth');

const router = express.Router();

router.get('/chat', chatController.getChat);
router.post('/:chatId/message', userAuthentication.authenticate, chatController.createMessage);
// router.get('/chat/message', userAuthentication.authenticate, chatController.getMessage);
router.get('/userFriends', userAuthentication.authenticate, chatController.getUserFriends);
router.get('/user/:chatId/messages', userAuthentication.authenticate, chatController.getUserMessagesWithFriend);
router.get('/user/:chatId/newMessages', userAuthentication.authenticate, chatController.getNewMessages);


module.exports = router;