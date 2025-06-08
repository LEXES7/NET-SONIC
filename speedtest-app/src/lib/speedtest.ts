import { SpeedTestResult, TestProgress, SpeedTestOptions } from './types';
import { calculateAverage } from './utils';

export class NetworkSpeedTest {
  private testServers = [
    'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js',     // ~90KB
    'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js', // ~70KB
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',     // ~600KB
    'https://cdnjs.cloudflare.com/ajax/libs/axios/1.6.2/axios.min.js',       // ~40KB
    'https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js', // ~140KB
  ];

  private uploadSizes = [
    256 * 1024,     // 256KB
    512 * 1024,     // 512KB
    1024 * 1024,    // 1MB
    2 * 1024 * 1024 // 2MB
  ];

  private onProgress?: (progress: TestProgress) => void;
  private options: SpeedTestOptions;

  constructor(onProgress?: (progress: TestProgress) => void, options: SpeedTestOptions = {}) {
    this.onProgress = onProgress;
    this.options = options;
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
      timestamp: new Date()
    };
  }

  private async measurePing(): Promise<number> {
    this.updateProgress('ping', 0, 0);
    
    const samples = 10;
    const pingResults: number[] = [];
    
    for (let i = 0; i < samples; i++) {
      // Add cache-busting parameter to prevent browser caching
      const cacheBuster = `?t=${Date.now()}-${Math.random()}`;
      const start = performance.now();
      try {
        await fetch(`/api/ping${cacheBuster}`, { 
          method: 'HEAD',
          cache: 'no-store',
          credentials: 'omit'
        });
        const end = performance.now();
        pingResults.push(end - start);
      } catch (e) {
        console.error('Ping measurement failed:', e);
      }
      
      this.updateProgress('ping', ((i + 1) / samples) * 100, 0);
    }
    
    // Remove outliers (highest and lowest values)
    pingResults.sort((a, b) => a - b);
    const trimmedResults = pingResults.slice(1, -1);
    
    return trimmedResults.length > 0 
      ? calculateAverage(trimmedResults)
      : pingResults.length > 0 
        ? calculateAverage(pingResults)
        : 0;
  }

  private async measureJitter(): Promise<number> {
    this.updateProgress('ping', 100, 0);
    
    const samples = 10;
    const measurements: number[] = [];
    
    for (let i = 0; i < samples; i++) {
      const cacheBuster = `?t=${Date.now()}-${Math.random()}`;
      const start = performance.now();
      try {
        await fetch(`/api/ping${cacheBuster}`, { 
          method: 'HEAD',
          cache: 'no-store',
          credentials: 'omit'
        });
        const end = performance.now();
        measurements.push(end - start);
      } catch (e) {
        console.error('Jitter measurement failed:', e);
      }
    }
    
    if (measurements.length <= 1) return 0;
    
    // Calculate jitter as the average of absolute differences
    let totalDiff = 0;
    for (let i = 1; i < measurements.length; i++) {
      totalDiff += Math.abs(measurements[i] - measurements[i-1]);
    }
    
    return totalDiff / (measurements.length - 1);
  }

  private async measureDownloadSpeed(): Promise<number> {
    // Reset progress for download test
    this.updateProgress('download', 0, 0);
    
    const testDuration = 10000; // 10 seconds
    const startTime = Date.now();
    const speeds: number[] = [];
    const parallelRequests = 4; // Use multiple connections
    
    try {
      while (Date.now() - startTime < testDuration) {
        // Run multiple requests in parallel to better saturate the connection
        const requests = Array(parallelRequests).fill(0).map(() => {
          const randomServer = this.testServers[Math.floor(Math.random() * this.testServers.length)];
          return this.performSingleDownloadTest(randomServer);
        });
        
        const results = await Promise.all(requests);
        speeds.push(...results.filter(Boolean));
        
        // Update progress
        const elapsedTime = Date.now() - startTime;
        const progressPercent = Math.min(100, (elapsedTime / testDuration) * 100);
        
        // Calculate current average speed for display
        const currentAvgSpeed = calculateAverage(speeds.slice(-8)); // Average of last 8 results
        
        this.updateProgress('download', progressPercent, currentAvgSpeed);
      }
      
      // Calculate average speed with trimming outliers
      return this.calculateAverageWithOutlierRemoval(speeds);
    } catch (error) {
      console.error('Download speed test failed:', error);
      return 0;
    }
  }

