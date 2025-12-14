const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  senderUsername: { // Denormalize for easier display
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },



}, { timestamps: true }); // Automatically adds createdAt and updatedAt

module.exports = mongoose.model('Message', messageSchema);