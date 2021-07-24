import React, { useMemo } from "react";
import { Box } from "@material-ui/core";
import { BadgeAvatar, ChatContent } from "../Sidebar";
import { withStyles } from "@material-ui/core/styles";
import { setActiveChat } from "../../store/activeConversation";
import { markMessagesAsRead } from "../../store/utils/thunkCreators";
import { connect } from "react-redux";

const styles = {
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
};

const Chat = (props) => {
  const { classes } = props;
  const otherUser = props.conversation.otherUser;
  const newMessageCount = useMemo(() => props.conversation.messages.filter(message =>
    !message.isRead && message.senderId === otherUser.id
  ).length, [props.conversation, otherUser.id]);

  const handleClick = async (conversation) => {
    await props.setActiveChat(conversation.otherUser.username);
    await props.markMessagesAsRead({
      conversation: conversation.id,
      otherUser: conversation.otherUser.id
    });
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

const mapDispatchToProps = (dispatch) => {
  return {
    setActiveChat: (id) => {
      dispatch(setActiveChat(id));
    },
    markMessagesAsRead: (body) => {
      dispatch(markMessagesAsRead(body));
    }
  };
};

export default connect(null, mapDispatchToProps)(withStyles(styles)(Chat));