private async performSingleDownloadTest(url: string): Promise<number> {
  try {
    // Add cache-busting and use more browser-compatible fetch options
    const cacheBuster = `?cache=${Date.now()}-${Math.random()}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    const start = performance.now();
    const response = await fetch(url + cacheBuster, { 
      cache: 'no-store',
      credentials: 'omit', // Don't send cookies
      keepalive: false,
      signal: controller.signal
    });
    
    // For Safari, use blob(), for other browsers arrayBuffer() for better performance
    let fileSizeInBits: number;
    
    if (this.options.isSafari) {
      const blob = await response.blob();
      fileSizeInBits = blob.size * 8;
    } else {
      const buffer = await response.arrayBuffer();
      fileSizeInBits = buffer.byteLength * 8;
    }
      
    clearTimeout(timeoutId);
    const end = performance.now();
    
    const durationInSeconds = (end - start) / 1000;
    
    // Filter out unrealistically fast results (likely cached)
    if (durationInSeconds < 0.05) return 0;
    
    return fileSizeInBits / durationInSeconds / 1_000_000;
  } catch (e) {
    console.error('Single download test failed:', e);
    return 0;
  }
}

private async measureUploadSpeed(): Promise<number> {
  // Reset progress for upload test
  this.updateProgress('upload', 0, 0);
  
  const testDuration = 8000; // 8 seconds
  const startTime = Date.now();
  const speeds: number[] = [];
  
  try {
    // First, check upload capability with a small payload
    const probeResult = await this.performSingleUploadTest(64 * 1024); // 64KB probe
    
    // Determine optimal number of parallel streams based on probe result
    const parallelUploads = probeResult > 5 ? 4 : (probeResult > 1 ? 3 : 2);
    
    while (Date.now() - startTime < testDuration) {
      // Dynamically choose payload size based on detected speed
      // For slower connections, use smaller payloads
      let payloadSize: number;
      const recentAvg = speeds.length > 0 
        ? calculateAverage(speeds.slice(-3)) 
        : probeResult;
        
      if (recentAvg < 1) payloadSize = 256 * 1024;      // < 1Mbps: 256KB
      else if (recentAvg < 5) payloadSize = 512 * 1024;  // < 5Mbps: 512KB
      else if (recentAvg < 25) payloadSize = 1024 * 1024; // < 25Mbps: 1MB
      else payloadSize = 2 * 1024 * 1024;                // >= 25Mbps: 2MB
      
      const uploadTasks = Array(parallelUploads).fill(0).map(() => 
        this.performSingleUploadTest(payloadSize)
      );
      
      const results = await Promise.all(uploadTasks);
      const validResults = results.filter(Boolean);
      
      if (validResults.length > 0) {
        speeds.push(...validResults);
      }
      
      // Update progress
      const elapsedTime = Date.now() - startTime;
      const progressPercent = Math.min(100, (elapsedTime / testDuration) * 100);
      
      // Calculate the current average speed for display
      const currentAvgSpeed = speeds.length > 0 
        ? calculateAverage(speeds.slice(-4)) 
        : 0;
      
      this.updateProgress('upload', progressPercent, currentAvgSpeed);
    }
    
    // Calculate average speed, discarding outliers
    return this.calculateAverageWithOutlierRemoval(speeds);
  } catch (error) {
    console.error('Upload speed test failed:', error);
    return 0;
  }
}

private async performSingleUploadTest(sizeInBytes: number): Promise<number> {
  try {
    // Generate payload of random data
    const payload = new ArrayBuffer(sizeInBytes);
    const view = new Uint8Array(payload);
    
    // Only randomize a small portion for efficiency
    const stride = Math.max(32, Math.floor(view.length / 1000));
    for (let i = 0; i < view.length; i += stride) {
      view[i] = Math.floor(Math.random() * 256);
    }
    
    // Upload the data and measure time
    const cacheBuster = `?t=${Date.now()}-${Math.random()}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const start = performance.now();
    
    const response = await fetch(`/api/upload${cacheBuster}`, {
      method: 'POST',
      body: payload,
      headers: {
        'Content-Type': 'application/octet-stream'
      },
      credentials: 'omit',
      signal: controller.signal
    });
    
    // Verify the server actually received the data
    const responseData = await response.json();
    clearTimeout(timeoutId);
    const end = performance.now();
    
    // Calculate speed in Mbps (megabits per second)
    const payloadSizeInBits = sizeInBytes * 8;
    const durationInSeconds = (end - start) / 1000;
    
    // Filter out unrealistic results
    if (durationInSeconds < 0.05) return 0;
    
    // Verify server received correct byte count
    if (!responseData.success || responseData.received !== sizeInBytes) {
      console.warn('Upload size mismatch:', responseData);
      return 0;
    }
    
    return payloadSizeInBits / durationInSeconds / 1_000_000;
  } catch (e) {
    console.error('Single upload test failed:', e);
    return 0;
  }
}
  
  // Calculate average speed with outlier removal
  private calculateAverageWithOutlierRemoval(speeds: number[]): number {
    if (speeds.length === 0) return 0;
    
    // Sort speeds
    const sortedSpeeds = [...speeds].sort((a, b) => a - b);
    
    // Remove bottom and top 20% if we have enough samples
    if (sortedSpeeds.length >= 10) {
      const trimAmount = Math.floor(sortedSpeeds.length * 0.2);
      const trimmedSpeeds = sortedSpeeds.slice(
        trimAmount, 
        sortedSpeeds.length - trimAmount
      );
      return calculateAverage(trimmedSpeeds);
    }
    
    // If we don't have enough samples, just remove highest and lowest
    if (sortedSpeeds.length >= 3) {
      return calculateAverage(sortedSpeeds.slice(1, -1));
    }
    
    // If we have very few samples, use them all
    return calculateAverage(sortedSpeeds);
  }
  
  private updateProgress(phase: TestProgress['phase'], progress: number, currentSpeed: number) {
    if (this.onProgress) {
      this.onProgress({
        phase,
        progress,
        currentSpeed
      });
    }
  }
}