# AI Interview Panel - Vimanas UI

A comprehensive AI-powered interview platform that conducts multi-level interviews with candidates, including technical assessments, behavioral evaluations, coding tests, and offer negotiations.

## Features

### 🎯 Core Functionality
- **Resume Upload & Analysis**: Upload candidate resumes with automatic skill extraction and analysis
- **Interview Scheduling**: Schedule AI-powered interviews with flexible time slots and configurations
- **Real-time Video Interviews**: Conduct live video interviews with AI agents
- **Multi-phase Interviews**: Support for introduction, technical, behavioral, coding, and negotiation phases
- **Time-based Skill Transitions**: Automatic skill focus changes during interviews based on time intervals
- **Coding Tests**: Integrated coding challenges with real-time code submission
- **Offer Negotiation**: AI-powered salary and benefits negotiation
- **Automated Feedback**: Generate and send detailed feedback emails to candidates

### 🤖 AI Integration
- **Vimanas API Integration**: Seamless integration with the Vimanas AI backend
- **Audio Q&A**: AI generates questions as MP3 audio files and processes spoken answers
- **Speech Recognition**: Real-time speech-to-text conversion for candidate responses
- **Dynamic Question Generation**: Context-aware questions based on resume analysis and job requirements
- **LLM-powered Feedback**: Intelligent feedback generation using large language models

### 📊 Analytics & Management
- **Interview History**: Comprehensive tracking of all interviews with detailed analytics
- **Candidate Profiles**: Detailed candidate information with performance metrics
- **Dashboard Analytics**: Overview of interview statistics and performance trends
- **Email Automation**: Automated follow-up emails and feedback delivery

## Technology Stack

- **Frontend**: React 19, Material-UI, React Router
- **Styling**: Material-UI with Emotion
- **State Management**: React Hooks
- **API Communication**: Axios
- **File Handling**: React Dropzone, PDF.js
- **Date/Time**: Day.js, MUI Date Pickers
- **Notifications**: React Toastify
- **Real-time Communication**: Socket.io Client

## Project Structure

```
src/
├── components/
│   ├── Dashboard.js              # Main dashboard with statistics
│   ├── ResumeUpload.js          # Multi-step resume upload process
│   ├── InterviewScheduler.js     # Interview scheduling interface
│   ├── InterviewRoom.js         # Real-time interview room
│   ├── InterviewHistory.js      # Historical interview data
│   └── CandidateProfile.js      # Detailed candidate information
├── services/
│   └── vimanasApi.js            # API integration service
├── App.js                       # Main application with routing
└── index.js                     # Application entry point
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vimanas-ui
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set environment variables**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_VIMANAS_API_URL=http://localhost:8000/api/v1
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`.

## Vimanas API Requirements

The application expects the following API endpoints to be available:

### Resume & Candidate Management
- `POST /resume/upload` - Upload and analyze resumes
- `POST /resume/{id}/analyze` - Analyze uploaded resume
- `GET /candidates/{id}` - Get candidate profile
- `POST /candidates/create` - Create candidate profile

### Interview Management
- `POST /interviews/schedule` - Schedule new interview
- `GET /interviews/slots` - Get available time slots
- `POST /interviews/{id}/start` - Start interview session
- `GET /interviews/{id}/session` - Get interview session data
- `POST /interviews/{id}/end` - End interview session

### Question & Answer Processing
- `GET /interviews/{id}/question` - Get next question (returns MP3 audio)
- `POST /interviews/{id}/answer` - Submit candidate answer (returns MP3 response)
- `GET /interviews/{id}/next-skill` - Get next skill focus area

### Coding Tests
- `POST /interviews/{id}/coding-test` - Initiate coding test
- `POST /interviews/{id}/code-submission` - Submit code solution

### Offer Negotiation
- `GET /interviews/{id}/offer` - Get offer details
- `POST /interviews/{id}/negotiate` - Process negotiation (returns MP3 response)

### Feedback & Communication
- `POST /interviews/{id}/feedback` - Generate interview feedback
- `POST /interviews/{id}/send-email` - Send automated emails
- `GET /interviews/{id}/feedback-email` - Get feedback email content

### Analytics & History
- `GET /interviews/history` - Get interview history
- `GET /interviews/{id}/analytics` - Get interview analytics
- `GET /dashboard/stats` - Get dashboard statistics

## Key Features Explained

### Time-based Interview Flow
The interview system automatically transitions between different skill areas and phases based on elapsed time:
- **Introduction Phase** (0-10%): General questions and rapport building
- **Technical Phase** (10-30%): Technical skill assessment
- **Behavioral Phase** (30-40%): Soft skills and cultural fit
- **Coding Phase** (40-60%): Programming challenges (if enabled)
- **Negotiation Phase** (60-80%): Salary and offer discussion (if enabled)
- **Closing Phase** (80-100%): Wrap-up and next steps

### Skill Transition System
During the interview, the system automatically changes focus areas every 10 minutes (configurable) to cover different technical skills based on the candidate's resume and job requirements.

### Audio Integration
- Questions are generated as MP3 files by the AI and played automatically
- Candidate responses are captured via speech recognition
- AI responses are returned as MP3 files and played seamlessly

### Multi-level Assessment
1. **First Level**: Basic screening and qualification check
2. **Second Level**: Detailed technical and behavioral assessment
3. **Coding Test**: Programming challenges (when required)
4. **Offer Negotiation**: Salary and benefits discussion

## Browser Requirements

- Chrome/Chromium (recommended for best speech recognition support)
- Firefox (limited speech recognition support)
- Safari (limited speech recognition support)
- Microphone and camera access required for interviews

## Development

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### API Integration Notes

The application includes comprehensive error handling and fallback mechanisms:
- Mock data is provided when API endpoints are unavailable
- Graceful degradation for missing features
- Toast notifications for user feedback
- Loading states for better UX

## Recommended Vimanas API Enhancements

Based on the UI implementation, consider adding these features to the Vimanas API:

1. **WebSocket Support**: Real-time interview events and status updates
2. **Batch Question Generation**: Pre-generate questions for smoother interview flow
3. **Audio Streaming**: Stream audio responses instead of full file downloads
4. **Interview Templates**: Predefined interview configurations for different roles
5. **Advanced Analytics**: Detailed performance metrics and comparison tools
6. **Multi-language Support**: Support for interviews in different languages
7. **Integration APIs**: Webhooks for external HR systems
8. **Candidate Portal**: Self-service portal for candidates to view their status

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.
