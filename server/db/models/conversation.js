const { Op, Sequelize } = require("sequelize");
const db = require("../db");
const Message = require("./message");

const Conversation = db.define("conversation", {
  user1Id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  user2Id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  user1UnreadCnt: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  user2UnreadCnt: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
});

// find conversation given two user Ids

Conversation.findConversation = async function (user1Id, user2Id) {
  const conversation = await Conversation.findOne({
    where: {
      user1Id: {
        [Op.or]: [user1Id, user2Id]
      },
      user2Id: {
        [Op.or]: [user1Id, user2Id]
      }
    }
  });

  // return conversation or null if it doesn't exist
  return conversation;
};

// Given a specific conversation id, return it if the userId
// exists in the conversation, otherwise return null

Conversation.includingUser = async function (convId, userId) {
  const conversation = await Conversation.findOne({
    where: {
      id: {
        [Op.eq]: convId
      },
      [Op.or]: [
        {
          user1Id: userId
        }, {
          user2Id: userId
        }
      ]
    }
  });

  // return conversation or null if it doesn't exist
  return conversation;
}

// Helper function to get conv through id or instance
const getConvOf = async function (conv, userId) {
  if (Number.isInteger(conv)) {
    conversation = await Conversation.includingUser(conv, userId);
  } else {
    conversation = conv;
  }
  if (conversation === null) {
    throw new Error("Cannot read from a conversation you're not in!");
  }
  return conversation;
}

// Add to the other users' unread count for the specific conversation.
// Takes either conversation ID or instance.
// Returns updated conversation instance
Conversation.addUnreadFrom = async function (conv, userId, amt=1) {
  let conversation = await getConvOf(conv, userId);
  let user1 = conversation.getDataValue("user1Id");
  // Get the other (receiver) user
  let key = (user1 !== userId) ? "user1UnreadCnt" : "user2UnreadCnt";

  // The increment feature in sequelize would make this function simplier, however
  // we need to fetch the conversation to figure out which user is the receiver
  conversation.setDataValue(key, conversation.getDataValue(key) + amt);
  conversation.save(); // write to DB
  return conversation;
};

// Mark conversation as read by the user
// Takes either conversation instance or id
Conversation.markAsReadBy = async function(conv, userId) {
  let conversation = await getConvOf(conv, userId);
  let user1 = conversation.getDataValue("user1Id");
  // Get the current (sender) user
  let key = (user1 === userId) ? "user1UnreadCnt" : "user2UnreadCnt";

  // Mark all as read
  conversation.setDataValue(key, 0);
  conversation.save(); // write to DB
  return conversation;
}

module.exports = Conversation;
