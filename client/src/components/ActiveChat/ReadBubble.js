import React from "react";
import { Avatar, Box, makeStyles } from "@material-ui/core";

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end"
  },
  avatar: {
    height: 20,
    width: 20,
  },
}));

const ReadBubble = (props) => {
  const classes = useStyles();
  const { otherUser } = props;

  return (
    <Box className={classes.root}>
      <Avatar alt={otherUser.username} src={otherUser.photoUrl} className={classes.avatar} key="read_bubble" ></Avatar>
    </Box>
  );
}

export default ReadBubble;