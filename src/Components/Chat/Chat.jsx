import React, { useEffect, useState } from "react";
import queryString from "query-string";
import socketIO from "socket.io-client";
import InfoBar from "../InfoBar/InfoBar";
import Input from "../Input/Input";
import Messages from "../Messages/Messages";
import TextContainer from "../TextContainer/TextContainer";
import "./Chat.css";

let ENDPOINT = `https://kchat-backend-xhif.onrender.com`;
let socket = socketIO(ENDPOINT, { transports: ["websocket"] });
const Chat = () => {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const { name, room } = queryString.parse(window.location.search);
    socket.on("connect", () => {
      console.log("connected");
    });
    setName(name);
    setRoom(room);
    socket.emit("join", { name, room }, (error) => {
      if (error) {
        alert(error);
      }
    });

    return () => {
      socket.emit("disconnected");
      socket.off();
    };
  }, [ENDPOINT, window.location.search]);

  //receiving messages from backend
  useEffect(() => {
    socket.on("message", (message) => {
      setMessages((prev) => {
        return [...prev, message];
      });
      socket.on("roomData", ({ users }) => {
        setUsers(users);
      });
    });
  }, []);

  //function for sending messages
  function sendMessage(e) {
    e.preventDefault();

    if (message) {
      socket.emit("sendMessage", message, () => {
        setMessage("");
      });
    }
  }

  return (
    <div className="outerContainer">
      <div className="container">
        <InfoBar room={room} />
        <Messages messages={messages} name={name} />
        <Input
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
        />
      </div>
      <TextContainer users={users} />
    </div>
  );
};

export default Chat;
