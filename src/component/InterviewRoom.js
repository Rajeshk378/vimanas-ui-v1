// src/InterviewRoom.js
import React from 'react';
import AIInterviewPanel from './AIInterviewPanel';
import CandidatePanel from './CandidatePanel';
import ControlBar from './ControlBar';

export default function InterviewRoom() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex flex-1">
        <div className="w-1/2 border-r p-4">
          <AIInterviewPanel />
        </div>
        <div className="w-1/2 p-4">
          <CandidatePanel />
        </div>
      </div>
      <ControlBar />
    </div>
  );
}
