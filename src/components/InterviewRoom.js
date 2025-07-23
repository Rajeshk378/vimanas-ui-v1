import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton,
  Avatar,
} from '@mui/material';
import {
  VideoCall as VideoCallIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  Stop as StopIcon,
  Code as CodeIcon,
  Psychology as PsychologyIcon,
  AccessTime as AccessTimeIcon,
  Send as SendIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import vimanasApi from '../services/vimanasApi';

const InterviewRoom = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  
  // Video and Audio refs
  const localVideoRef = useRef(null);
  const aiAvatarRef = useRef(null);
  const questionAudioRef = useRef(null);
  const responseAudioRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  
  // Interview state
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('introduction'); // introduction, technical, behavioral, coding, negotiation, closing
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [totalDuration, setTotalDuration] = useState(3600); // 60 minutes default
  const [currentSkill, setCurrentSkill] = useState('general');
  const [skillTransitionTime, setSkillTransitionTime] = useState(600); // 10 minutes per skill
  
  // Audio/Video controls
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isListening, setIsListening] = useState(false);
  
  // Interview content
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [interviewTranscript, setInterviewTranscript] = useState([]);
  const [aiResponse, setAiResponse] = useState('');
  
  // Coding test
  const [showCodingTest, setShowCodingTest] = useState(false);
  const [codingProblem, setCodingProblem] = useState('');
  const [candidateCode, setCandidateCode] = useState('');
  
  // Offer negotiation
  const [showOfferNegotiation, setShowOfferNegotiation] = useState(false);
  const [offerDetails, setOfferDetails] = useState(null);
  const [negotiationMessage, setNegotiationMessage] = useState('');
  
  // Interview session data
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initializeInterview();
    return () => {
      cleanup();
    };
  }, [interviewId]);

  useEffect(() => {
    let interval;
    if (interviewStarted && !interviewEnded) {
      interval = setInterval(() => {
        setTimeElapsed(prev => {
          const newTime = prev + 1;
          
          // Check for skill transition
          if (newTime % skillTransitionTime === 0 && newTime < totalDuration) {
            transitionToNextSkill(newTime);
          }
          
          // Check for phase transitions
          checkPhaseTransition(newTime);
          
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [interviewStarted, interviewEnded, skillTransitionTime, totalDuration]);

  const initializeInterview = async () => {
    try {
      setLoading(true);
      
      // Initialize media devices
      await initializeMediaDevices();
      
      // Initialize speech recognition
      initializeSpeechRecognition();
      
      // Load interview session data
      if (interviewId !== 'new') {
        const response = await vimanasApi.getInterviewSession(interviewId);
        setSessionData(response.data);
        setTotalDuration(response.data.duration * 60);
      }
      
      toast.success('Interview room initialized successfully!');
    } catch (error) {
      console.error('Error initializing interview:', error);
      toast.error('Error initializing interview room');
    } finally {
      setLoading(false);
    }
  };

  const initializeMediaDevices = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      
      mediaStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast.error('Camera/microphone access denied');
    }
  };

  const initializeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setCandidateAnswer(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    speechRecognitionRef.current = recognition;
  };

  const startInterview = async () => {
    try {
      setLoading(true);
      
      const response = await vimanasApi.startInterview(interviewId || 'new', 'demo_candidate');
      setSessionData(response.data);
      
      setInterviewStarted(true);
      setCurrentPhase('introduction');
      
      // Get first question
      await getNextQuestion();
      
      toast.success('Interview started!');
    } catch (error) {
      console.error('Error starting interview:', error);
      toast.error('Error starting interview');
    } finally {
      setLoading(false);
    }
  };

  const getNextQuestion = async () => {
    try {
      const timeSlot = Math.floor(timeElapsed / skillTransitionTime);
      const response = await vimanasApi.getQuestionForTimeSlot(
        interviewId || 'demo',
        timeSlot,
        currentSkill
      );

      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (questionAudioRef.current) {
        questionAudioRef.current.src = audioUrl;
        questionAudioRef.current.onended = () => {
          startListening();
        };
        questionAudioRef.current.play();
      }

      // Extract question text (this would come from API headers or separate endpoint)
      setCurrentQuestion('Please tell me about your experience with the technologies mentioned in your resume.');
      
    } catch (error) {
      console.error('Error getting next question:', error);
      // Fallback for demo
      setCurrentQuestion('Please tell me about your experience with the technologies mentioned in your resume.');
      startListening();
    }
  };

  const startListening = () => {
    if (speechRecognitionRef.current) {
      setIsListening(true);
      setCandidateAnswer('');
      speechRecognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const submitAnswer = async () => {
    if (!candidateAnswer.trim()) return;

    try {
      stopListening();
      
      const answerData = {
        question: currentQuestion,
        answer: candidateAnswer,
        timestamp: timeElapsed,
        phase: currentPhase,
        skill: currentSkill,
      };

      const response = await vimanasApi.submitAnswer(interviewId || 'demo', answerData);
      
      // Play AI response
      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (responseAudioRef.current) {
        responseAudioRef.current.src = audioUrl;
        responseAudioRef.current.onended = () => {
          // Get next question after AI response
          setTimeout(getNextQuestion, 1000);
        };
        responseAudioRef.current.play();
      }

      // Add to transcript
      setInterviewTranscript(prev => [
        ...prev,
        { type: 'question', content: currentQuestion, timestamp: timeElapsed },
        { type: 'answer', content: candidateAnswer, timestamp: timeElapsed },
      ]);

      setCandidateAnswer('');
      
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error('Error processing your answer');
    }
  };

  const transitionToNextSkill = async (currentTime) => {
    try {
      const response = await vimanasApi.getNextSkillForTimeSlot(interviewId || 'demo', currentTime);
      const nextSkill = response.data.nextSkill;
      
      if (nextSkill && nextSkill !== currentSkill) {
        setCurrentSkill(nextSkill);
        toast.info(`Transitioning to ${nextSkill} questions`);
      }
    } catch (error) {
      console.error('Error transitioning skills:', error);
    }
  };

  const checkPhaseTransition = (currentTime) => {
    const progress = currentTime / totalDuration;
    
    if (progress > 0.8 && currentPhase !== 'closing') {
      setCurrentPhase('closing');
    } else if (progress > 0.6 && currentPhase !== 'negotiation' && sessionData?.includesOfferNegotiation) {
      setCurrentPhase('negotiation');
      initiateOfferNegotiation();
    } else if (progress > 0.4 && currentPhase !== 'coding' && sessionData?.includesCodingTest) {
      setCurrentPhase('coding');
      initiateCodingTest();
    } else if (progress > 0.3 && currentPhase !== 'behavioral') {
      setCurrentPhase('behavioral');
    } else if (progress > 0.1 && currentPhase !== 'technical') {
      setCurrentPhase('technical');
    }
  };

  const initiateCodingTest = async () => {
    try {
      const response = await vimanasApi.initiateCodingTest(interviewId || 'demo', 'algorithm');
      setCodingProblem(response.data.problem);
      setShowCodingTest(true);
      toast.info('Coding test initiated!');
    } catch (error) {
      console.error('Error initiating coding test:', error);
      // Fallback for demo
      setCodingProblem('Write a function to find the maximum element in an array.');
      setShowCodingTest(true);
    }
  };

  const submitCode = async () => {
    try {
      const codeData = {
        problem: codingProblem,
        solution: candidateCode,
        language: 'javascript',
        timestamp: timeElapsed,
      };

      await vimanasApi.submitCode(interviewId || 'demo', codeData);
      setShowCodingTest(false);
      toast.success('Code submitted successfully!');
      
      // Continue with interview
      setTimeout(getNextQuestion, 2000);
    } catch (error) {
      console.error('Error submitting code:', error);
      toast.error('Error submitting code');
    }
  };

  const initiateOfferNegotiation = async () => {
    try {
      const response = await vimanasApi.getOfferDetails(interviewId || 'demo');
      setOfferDetails(response.data);
      setShowOfferNegotiation(true);
      toast.info('Offer negotiation phase started!');
    } catch (error) {
      console.error('Error getting offer details:', error);
      // Fallback for demo
      setOfferDetails({
        position: 'Software Developer',
        salary: '$80,000',
        benefits: ['Health Insurance', 'Dental', '401k'],
        startDate: '2024-03-01',
      });
      setShowOfferNegotiation(true);
    }
  };

  const submitNegotiation = async () => {
    try {
      const response = await vimanasApi.negotiateOffer(interviewId || 'demo', {
        message: negotiationMessage,
        timestamp: timeElapsed,
      });

      // Play AI response
      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (responseAudioRef.current) {
        responseAudioRef.current.src = audioUrl;
        responseAudioRef.current.play();
      }

      setNegotiationMessage('');
      toast.success('Negotiation message sent!');
    } catch (error) {
      console.error('Error submitting negotiation:', error);
      toast.error('Error processing negotiation');
    }
  };

  const endInterview = async () => {
    try {
      setLoading(true);
      
      const endData = {
        transcript: interviewTranscript,
        duration: timeElapsed,
        phase: currentPhase,
        completedPhases: [currentPhase],
      };

      await vimanasApi.endInterview(interviewId || 'demo', endData);
      
      setInterviewEnded(true);
      toast.success('Interview completed successfully!');
      
      // Generate and send feedback
      setTimeout(async () => {
        try {
          await vimanasApi.generateFeedback(interviewId || 'demo');
          await vimanasApi.sendFollowUpEmail(interviewId || 'demo', 'feedback');
          toast.success('Feedback email sent to candidate!');
        } catch (error) {
          console.error('Error sending feedback:', error);
        }
      }, 2000);
      
    } catch (error) {
      console.error('Error ending interview:', error);
      toast.error('Error ending interview');
    } finally {
      setLoading(false);
    }
  };

  const toggleMute = () => {
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = isMuted;
        setIsMuted(!isMuted);
      }
    }
  };

  const toggleVideo = () => {
    if (mediaStreamRef.current) {
      const videoTrack = mediaStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoOn;
        setIsVideoOn(!isVideoOn);
      }
    }
  };

  const cleanup = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseColor = (phase) => {
    const colors = {
      introduction: '#4caf50',
      technical: '#2196f3',
      behavioral: '#ff9800',
      coding: '#9c27b0',
      negotiation: '#f44336',
      closing: '#607d8b',
    };
    return colors[phase] || '#757575';
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ textAlign: 'center' }}>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography>Initializing interview room...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1">
            AI Interview Room
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label={currentPhase}
              sx={{ bgcolor: getPhaseColor(currentPhase), color: 'white' }}
            />
            <Typography variant="h6">
              {formatTime(timeElapsed)} / {formatTime(totalDuration)}
            </Typography>
          </Box>
        </Box>

        {/* Progress Bar */}
        <Box sx={{ mb: 3 }}>
          <LinearProgress
            variant="determinate"
            value={(timeElapsed / totalDuration) * 100}
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Current Skill Focus: {currentSkill}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Video Section */}
          <Grid item xs={12} md={8}>
            <Card sx={{ height: '500px' }}>
              <CardContent sx={{ height: '100%', p: 2 }}>
                <Grid container spacing={2} sx={{ height: '100%' }}>
                  {/* AI Avatar */}
                  <Grid item xs={6} sx={{ height: '100%' }}>
                    <Box sx={{ position: 'relative', height: '100%', bgcolor: '#f5f5f5', borderRadius: 1 }}>
                      <Avatar
                        sx={{
                          width: 100,
                          height: 100,
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          bgcolor: 'primary.main',
                          fontSize: '2rem',
                        }}
                      >
                        AI
                      </Avatar>
                      <Typography
                        variant="caption"
                        sx={{
                          position: 'absolute',
                          bottom: 8,
                          left: 8,
                          bgcolor: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          px: 1,
                          borderRadius: 1,
                        }}
                      >
                        AI Interviewer
                      </Typography>
                    </Box>
                  </Grid>
                  
                  {/* Candidate Video */}
                  <Grid item xs={6} sx={{ height: '100%' }}>
                    <Box sx={{ position: 'relative', height: '100%' }}>
                      <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '4px',
                          backgroundColor: '#000',
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          position: 'absolute',
                          bottom: 8,
                          left: 8,
                          bgcolor: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          px: 1,
                          borderRadius: 1,
                        }}
                      >
                        You
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Controls */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
              <IconButton
                onClick={toggleMute}
                color={isMuted ? 'error' : 'primary'}
                size="large"
              >
                {isMuted ? <MicOffIcon /> : <MicIcon />}
              </IconButton>
              
              <IconButton
                onClick={toggleVideo}
                color={!isVideoOn ? 'error' : 'primary'}
                size="large"
              >
                {!isVideoOn ? <VideocamOffIcon /> : <VideocamIcon />}
              </IconButton>

              {!interviewStarted && !interviewEnded && (
                <Button
                  variant="contained"
                  startIcon={<VideoCallIcon />}
                  onClick={startInterview}
                  size="large"
                >
                  Start Interview
                </Button>
              )}

              {interviewStarted && !interviewEnded && (
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<StopIcon />}
                  onClick={endInterview}
                  size="large"
                >
                  End Interview
                </Button>
              )}
            </Box>
          </Grid>

          {/* Interview Panel */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1, overflow: 'auto' }}>
                <Typography variant="h6" gutterBottom>
                  Interview Progress
                </Typography>

                {/* Current Question */}
                {currentQuestion && (
                  <Box sx={{ mb: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="primary.contrastText">
                      Current Question:
                    </Typography>
                    <Typography variant="body2" color="primary.contrastText">
                      {currentQuestion}
                    </Typography>
                  </Box>
                )}

                {/* Answer Input */}
                {interviewStarted && !interviewEnded && (
                  <Box sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Your Answer (or speak directly)"
                      value={candidateAnswer}
                      onChange={(e) => setCandidateAnswer(e.target.value)}
                      disabled={isListening}
                    />
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Button
                        size="small"
                        variant={isListening ? 'contained' : 'outlined'}
                        color={isListening ? 'error' : 'primary'}
                        onClick={isListening ? stopListening : startListening}
                      >
                        {isListening ? 'Stop' : 'Speak'}
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={submitAnswer}
                        disabled={!candidateAnswer.trim()}
                      >
                        Submit
                      </Button>
                    </Box>
                  </Box>
                )}

                {/* Interview Transcript */}
                <Box sx={{ maxHeight: '200px', overflow: 'auto' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Transcript:
                  </Typography>
                  {interviewTranscript.map((entry, index) => (
                    <Box key={index} sx={{ mb: 1, fontSize: '0.875rem' }}>
                      <Typography
                        variant="caption"
                        color={entry.type === 'question' ? 'primary' : 'text.secondary'}
                        sx={{ fontWeight: 'bold' }}
                      >
                        {entry.type === 'question' ? '🤖 AI: ' : '👤 You: '}
                      </Typography>
                      <Typography variant="caption" display="block">
                        {entry.content}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Hidden Audio Elements */}
        <audio ref={questionAudioRef} style={{ display: 'none' }} />
        <audio ref={responseAudioRef} style={{ display: 'none' }} />

        {/* Coding Test Dialog */}
        <Dialog open={showCodingTest} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CodeIcon sx={{ mr: 1 }} />
              Coding Challenge
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              {codingProblem}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={10}
              label="Your Solution"
              value={candidateCode}
              onChange={(e) => setCandidateCode(e.target.value)}
              sx={{ mt: 2 }}
              placeholder="// Write your code here..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowCodingTest(false)}>Skip</Button>
            <Button variant="contained" onClick={submitCode}>
              Submit Code
            </Button>
          </DialogActions>
        </Dialog>

        {/* Offer Negotiation Dialog */}
        <Dialog open={showOfferNegotiation} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PsychologyIcon sx={{ mr: 1 }} />
              Offer Negotiation
            </Box>
          </DialogTitle>
          <DialogContent>
            {offerDetails && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Job Offer Details
                </Typography>
                <Typography><strong>Position:</strong> {offerDetails.position}</Typography>
                <Typography><strong>Salary:</strong> {offerDetails.salary}</Typography>
                <Typography><strong>Start Date:</strong> {offerDetails.startDate}</Typography>
                <Typography><strong>Benefits:</strong> {offerDetails.benefits?.join(', ')}</Typography>
              </Box>
            )}
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Your Response/Negotiation"
              value={negotiationMessage}
              onChange={(e) => setNegotiationMessage(e.target.value)}
              placeholder="Share your thoughts on the offer or any negotiation points..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowOfferNegotiation(false)}>Close</Button>
            <Button variant="contained" onClick={submitNegotiation} startIcon={<SendIcon />}>
              Send Response
            </Button>
          </DialogActions>
        </Dialog>

        {/* Interview Completed */}
        {interviewEnded && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h4" gutterBottom>
              🎉 Interview Completed!
            </Typography>
            <Typography variant="body1" gutterBottom>
              Thank you for participating in the AI interview. 
              Feedback will be sent to your email shortly.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/dashboard')}
              sx={{ mt: 2 }}
            >
              Return to Dashboard
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default InterviewRoom;