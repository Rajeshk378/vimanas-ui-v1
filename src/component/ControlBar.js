export default function ControlBar() {
  return (
    <div className="bg-white shadow px-6 py-4 flex justify-center space-x-4">
      <button className="bg-green-600 text-white px-4 py-2 rounded">▶️ Next Question</button>
      <button className="bg-red-600 text-white px-4 py-2 rounded">🛑 End Interview</button>
      <button className="bg-gray-600 text-white px-4 py-2 rounded">🔇 Mute</button>
    </div>
  );
}
