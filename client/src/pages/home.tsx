import { Link } from "wouter";

export default function Home() {
  const today = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const gameNumber = Math.floor((Date.now() - new Date('2024-01-01').getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center animate-fade-in">
        {/* Logo */}
        <div className="mb-8 animate-fade-in-up">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
          </div>
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
            Chronicle
          </h1>
          <p className="text-gray-400 text-lg font-medium">Daily Historical Timeline</p>
        </div>

        {/* Description */}
        <div className="mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <p className="text-gray-300 text-xl mb-4 font-medium leading-relaxed">
            Arrange 6 historical events in chronological order
          </p>
          <p className="text-gray-400 text-base italic font-light">
            New puzzle every day!
          </p>
        </div>

        {/* Date Info */}
        <div className="mb-10 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700">
            <p className="text-gray-300 text-lg font-medium mb-2">{today}</p>
            <p className="text-green-400 text-sm font-semibold">No. {gameNumber}</p>
          </div>
        </div>

        {/* Play Button */}
        <div className="mb-12 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <Link href="/game">
            <button className="w-full bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-black font-bold py-5 px-8 rounded-2xl text-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-xl">
              Play
            </button>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
          <p className="mb-4 font-light">Built by Chronicle Team</p>
          <div className="flex justify-center space-x-6">
            <button className="hover:text-green-400 transition-colors font-medium">About</button>
            <button className="hover:text-green-400 transition-colors font-medium">Help</button>
            <button className="hover:text-green-400 transition-colors font-medium">Settings</button>
          </div>
        </div>
      </div>
    </div>
  );
}