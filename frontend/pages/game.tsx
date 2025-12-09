import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const LandingPage: React.FC = () => {
  const router = useRouter();

  const handleStartGame = () => {
    // Opens the game in a new tab
    window.open('/cosmic-clicker', '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden font-sans">
      <Head>
        <title>Neon Gateway</title>
      </Head>

      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-10 right-10 w-72 h-72 bg-cyan-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-4">
        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-6 drop-shadow-lg tracking-tight">
          REFLEX <br className="md:hidden" /> PROTOCOL
        </h1>
        
        <p className="text-gray-300 text-lg md:text-xl mb-12 max-w-lg mx-auto leading-relaxed">
          Test your reaction speeds in the cosmic void. Mobile optimized. High intensity.
        </p>

        <button
          onClick={handleStartGame}
          className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-transparent border-2 border-cyan-400 rounded-full focus:outline-none hover:bg-cyan-400 hover:text-slate-900 hover:shadow-[0_0_20px_rgba(34,211,238,0.6)]"
        >
          <span className="absolute w-full h-full rounded-full opacity-0 group-hover:animate-ping bg-cyan-400"></span>
          <span className="relative text-xl uppercase tracking-widest">
            Enter Game
          </span>
        </button>
      </div>

      {/* Footer / Credits */}
      <div className="absolute bottom-5 text-gray-500 text-xs">
        System Ready // v2.0
      </div>

      {/* Tailwind Animation Customization (Add to global css or tailwind config if needed, otherwise standard pulsing works) */}
      <style jsx>{`
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;