import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  LinearProgress,
  Avatar,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Schedule as ScheduleIcon,
  VideoCall as VideoCallIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import vimanasApi from '../services/vimanasApi';

const Dashboard = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalInterviews: 0,
    scheduledInterviews: 0,
    completedInterviews: 0,
    pendingFeedbacks: 0,
  });
  const [recentInterviews, setRecentInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Load dashboard statistics and recent interviews
      // This would be implemented in the API
      const statsResponse = await vimanasApi.client.get('/dashboard/stats');
      const recentResponse = await vimanasApi.client.get('/dashboard/recent-interviews');
      
      setDashboardStats(statsResponse.data);
      setRecentInterviews(recentResponse.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set mock data for demo
      setDashboardStats({
        totalInterviews: 25,
        scheduledInterviews: 3,
        completedInterviews: 22,
        pendingFeedbacks: 2,
      });
      setRecentInterviews([
        {
          id: 1,
          candidateName: 'John Doe',
          position: 'Frontend Developer',
          scheduledAt: new Date().toISOString(),
          status: 'scheduled',
        },
        {
          id: 2,
          candidateName: 'Jane Smith',
          position: 'Backend Developer',
          scheduledAt: new Date(Date.now() - 86400000).toISOString(),
          status: 'completed',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'primary';
      case 'in_progress':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const dashboardCards = [
    {
      title: 'Upload Resume',
      description: 'Upload candidate resume and select job requirements',
      icon: <UploadIcon fontSize="large" />,
      color: '#1976d2',
      action: () => navigate('/upload-resume'),
    },
    {
      title: 'Schedule Interview',
      description: 'Schedule AI-powered interviews with candidates',
      icon: <ScheduleIcon fontSize="large" />,
      color: '#388e3c',
      action: () => navigate('/schedule-interview'),
    },
    {
      title: 'Start Interview',
      description: 'Begin video call with AI agent',
      icon: <VideoCallIcon fontSize="large" />,
      color: '#f57c00',
      action: () => navigate('/interview-room/new'),
    },
    {
      title: 'Interview History',
      description: 'View past interviews and feedback',
      icon: <HistoryIcon fontSize="large" />,
      color: '#7b1fa2',
      action: () => navigate('/interview-history'),
    },
  ];

  const statCards = [
    {
      title: 'Total Interviews',
      value: dashboardStats.totalInterviews,
      icon: <AssessmentIcon />,
      color: '#1976d2',
    },
    {
      title: 'Scheduled',
      value: dashboardStats.scheduledInterviews,
      icon: <ScheduleIcon />,
      color: '#388e3c',
    },
    {
      title: 'Completed',
      value: dashboardStats.completedInterviews,
      icon: <VideoCallIcon />,
      color: '#f57c00',
    },
    {
      title: 'Pending Feedback',
      value: dashboardStats.pendingFeedbacks,
      icon: <HistoryIcon />,
      color: '#d32f2f',
    },
  ];

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <DashboardIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AI Interview Panel
          </Typography>
          <IconButton
            size="large"
            aria-label="account menu"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32 }}>AI</Avatar>
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>
              <PersonIcon sx={{ mr: 1 }} />
              Profile
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <SettingsIcon sx={{ mr: 1 }} />
              Settings
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: stat.color, mr: 2 }}>
                      {stat.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="h4" component="div">
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.title}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Main Action Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {dashboardCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                sx={{ 
                  height: '100%', 
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                }}
                onClick={card.action}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Avatar
                    sx={{
                      bgcolor: card.color,
                      width: 64,
                      height: 64,
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    {card.icon}
                  </Avatar>
                  <Typography variant="h6" component="div" gutterBottom>
                    {card.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Recent Interviews */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Interviews
            </Typography>
            {recentInterviews.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No recent interviews found.
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {recentInterviews.map((interview) => (
                  <Grid item xs={12} key={interview.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="subtitle1">
                              {interview.candidateName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {interview.position}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(interview.scheduledAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={interview.status}
                              color={getStatusColor(interview.status)}
                              size="small"
                            />
                            <Button
                              size="small"
                              onClick={() => navigate(`/candidate/${interview.id}`)}
                            >
                              View Details
                            </Button>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Dashboard;