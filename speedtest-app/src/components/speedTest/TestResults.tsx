'use client';

import React from 'react';
import { SpeedTestResult } from '@/lib/types';
import { formatSpeed } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';

interface TestResultsProps {
  result: SpeedTestResult | null;
  error?: string | null;
}

export default function TestResults({ result, error }: TestResultsProps) {
  const { currentThemeColors } = useTheme();
  
  if (!result && !error) {
    return null;
  }

  // If there's an error, display it
  if (error) {
    return (
      <div className="w-full p-6 bg-black/50 backdrop-blur-sm rounded-lg border border-red-500 shadow-lg"
           style={{ boxShadow: '0 0 15px rgba(255, 50, 50, 0.5)' }}>
        <h3 className="text-xl font-bold text-red-500 mb-2"
            style={{ textShadow: '0 0 5px rgba(255, 50, 50, 0.7)' }}>
          Test Failed
        </h3>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!result) return null;

  // Function to clean up ISP name by removing AS number pattern
  const cleanIspName = (ispName: string | undefined): string => {
    if (!ispName) return 'Unknown';
    // Remove "AS12345" pattern from the ISP name
    return ispName.replace(/AS\d+\s+/, '');
  };

  return (
    <div className="w-full">
      {/* Main results with neon style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="result-card">
          <div className="result-title">DOWNLOAD</div>
          <div className="result-value">{formatSpeed(result.downloadSpeed)}</div>
        </div>
        
        <div className="result-card">
          <div className="result-title">UPLOAD</div>
          <div className="result-value">{formatSpeed(result.uploadSpeed)}</div>
        </div>
        
        <div className="result-card">
          <div className="result-title">PING</div>
          <div className="result-value">{Math.round(result.ping)} <span className="text-lg">ms</span></div>
          <div className="text-xs mt-1"
               style={{ 
                 color: `rgba(${currentThemeColors.primaryRGB}, 0.8)`,
                 textShadow: `0 0 3px rgba(${currentThemeColors.primaryRGB}, 0.5)`
               }}>
            Jitter: {Math.round(result.jitter)} ms
          </div>
        </div>
      </div>
      
      {/* ISP and connection info */}
      <div className="p-5 bg-black/50 backdrop-blur-md rounded-lg border"
           style={{ 
             borderColor: `rgba(${currentThemeColors.primaryRGB}, 0.3)`,
             boxShadow: `0 0 10px rgba(${currentThemeColors.primaryRGB}, 0.2), inset 0 0 8px rgba(${currentThemeColors.primaryRGB}, 0.1)`
           }}>
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="info-item">
            <span className="info-label">ISP</span>
            <span className="info-value">{cleanIspName(result.isp)}</span>
          </div>
          
          {result.connectionType && (
            <div className="info-item">
              <span className="info-label">CONNECTION</span>
              <span className="info-value">{result.connectionType}</span>
            </div>
          )}
          
          <div className="info-item">
            <span className="info-label">DATE</span>
            <span className="info-value">{result.timestamp.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .result-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1.5rem;
          background-color: rgba(0, 0, 0, 0.7);
          border: 1px solid rgba(${currentThemeColors.primaryRGB}, 0.3);
          border-radius: 0.5rem;
          box-shadow: 0 0 15px rgba(${currentThemeColors.primaryRGB}, 0.15), inset 0 0 10px rgba(${currentThemeColors.primaryRGB}, 0.05);
          transition: all 0.3s ease;
        }
        
        .result-card:hover {
          box-shadow: 0 0 20px rgba(${currentThemeColors.primaryRGB}, 0.3), inset 0 0 15px rgba(${currentThemeColors.primaryRGB}, 0.1);
          transform: translateY(-2px);
        }
        
        .result-title {
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: rgba(${currentThemeColors.primaryRGB}, 0.8);
          text-shadow: 0 0 5px rgba(${currentThemeColors.primaryRGB}, 0.4);
          font-family: var(--font-geist-mono);
          margin-bottom: 0.5rem;
        }
        
        .result-value {
          font-size: 2.25rem;
          font-weight: 700;
          color: ${currentThemeColors.primary};
          text-shadow: 0 0 10px rgba(${currentThemeColors.primaryRGB}, 0.5), 0 0 20px rgba(${currentThemeColors.primaryRGB}, 0.3);
        }
        
        .info-item {
          display: flex;
          flex-direction: column;
        }
        
        .info-label {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: rgba(${currentThemeColors.primaryRGB}, 0.6);
          font-family: var(--font-geist-mono);
        }
        
        .info-value {
          font-size: 0.9rem;
          color: ${currentThemeColors.primary};
          text-shadow: 0 0 5px rgba(${currentThemeColors.primaryRGB}, 0.4);
        }
      `}</style>
    </div>
  );
}