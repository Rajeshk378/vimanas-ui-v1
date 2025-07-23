import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Avatar,
  Divider,
  Alert,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarIcon,
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
  VideoCall as VideoCallIcon,
} from '@mui/icons-material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import vimanasApi from '../services/vimanasApi';

const InterviewScheduler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs().add(1, 'day'));
  const [selectedTime, setSelectedTime] = useState(dayjs().hour(10).minute(0));
  const [duration, setDuration] = useState(60);
  const [interviewType, setInterviewType] = useState('comprehensive');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [candidateInfo, setCandidateInfo] = useState(null);
  const [jobRequirement, setJobRequirement] = useState(null);
  const [interviewConfig, setInterviewConfig] = useState({
    includesCodingTest: false,
    includesOfferNegotiation: false,
    skillFocusAreas: [],
    difficultyLevel: 'medium',
  });

  useEffect(() => {
    // Get candidate info from navigation state
    if (location.state) {
      setCandidateInfo(location.state.candidateInfo);
      setJobRequirement(location.state.jobRequirement);
    }
    
    loadAvailableSlots();
  }, [location.state, selectedDate]);

  const loadAvailableSlots = async () => {
    try {
      const response = await vimanasApi.getInterviewSlots(selectedDate.format('YYYY-MM-DD'));
      setAvailableSlots(response.data);
    } catch (error) {
      console.error('Error loading available slots:', error);
      // Set mock data for demo
      setAvailableSlots([
        { time: '09:00', available: true },
        { time: '10:00', available: true },
        { time: '11:00', available: false },
        { time: '14:00', available: true },
        { time: '15:00', available: true },
        { time: '16:00', available: true },
      ]);
    }
  };

  const handleScheduleInterview = async () => {
    try {
      setLoading(true);
      
      const scheduleData = {
        candidateId: candidateInfo?.candidateId || 'demo_candidate',
        jobRequirementId: jobRequirement?.id,
        scheduledDateTime: selectedDate
          .hour(selectedTime.hour())
          .minute(selectedTime.minute())
          .toISOString(),
        duration,
        interviewType,
        config: interviewConfig,
        candidateEmail: candidateInfo?.email,
        candidateName: candidateInfo?.name,
      };

      const response = await vimanasApi.scheduleInterview(scheduleData);
      
      toast.success('Interview scheduled successfully!');
      
      // Navigate to interview room or dashboard
      navigate('/dashboard', {
        state: {
          scheduledInterview: {
            ...response.data,
            candidateInfo,
            jobRequirement,
          },
        },
      });
    } catch (error) {
      console.error('Error scheduling interview:', error);
      toast.error('Error scheduling interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (field, value) => {
    setInterviewConfig(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const interviewTypes = [
    {
      value: 'comprehensive',
      label: 'Comprehensive Interview',
      description: 'Full interview with multiple rounds and skill assessment',
      duration: 90,
    },
    {
      value: 'technical',
      label: 'Technical Interview',
      description: 'Focus on technical skills and coding abilities',
      duration: 60,
    },
    {
      value: 'behavioral',
      label: 'Behavioral Interview',
      description: 'Focus on soft skills and cultural fit',
      duration: 45,
    },
    {
      value: 'screening',
      label: 'Initial Screening',
      description: 'Quick assessment and basic qualification check',
      duration: 30,
    },
  ];

  const skillFocusOptions = [
    'Frontend Development',
    'Backend Development',
    'Database Design',
    'System Architecture',
    'Problem Solving',
    'Communication Skills',
    'Leadership',
    'Project Management',
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/dashboard')}
              sx={{ mr: 2 }}
            >
              Back to Dashboard
            </Button>
            <Typography variant="h4" component="h1">
              Schedule AI Interview
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {/* Candidate Information */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Candidate Information
                  </Typography>
                  {candidateInfo ? (
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        {candidateInfo.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {candidateInfo.email}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {candidateInfo.phone}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Experience:</strong> {candidateInfo.experience}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Current Role:</strong> {candidateInfo.currentRole}
                      </Typography>
                      
                      {jobRequirement && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Applying for: {jobRequirement.title}
                          </Typography>
                          <Box>
                            {jobRequirement.skills.map((skill, index) => (
                              <Chip 
                                key={index} 
                                label={skill} 
                                size="small" 
                                sx={{ mr: 1, mb: 1 }} 
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Alert severity="info">
                      No candidate information available. Please go back and upload a resume first.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Interview Configuration */}
            <Grid item xs={12} md={8}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Interview Configuration
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Interview Type</InputLabel>
                        <Select
                          value={interviewType}
                          onChange={(e) => {
                            setInterviewType(e.target.value);
                            const selectedType = interviewTypes.find(type => type.value === e.target.value);
                            if (selectedType) {
                              setDuration(selectedType.duration);
                            }
                          }}
                          label="Interview Type"
                        >
                          {interviewTypes.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                              <Box>
                                <Typography variant="subtitle1">{type.label}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {type.description}
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Difficulty Level</InputLabel>
                        <Select
                          value={interviewConfig.difficultyLevel}
                          onChange={(e) => handleConfigChange('difficultyLevel', e.target.value)}
                          label="Difficulty Level"
                        >
                          <MenuItem value="easy">Easy</MenuItem>
                          <MenuItem value="medium">Medium</MenuItem>
                          <MenuItem value="hard">Hard</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Duration (minutes)"
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value))}
                        InputProps={{ inputProps: { min: 15, max: 180 } }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Skill Focus Areas</InputLabel>
                        <Select
                          multiple
                          value={interviewConfig.skillFocusAreas}
                          onChange={(e) => handleConfigChange('skillFocusAreas', e.target.value)}
                          label="Skill Focus Areas"
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => (
                                <Chip key={value} label={value} size="small" />
                              ))}
                            </Box>
                          )}
                        >
                          {skillFocusOptions.map((skill) => (
                            <MenuItem key={skill} value={skill}>
                              {skill}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Date and Time Selection */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <CalendarIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Schedule Date & Time
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <DatePicker
                        label="Interview Date"
                        value={selectedDate}
                        onChange={setSelectedDate}
                        minDate={dayjs()}
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TimePicker
                        label="Interview Time"
                        value={selectedTime}
                        onChange={setSelectedTime}
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        Available Time Slots for {selectedDate.format('MMMM D, YYYY')}:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {availableSlots.map((slot) => (
                          <Chip
                            key={slot.time}
                            label={slot.time}
                            color={slot.available ? 'primary' : 'default'}
                            variant={slot.available ? 'outlined' : 'filled'}
                            onClick={() => {
                              if (slot.available) {
                                const [hour, minute] = slot.time.split(':');
                                setSelectedTime(dayjs().hour(parseInt(hour)).minute(parseInt(minute)));
                              }
                            }}
                            sx={{ 
                              cursor: slot.available ? 'pointer' : 'not-allowed',
                              opacity: slot.available ? 1 : 0.5,
                            }}
                          />
                        ))}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* Interview Summary */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Interview Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>Type:</strong> {interviewTypes.find(type => type.value === interviewType)?.label}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Duration:</strong> {duration} minutes
                  </Typography>
                  <Typography variant="body2">
                    <strong>Difficulty:</strong> {interviewConfig.difficultyLevel}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>Date:</strong> {selectedDate.format('MMMM D, YYYY')}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Time:</strong> {selectedTime.format('h:mm A')}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Focus Areas:</strong> {interviewConfig.skillFocusAreas.length || 'General'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/upload-resume')}
            >
              Back to Resume Upload
            </Button>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<VideoCallIcon />}
                onClick={() => navigate('/interview-room/new')}
              >
                Start Interview Now
              </Button>
              
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                onClick={handleScheduleInterview}
                disabled={loading || !candidateInfo}
              >
                {loading ? 'Scheduling...' : 'Schedule Interview'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
};

export default InterviewScheduler;