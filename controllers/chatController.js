const path = require('path');
const User = require('../models/User');
const Message = require('../models/Message');
const { Op } = require('sequelize');

exports.getChat = (req, res, next) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'chat.html'));
}

exports.createMessage = async (req, res, next) => {
    try {
        const { message } = req.body;
        const messageData = await Message.create({
            userId: req.user.id,
            message: message,
            chatId: req.params.chatId
        });
        if (!messageData) {
            throw new Error('Failed to create new message.');
        }
        res.status(201).json({ success: true, newMessage: messageData });

    } catch (err) {
        console.log('Error creating message:', err)
        return res.status(500).json({ error: err });
    };
}
exports.getMessage = async (req, res, next) => {
    try {
        const messages = await Message.findAll({ where: { userId: req.user.id } });

        if (messages.length === 0) {
            return res.json({ messages: 'no messages present' });
        } else {
            res.json({ success: true, messages });
        }

    } catch (err) {
        console.error('Error fetching messages:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.getNewMessages = async (req, res, next) => {
    try {
        const lastMessageId = req.query.id;
        const chatId = req.params.chatId; // Assuming the chatId is provided in the route parameter
        console.log('lastMessageId>>:>>', lastMessageId);
        console.log('chatId>>:>>', chatId);

        const messages = await Message.findAll({ 
            where: {  
                chatId: chatId, // Filter messages by the provided chatId
                id: { [Op.gt]: lastMessageId } 
            } 
        });

        if (messages.length !== 0) {
            return res.json({ success: true, messages });
        } else {
            return res.json({ messages: [] });
        }
    } catch (err) {
        console.error('Error fetching messages:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.getUserFriends = async (req, res, next) => {
    try {
        // Find all users
        const totalUsers = await User.findAll();

        res.status(200).json({ users: totalUsers });
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.getUserMessagesWithFriend = async (req, res, next) => {
    try {
        const userId = req.user.id; // Your user ID
        // const friendId = req.params.userId; // Friend's user ID
        const chatId = req.params.chatId; // Chat ID associated with your conversation with your friend

        const messages = await Message.findAll({
            where: {
                chatId: chatId, // Filter messages based on the chatId
                // userId: {
                //     [Op.or]: [userId, friendId] // Filter messages sent by you or your friend
                // }
            },
            order: [['createdAt', 'ASC']] // Optionally, you can order messages by creation date
        });

        res.status(200).json({ messages });
    } catch (error) {
        console.error('Error fetching user messages with friend:', error);
        res.status(500).json({ error: error.message });
    }
};