// src/HomePage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100 space-y-6">
      <h1 className="text-2xl font-bold">Welcome to AI Interview</h1>
      <button
        onClick={() => navigate('/interview')}
        className="bg-blue-600 text-white px-6 py-3 rounded"
      >
        Start Interview
      </button>
    </div>
  );
}
