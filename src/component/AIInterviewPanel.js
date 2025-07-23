export default function AIInterviewPanel() {
  return (
    <div>
      <h2 className="text-lg font-bold mb-2">🤖 AI Interviewer</h2>
      <img src="/avatar-ai.png" alt="AI" className="w-32 mb-4" />
      <p className="mb-2">"Tell me about your last project."</p>
      <button
        onClick={() => new Audio("/ttsmaker-file-2025-7-20-16-35-26.mp3").play()}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        ▶️ Play Question
      </button>
    </div>
  );
}
