const socket = io();
const messageForm = document.querySelector('.conversation-form');
const messageFormSendFile = document.querySelector('.conversation-form-sendFile');
const messageInput = document.querySelector('.conversation-form-input');
const conversationWrapper = document.querySelector('.conversation-wrapper');
const createGroupButton = document.querySelector('.create-group-button');
const addUserButton = document.querySelector('.add-user-button');
const removeUserButton = document.querySelector('.remove-user-button');
const deleteGroupButton = document.querySelector('.delete-group-button');
const openChatButton = document.querySelector('.open-chat-button');
const groupForm = document.querySelector('.group-form');
const groupNameInput = document.querySelector('.group-name');
const groupSubmitButton = document.querySelector('.group-submit-button');
const groupUsersContainer = document.querySelector('.group-user-container');
const loggedInUser = document.querySelector('.conversation-user-status-online');
let lastMessageId = null;

const baseURL = 'http://localhost:5000';

document.addEventListener('DOMContentLoaded', async () => { // on domContentloaded initialy it fetches all the messags form the db
    loggedInUser.innerHTML = localStorage.getItem('loggedInUser');
    conversationWrapper.innerHTML = '';
    messageForm.style.visibility = 'hidden';
    messageFormSendFile.style.visibility = 'hidden';

    // for Loading user groups and friends
    await fetchUserFriends()
    await fetchUserGroups();

});

function logout() {
    localStorage.removeItem('token');
    window.location.href = "/login";
}

