import axios from "axios";
import socket from "../../socket";
import {
  gotConversations,
  addConversation,
  setNewMessage,
  setSearchedUsers,
  updateMessages
} from "../conversations";
import { gotUser, setFetchingStatus } from "../user";

axios.interceptors.request.use(async function (config) {
  const token = await localStorage.getItem("messenger-token");
  config.headers["x-access-token"] = token;

  return config;
});

// USER THUNK CREATORS

// Authenticate and connect with socket if not already connected
const socketAuthAndConnect = (token) => {
  token = token ?? localStorage.getItem("messenger-token");
  if (!socket.connected) {
    socket.auth = { token: token };
    socket.connect();
  }
}

export const fetchUser = () => async (dispatch) => {
  dispatch(setFetchingStatus(true));
  try {
    const { data } = await axios.get("/auth/user");
    dispatch(gotUser(data));
    if (data.id) {
      // If already logged in, make sure we are connected to web sockets
      // with our token.
      socketAuthAndConnect();
      socket.emit("go-online", data.id);
    }
  } catch (error) {
    console.error(error);
  } finally {
    dispatch(setFetchingStatus(false));
  }
};

export const register = (credentials) => async (dispatch) => {
  try {
    const { data } = await axios.post("/auth/register", credentials);
    localStorage.setItem("messenger-token", data.token);
    dispatch(gotUser(data));
    socketAuthAndConnect(data.token);
    socket.emit("go-online", data.id);
  } catch (error) {
    console.error(error);
    dispatch(gotUser({ error: error.response.data.error || "Server Error" }));
  }
};

export const login = (credentials) => async (dispatch) => {
  try {
    const { data } = await axios.post("/auth/login", credentials);
    localStorage.setItem("messenger-token", data.token);
    dispatch(gotUser(data));
    socketAuthAndConnect(data.token);
    socket.emit("go-online", data.id);
  } catch (error) {
    console.error(error);
    dispatch(gotUser({ error: error.response.data.error || "Server Error" }));
  }
};

export const logout = (id) => async (dispatch) => {
  try {
    await axios.delete("/auth/logout");
    await localStorage.removeItem("messenger-token");
    dispatch(gotUser({}));
    socket.emit("logout", id);
  } catch (error) {
    console.error(error);
  }
};

// CONVERSATIONS THUNK CREATORS

export const fetchConversations = () => async (dispatch) => {
  try {
    const { data } = await axios.get("/api/conversations");
    dispatch(gotConversations(data));
  } catch (error) {
    console.error(error);
  }
};

// Marks if our user has read a specific conversation.
// Updating the DB directly for permanent storage
export const markMessagesAsRead = (body) => async (dispatch) => {
  /* Request format
  {
    const reqBody = {
      conversation: conversationId,
      otherUser: otherUser
    };
  }*/
  await axios.patch("/api/messages", body); // Mark as read in DB
  dispatch(updateMessages(body.conversation, true)); // Mark messages as read for the conversation
  socket.emit("update-messages", body);
}

// Sets the new message in store and writes any necessary data like
// if the user is reading the message in the DB.
export const handleIncomingNewMessage = (data) => async(dispatch, getState) => {
    let isActiveConv = false;
    let state = getState();
    let otherUser;
    for (let conv of state.conversations) {
      // See if the message conversation is the active conversation
      // and always mark incoming messages as read in that case
      if (conv.id === data.message.conversationId
        && conv.otherUser.username === state.activeConversation) {
        isActiveConv = true;
        otherUser = conv.otherUser.id;
        break;
      }
    }
    // Set new message in data store
    dispatch(setNewMessage(data.message, data.sender));
    // Instantly Mark messages as read if its our active conversation
    if (isActiveConv) {
      dispatch(markMessagesAsRead({
        conversation: data.message.conversationId,
        otherUser: otherUser
      }));
    }
}

const saveMessage = async (body) => {
  const { data } = await axios.post("/api/messages", body);
  return data;
};

const sendMessage = (data, body) => {
  socket.emit("new-message", {
    message: data.message,
    recipientId: body.recipientId,
    sender: data.sender,
  });
};

// message format to send: {recipientId, text, conversationId}
// conversationId will be set to null if its a brand new conversation
export const postMessage = (body) => async(dispatch) => {
  try {
    const data = await saveMessage(body);

    if (!body.conversationId) {
      dispatch(addConversation(body.recipientId, data.message));
    } else {
      dispatch(setNewMessage(data.message));
    }

    sendMessage(data, body);
  } catch (error) {
    console.error(error);
  }
};

export const searchUsers = (searchTerm) => async (dispatch) => {
  try {
    const { data } = await axios.get(`/api/users/${searchTerm}`);
    dispatch(setSearchedUsers(data));
  } catch (error) {
    console.error(error);
  }
};
