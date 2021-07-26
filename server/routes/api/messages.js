const router = require("express").Router();
const { Conversation, Message } = require("../../db/models");
const onlineUsers = require("../../onlineUsers");

// expects {recipientId, text, conversationId } in body (conversationId will be null if no conversation exists yet)
router.post("/", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const senderId = req.user.id;
    const { recipientId, text, conversationId, sender } = req.body;

    // if we already know conversation id, we can save time and just add it to message and return
    if (conversationId) {
      // Validate that the user exists in the desired conversation, this is to prevent being able
      // to send to other conversations they aren't apart of
      const conv = await Conversation.includingUser(conversationId, senderId);
      if (conv === null) {
        return res.sendStatus(403);
      }

      const message = await Message.create({ senderId, text, conversationId });
      return res.json({ message, sender });
    }
    // if we don't have conversation id, find a conversation to make sure it doesn't already exist
    let conversation = await Conversation.findConversation(
      senderId,
      recipientId
    );

    if (!conversation) {
      // create conversation
      conversation = await Conversation.create({
        user1Id: senderId,
        user2Id: recipientId,
      });
      if (onlineUsers.includes(sender.id)) {
        sender.online = true;
      }
    }
    const message = await Message.create({
      senderId,
      text,
      conversationId: conversation.id,
    });
    res.json({ message, sender });
  } catch (error) {
    next(error);
  }
});


// Handles marking messages as read that are unread
router.patch("/", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const senderId = req.user.id;
    const { conversation, otherUser } = req.body;

    // Validate that the conversation exists between the two people 
    // and matches with our desired id
    let convoLookup = await Conversation.findConversation(
      senderId,
      otherUser
    );
    if (convoLookup && convoLookup.id === conversation) {
      await Message.markAsRead(conversation, otherUser);
    } else {
      return res.sendStatus(403); // Cannot mark as read for other people!
    }
    

    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
