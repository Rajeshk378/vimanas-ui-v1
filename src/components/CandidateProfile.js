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
  Avatar,
  Chip,
  LinearProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Assessment as AssessmentIcon,
  Schedule as ScheduleIcon,
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  VideoCall as VideoCallIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import vimanasApi from '../services/vimanasApi';

const CandidateProfile = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  
  const [candidate, setCandidate] = useState(null);
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState('');

  useEffect(() => {
    loadCandidateData();
  }, [candidateId]);

  const loadCandidateData = async () => {
    try {
      setLoading(true);
      
      // Load candidate profile and interview history
      const [profileResponse, historyResponse] = await Promise.all([
        vimanasApi.getCandidateProfile(candidateId),
        vimanasApi.getInterviewHistory(candidateId),
      ]);
      
      setCandidate(profileResponse.data);
      setInterviewHistory(historyResponse.data);
    } catch (error) {
      console.error('Error loading candidate data:', error);
      
      // Set mock data for demo
      setCandidate({
        id: candidateId,
        name: 'John Doe',
        email: 'john.doe@email.com',
        phone: '+1 (555) 123-4567',
        currentRole: 'Senior Frontend Developer',
        experience: '5 years',
        location: 'San Francisco, CA',
        expectedSalary: '$120,000',
        noticePeriod: '2 weeks',
        skills: [
          { name: 'React', level: 90 },
          { name: 'JavaScript', level: 95 },
          { name: 'TypeScript', level: 85 },
          { name: 'Node.js', level: 80 },
          { name: 'HTML/CSS', level: 90 },
          { name: 'MongoDB', level: 75 },
        ],
        education: [
          {
            degree: 'Bachelor of Computer Science',
            institution: 'University of California, Berkeley',
            year: '2019',
          },
        ],
        workExperience: [
          {
            company: 'Tech Startup Inc.',
            position: 'Senior Frontend Developer',
            duration: '2021 - Present',
            description: 'Led frontend development for multiple React applications',
          },
          {
            company: 'Web Solutions LLC',
            position: 'Frontend Developer',
            duration: '2019 - 2021',
            description: 'Developed responsive web applications using modern frameworks',
          },
        ],
        resumeUrl: '/path/to/resume.pdf',
        createdAt: '2024-01-10T10:00:00Z',
        overallScore: 87,
        totalInterviews: 3,
        completedInterviews: 2,
      });

      setInterviewHistory([
        {
          id: 1,
          position: 'Frontend Developer',
          company: 'TechCorp',
          scheduledAt: '2024-01-15T10:00:00Z',
          completedAt: '2024-01-15T11:30:00Z',
          status: 'completed',
          duration: 90,
          score: 85,
          phase: 'closing',
          interviewType: 'comprehensive',
          feedback: 'Strong technical skills, excellent problem-solving approach. Good communication skills and cultural fit.',
        },
        {
          id: 2,
          position: 'Senior Frontend Developer',
          company: 'StartupXYZ',
          scheduledAt: '2024-01-12T14:00:00Z',
          completedAt: '2024-01-12T15:15:00Z',
          status: 'completed',
          duration: 75,
          score: 92,
          phase: 'closing',
          interviewType: 'technical',
          feedback: 'Outstanding technical knowledge, innovative solutions to complex problems.',
        },
        {
          id: 3,
          position: 'Full Stack Developer',
          company: 'Enterprise Co',
          scheduledAt: '2024-01-20T09:00:00Z',
          completedAt: null,
          status: 'scheduled',
          duration: 0,
          score: null,
          phase: null,
          interviewType: 'comprehensive',
          feedback: null,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleInterview = () => {
    navigate('/schedule-interview', {
      state: {
        candidateInfo: {
          candidateId: candidate.id,
          name: candidate.name,
          email: candidate.email,
          phone: candidate.phone,
          experience: candidate.experience,
          currentRole: candidate.currentRole,
        },
      },
    });
  };

  const handleViewFeedback = (interview) => {
    setSelectedFeedback(interview.feedback || 'No feedback available for this interview.');
    setShowFeedbackDialog(true);
  };

  const handleDownloadResume = () => {
    // This would typically download the actual resume file
    toast.success('Resume download started!');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'scheduled':
        return 'primary';
      case 'in_progress':
        return 'warning';
      case 'incomplete':
        return 'error';
      default:
        return 'default';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ff9800';
    return '#f44336';
  };

  const getSkillLevelColor = (level) => {
    if (level >= 80) return 'success';
    if (level >= 60) return 'warning';
    return 'error';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ textAlign: 'center' }}>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography>Loading candidate profile...</Typography>
        </Box>
      </Container>
    );
  }

  if (!candidate) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error">
            Candidate not found
          </Typography>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/dashboard')}
            sx={{ mt: 2 }}
          >
            Back to Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/dashboard')}
              sx={{ mr: 2 }}
            >
              Back
            </Button>
            <Typography variant="h4" component="h1">
              Candidate Profile
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadResume}
            >
              Download Resume
            </Button>
            <Button
              variant="contained"
              startIcon={<ScheduleIcon />}
              onClick={handleScheduleInterview}
            >
              Schedule Interview
            </Button>
          </Box>
        </Box>

        <Grid container spacing={4}>
          {/* Left Column - Basic Info */}
          <Grid item xs={12} md={4}>
            {/* Profile Card */}
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: 'primary.main',
                    fontSize: '2rem',
                  }}
                >
                  {candidate.name.charAt(0)}
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  {candidate.name}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {candidate.currentRole}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {candidate.location}
                </Typography>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Contact Information
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <EmailIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <Typography variant="body2">{candidate.email}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PhoneIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <Typography variant="body2">{candidate.phone}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <WorkIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <Typography variant="body2">{candidate.experience} experience</Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Performance Overview */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Performance Overview
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Overall Score</Typography>
                    <Typography variant="body2" sx={{ color: getScoreColor(candidate.overallScore) }}>
                      {candidate.overallScore}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={candidate.overallScore}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="h4" sx={{ color: 'primary.main' }}>
                      {candidate.totalInterviews}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Interviews
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h4" sx={{ color: 'success.main' }}>
                      {candidate.completedInterviews}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Completed
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column - Detailed Info */}
          <Grid item xs={12} md={8}>
            {/* Skills */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Skills & Expertise
                </Typography>
                <Grid container spacing={2}>
                  {candidate.skills.map((skill, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">{skill.name}</Typography>
                          <Typography variant="body2">{skill.level}%</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={skill.level}
                          color={getSkillLevelColor(skill.level)}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            {/* Work Experience */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Work Experience
                </Typography>
                {candidate.workExperience.map((exp, index) => (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {exp.position}
                    </Typography>
                    <Typography variant="body2" color="primary" gutterBottom>
                      {exp.company} • {exp.duration}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {exp.description}
                    </Typography>
                    {index < candidate.workExperience.length - 1 && <Divider sx={{ mt: 2 }} />}
                  </Box>
                ))}
              </CardContent>
            </Card>

            {/* Education */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Education
                </Typography>
                {candidate.education.map((edu, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SchoolIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="subtitle2">{edu.degree}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {edu.institution} • {edu.year}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>

            {/* Interview History */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Interview History
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Position</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Score</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {interviewHistory.map((interview) => (
                        <TableRow key={interview.id} hover>
                          <TableCell>
                            <Typography variant="body2">{interview.position}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {interview.company} • {interview.interviewType}
                            </Typography>
                          </TableCell>
                          
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(interview.scheduledAt)}
                            </Typography>
                          </TableCell>
                          
                          <TableCell>
                            {interview.duration > 0 ? formatDuration(interview.duration) : '-'}
                          </TableCell>
                          
                          <TableCell>
                            <Chip
                              label={interview.status}
                              color={getStatusColor(interview.status)}
                              size="small"
                            />
                          </TableCell>
                          
                          <TableCell>
                            {interview.score ? (
                              <Typography
                                variant="body2"
                                sx={{ color: getScoreColor(interview.score), fontWeight: 'bold' }}
                              >
                                {interview.score}%
                              </Typography>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          
                          <TableCell>
                            {interview.status === 'completed' && interview.feedback && (
                              <Button
                                size="small"
                                onClick={() => handleViewFeedback(interview)}
                              >
                                View Feedback
                              </Button>
                            )}
                            {interview.status === 'scheduled' && (
                              <Button
                                size="small"
                                startIcon={<VideoCallIcon />}
                                onClick={() => navigate(`/interview-room/${interview.id}`)}
                              >
                                Join Interview
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                {interviewHistory.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No interview history available.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Feedback Dialog */}
        <Dialog open={showFeedbackDialog} maxWidth="md" fullWidth>
          <DialogTitle>Interview Feedback</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {selectedFeedback}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowFeedbackDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default CandidateProfile;