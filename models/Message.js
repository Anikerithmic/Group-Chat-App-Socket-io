const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Message = sequelize.define('message', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    message: {
        type: Sequelize.STRING,
        allowNull: false
    },
    userId: {
        type: Sequelize.INTEGER
        // allowNull: false
    },
    chatId: {
        type: Sequelize.INTEGER
    }
});

module.exports = Message;
