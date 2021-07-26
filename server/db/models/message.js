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
  },
  isRead: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false, // New messages will always start off as unread
  }
});

// Marks all of the messages in the given conversation sent by the
// sender as read.
// Returns the newly read messages
Message.markAsRead = async (conversationId, senderId) => {
  const readMessages = await Message.update({
    isRead: true
  }, {
  where: {
    conversationId: conversationId,
    senderId: senderId
  }});
  return readMessages;
}

module.exports = Message;
