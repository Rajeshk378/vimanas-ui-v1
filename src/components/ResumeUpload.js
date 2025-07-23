import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Divider,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import vimanasApi from '../services/vimanasApi';

const steps = ['Upload Resume', 'Candidate Information', 'Job Requirements', 'Review & Submit'];

const ResumeUpload = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  const [jobRequirements, setJobRequirements] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [candidateInfo, setCandidateInfo] = useState({
    name: '',
    email: '',
    phone: '',
    experience: '',
    currentRole: '',
    expectedSalary: '',
    noticePeriod: '',
  });

  useEffect(() => {
    loadJobRequirements();
  }, []);

  const loadJobRequirements = async () => {
    try {
      const response = await vimanasApi.getJobRequirements();
      setJobRequirements(response.data);
    } catch (error) {
      console.error('Error loading job requirements:', error);
      // Set mock data for demo
      setJobRequirements([
        {
          id: 1,
          title: 'Frontend Developer',
          skills: ['React', 'JavaScript', 'HTML/CSS', 'TypeScript'],
          experience: '2-5 years',
          location: 'Remote',
        },
        {
          id: 2,
          title: 'Backend Developer',
          skills: ['Node.js', 'Python', 'MongoDB', 'API Development'],
          experience: '3-6 years',
          location: 'Hybrid',
        },
        {
          id: 3,
          title: 'Full Stack Developer',
          skills: ['React', 'Node.js', 'MongoDB', 'AWS'],
          experience: '4-8 years',
          location: 'On-site',
        },
      ]);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        setUploadedFile(file);
        analyzeResume(file);
      } else {
        toast.error('Please upload a PDF file');
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  });

  const analyzeResume = async (file) => {
    try {
      setLoading(true);
      const response = await vimanasApi.uploadResume(file, candidateInfo);
      const resumeId = response.data.resumeId;
      
      // Analyze the resume
      const analysisResponse = await vimanasApi.analyzeResume(resumeId);
      setResumeAnalysis(analysisResponse.data);
      
      // Auto-fill candidate info from analysis
      if (analysisResponse.data.extractedInfo) {
        setCandidateInfo(prev => ({
          ...prev,
          ...analysisResponse.data.extractedInfo,
        }));
      }
      
      toast.success('Resume uploaded and analyzed successfully!');
    } catch (error) {
      console.error('Error analyzing resume:', error);
      toast.error('Error analyzing resume. Please try again.');
      // Set mock analysis for demo
      setResumeAnalysis({
        skills: ['React', 'JavaScript', 'Node.js', 'MongoDB'],
        experience: '4 years',
        education: 'Bachelor of Computer Science',
        extractedInfo: {
          name: 'John Doe',
          email: 'john.doe@email.com',
          phone: '+1234567890',
          currentRole: 'Senior Frontend Developer',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && !uploadedFile) {
      toast.error('Please upload a resume first');
      return;
    }
    if (activeStep === 1 && (!candidateInfo.name || !candidateInfo.email)) {
      toast.error('Please fill in required candidate information');
      return;
    }
    if (activeStep === 2 && !selectedJobId) {
      toast.error('Please select a job requirement');
      return;
    }
    
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const submissionData = {
        candidateInfo,
        jobRequirementId: selectedJobId,
        resumeFile: uploadedFile,
        resumeAnalysis,
      };

      // This would create the candidate profile and prepare for interview scheduling
      const response = await vimanasApi.client.post('/candidates/create', submissionData);
      
      toast.success('Candidate profile created successfully!');
      navigate('/schedule-interview', { 
        state: { 
          candidateId: response.data.candidateId,
          candidateInfo,
          jobRequirement: jobRequirements.find(job => job.id === selectedJobId),
        }
      });
    } catch (error) {
      console.error('Error creating candidate profile:', error);
      toast.error('Error creating candidate profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setCandidateInfo(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Upload Candidate Resume
            </Typography>
            <Paper
              {...getRootProps()}
              sx={{
                p: 4,
                textAlign: 'center',
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'grey.300',
                bgcolor: isDragActive ? 'action.hover' : 'background.paper',
                cursor: 'pointer',
                mb: 2,
              }}
            >
              <input {...getInputProps()} />
              <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              {uploadedFile ? (
                <Box>
                  <Typography variant="h6" color="primary">
                    {uploadedFile.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    File size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {isDragActive ? 'Drop the resume here' : 'Drag & drop resume here'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    or click to select file (PDF only)
                  </Typography>
                </Box>
              )}
            </Paper>
            
            {loading && <LinearProgress sx={{ mb: 2 }} />}
            
            {resumeAnalysis && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <DescriptionIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Resume Analysis
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2">Extracted Skills:</Typography>
                      <Box sx={{ mt: 1 }}>
                        {resumeAnalysis.skills?.map((skill, index) => (
                          <Chip key={index} label={skill} size="small" sx={{ mr: 1, mb: 1 }} />
                        ))}
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2">Experience:</Typography>
                      <Typography variant="body2">{resumeAnalysis.experience}</Typography>
                      <Typography variant="subtitle2" sx={{ mt: 1 }}>Education:</Typography>
                      <Typography variant="body2">{resumeAnalysis.education}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Candidate Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name *"
                  value={candidateInfo.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email *"
                  type="email"
                  value={candidateInfo.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={candidateInfo.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Years of Experience"
                  value={candidateInfo.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Current Role"
                  value={candidateInfo.currentRole}
                  onChange={(e) => handleInputChange('currentRole', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Expected Salary"
                  value={candidateInfo.expectedSalary}
                  onChange={(e) => handleInputChange('expectedSalary', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Notice Period"
                  value={candidateInfo.noticePeriod}
                  onChange={(e) => handleInputChange('noticePeriod', e.target.value)}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              <WorkIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Select Job Requirements
            </Typography>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Job Position</InputLabel>
              <Select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                label="Job Position"
              >
                {jobRequirements.map((job) => (
                  <MenuItem key={job.id} value={job.id}>
                    {job.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedJobId && (
              <Card>
                <CardContent>
                  {(() => {
                    const selectedJob = jobRequirements.find(job => job.id === selectedJobId);
                    return selectedJob ? (
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {selectedJob.title}
                        </Typography>
                        <Typography variant="subtitle2">Required Skills:</Typography>
                        <Box sx={{ mt: 1, mb: 2 }}>
                          {selectedJob.skills.map((skill, index) => (
                            <Chip 
                              key={index} 
                              label={skill} 
                              color="primary" 
                              variant="outlined" 
                              size="small" 
                              sx={{ mr: 1, mb: 1 }} 
                            />
                          ))}
                        </Box>
                        <Typography variant="body2">
                          <strong>Experience:</strong> {selectedJob.experience}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Location:</strong> {selectedJob.location}
                        </Typography>
                      </Box>
                    ) : null;
                  })()}
                </CardContent>
              </Card>
            )}
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review & Submit
            </Typography>
            
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Candidate Information
                </Typography>
                <Typography><strong>Name:</strong> {candidateInfo.name}</Typography>
                <Typography><strong>Email:</strong> {candidateInfo.email}</Typography>
                <Typography><strong>Phone:</strong> {candidateInfo.phone}</Typography>
                <Typography><strong>Experience:</strong> {candidateInfo.experience}</Typography>
                <Typography><strong>Current Role:</strong> {candidateInfo.currentRole}</Typography>
              </CardContent>
            </Card>

            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Selected Position
                </Typography>
                {(() => {
                  const selectedJob = jobRequirements.find(job => job.id === selectedJobId);
                  return selectedJob ? (
                    <Box>
                      <Typography><strong>Title:</strong> {selectedJob.title}</Typography>
                      <Typography><strong>Experience:</strong> {selectedJob.experience}</Typography>
                      <Typography><strong>Location:</strong> {selectedJob.location}</Typography>
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="subtitle2">Skills:</Typography>
                        {selectedJob.skills.map((skill, index) => (
                          <Chip key={index} label={skill} size="small" sx={{ mr: 1, mt: 1 }} />
                        ))}
                      </Box>
                    </Box>
                  ) : null;
                })()}
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Resume Analysis
                </Typography>
                {resumeAnalysis && (
                  <Box>
                    <Typography><strong>Extracted Skills:</strong></Typography>
                    <Box sx={{ mt: 1 }}>
                      {resumeAnalysis.skills?.map((skill, index) => (
                        <Chip key={index} label={skill} size="small" sx={{ mr: 1, mb: 1 }} />
                      ))}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
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
            Upload Resume & Requirements
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent()}

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
          >
            Back
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Creating Profile...' : 'Create Profile'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<ArrowForwardIcon />}
            >
              Next
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default ResumeUpload;