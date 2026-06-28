const mongoose = require('mongoose');
const User = require('../models/User');
const SkinAnalysis = require('../models/SkinAnalysis');
const DailyCheckin = require('../models/DailyCheckin');
const AnalysisJob = require('../models/AnalysisJob');
const { deleteS3Prefix } = require('./s3Service');
const admin = require('../config/firebaseAdmin');
const logger = require('../config/logger');

// As per Q2, we will delete the Firebase user as well
const deleteUserAccount = async (uid) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    logger.info(`Starting account deletion for uid: ${uid}`);

    // 1. Delete all related documents in Mongo
    await SkinAnalysis.deleteMany({ user: uid }, { session });
    await DailyCheckin.deleteMany({ user: uid }, { session });
    await AnalysisJob.deleteMany({ user: uid }, { session });
    
    // Note: If Routine, RoutineStreak, ProductReaction exist, they would be deleted here too
    
    // 2. Delete User document
    await User.deleteOne({ uid }, { session });

    // 3. Delete from Firebase Auth
    try {
      await admin.auth().deleteUser(uid);
    } catch (firebaseErr) {
      // If user doesn't exist in Firebase, we ignore and continue
      if (firebaseErr.code !== 'auth/user-not-found') {
        throw firebaseErr;
      }
    }

    await session.commitTransaction();
    session.endSession();

    // 4. Delete S3 artifacts (outside of Mongo transaction)
    // S3 might fail due to IAM policies, but deleteS3Prefix catches and logs it safely
    await deleteS3Prefix(`analyses/${uid}/`);

    logger.info(`Successfully deleted account for uid: ${uid}`);
    return true;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logger.error('Failed to delete user account', { uid, error: error.message });
    throw error;
  }
};

module.exports = {
  deleteUserAccount
};
