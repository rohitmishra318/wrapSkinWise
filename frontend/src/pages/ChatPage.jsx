import React, {useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext';
import Chat from '../components/Chat';
import { MessageSquare, User } from 'lucide-react';

const InboxPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) {
        setLoading(false);
        return;
      };
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/chats', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (res.ok) {
            const data = await res.json();
            setConversations(data);
        } else {
            console.error("Failed to fetch conversations");
            setConversations([]);
        }
      } catch (error) {
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [user]);

  const handleSelectConversation = (convo) => {
    setSelectedConversation({
      propertyId: convo.property._id,
      ownerId: convo.otherUser._id,
      ownerUsername: convo.otherUser.username,
    });
  };

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500 dark:text-gray-400 text-lg">
        Loading conversations...
      </div>
    );

  return (
    // The main background is handled by index.css
    <div className="flex h-[calc(100vh-80px)]">
      {/* Sidebar */}
      <div className="w-1/3 border-r dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md flex flex-col">
        <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 p-5 border-b dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <MessageSquare className="text-blue-500" size={22} />
            Inbox
          </h2>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-4">
          {conversations.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center mt-10">No conversations yet.</p>
          ) : (
            <ul className="space-y-3">
              {conversations.map((convo) => (
                <li
                  key={convo.property._id + convo.otherUser._id}
                  onClick={() => handleSelectConversation(convo)}
                  className={`cursor-pointer p-4 rounded-xl border dark:border-gray-700 transition-all duration-300 shadow-sm
                    ${
                      selectedConversation &&
                      selectedConversation.propertyId === convo.property._id &&
                      selectedConversation.ownerId === convo.otherUser._id
                        ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-400 dark:border-blue-500'
                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 hover:border-blue-200 dark:hover:border-blue-600'
                    }`}
                >
                  <div className="font-semibold text-gray-800 dark:text-white truncate">
                    {convo.property.title}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-gray-600 dark:text-gray-300 text-sm">
                    <User size={16} />
                    With: <span className="font-medium">{convo.otherUser.username}</span>
                  </div>
                   <p className="text-xs text-gray-500 dark:text-gray-400 truncate italic mt-2">
                    "{convo.lastMessage}"
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Chat Section */}
      <div className="w-2/3 flex flex-col">
        {selectedConversation ? (
          <div className="flex-1 p-4">
            <Chat
              key={selectedConversation.propertyId + selectedConversation.ownerId}
              propertyId={selectedConversation.propertyId}
              ownerId={selectedConversation.ownerId}
              ownerUsername={selectedConversation.ownerUsername}
              isEmbedded={true}
              onClose={() => setSelectedConversation(null)}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400 text-lg">
            Select a conversation to start chatting.
          </div>
        )}
      </div>
    </div>
  );
};

export default InboxPage;
