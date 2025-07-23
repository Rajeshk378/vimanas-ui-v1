import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const VideoChat = () => {
  const videoRef = useRef(null);
  const [role, setRole] = useState('');
  const [roomReady, setRoomReady] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [speechBuffer, setSpeechBuffer] = useState('');
  const recognitionRef = useRef(null);
  const pauseTimer = useRef(null);

  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get('room') || 'default-room';
  const currentRole = urlParams.get('role') || 'candidate';

  useEffect(() => {
    setRole(currentRole);

    // Access camera
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      if (videoRef.current) videoRef.current.srcObject = stream;
    });

    // Join signaling room
    socket.emit('joinRoom', { roomId, role: currentRole });

    // Play welcome MP3 once both joined
    socket.on('bothUsersJoined', () => {
      setRoomReady(true);
      if (currentRole === 'candidate') {
        fetch('http://localhost:5000/api/welcome-audio')
          .then(res => res.blob())
          .then(blob => {
            const audioUrl = URL.createObjectURL(blob);
            const audio = new Audio(audioUrl);
            audio.play();
          });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, currentRole]);

  useEffect(() => {
    if (!SpeechRecognition || currentRole !== 'candidate') return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }

      setSpeechBuffer(transcript);

      if (pauseTimer.current) clearTimeout(pauseTimer.current);
      pauseTimer.current = setTimeout(() => {
        if (transcript.trim()) {
          sendToBackend(transcript.trim());
          setSpeechBuffer('');
        }
      }, 2000);
    };

    recognition.onstart = () => setIsRecognizing(true);
    recognition.onend = () => {
      setIsRecognizing(false);
      try {
        recognition.start();
      } catch (e) {
        console.warn('Could not restart recognition:', e.message);
      }
    };

    recognition.onerror = (e) => {
      console.error('Speech recognition error:', e.error);
      setIsRecognizing(false);
    };

    try {
      recognition.start();
    } catch (err) {
      console.warn('Error starting recognition:', err.message);
    }

    return () => {
      recognition.stop();
      clearTimeout(pauseTimer.current);
    };
  }, [currentRole]);

  const sendToBackend = async (text) => {
    try {
      const res = await fetch('http://localhost:5000/api/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, roomId })
      });
      const result = await res.json();
      console.log('Server response:', result);
    } catch (err) {
      console.error('Error sending to backend:', err);
    }
  };

  return (
    <div>
      <h2>{role === 'ai' ? 'AI Interviewer' : 'Candidate'}</h2>
      <video ref={videoRef} autoPlay muted playsInline style={{ width: '400px', height: '300px' }} />
      {role === 'candidate' && <p>Speech Buffer: {speechBuffer}</p>}
    </div>
  );
};

export default VideoChat;