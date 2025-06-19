import { Link } from "wouter";

export default function Home() {
  const today = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Start counting from June 19, 2025 as puzzle #1
  const startDate = new Date('2025-06-19').getTime();
  const gameNumber = Math.floor((Date.now() - startDate) / (1000 * 60 * 60 * 24)) + 1;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center px-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-[600px] mx-auto text-center animate-fade-in">
        {/* Logo */}
        <div className="mb-16 animate-fade-in-up">
          <div className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-12 shadow-2xl" style={{ background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-gold-hover))' }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-black">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
          </div>
          <h1 className="font-title text-7xl mb-12" style={{ color: 'var(--text-primary)' }}>
            Chronicle
          </h1>
        </div>

        {/* Description */}
        <div className="mb-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <p className="font-heading text-2xl leading-tight" style={{ color: 'var(--text-primary)' }}>
            Arrange 6 historical events in chronological order
          </p>
        </div>

        {/* Date Info */}
        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="rounded-2xl p-6 shadow-xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--bg-tertiary)' }}>
            <p className="font-heading text-lg mb-2" style={{ color: 'var(--text-primary)' }}>{today}</p>
            <p className="font-body text-sm font-semibold" style={{ color: 'var(--accent-gold)' }}>No. {gameNumber}</p>
          </div>
        </div>

        {/* Play Button */}
        <div className="mb-10 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <Link href="/game">
            <button className="font-button w-full text-black py-6 px-8 rounded-2xl text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl" style={{ background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-gold-hover))', boxShadow: '0 8px 32px rgba(212, 175, 55, 0.3)' }} onMouseEnter={(e) => (e.target as HTMLElement).style.boxShadow = '0 12px 40px rgba(212, 175, 55, 0.4)'} onMouseLeave={(e) => (e.target as HTMLElement).style.boxShadow = '0 8px 32px rgba(212, 175, 55, 0.3)'}>
              Play
            </button>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
          <p className="font-body text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Built by Chronicle Team</p>
          <div className="flex justify-center space-x-6">
            <button className="font-body text-sm transition-colors duration-200 hover:scale-105 hover:text-yellow-400" style={{ color: 'var(--text-secondary)' }}>About</button>
            <button className="font-body text-sm transition-colors duration-200 hover:scale-105 hover:text-yellow-400" style={{ color: 'var(--text-secondary)' }}>Help</button>
            <button className="font-body text-sm transition-colors duration-200 hover:scale-105 hover:text-yellow-400" style={{ color: 'var(--text-secondary)' }}>Settings</button>
          </div>
        </div>
      </div>
    </div>
  );
}