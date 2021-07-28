import React from "react";
import { Box } from "@material-ui/core";
import { SenderBubble, OtherUserBubble, ReadBubble } from "../ActiveChat";
import moment from "moment";

const Messages = (props) => {
  const { messages, otherUser, userId } = props;

  const createMessages = () => {
    let hasPlacedReadBubble = false;
    let elements = [];
    messages.forEach((message) => {
      const time = moment(message.createdAt).format("h:mm");
      if (message.senderId === userId) {
        // If this was the most recent unread message by the other, place the read bubble
        if (!message.isRead && !hasPlacedReadBubble) {
          hasPlacedReadBubble = true;
          elements.push(<ReadBubble otherUser={otherUser} key="readbubble" />);
        }
        elements.push(<SenderBubble key={message.id} text={message.text} time={time} />);
      } else {
        elements.push(<OtherUserBubble key={message.id} text={message.text} time={time} otherUser={otherUser} />);
      }
    });

    // Push to bottom if other has read all messages
    if (!hasPlacedReadBubble)
      elements.push(<ReadBubble otherUser={otherUser} key="readbubble" />);

    return elements;
  }

  return (
    <Box>
      {createMessages()}
    </Box>
  );
};

export default Messages;