document.addEventListener('click', async (event) => {
    const target = event.target;
    const token = localStorage.getItem('token');
    const chatType = target.parentElement.parentElement.dataset.chatType;
    const chatId = target.parentElement.parentElement.dataset.chatId;


    if (target.classList.contains('user-group-name')) {
        const userGroupToggleButton = target.parentElement.querySelector('.user-group-toggle-button');
        const chatId = target.parentElement.dataset.chatId;

        if (userGroupToggleButton) {
            userGroupToggleButton.style.display = (userGroupToggleButton.style.display === 'block') ? 'none' : 'block';
        }

        try {
            const response = await axios.get(`${baseURL}/group/${chatId}/is-admin`, { headers: { "Authorization": token } });
            if (response.data.isAdmin) {
                target.parentElement.querySelector('.add-user-button').style.display = 'block';
                target.parentElement.querySelector('.remove-user-button').style.display = 'block';
                target.parentElement.querySelector('.make-admin-button').style.display = 'block';
                target.parentElement.querySelector('.delete-group-button').style.display = 'block';
            } else {
                target.parentElement.querySelector('.add-user-button').style.display = 'none';
                target.parentElement.querySelector('.remove-user-button').style.display = 'none';
                target.parentElement.querySelector('.make-admin-button').style.display = 'none';
                target.parentElement.querySelector('.delete-group-button').style.display = 'none';
            }
        } catch (error) {
            console.error('Error checking if user is admin:', error);
        }
    }


    // on click eventListener for open-chat button
    if (target.classList.contains('open-chat-button')) {

        messageForm.dataset.chatType = chatType;
        messageForm.dataset.chatId = chatId;
    }

    //on click eventListener for user-list button
    if (target.classList.contains('user-list-button')) {
        const groupUserList = document.querySelector('.group-user-list');
        groupUserList.innerHTML = '';

        try {
            const userListResponse = await axios.get(`${baseURL}/group/${chatId}/user-list`, { headers: { "Authorization": token } });
            console.log('userLisy:>', userListResponse.data.groupUsers);

            if (userListResponse.data.success === true) {
                const storedUsers = JSON.parse(localStorage.getItem('Users'));
                const userIds = userListResponse.data.groupUsers.map(user => user.userId);
                const filteredUsers = storedUsers.filter(user => userIds.includes(user.id));
                const userNames = filteredUsers.map(user => user.name);

                userNames.forEach(userName => {
                    const userNameElement = document.createElement('div');
                    userNameElement.textContent = userName;
                    groupUserList.appendChild(userNameElement);
                });
            } else {
                console.log('Error: Unable to fetch user list');
            }
        } catch (error) {
            console.error('Error fetching group users:', error);
        }
    }



    //on click eventListener for add user button button
    if (target.classList.contains('add-user-button')) {
        const storedUsers = JSON.parse(localStorage.getItem('Users'));
        console.log(storedUsers);
        const userid = prompt("Enter user id:");

        try {
            const response = await axios.post(`${baseURL}/group/${chatId}/add-user`, { userid }, { headers: { "Authorization": token } });

            if (response.data.success === true) {
                alert("User added to the group successfully.");
            } else {
                alert(response.data.error);
            }
        } catch (error) {
            console.error('Error adding user to group:', error);
            if (error.response && error.response.data && error.response.data.error) {
                alert(error.response.data.error);
            } else {
                alert("An error occurred while adding the user to the group.");
            }
        }
    }

    // on click eventlistener for remove user button
    if (target.classList.contains('remove-user-button')) {
        const userid = prompt("Enter user id to remove:");

        try {
            const response = await axios.post(`${baseURL}/group/${chatId}/remove-user`, { userid }, { headers: { "Authorization": token } });

            if (response.data.success === true) {
                alert("User removed.");
            } else {
                alert(response.data.error);
            }
        } catch (error) {
            console.error('Error removing user from group:', error);
            if (error.response && error.response.data && error.response.data.error) {
                alert(error.response.data.error);
            } else {
                alert("An error occurred while removing the user from the group.");
            }
        }
    }

    //on click eventListener for delete group button
    if (target.classList.contains('delete-group-button')) {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${baseURL}/group/${chatId}/delete-group`, {}, { headers: { "Authorization": token } });

            if (response.data.success === true) {
                alert("Group deleted.");
            } else {
                alert(response.data.error);
            }
        } catch (error) {
            console.error('Error deleting group:', error);
            if (error.response && error.response.data && error.response.data.error) {
                alert(error.response.data.error);
            } else {
                alert("An error occurred while deleting group.");
            }
        }
    }

    if (target.classList.contains('make-admin-button')) {
        const token = localStorage.getItem('token');
        const userid = prompt("Enter user id:");
        try {

            const response = await axios.post(`${baseURL}/group/${chatId}/make-admin`, { userid }, { headers: { "Authorization": token } });

            if (response.data.success === true) {
                alert("User has been made admin.");

            } else {
                alert(response.data.error);
            }
        } catch (error) {
            console.error('Error making user admin:', error);
            if (error.response && error.response.data && error.response.data.error) {
                alert(error.response.data.error);
            } else {
                alert("An error occurred while making the user admin.");
            }
        }
    }

});

socket.on('chatMessage', (data) => {
    console.log('Received message:', data);
    renderMessage(data);
});

socket.on('fileMessage', (data) => {
    console.log('Received file message:', data);
    renderMultimediaMessage(data);
});


messageForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const message = messageInput.value.trim();
    const chatType = messageForm.dataset.chatType;
    const chatId = messageForm.dataset.chatId;
    console.log('CreateMsg-chatType', chatType)
    console.log('CreateMsg-chatId', chatId)

    if (message !== '') {
        try {
            const token = localStorage.getItem('token');
            // Emit the chat message to the server
            socket.emit('chatMessage', { token, chatType, chatId, message, name });

        } catch (error) {
            console.error('Error sending message:', error);
        }
        messageInput.value = '';
    }
});

const renderMessage = (message) => {
    const loggedInUser = localStorage.getItem('loggedInUser'); 
    const usersArray = localStorage.getItem('Users'); 

    if (!loggedInUser || !usersArray) {
        console.error('Logged in user or users array not found in localStorage.');
        return;
    }
    const users = JSON.parse(usersArray);

    // Find the user object with the matching name
    const user = users.find(u => u.name === loggedInUser);
    const messageItem = document.createElement('li');

    // Check if user exists and log the id if found
    if (user.id === message.userId) {
        messageItem.classList.add('conversation-item');
    } else {
        messageItem.classList.add('conversation-item');
        messageItem.classList.add('me');
    }

    messageItem.innerHTML = `
        <div class="conversation-item-content">
            <div class="conversation-item-wrapper">
                <div class="conversation-item-box">
                    <div class="conversation-item-text">
                        <p>${message.message}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    conversationWrapper.appendChild(messageItem);
    lastMessageId = message.id;
};

const renderMultimediaMessage = (message) => {

    const loggedInUser = localStorage.getItem('loggedInUser'); 
    const usersArray = localStorage.getItem('Users'); 

    if (!loggedInUser || !usersArray) {
        console.error('Logged in user or users array not found in localStorage.');
        return;
    }
    const users = JSON.parse(usersArray);

    // Finding the user object with the matching name
    const user = users.find(u => u.name === loggedInUser);
    const messageItem = document.createElement('li');

    if (user.id === message.userId) {
        messageItem.classList.add('conversation-item');
    } else {
        messageItem.classList.add('conversation-item');
        messageItem.classList.add('me');
    }

    messageItem.innerHTML = `
        <div class="conversation-item-content">
            <div class="conversation-item-wrapper">
                <div class="conversation-item-box">
                    <div class="conversation-item-text">
                        
                        <button class="open-message-button">Open message</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    const openButton = messageItem.querySelector('.open-message-button');
    openButton.addEventListener('click', () => {
        window.open(message.message, '_blank');
    });

    conversationWrapper.appendChild(messageItem);
    lastMessageId = message.id;
};

socket.on('newGroupMessages', (data) => {
    const { groupId, newMessages } = data;
    // Render new messages received from the server
    newMessages.forEach(message => {
        renderMessage(message);
    });

    // Concatenate the new messages with old stored messages.
    let storedMessages = JSON.parse(localStorage.getItem('newMessages')) || [];
    storedMessages = storedMessages.concat(newMessages);
    localStorage.setItem('messages', JSON.stringify(storedMessages));
});

createGroupButton.addEventListener('click', async (event) => {
    event.preventDefault();

    groupForm.style.visibility = (groupForm.style.visibility === 'visible') ? 'hidden' : 'visible';

    groupForm.addEventListener('submit', createGroup);
})

async function createGroup(e) {
    e.preventDefault();

    const groupName = groupNameInput.value.trim();
    console.log('Group  Name::>>', groupName)

    if (groupName !== '') {

        try {

            const token = localStorage.getItem('token');
            conversationWrapper.innerHTML = '';
            const groupResponse = await axios.post(`${baseURL}/createGroup`, { groupName }, { headers: { "Authorization": token } });
            groupForm.style.visibility = (groupForm.style.visibility === 'visible') ? 'hidden' : 'visible';

        }
        catch (error) {
            console.error('Error creating group:', error);
        }
        groupNameInput.value = '';
    }
}

// Fetch user groups from the server
async function fetchUserGroups() {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${baseURL}/userGroups`, { headers: { "Authorization": token } });
        console.log('FetcgesGroups:>', response.data.totalUserGroups);

        localStorage.setItem('Groups', JSON.stringify(response.data.groups));
        localStorage.setItem('UserGroupsInfo', JSON.stringify(response.data.totalUserGroups));

        renderGroups(response.data.groups, response.data.totalUserGroups);

    } catch (error) {
        console.error('Error fetching user groups:', error);
    }
}

