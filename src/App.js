import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import components
import Dashboard from './components/Dashboard';
import ResumeUpload from './components/ResumeUpload';
import InterviewScheduler from './components/InterviewScheduler';
import InterviewRoom from './components/InterviewRoom';
import InterviewHistory from './components/InterviewHistory';
import CandidateProfile from './components/CandidateProfile';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload-resume" element={<ResumeUpload />} />
            <Route path="/schedule-interview" element={<InterviewScheduler />} />
            <Route path="/interview-room/:interviewId" element={<InterviewRoom />} />
            <Route path="/interview-history" element={<InterviewHistory />} />
            <Route path="/candidate/:candidateId" element={<CandidateProfile />} />
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
