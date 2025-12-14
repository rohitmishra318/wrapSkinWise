const Message = require('../models/Message');
const mongoose = require('mongoose');

exports.getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id; 
    console.log('--- [Inbox] Fetching conversations for user ID:', userId, '---'); 
   
    const conversations = await Message.aggregate([
      
      {
        $match: {
          $or: [
            { sender: new mongoose.Types.ObjectId(userId) },
            { recipient: new mongoose.Types.ObjectId(userId) }
          ]
        }
      },
      
      { $sort: { createdAt: -1 } },
      
      {
        $group: {
          _id: {
            propertyId: "$propertyId",
            
            otherUser: {
              $cond: {
                if: { $eq: ["$sender", new mongoose.Types.ObjectId(userId)] },
                then: "$recipient",
                else: "$sender"
              }
            }
          },
          
          lastMessage: { $first: "$text" },
          lastMessageTimestamp: { $first: "$createdAt" },
          senderUsername: { $first: "$senderUsername" },
        }
      },
      
      {
        $lookup: {
          from: 'properties',
          localField: '_id.propertyId',
          foreignField: '_id',
          as: 'property'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id.otherUser',
          foreignField: '_id',
          as: 'otherUserDetails'
        }
      },
      
      {
        $project: {
          _id: 0,
          property: { $arrayElemAt: ["$property", 0] },
          otherUser: { $arrayElemAt: ["$otherUserDetails", 0] },
          lastMessage: 1,
          lastMessageTimestamp: 1,
        }
      },
      { $sort: { lastMessageTimestamp: -1 } }, 
    ]);
    console.log('--- [Inbox] Aggregation found:', conversations.length, 'conversations ---'); // <-- ADD THIS

    res.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Server Error" });
  }
};