// Fetch user friends from the server
async function fetchUserFriends() {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${baseURL}/userFriends`, { headers: { "Authorization": token } });
        localStorage.setItem('Users', JSON.stringify(response.data.users));
        // Render user friends in the sidebar
        renderUsers(response.data.users);


    } catch (error) {
        console.error('Error fetching user friends:', error);
    }
}

// Render user groups in the sidebar
function renderGroups(groups, userGroupsInfo) {
    const userGroupsContainer = document.querySelector('.groups-container');
    userGroupsContainer.innerHTML = '';

    groups.forEach(group => {
        const groupElement = document.createElement('div');
        groupElement.classList.add('.user-group');
        groupElement.dataset.chatType = 'group';
        groupElement.dataset.chatId = group.id;
        groupElement.innerHTML = `
            <div class="user-group-name">${group.id}.${group.groupName}</div>
            <div class="user-group-toggle-button" style="display: none;">
                <button class="open-chat-button">Open Chat</button>
                <button class="user-list-button">User list</button>
                <button class="make-admin-button">Make Admin</button>
                <button class="add-user-button">Add User</button>
                <button class="remove-user-button">Remove User</button>
                <button class="delete-group-button">Delete Group</button>
                
            </div>
        `;
        userGroupsContainer.appendChild(groupElement);


        attachGroupEventListeners(groupElement, group);
    });

}

function attachGroupEventListeners(groupOrUserElement, group) {
    const openChatButton = groupOrUserElement.querySelector('.open-chat-button');

    openChatButton.addEventListener('click', async (event) => {
        event.preventDefault();
        const chatType = groupOrUserElement.dataset.chatType;
        const chatId = groupOrUserElement.dataset.chatId;
        console.log('chatType:', chatType);
        console.log('chatId:', chatId);

        openChatForGroup(chatId);
    });
}


// Rendering user friends in the sidebar

function renderUsers(users) {
    const userFriendsContainer = document.querySelector('.user-friends-container');
    userFriendsContainer.innerHTML = '';

    users.forEach(user => {
        const userElement = document.createElement('div');
        userElement.classList.add('.user-friend');
        userElement.dataset.chatType = 'user';
        userElement.dataset.chatId = user.id; 
        userElement.innerHTML = `
            <div class="user-friend-name">${user.id}.${user.name}</div>
            <div class="user-friend-toggle-button" style="display:none">
                <button class="open-chat-button">Open Chat</button>
            </div>
        `;
        userFriendsContainer.appendChild(userElement);
        attachUserEventListeners(userElement, user);
    });
}

function attachUserEventListeners(userElement, user) {
    const openChatButton = userElement.querySelector('.open-chat-button');

    openChatButton.addEventListener('click', async (event) => {
        event.preventDefault();
        const chatType = userElement.dataset.chatType;
        const chatId = userElement.dataset.chatId;
        console.log('chatType:', chatType);
        console.log('chatId:', chatId);

        openChatForUser(chatId);

        setInterval(async () => {
            await fetchNewMessages(chatId, chatType);
        }, 2000);

    });
}


// Function to open chat for group with the ID

async function openChatForUser(chatId) {
    conversationWrapper.innerHTML = '';
    messageForm.style.visibility = 'visible';
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${baseURL}/user/${chatId}/messages`, { headers: { "Authorization": token } });

        if (response.data && Array.isArray(response.data.messages)) {
            conversationWrapper.innerHTML = '';
            response.data.messages.forEach(message => {
                renderMessage(message);
            });
        }
    } catch (error) {
        console.error('Error fetching messages for user:', error);
    }
}

