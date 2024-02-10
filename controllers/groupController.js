const path = require('path');
const User = require('../models/User');
const Message = require('../models/Message');
const Group = require('../models/Group');
const GroupHandler = require('../models/GroupHandler');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');
const S3Service = require('../services/S3services');
const fs = require('fs');


exports.getGroupChat = (req, res, next) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'chat.html'));
}

exports.createGroup = async (req, res, next) => {
    try {
        const gName = req.body.groupName;
        const groupData = await Group.create({
            groupName: gName
        });

        await GroupHandler.create({
            groupId: groupData.id,
            userId: req.user.id,
            isAdmin: true
        });

        res.status(201).json({ success: true, message: 'Group created successfully', groupData });

    }
    catch (error) {
        console.log('Error creating group:', error)
        return res.status(500).json({ error: error });
    }
}

exports.getUserGroups = async (req, res, next) => {
    try {
        // Finding all groups associated with the current user using GroupHandler
        const totalUserGroups = await GroupHandler.findAll({ where: { userId: req.user.id } });

        // Extracting the groupIds from totalUserGroups in an array
        const groupIds = totalUserGroups.map(group => group.groupId);

        // Finding all groups with ids in groupIds array
        const groups = await Group.findAll({ where: { id: groupIds } });

        res.status(200).json({ groups, totalUserGroups });
    } catch (err) {
        console.error('Error fetching groups:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.createGroupMessage = async (req, res, next) => {
    try {
        const { message } = req.body;
        const groupId = req.params.groupId;

        const messageData = await Message.create({
            userId: req.user.id,
            message: message,
            groupId: groupId
        });

        if (!messageData) {
            throw new Error('Failed to create new message.');
        }

        io.emit('GroupMessage', { messageData });

    } catch (err) {
        console.error('Error creating message:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.getGroupMessage = async (req, res, next) => {
    try {
        const messages = await Message.findAll({ where: { groupId: req.params.groupId } });

        res.status(200).json({ messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getGroupNewMessages = async (req, res, next) => {
    try {
        const groupId = req.params.chatId;
        const lastMessageId = req.query.id;
        console.log('groupId:>>', groupId)
        console.log('lastMessageId:>>', lastMessageId)

        const newMessages = await Message.findAll({
            where: {
                groupId: groupId,
                id: { [Op.gt]: lastMessageId }
            }
        });
        if (newMessages.length !== 0) {
            io.emit('newGroupMessages', { newMessages: newMessages });

        } else {
            io.emit('newGroupMessages', { newMessages: [] });
        }
    } catch (error) {
        console.error('Error fetching new messages:', error);
        res.status(500).json({ error: error.message });
    }
};


exports.addUserToGroup = async (req, res, next) => {
    try {
        const { userid } = req.body;
        const groupId = req.params.groupId;

        // Check if the user already exists in the group
        const existingUser = await GroupHandler.findOne({ where: { groupId: groupId, userId: userid } });
        if (existingUser) {
            return res.status(400).json({ success: false, error: "User already exists in the group." });
        }

        const addedUser = await GroupHandler.create({
            groupId: groupId,
            userId: userid
        });

        res.status(200).json({ success: true, addedUser });
    } catch (error) {
        console.error('Error adding user to group:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};


exports.removeUserFromGroup = async (req, res, next) => {
    try {
        const { userid } = req.body;
        const groupId = req.params.groupId;

        const fetchUser = await GroupHandler.findOne({ where: { groupId: groupId, userId: userid } });
        if (!fetchUser) {
            throw new Error("User or Group dosen't exists.");
        }

        await GroupHandler.destroy({
            where: {
                groupId: groupId,
                userId: userid
            }
        });

        res.status(200).json({ success: true, message: 'User removed from group successfully' });
    } catch (error) {
        console.error('Error removing user from group:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.deleteGroup = async (req, res, next) => {
    try {
        const groupId = req.params.groupId;

        await GroupHandler.destroy({ where: { groupId: groupId } });
        await Group.destroy({ where: { id: groupId } });

        res.status(200).json({ success: true, message: 'Group successfully deleted' });
    } catch (error) {
        console.error('Error deleting group:', error);
        res.status(500).json({ error: error.message });
    }
};
exports.getGroupUserList = async (req, res, next) => {
    try {
        const groupId = req.params.groupId;

        const groupUsers = await GroupHandler.findAll({ where: { groupId: groupId } });

        res.status(200).json({ success: true, groupUsers });
    } catch (error) {
        console.error('Error getting group users:', error);
        res.status(500).json({ error: error });
    }
};


exports.isAdmin = async (req, res, next) => {
    try {
        const groupId = req.params.groupId;

        console.log('groupId:', groupId)
        console.log('userId:', req.user.id)

        const groupHandler = await GroupHandler.findOne({ where: { groupId, userId: req.user.id } });

        if (!groupHandler) {
            return res.status(404).json({ success: false, error: 'User not found in the group' });
        }

        // Checkig if the user is an admin
        if (groupHandler.isAdmin) {
            res.status(200).json({ success: true, isAdmin: true, message: 'User is an admin' });
        } else {
            res.status(200).json({ success: true, isAdmin: false, message: 'User is not an admin' });
        }
    } catch (error) {
        console.error('Error fetching isAdmin:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};




exports.makeUserAdmin = async (req, res, next) => {
    try {
        const groupId = req.params.groupId;
        const userId = req.body.userid;

        const groupHandler = await GroupHandler.findOne({ where: { groupId, userId } });

        if (!groupHandler) {
            return res.status(404).json({ success: false, error: 'User not found in the group' });
        }
        groupHandler.isAdmin = true;
        await groupHandler.save();

        res.status(200).json({ success: true, message: 'User has been made admin' });
    } catch (error) {
        console.error('Error making user admin:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};


//function to upload files over the AWS s3 services
exports.uploadFile = async (req, res) => {
    try {
        console.log("File content:", req.file);
        const filename = `user-${req.user.id}_${req.file.filename}_${Date.now()}.png`; // Generate a unique filename
        const fileURL = await S3Service.uploadToS3(req.file.path, filename); // Upload file to S3
        console.log('File URL:', fileURL);
        return res.status(200).json({ success: true, message: "File uploaded successfully", fileURL });
    } catch (err) {
        console.error("Error uploading file:", err);
        return res.status(500).json({ success: false, message: "Failed to upload file", error: err });
    }
};