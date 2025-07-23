import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_VIMANAS_API_URL || 'http://localhost:8000/api/v1';

class VimanasApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for auth tokens
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  // Resume Upload and Analysis
  async uploadResume(file, candidateInfo) {
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('candidate_info', JSON.stringify(candidateInfo));

    return this.client.post('/resume/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async analyzeResume(resumeId) {
    return this.client.post(`/resume/${resumeId}/analyze`);
  }

  // Job Requirements
  async getJobRequirements() {
    return this.client.get('/job-requirements');
  }

  async createJobRequirement(jobData) {
    return this.client.post('/job-requirements', jobData);
  }

  // Interview Scheduling
  async scheduleInterview(scheduleData) {
    return this.client.post('/interviews/schedule', scheduleData);
  }

  async getInterviewSlots(date) {
    return this.client.get(`/interviews/slots?date=${date}`);
  }

  async updateInterviewSchedule(interviewId, updateData) {
    return this.client.put(`/interviews/${interviewId}/schedule`, updateData);
  }

  // Interview Session Management
  async startInterview(interviewId, candidateId) {
    return this.client.post(`/interviews/${interviewId}/start`, {
      candidate_id: candidateId,
    });
  }

  async getInterviewSession(interviewId) {
    return this.client.get(`/interviews/${interviewId}/session`);
  }

  async endInterview(interviewId, sessionData) {
    return this.client.post(`/interviews/${interviewId}/end`, sessionData);
  }

  // Time-based Interview Questions (with skill transitions)
  async getQuestionForTimeSlot(interviewId, timeSlot, currentSkill) {
    return this.client.get(`/interviews/${interviewId}/question`, {
      params: {
        time_slot: timeSlot,
        current_skill: currentSkill,
      },
      responseType: 'blob', // For MP3 audio response
    });
  }

  async getNextSkillForTimeSlot(interviewId, currentTime) {
    return this.client.get(`/interviews/${interviewId}/next-skill`, {
      params: {
        current_time: currentTime,
      },
    });
  }

  // Answer Processing
  async submitAnswer(interviewId, answerData) {
    return this.client.post(`/interviews/${interviewId}/answer`, answerData, {
      responseType: 'blob', // For MP3 audio response
    });
  }

  // Coding Test Integration
  async initiateCodingTest(interviewId, testType) {
    return this.client.post(`/interviews/${interviewId}/coding-test`, {
      test_type: testType,
    });
  }

  async submitCode(interviewId, codeData) {
    return this.client.post(`/interviews/${interviewId}/code-submission`, codeData);
  }

  async getCodingTestResults(interviewId, submissionId) {
    return this.client.get(`/interviews/${interviewId}/coding-results/${submissionId}`);
  }

  // Offer Negotiation
  async getOfferDetails(interviewId) {
    return this.client.get(`/interviews/${interviewId}/offer`);
  }

  async negotiateOffer(interviewId, negotiationData) {
    return this.client.post(`/interviews/${interviewId}/negotiate`, negotiationData, {
      responseType: 'blob', // For MP3 audio response
    });
  }

  // Feedback and Email Services
  async generateFeedback(interviewId) {
    return this.client.post(`/interviews/${interviewId}/feedback`);
  }

  async sendFollowUpEmail(interviewId, emailType) {
    return this.client.post(`/interviews/${interviewId}/send-email`, {
      email_type: emailType, // 'follow_up', 'feedback', 'offer', 'rejection'
    });
  }

  async getFeedbackEmail(interviewId) {
    return this.client.get(`/interviews/${interviewId}/feedback-email`);
  }

  // Interview History and Analytics
  async getInterviewHistory(candidateId) {
    return this.client.get(`/candidates/${candidateId}/interviews`);
  }

  async getInterviewAnalytics(interviewId) {
    return this.client.get(`/interviews/${interviewId}/analytics`);
  }

  // Candidate Management
  async getCandidateProfile(candidateId) {
    return this.client.get(`/candidates/${candidateId}`);
  }

  async updateCandidateProfile(candidateId, profileData) {
    return this.client.put(`/candidates/${candidateId}`, profileData);
  }

  // Audio/Video Processing
  async uploadAudioChunk(interviewId, audioBlob, timestamp) {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('timestamp', timestamp);

    return this.client.post(`/interviews/${interviewId}/audio`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Real-time Interview Events
  async sendInterviewEvent(interviewId, eventType, eventData) {
    return this.client.post(`/interviews/${interviewId}/events`, {
      event_type: eventType,
      event_data: eventData,
      timestamp: Date.now(),
    });
  }

  // AI Avatar and Voice Configuration
  async getAIAvatarConfig(interviewId) {
    return this.client.get(`/interviews/${interviewId}/ai-config`);
  }

  async updateAIPersonality(interviewId, personalityConfig) {
    return this.client.put(`/interviews/${interviewId}/ai-personality`, personalityConfig);
  }
}

export default new VimanasApiService();