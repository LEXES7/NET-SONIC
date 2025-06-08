export interface SpeedTestResult {
  downloadSpeed: number; // Mbps
  uploadSpeed: number;    // Mbps
  ping: number;          // ms
  jitter: number;        // ms
  timestamp: Date;
}

export interface TestProgress {
  phase: 'idle' | 'ping' | 'download' | 'upload' | 'complete';
  progress: number; // 0-100
  currentSpeed: number;
}

export class NetworkSpeedTest {
  private testServers = [
    'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js', // ~90KB
    'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js', // ~70KB
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', // ~600KB
  ];

  private onProgress?: (progress: TestProgress) => void;

  constructor(onProgress?: (progress: TestProgress) => void) {
    this.onProgress = onProgress;
  }

  async runFullTest(): Promise<SpeedTestResult> {
    const ping = await this.measurePing();
    const jitter = await this.measureJitter();
    const downloadSpeed = await this.measureDownloadSpeed();
    const uploadSpeed = await this.measureUploadSpeed();

    return {
      downloadSpeed,
      uploadSpeed,
      ping,
      jitter,
      timestamp: new Date(),
    };
  }

  private async measurePing(): Promise<number> {
    this.onProgress?.({ phase: 'ping', progress: 10, currentSpeed: 0 });
    
    const pings: number[] = [];
    const testUrl = this.testServers[0];

    for (let i = 0; i < 5; i++) {
      const start = performance.now();
      try {
        await fetch(testUrl, { 
          method: 'HEAD',
          cache: 'no-cache',
          mode: 'cors'
        });
        const end = performance.now();
        pings.push(end - start);
      } catch (error) {
        console.warn('Ping test failed:', error);
        pings.push(1000); // Fallback high ping
      }
    }

    return pings.reduce((a, b) => a + b, 0) / pings.length;
  }

  private async measureJitter(): Promise<number> {
    const pings: number[] = [];
    const testUrl = this.testServers[0];

    for (let i = 0; i < 10; i++) {
      const start = performance.now();
      try {
        await fetch(testUrl, { 
          method: 'HEAD',
          cache: 'no-cache',
          mode: 'cors'
        });
        const end = performance.now();
        pings.push(end - start);
      } catch (error) {
        pings.push(1000);
      }
    }

    const avgPing = pings.reduce((a, b) => a + b, 0) / pings.length;
    const variations = pings.map(ping => Math.abs(ping - avgPing));
    return variations.reduce((a, b) => a + b, 0) / variations.length;
  }

  private async measureDownloadSpeed(): Promise<number> {
    this.onProgress?.({ phase: 'download', progress: 30, currentSpeed: 0 });
    
    const speeds: number[] = [];
    const testDuration = 10000; // 10 seconds
    const startTime = Date.now();

    for (const serverUrl of this.testServers) {
      if (Date.now() - startTime > testDuration) break;

      try {
        const start = performance.now();
        const response = await fetch(serverUrl, { 
          cache: 'no-cache',
          mode: 'cors'
        });
        
        if (!response.ok) continue;
        
        const data = await response.blob();
        const end = performance.now();
        
        const sizeInBits = data.size * 8;
        const timeInSeconds = (end - start) / 1000;
        const speedBps = sizeInBits / timeInSeconds;
        const speedMbps = speedBps / (1024 * 1024);
        
        speeds.push(speedMbps);
        
        const currentSpeed = speedMbps;
        const progress = Math.min(30 + ((Date.now() - startTime) / testDuration) * 40, 70);
        this.onProgress?.({ phase: 'download', progress, currentSpeed });
        
      } catch (error) {
        console.warn('Download test failed for', serverUrl, error);
      }
    }

    // Continue testing with repeated requests if we have time
    while (Date.now() - startTime < testDuration && speeds.length < 20) {
      const serverUrl = this.testServers[speeds.length % this.testServers.length];
      try {
        const start = performance.now();
        const response = await fetch(serverUrl, { 
          cache: 'no-cache',
          mode: 'cors'
        });
        
        if (response.ok) {
          const data = await response.blob();
          const end = performance.now();
          
          const sizeInBits = data.size * 8;
          const timeInSeconds = (end - start) / 1000;
          const speedBps = sizeInBits / timeInSeconds;
          const speedMbps = speedBps / (1024 * 1024);
          
          speeds.push(speedMbps);
          
          const progress = Math.min(30 + ((Date.now() - startTime) / testDuration) * 40, 70);
          this.onProgress?.({ phase: 'download', progress, currentSpeed: speedMbps });
        }
      } catch (error) {
        // Continue with next iteration
      }
    }

    return speeds.length > 0 ? Math.max(...speeds) : 0;
  }

  private async measureUploadSpeed(): Promise<number> {
    this.onProgress?.({ phase: 'upload', progress: 70, currentSpeed: 0 });
    
    // For upload testing, we'll use a different approach since we can't easily upload to CDNs
    // We'll simulate upload by creating data and measuring the time to prepare it
    // In a real implementation, you'd want your own server endpoint
    
    const speeds: number[] = [];
    const testData = new Uint8Array(1024 * 1024); // 1MB of data
    const testDuration = 5000; // 5 seconds
    const startTime = Date.now();

    // Fill with random data
    for (let i = 0; i < testData.length; i++) {
      testData[i] = Math.floor(Math.random() * 256);
    }

    // Simulate upload by creating and processing data
    while (Date.now() - startTime < testDuration) {
      const start = performance.now();
      
      // Simulate upload preparation/compression
      const blob = new Blob([testData]);
      const arrayBuffer = await blob.arrayBuffer();
      const processed = new Uint8Array(arrayBuffer);
      
      const end = performance.now();
      const timeInSeconds = (end - start) / 1000;
      
      if (timeInSeconds > 0) {
        const sizeInBits = processed.length * 8;
        const speedBps = sizeInBits / timeInSeconds;
        const speedMbps = speedBps / (1024 * 1024);
        speeds.push(speedMbps);
        
        const progress = Math.min(70 + ((Date.now() - startTime) / testDuration) * 30, 100);
        this.onProgress?.({ phase: 'upload', progress, currentSpeed: speedMbps });
      }
    }

    // Return a simulated upload speed (typically lower than download)
    const maxSpeed = speeds.length > 0 ? Math.max(...speeds) : 10;
    return Math.min(maxSpeed * 0.3, 50); // Simulate typical upload/download ratio
  }
}

export const formatSpeed = (speed: number): string => {
  if (speed < 1) {
    return `${(speed * 1000).toFixed(0)} Kbps`;
  }
  return `${speed.toFixed(1)} Mbps`;
};

export const getSpeedRating = (speed: number): {
  rating: string;
  color: string;
  description: string;
} => {
  if (speed < 1) {
    return {
      rating: 'Poor',
      color: 'text-red-500',
      description: 'Very slow connection'
    };
  } else if (speed < 5) {
    return {
      rating: 'Slow',
      color: 'text-orange-500',
      description: 'Basic browsing only'
    };
  } else if (speed < 25) {
    return {
      rating: 'Good',
      color: 'text-yellow-500',
      description: 'Good for streaming'
    };
  } else if (speed < 100) {
    return {
      rating: 'Fast',
      color: 'text-blue-500',
      description: 'Great for everything'
    };
  } else {
    return {
      rating: 'Very Fast',
      color: 'text-green-500',
      description: 'Lightning fast!'
    };
  }
};