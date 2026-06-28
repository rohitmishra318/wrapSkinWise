const { analysisQueue } = require('../config/bull');
const { getIo } = require('../services/socketService');
const { downloadS3ToBuffer, uploadBufferToS3 } = require('../services/s3Service');
const { getWeather } = require('../services/weatherService');
const AnalysisJob = require('../models/AnalysisJob');
const SkinAnalysis = require('../models/SkinAnalysis');
const axios = require('axios');
const FormData = require('form-data');
const logger = require('../config/logger');

analysisQueue.process(async (job) => {
  const { jobId, uid, imageS3Key, city, requestId } = job.data;
  const io = getIo();
  const logContext = { jobId, uid, requestId };

  try {
    // Step 1: Update job status
    await AnalysisJob.findOneAndUpdate({ jobId }, { status: 'sr_processing' });
    io.to(`job:${jobId}`).emit('job:status', { jobId, status: 'sr_processing', progress: 10 });

    // Step 2: Download image from S3
    const imageBuffer = await downloadS3ToBuffer(imageS3Key);

    // Step 3: POST image to sr_service
    const srFormData = new FormData();
    srFormData.append('image', imageBuffer, { filename: 'upload.jpg' });
    if (requestId) srFormData.append('requestId', requestId);

    let srResultData;
    try {
      const srUrl = process.env.SR_SERVICE_URL || 'http://localhost:7001';
      const srResponse = await axios.post(`${srUrl}/enhance`, srFormData, {
        headers: srFormData.getHeaders()
      });
      srResultData = srResponse.data;
    } catch (err) {
      if (err.response && err.response.status === 422) {
        await AnalysisJob.findOneAndUpdate({ jobId }, { status: 'failed', errorMessage: 'QUALITY_GATE_FAILED' });
        io.to(`job:${jobId}`).emit('job:failed', { jobId, error: 'QUALITY_GATE_FAILED' });
        return;
      }
      throw err;
    }

    // Step 4: SR Applied handling
    let finalImageBuffer = imageBuffer;
    let enhancedImageKey = null;
    if (srResultData.srApplied) {
      finalImageBuffer = Buffer.from(srResultData.imageBase64, 'base64');
      enhancedImageKey = `analyses/${uid}/${Date.now()}_enhanced.jpg`;
      await uploadBufferToS3(enhancedImageKey, finalImageBuffer, 'image/jpeg');
    }

    await AnalysisJob.findOneAndUpdate({ jobId }, { status: 'analyzing' });
    io.to(`job:${jobId}`).emit('job:status', { jobId, status: 'analyzing', progress: 40 });

    // Step 5: Fetch weather
    const weatherData = await getWeather(city);

    // Step 6: POST to python_service
    const mlFormData = new FormData();
    mlFormData.append('image', finalImageBuffer, { filename: 'analyze.jpg' });
    if (requestId) mlFormData.append('requestId', requestId);
    
    // Pass metadata
    const metadata = {
      contextHumidity: weatherData ? weatherData.humidity : null,
      contextUV: weatherData ? weatherData.uvIndex : null,
      contextAQI: weatherData ? weatherData.aqi : null
    };
    mlFormData.append('metadata', JSON.stringify(metadata));

    io.to(`job:${jobId}`).emit('job:status', { jobId, status: 'analyzing', progress: 70 });

    const pythonUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:7000';
    const mlResponse = await axios.post(`${pythonUrl}/analyze-image`, mlFormData, {
      headers: mlFormData.getHeaders()
    });

    const analysisResult = mlResponse.data;

    // Annotated image upload
    const annotatedBuffer = Buffer.from(analysisResult.annotatedImageBase64, 'base64');
    const annotatedImageKey = `analyses/${uid}/${Date.now()}_annotated.png`;
    await uploadBufferToS3(annotatedImageKey, annotatedBuffer, 'image/png');

    // Step 8: Save SkinAnalysis
    const newAnalysis = new SkinAnalysis({
      user: uid,
      imageMetadata: {
        originalResolution: srResultData.originalSize,
        srApplied: srResultData.srApplied,
        srModel: srResultData.srModel,
        originalImageKey: imageS3Key,
        enhancedImageKey,
        analysisImageKey: srResultData.srApplied ? enhancedImageKey : imageS3Key,
        annotatedImageKey,
        qualityFlags: srResultData.qualityResult.flags,
        qualityScore: srResultData.qualityResult.qualityScore
      },
      raw: analysisResult.raw,
      severity: analysisResult.severity,
      zonalSeverity: analysisResult.zonalSeverity,
      overallScore: analysisResult.overallScore,
      igaGrade: analysisResult.igaGrade,
      fitzpatrickAtAnalysis: analysisResult.fitzpatrickEstimate,
      modelVersion: analysisResult.modelVersion,
      contextAtAnalysis: weatherData ? {
        humidity: weatherData.humidity,
        uvIndex: weatherData.uvIndex,
        aqi: weatherData.aqi,
        temperature: weatherData.temperature
      } : {}
    });

    await newAnalysis.save();

    // Step 9: Update analysis_jobs
    await AnalysisJob.findOneAndUpdate({ jobId }, { 
      status: 'complete', 
      resultAnalysisId: newAnalysis._id,
      completedAt: new Date()
    });

    // Step 10: Emit complete
    io.to(`job:${jobId}`).emit('job:complete', { 
      jobId, 
      analysisId: newAnalysis._id, 
      overallScore: newAnalysis.overallScore,
      delta: newAnalysis.delta
    });

  } catch (error) {
    logger.error('Job failed', { ...logContext, error: error.message, stack: error.stack });
    await AnalysisJob.findOneAndUpdate({ jobId }, { status: 'failed', errorMessage: error.message });
    io.to(`job:${jobId}`).emit('job:failed', { jobId, error: error.message });
  }
});
