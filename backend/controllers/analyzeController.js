const { analysisQueue } = require('../config/bull');
const AnalysisJob = require('../models/AnalysisJob');
const SkinAnalysis = require('../models/SkinAnalysis');
const { uploadBufferToS3, getSignedS3Url } = require('../services/s3Service');
const { v4: uuidv4 } = require('uuid');

const analyzeImage = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'No image uploaded' } });
    }
    if (file.size > 15 * 1024 * 1024) {
      return res.status(400).json({ success: false, error: { code: 'FILE_TOO_LARGE', message: 'File must be under 15MB' } });
    }
    if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_FILE_TYPE', message: 'Only JPEG/PNG supported' } });
    }

    const city = req.body.city;
    const uid = req.user ? req.user.uid : 'anonymous'; // Expecting req.user.uid from authMiddleware
    const timestamp = Date.now();
    const imageS3Key = `analyses/${uid}/${timestamp}_original.jpg`;

    await uploadBufferToS3(imageS3Key, file.buffer, file.mimetype);

    const jobId = uuidv4();

    const jobDoc = new AnalysisJob({
      jobId,
      user: uid,
      status: 'queued',
      imageS3Key
    });
    await jobDoc.save();

    await analysisQueue.add({
      jobId,
      uid,
      imageS3Key,
      city,
      requestId: req.requestId
    });

    res.json({ success: true, data: { jobId, status: 'queued', message: 'Analysis started' } });

  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

const getJobStatus = async (req, res) => {
  try {
    const job = await AnalysisJob.findOne({ jobId: req.params.jobId });
    if (!job) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Job not found' } });
    
    res.json({ success: true, data: { jobId: job.jobId, status: job.status, resultAnalysisId: job.resultAnalysisId, errorMessage: job.errorMessage } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

const getAnalysisImage = async (req, res) => {
  try {
    const { id, type } = req.params;
    const analysis = await SkinAnalysis.findById(id);
    if (!analysis) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Analysis not found' } });
    
    let key;
    if (type === 'original') key = analysis.imageMetadata.originalImageKey;
    else if (type === 'enhanced') key = analysis.imageMetadata.enhancedImageKey;
    else if (type === 'annotated') key = analysis.imageMetadata.annotatedImageKey;
    else return res.status(400).json({ success: false, error: { code: 'INVALID_TYPE', message: 'Invalid image type' } });

    if (!key) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Image key not found' } });

    const url = await getSignedS3Url(key);
    res.redirect(url);
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

module.exports = {
  analyzeImage,
  getJobStatus,
  getAnalysisImage
};
