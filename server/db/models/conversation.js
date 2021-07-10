const { Op } = require("sequelize");
const db = require("../db");
const Message = require("./message");

const Conversation = db.define("conversation", {});

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

module.exports = Conversation;
