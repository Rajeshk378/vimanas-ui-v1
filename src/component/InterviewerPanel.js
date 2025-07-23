import React, { useState } from 'react';
import VideoChat from './VideoChat';

const questions = [
  "Tell me about yourself.",
  "What are your strengths?",
  "Describe a challenge you faced at work.",
];

const InterviewerPanel = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  const askQuestion = () => {
    const question = questions[currentQuestion];
    speak(question);
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-2">AI Interview Panel</h1>
      <VideoChat roomId="room1" role="interviewer" />
      <div className="mt-4">
        <button onClick={askQuestion} className="bg-blue-500 text-white px-4 py-2 rounded">
          Ask Question
        </button>
        <p className="mt-2">Question: {questions[currentQuestion]}</p>
        <button
          onClick={() => setCurrentQuestion((prev) => (prev + 1) % questions.length)}
          className="mt-2 bg-gray-300 px-3 py-1 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default InterviewerPanel;
