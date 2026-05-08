'use client';

import { useState, useEffect } from 'react';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out after 2.5 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2500);

    // Call onComplete after 3 seconds
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className={`splash-container ${fadeOut ? 'fade-out' : ''}`}>
      <div className="splash-content">
        <div className="splash-logo">
          <span className="brace">[</span>
          <span className="c">C</span>
          <span className="brace">]</span>
          <div className="logo-line"></div>
        </div>
        
        <div className="splash-title">
          <span className="compile">Compile_</span>
          <span className="zero-one">01</span>
        </div>
        
        <div className="splash-tagline">
          DETERMINISTIC AI COMPILER
        </div>
        
        <div className="splash-loader">
          <div className="loader-dot"></div>
          <div className="loader-dot"></div>
          <div className="loader-dot"></div>
        </div>
      </div>

      <style jsx>{`
        .splash-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          transition: opacity 0.5s ease-out;
        }

        .splash-container.fade-out {
          opacity: 0;
        }

        .splash-content {
          text-align: center;
        }

        .splash-logo {
          position: relative;
          display: inline-block;
          margin-bottom: 20px;
        }

        .brace {
          font-size: 70px;
          color: var(--amber);
          font-family: monospace;
          opacity: 0;
          animation: fadeInLetter 0.3s ease-out forwards;
        }

        .brace:nth-of-type(1) {
          animation-delay: 0.1s;
        }

        .c {
          font-size: 90px;
          font-weight: 700;
          -webkit-background-clip: text;
          background-clip: text;
          color: white;
          font-family: monospace;
          margin: 0 5px;
          display: inline-block;
          opacity: 0;
          animation: fadeInLetter 0.3s ease-out 0.2s forwards;
        }

        .brace:nth-of-type(2) {
          animation-delay: 0.3s;
        }

        .logo-line {
          position: absolute;
          bottom: -10px;
          left: 0;
          width: 0%;
          height: 2px;
          color: var(--amber);
          animation: expandLine 0.6s ease-out 0.6s forwards;
        }

        @keyframes fadeInLetter {
          0% {
            opacity: 0;
            transform: translateY(15px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes expandLine {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }

        .splash-title {
          margin-top: 30px;
          opacity: 0;
          animation: fadeInLetter 0.4s ease-out 0.5s forwards;
        }

        .compile {
          font-size: 42px;
          font-weight: 600;
          color: #e5e5e5;
          font-family: monospace;
        }

        .zero-one {
          font-size: 42px;
          font-weight: 700;
          -webkit-background-clip: text;
          background-clip: text;
          color: var(--amber);;
          font-family: monospace;
        }

        .splash-tagline {
          font-size: 10px;
          letter-spacing: 3px;
          color: #6b7280;
          font-family: monospace;
          margin-top: 15px;
          margin-bottom: 30px;
          opacity: 0;
          animation: fadeInLetter 0.3s ease-out 0.7s forwards;
        }

        .splash-loader {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 40px;
          opacity: 0;
          animation: fadeInLetter 0.3s ease-out 0.9s forwards;
        }

        .loader-dot {
          width: 6px;
          height: 6px;
          background: var(--amber);;
          border-radius: 50%;
          animation: pulse 1.2s ease-in-out infinite;
        }

        .loader-dot:nth-child(1) { animation-delay: 0s; }
        .loader-dot:nth-child(2) { animation-delay: 0.2s; }
        .loader-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
}