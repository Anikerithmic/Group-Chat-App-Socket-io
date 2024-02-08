const Sequelize = require('sequelize');

const sequelize = new Sequelize('group-chat-app', 'root', 'trailing',{
    dialect: 'mysql',
    host: 'localhost'
});
module.exports = sequelize;
    