async function openChatForGroup(groupId) {
    conversationWrapper.innerHTML = '';
    messageForm.style.visibility = 'visible';
    messageFormSendFile.style.visibility = 'visible';
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${baseURL}/group/${groupId}/messages`, { headers: { "Authorization": token } });

        if (response.data && Array.isArray(response.data.messages)) {
            conversationWrapper.innerHTML = '';
            response.data.messages.forEach(message => {
                if (message.message.includes("https")) {
                    renderMultimediaMessage(message);
                } else {
                    renderMessage(message);
                }
            });
        }
    } catch (error) {
        console.error('Error fetching messages for group:', error);
    }
}

async function sendFile(event) {
    try {
        const token = localStorage.getItem('token');
        event.preventDefault();

        const chatType = messageForm.dataset.chatType;
        const chatId = messageForm.dataset.chatId;
        console.log('sendFile-chatType:', chatType)
        console.log('sendFile-chatId:', chatId)

        const fileInput = document.getElementById("file-input");
        const formData = new FormData();

        if (fileInput.files.length > 0) {
            formData.append("image", fileInput.files[0]);

            const response = await axios.post(`${baseURL}/group/upload`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": token
                }
            });

            fileInput.value = '';

            console.log("Response from /upload:", response.data);
            // If response.data contains fileURL then emit it via socket.
            if (response.data && response.data.fileURL) {
                const message = response.data.fileURL;
                const messageType = 'img';
                socket.emit('fileUploaded', { token, message, chatId, messageType }); // Emiting the fileURL to the server.
            }

        } else {
            console.log('No file selected.');
        }
    } catch (error) {
        console.error("Error uploading file:", error);
    }
}

