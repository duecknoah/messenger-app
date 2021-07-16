const Sequelize = require("sequelize");
const db = require("../db");
const Conversation = require("./conversation");

const Message = db.define("message", {
  text: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  senderId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  conversationId: {
    type: Sequelize.INTEGER,
    allowNull: false
  }
});

module.exports = Message;
