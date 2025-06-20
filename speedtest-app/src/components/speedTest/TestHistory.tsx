import React from 'react';
import { SpeedTestResult } from '@/lib/types';
import { formatSpeed, formatMilliseconds } from '@/lib/utils';

interface TestHistoryProps {
  history: SpeedTestResult[];
}

export default function TestHistory({ history }: TestHistoryProps) {
  if (!history.length) return null;
  
  return (
    <div className="w-full">
      {/* Title with neon effect */}
      <h3 className="text-xl font-bold mb-6"
          style={{
            color: '#fcee09',
            textShadow: '0 0 8px rgba(252, 238, 9, 0.5)',
            fontFamily: "'Share Tech Mono', monospace",
            letterSpacing: '0.05em'
          }}>
        TEST HISTORY
      </h3>
      
      <div className="overflow-x-auto rounded-lg"
           style={{ 
             background: 'rgba(0, 0, 0, 0.5)',
             border: '1px solid rgba(252, 238, 9, 0.2)',
             boxShadow: '0 0 15px rgba(0, 0, 0, 0.5)'
           }}>
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-yellow-400/20">
              <th className="py-4 px-5 text-sm font-medium text-left table-header">DATE</th>
              <th className="py-4 px-5 text-sm font-medium text-left table-header">DOWNLOAD</th>
              <th className="py-4 px-5 text-sm font-medium text-left table-header">UPLOAD</th>
              <th className="py-4 px-5 text-sm font-medium text-left table-header">PING</th>
              <th className="py-4 px-5 text-sm font-medium text-left table-header">JITTER</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-yellow-400/10">
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
          color: rgba(252, 238, 9, 0.7);
          text-shadow: 0 0 5px rgba(252, 238, 9, 0.3);
          font-family: var(--font-geist-mono);
          letter-spacing: 0.1em;
        }
        
        .table-cell {
          color: rgba(255, 255, 255, 0.85);
        }
        
        .value-cell {
          color: rgba(252, 238, 9, 0.9);
          text-shadow: 0 0 5px rgba(252, 238, 9, 0.2);
        }
        
        .hover-row {
          transition: all 0.2s ease;
          border-left: 0px solid transparent;
        }
        
        .hover-row:hover {
          background: rgba(252, 238, 9, 0.05);
          border-left: 2px solid rgba(252, 238, 9, 0.5);
        }
        
        /* Add a scrollbar styler for WebKit browsers */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(252, 238, 9, 0.3);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(252, 238, 9, 0.5);
        }
      `}</style>
    </div>
  );
}