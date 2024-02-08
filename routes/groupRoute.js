const express = require('express');
const groupController = require('../controllers/groupController');
const userAuthentication = require('../middleware/auth');

const router = express.Router();

router.get('/groupChat', groupController.getGroupChat);
router.post('/createGroup', userAuthentication.authenticate, groupController.createGroup);
router.get('/userGroups', userAuthentication.authenticate, groupController.getUserGroups);
router.post('/group/:groupId/message/create', userAuthentication.authenticate, groupController.createGroupMessage);
router.get('/group/:groupId/messages', userAuthentication.authenticate, groupController.getGroupMessage);

router.get('/group/:chatId/newMessages', userAuthentication.authenticate, groupController.getGroupNewMessages);

//route to add the user into the specific selected group
router.post('/group/:groupId/add-user', userAuthentication.authenticate, groupController.addUserToGroup);

//route to remove the user from the group.
router.post('/group/:groupId/remove-user', userAuthentication.authenticate, groupController.removeUserFromGroup);

//route to delete the group.
router.post('/group/:groupId/delete-group', userAuthentication.authenticate, groupController.deleteGroup);

//route to fetch users of group.
router.get('/group/:groupId/user-list', userAuthentication.authenticate, groupController.getGroupUserList);

//route to fetch isAdmin user.
router.get('/group/:groupId/is-admin', userAuthentication.authenticate, groupController.isAdmin);

//route to fetch users of group.
router.post('/group/:groupId/make-admin', userAuthentication.authenticate, groupController.makeUserAdmin);





module.exports = router;