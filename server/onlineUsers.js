const onlineUsersToSocket = {}; // a map of userid->socketid
const socketToOnlineUsers = {}; // a map of socketid->userid

const setOnlineUser = (user, socket) => {
  onlineUsersToSocket[user] = socket;
  socketToOnlineUsers[socket] = user;
}

const getSocketFromOnlineUser = (user) => {
  return onlineUsersToSocket[user];
}

const getOnlineUserFromSocket = (socket) => {
  return socketToOnlineUsers[socket];
}

const deleteOnlineUser = (user) => {
  let socket = getSocketFromOnlineUser(user);
  delete onlineUsersToSocket[user];
  delete socketToOnlineUsers[socket];
}

module.exports = { setOnlineUser, getSocketFromOnlineUser, getOnlineUserFromSocket, deleteOnlineUser };
