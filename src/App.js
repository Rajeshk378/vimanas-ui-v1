import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const App = () => {
  const localVideoRef = useRef(null);
  const questionAudioRef = useRef(null);
  const aiResponseAudioRef = useRef(null);
  const [isInterviewActive, setIsInterviewActive] = useState(false);

  const [interviewStarted, setInterviewStarted] = useState(false);
  const [candidateAnswer, setCandidateAnswer] = useState("");
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error("Media access error:", err);
        setErrorMsg("Mic/Camera access denied.");
      });
  }, []);

  const startInterview = () => {
    setInterviewStarted(true);
    fetchNextQuestion();
  };

  const fetchNextQuestion = async () => {
    try {

      const response= await axios.get("http://localhost:8000/api/v1/question", {
                               params: {
                                 context: 'experience-10, skills-Angular'
                               },
                               responseType: 'blob'
                             });
            const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
            const audioSrc = URL.createObjectURL(audioBlob);
      if (response.data.end) {
        setInterviewEnded(true);
        return;
      }

      const questionAudio = questionAudioRef.current;
      questionAudio.src = audioSrc;

      questionAudio.onended = () => {
        startSpeechRecognition();
      };

      questionAudio.play();
    } catch (error) {
      console.error("Error fetching question:", error);
      setErrorMsg("Failed to fetch question.");
    }
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition not supported.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setCandidateAnswer(transcript);

      try {

      const response= await axios.get("http://localhost:8000/api/v1/answer", {
                                     params: {
                                     candidate_id: '1',
                                       answer: transcript
                                     },
                                     responseType: 'blob'
                                   });
        const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
            const audioSrc = URL.createObjectURL(audioBlob);
        // Play AI’s response MP3 before going to next question
        const aiAudio = aiResponseAudioRef.current;
        aiAudio.src = audioSrc;
        aiAudio.onended = () => {
          startSpeechRecognition();// After AI response ends, move to next question
        };
        aiAudio.play();
      } catch (err) {
        console.error("Failed to send answer:", err);
        setErrorMsg("Answer not sent.");
      }
    };

    recognition.onerror = (err) => {
      console.error("Speech recognition error:", err);
      setErrorMsg("Speech error: " + err.error);
    };

    recognition.start();
  };

const fetchQuestion = async () => {
    try {

      const response= await axios.get("http://localhost:8000/api/v1/question", {
                               params: {
                                 context: 'experience-10, skills-Angular'
                               },
                               responseType: 'blob'
                             });
            const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
            const audioSrc = URL.createObjectURL(audioBlob);
      if (response.data.end) {
        setInterviewEnded(true);
        return;
      }

      const questionAudio = questionAudioRef.current;
      questionAudio.src = audioSrc;

      questionAudio.onended = async () => {
              // Check if backend signaled interview end (e.g., using a header or some marker)
              const isInterviewEnded = response.headers['x-interview-ended'] === 'true';
              if (isInterviewEnded) {
                setInterviewEnded(true);
              } else {
                // Continue speech-recognition for next answer
                startSpeechRecognition();
              }
            };

      questionAudio.play();
    } catch (error) {
      console.error("Error fetching question:", error);
      setErrorMsg("Failed to fetch question.");
    }
  };

  const endInterview = () => {
    setInterviewEnded(true);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>AI Interview</h2>
      <video ref={localVideoRef} autoPlay playsInline width="300" height="200" />
      <audio ref={questionAudioRef} hidden controls />
      <audio ref={aiResponseAudioRef} hidden controls />

      {!interviewStarted && !interviewEnded && (
        <button onClick={startInterview}>Start Interview</button>
      )}

      {interviewStarted && !interviewEnded && (
        <>
          <p><strong>Listening and responding...</strong></p>
          <p>Your answer: {candidateAnswer}</p>
          <button onClick={endInterview}>End Interview</button>
        </>
      )}

      {interviewEnded && (
        <h3>✅ Interview completed.</h3>
      )}

      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
    </div>
  );
};

export default App;
