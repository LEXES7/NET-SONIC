import React from 'react';
import { SpeedTestResult } from '@/lib/types';
import { formatSpeed, formatMilliseconds } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';

interface TestHistoryProps {
  history: SpeedTestResult[];
}

export default function TestHistory({ history }: TestHistoryProps) {
  const { currentThemeColors } = useTheme();
  
  if (!history.length) return null;
  
  return (
    <div className="w-full">
      {/* Title with neon effect */}
      <h3 className="text-xl font-bold mb-6"
          style={{
            color: currentThemeColors.primary,
            textShadow: `0 0 8px rgba(${currentThemeColors.primaryRGB}, 0.5)`,
            fontFamily: "'Share Tech Mono', monospace",
            letterSpacing: '0.05em'
          }}>
        TEST HISTORY
      </h3>
      
      <div className="overflow-x-auto rounded-lg backdrop-blur-sm"
           style={{ 
             background: 'rgba(0, 0, 0, 0.25)', // More transparent background
             border: `1px solid rgba(${currentThemeColors.primaryRGB}, 0.15)`,
             boxShadow: `0 0 20px rgba(0, 0, 0, 0.3), inset 0 0 10px rgba(${currentThemeColors.primaryRGB}, 0.03)`
           }}>
        <table className="min-w-full">
          <thead>
            <tr className="border-b"
                style={{ borderColor: `rgba(${currentThemeColors.primaryRGB}, 0.15)` }}>
              <th className="py-4 px-5 text-sm font-medium text-left table-header">DATE</th>
              <th className="py-4 px-5 text-sm font-medium text-left table-header">DOWNLOAD</th>
              <th className="py-4 px-5 text-sm font-medium text-left table-header">UPLOAD</th>
              <th className="py-4 px-5 text-sm font-medium text-left table-header">PING</th>
              <th className="py-4 px-5 text-sm font-medium text-left table-header">JITTER</th>
            </tr>
          </thead>
          <tbody className={`divide-y divide-[rgba(${currentThemeColors.primaryRGB},0.07)]`}>
            {history.map((result, index) => (
              <tr key={index} className="hover-row">
                <td className="py-3 px-5 text-sm table-cell">
                  {result.timestamp.toLocaleDateString()} {result.timestamp.toLocaleTimeString()}
                </td>
                <td className="py-3 px-5 text-sm font-medium table-cell value-cell">
                  {formatSpeed(result.downloadSpeed)}
                </td>
                <td className="py-3 px-5 text-sm font-medium table-cell value-cell">
                  {formatSpeed(result.uploadSpeed)}
                </td>
                <td className="py-3 px-5 text-sm font-medium table-cell value-cell">
                  {formatMilliseconds(result.ping)}
                </td>
                <td className="py-3 px-5 text-sm font-medium table-cell value-cell">
                  {formatMilliseconds(result.jitter)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .table-header {
          color: rgba(${currentThemeColors.primaryRGB}, 0.8);
          text-shadow: 0 0 5px rgba(${currentThemeColors.primaryRGB}, 0.3);
          font-family: var(--font-geist-mono);
          letter-spacing: 0.1em;
        }
        
        .table-cell {
          color: rgba(255, 255, 255, 0.9);
        }
        
        .value-cell {
          color: rgba(${currentThemeColors.primaryRGB}, 0.95);
          text-shadow: 0 0 5px rgba(${currentThemeColors.primaryRGB}, 0.2);
        }
        
        .hover-row {
          transition: all 0.3s ease;
          border-left: 0px solid transparent;
        }
        
        .hover-row:hover {
          background: rgba(${currentThemeColors.primaryRGB}, 0.03);
          border-left: 2px solid rgba(${currentThemeColors.primaryRGB}, 0.4);
        }
        
        /* Add a scrollbar styler for WebKit browsers */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(${currentThemeColors.primaryRGB}, 0.25);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(${currentThemeColors.primaryRGB}, 0.4);
        }
      `}</style>
    </div>
  );
}