import React, { useMemo } from "react";
import { Box } from "@material-ui/core";
import { BadgeAvatar, ChatContent } from "../Sidebar";
import { makeStyles } from "@material-ui/core/styles";
import { setActiveChat } from "../../store/activeConversation";
import { markMessagesAsRead } from "../../store/utils/thunkCreators";
import { useDispatch } from "react-redux";

const useStyles = makeStyles(() => ({
  root: {
    borderRadius: 8,
    height: 80,
    boxShadow: "0 2px 10px 0 rgba(88,133,196,0.05)",
    marginBottom: 10,
    display: "flex",
    alignItems: "center",
    "&:hover": {
      cursor: "grab",
    },
  },
}));

const Chat = (props) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const otherUser = props.conversation.otherUser;
  const newMessageCount = useMemo(() => props.conversation.messages.filter(message =>
    !message.isRead && message.senderId === otherUser.id
  ).length, [props.conversation, otherUser.id]);

  const handleClick = async (conversation) => {
    dispatch(setActiveChat(conversation.otherUser.username));
    dispatch(markMessagesAsRead({
      conversation: conversation.id,
      otherUser: conversation.otherUser.id
    }));
  };

  return (
    <Box
      onClick={() => handleClick(props.conversation)}
      className={classes.root}
    >
      <BadgeAvatar
        photoUrl={otherUser.photoUrl}
        username={otherUser.username}
        online={otherUser.online}
        sidebar={true}
      />
      <ChatContent conversation={props.conversation} newMessageCount={newMessageCount} />
    </Box>
  );
}

export default Chat;
