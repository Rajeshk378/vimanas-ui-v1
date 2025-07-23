import React, { useEffect, useRef, useState } from 'react';

export default function CandidatePanel() {
  const videoRef = useRef(null);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      videoRef.current.srcObject = stream;
    });

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true;

    recognition.onresult = (event) => {
      const latestTranscript = Array.from(event.results)
        .map((res) => res[0].transcript)
        .join(' ');
      setTranscript(latestTranscript);
    };

    recognition.start();

    return () => recognition.stop();
  }, []);

  return (
    <div>
      <h2 className="text-lg font-bold mb-2">👤 Candidate</h2>
      <video ref={videoRef} autoPlay muted className="w-full mb-4 rounded shadow" />
      <textarea value={transcript} readOnly className="w-full h-24 p-2 border rounded" />
    </div>
  );
}
