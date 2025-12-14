const Message = require('../models/Message');

exports.getMessagesForProperty = async (req, res) => {
  try {
    // Get the two user IDs from the URL's query string
    const { userId1, userId2 } = req.query;
    const { propertyId } = req.params;

    const messages = await Message.find({
      propertyId: propertyId,
      // Find messages where the sender/recipient pair matches in either direction
      $or: [
        { sender: userId1, recipient: userId2 },
        { sender: userId2, recipient: userId1 },
      ]
    }).sort({ createdAt: 'asc' }); // Get messages in chronological order

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages' });
  }
};