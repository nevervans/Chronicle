import { Link } from "wouter";

export default function Home() {
  const today = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
      <div className="max-w-lg mx-auto px-6 text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-green-400 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-black text-2xl font-bold">C</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">Chronicle</h1>
          <p className="text-gray-400">Daily Historical Timeline</p>
        </div>

        {/* Description */}
        <div className="mb-8">
          <p className="text-gray-300 text-lg mb-4">
            Arrange 6 historical events in chronological order
          </p>
          <p className="text-gray-400 text-sm">
            Get 5 chances to guess the correct timeline. A new puzzle every day!
          </p>
        </div>

        {/* Date */}
        <div className="mb-8">
          <p className="text-gray-500 text-sm mb-2">{today}</p>
          <p className="text-gray-400 text-xs">No. {Math.floor((Date.now() - new Date('2024-01-01').getTime()) / (1000 * 60 * 60 * 24))}</p>
        </div>

        {/* Play Button */}
        <Link href="/game">
          <button className="w-full bg-green-400 hover:bg-green-500 text-black font-semibold py-4 px-8 rounded-lg text-lg transition-colors mb-6">
            Play
          </button>
        </Link>

        {/* Footer */}
        <div className="text-center text-gray-500 text-xs">
          <p className="mb-2">Edited by Chronicle Team</p>
          <div className="flex justify-center space-x-4">
            <button className="hover:text-gray-400">About</button>
            <button className="hover:text-gray-400">Help</button>
            <button className="hover:text-gray-400">Settings</button>
          </div>
        </div>
      </div>
    </div>
  );
}