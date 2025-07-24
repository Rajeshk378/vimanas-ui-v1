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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Avatar,
  Divider,
} from '@mui/material';
import {
  History as HistoryIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon,
  Email as EmailIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  ArrowBack as ArrowBackIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import vimanasApi from '../services/vimanasApi';

const InterviewHistory = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [filteredInterviews, setFilteredInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedbackContent, setFeedbackContent] = useState('');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadInterviewHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [interviews, statusFilter, dateFilter, searchTerm]);

  const loadInterviewHistory = async () => {
    try {
      setLoading(true);
      // This would typically load for a specific candidate or all interviews
      const response = await vimanasApi.client.get('/interviews/history');
      setInterviews(response.data);
    } catch (error) {
      console.error('Error loading interview history:', error);
      // Set mock data for demo
      setInterviews([
        {
          id: 1,
          candidateName: 'John Doe',
          candidateEmail: 'john.doe@email.com',
          position: 'Frontend Developer',
          scheduledAt: '2024-01-15T10:00:00Z',
          completedAt: '2024-01-15T11:30:00Z',
          status: 'completed',
          duration: 90,
          score: 85,
          phase: 'closing',
          skills: ['React', 'JavaScript', 'HTML/CSS'],
          feedback: 'Strong technical skills, good communication',
          interviewType: 'comprehensive',
        },
        {
          id: 2,
          candidateName: 'Jane Smith',
          candidateEmail: 'jane.smith@email.com',
          position: 'Backend Developer',
          scheduledAt: '2024-01-14T14:00:00Z',
          completedAt: '2024-01-14T15:00:00Z',
          status: 'completed',
          duration: 60,
          score: 92,
          phase: 'closing',
          skills: ['Node.js', 'Python', 'MongoDB'],
          feedback: 'Excellent problem-solving abilities',
          interviewType: 'technical',
        },
        {
          id: 3,
          candidateName: 'Mike Johnson',
          candidateEmail: 'mike.johnson@email.com',
          position: 'Full Stack Developer',
          scheduledAt: '2024-01-16T09:00:00Z',
          completedAt: null,
          status: 'scheduled',
          duration: 0,
          score: null,
          phase: null,
          skills: ['React', 'Node.js', 'MongoDB'],
          feedback: null,
          interviewType: 'comprehensive',
        },
        {
          id: 4,
          candidateName: 'Sarah Wilson',
          candidateEmail: 'sarah.wilson@email.com',
          position: 'Frontend Developer',
          scheduledAt: '2024-01-13T11:00:00Z',
          completedAt: '2024-01-13T11:45:00Z',
          status: 'incomplete',
          duration: 45,
          score: 65,
          phase: 'technical',
          skills: ['React', 'TypeScript'],
          feedback: 'Interview ended early due to technical issues',
          interviewType: 'technical',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...interviews];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(interview => interview.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(interview => 
            new Date(interview.scheduledAt) >= filterDate
          );
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(interview => 
            new Date(interview.scheduledAt) >= filterDate
          );
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(interview => 
            new Date(interview.scheduledAt) >= filterDate
          );
          break;
      }
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(interview =>
        interview.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredInterviews(filtered);
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
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ff9800';
    return '#f44336';
  };

  const handleViewDetails = (interview) => {
    setSelectedInterview(interview);
    setShowDetailsDialog(true);
  };

  const handleViewFeedback = async (interview) => {
    try {
      setSelectedInterview(interview);
      
      if (interview.status === 'completed') {
        const response = await vimanasApi.getFeedbackEmail(interview.id);
        setFeedbackContent(response.data.content);
      } else {
        setFeedbackContent('Feedback not available for incomplete interviews.');
      }
      
      setShowFeedbackDialog(true);
    } catch (error) {
      console.error('Error loading feedback:', error);
      setFeedbackContent(interview.feedback || 'No feedback available.');
      setShowFeedbackDialog(true);
    }
  };

  const handleSendFollowUp = async (interview) => {
    try {
      await vimanasApi.sendFollowUpEmail(interview.id, 'follow_up');
      toast.success('Follow-up email sent successfully!');
    } catch (error) {
      console.error('Error sending follow-up email:', error);
      toast.error('Error sending follow-up email');
    }
  };

  const handleDownloadReport = async (interview) => {
    try {
      const response = await vimanasApi.getInterviewAnalytics(interview.id);
      // This would typically download a PDF report
      toast.success('Interview report downloaded!');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Error downloading report');
    }
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
          <Typography>Loading interview history...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            Back to Dashboard
          </Button>
          <Typography variant="h4" component="h1">
            Interview History
          </Typography>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: '#1976d2', mr: 2 }}>
                    <AssessmentIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4">
                      {interviews.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Interviews
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: '#4caf50', mr: 2 }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4">
                      {interviews.filter(i => i.status === 'completed').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completed
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: '#ff9800', mr: 2 }}>
                    <HistoryIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4">
                      {interviews.filter(i => i.status === 'scheduled').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Scheduled
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: '#9c27b0', mr: 2 }}>
                    <AssessmentIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4">
                      {Math.round(
                        interviews
                          .filter(i => i.score)
                          .reduce((acc, i) => acc + i.score, 0) /
                        interviews.filter(i => i.score).length || 0
                      )}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Score
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <FilterListIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Filters
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="all">All Statuses</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="scheduled">Scheduled</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="incomplete">Incomplete</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Date Range</InputLabel>
                  <Select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    label="Date Range"
                  >
                    <MenuItem value="all">All Time</MenuItem>
                    <MenuItem value="today">Today</MenuItem>
                    <MenuItem value="week">This Week</MenuItem>
                    <MenuItem value="month">This Month</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setDateFilter('all');
                  }}
                  sx={{ height: '56px' }}
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Interview List */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Interview Records ({filteredInterviews.length})
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Candidate</TableCell>
                    <TableCell>Position</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Score</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredInterviews.map((interview) => (
                    <TableRow key={interview.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                            {interview.candidateName.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">
                              {interview.candidateName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {interview.candidateEmail}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {interview.position}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {interview.interviewType}
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
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography
                              variant="body2"
                              sx={{ color: getScoreColor(interview.score), fontWeight: 'bold' }}
                            >
                              {interview.score}%
                            </Typography>
                          </Box>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleViewDetails(interview)}
                          >
                            Details
                          </Button>
                          
                          {interview.status === 'completed' && (
                            <>
                              <Button
                                size="small"
                                startIcon={<EmailIcon />}
                                onClick={() => handleViewFeedback(interview)}
                              >
                                Feedback
                              </Button>
                              <Button
                                size="small"
                                startIcon={<DownloadIcon />}
                                onClick={() => handleDownloadReport(interview)}
                              >
                                Report
                              </Button>
                            </>
                          )}
                          
                          <Button
                            size="small"
                            startIcon={<EmailIcon />}
                            onClick={() => handleSendFollowUp(interview)}
                          >
                            Follow Up
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {filteredInterviews.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No interviews found matching your criteria.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Interview Details Dialog */}
        <Dialog open={showDetailsDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            Interview Details
          </DialogTitle>
          <DialogContent>
            {selectedInterview && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Candidate Information
                  </Typography>
                  <Typography><strong>Name:</strong> {selectedInterview.candidateName}</Typography>
                  <Typography><strong>Email:</strong> {selectedInterview.candidateEmail}</Typography>
                  <Typography><strong>Position:</strong> {selectedInterview.position}</Typography>
                  
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Interview Details
                  </Typography>
                  <Typography><strong>Type:</strong> {selectedInterview.interviewType}</Typography>
                  <Typography><strong>Scheduled:</strong> {formatDate(selectedInterview.scheduledAt)}</Typography>
                  {selectedInterview.completedAt && (
                    <Typography><strong>Completed:</strong> {formatDate(selectedInterview.completedAt)}</Typography>
                  )}
                  <Typography><strong>Duration:</strong> {formatDuration(selectedInterview.duration)}</Typography>
                  <Typography><strong>Status:</strong> {selectedInterview.status}</Typography>
                  {selectedInterview.phase && (
                    <Typography><strong>Last Phase:</strong> {selectedInterview.phase}</Typography>
                  )}
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Skills Assessed
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    {selectedInterview.skills.map((skill, index) => (
                      <Chip key={index} label={skill} size="small" sx={{ mr: 1, mb: 1 }} />
                    ))}
                  </Box>
                  
                  {selectedInterview.score && (
                    <>
                      <Typography variant="h6" gutterBottom>
                        Performance
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h4" sx={{ color: getScoreColor(selectedInterview.score) }}>
                          {selectedInterview.score}%
                        </Typography>
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          Overall Score
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={selectedInterview.score}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </>
                  )}
                  
                  {selectedInterview.feedback && (
                    <>
                      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                        Summary
                      </Typography>
                      <Typography variant="body2">
                        {selectedInterview.feedback}
                      </Typography>
                    </>
                  )}
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Feedback Dialog */}
        <Dialog open={showFeedbackDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            Interview Feedback
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {feedbackContent}
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

export default InterviewHistory;