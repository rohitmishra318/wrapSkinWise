// frontend/src/components/Chat.jsx
// This component now supports dark mode and uses a shared socket instance.

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Send, X } from 'lucide-react';
import socket from '../../socket'; // Use the shared socket instance

const Chat = ({ propertyId, ownerId, ownerUsername, onClose, isEmbedded = false }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!propertyId || !ownerId || !user) return;

    socket.emit('joinPrivateChat', { userId1: user.id, userId2: ownerId });

    const fetchMessageHistory = async () => {
      try {
        // Pass user IDs to the backend for secure, server-side filtering
        const res = await fetch(`http://localhost:5000/api/messages/${propertyId}?userId1=${user.id}&userId2=${ownerId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        } else {
          console.error("Failed to fetch message history");
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    
    fetchMessageHistory();

    const messageListener = (message) => {
      setMessages((prev) => [...prev, message]);
    };
    socket.on('receiveMessage', messageListener);

    return () => {
      socket.off('receiveMessage', messageListener);
    };
  }, [propertyId, ownerId, user]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && user) {
      const messageData = {
        propertyId,
        sender: user.id,
        recipient: ownerId,
        senderUsername: user.username,
        text: newMessage,
      };
      socket.emit('sendPrivateMessage', messageData);
      setNewMessage('');
    }
  };

  const containerClass = isEmbedded
    ? "relative w-full h-full bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col"
    : "fixed bottom-4 right-4 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col z-50";

  return (
    <div className={containerClass}>
      <div className="flex justify-between items-center p-4 bg-blue-500 text-white rounded-t-lg">
        <h3 className="font-bold">Chat with {ownerUsername}</h3>
        {!isEmbedded && (
          <button onClick={onClose} className="hover:bg-blue-600 p-1 rounded-full">
            <X size={20} />
          </button>
        )}
      </div>

      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`flex mb-3 ${msg.sender === user.id ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`rounded-lg p-3 max-w-[80%] break-words ${msg.sender === user.id ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
              <p className="font-bold text-sm mb-1">{msg.senderUsername}</p>
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t dark:border-gray-700 flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-l-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-r-full hover:bg-blue-600 flex items-center">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default Chat;
