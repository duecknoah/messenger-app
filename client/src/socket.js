import io from "socket.io-client";
import store from "./store";
import {
  removeOfflineUser,
  addOnlineUser,
  updateMessages
} from "./store/conversations";
import { handleIncomingNewMessage } from "./store/utils/thunkCreators";

// autoConnect false as we want to only connect when we have our
// token
const socket = io(window.location.origin, { autoConnect: false });

socket.on("connect", () => {
  console.log("connected to server");

  socket.on("add-online-user", (id) => {
    store.dispatch(addOnlineUser(id));
  });
  socket.on("remove-offline-user", (id) => {
    store.dispatch(removeOfflineUser(id));
  });
  socket.on("new-message", (data) => {
    store.dispatch(handleIncomingNewMessage(data));
  });
  socket.on("update-messages", (data) => {
    store.dispatch(updateMessages(data.conversation, false));
  });
});

export default socket;
