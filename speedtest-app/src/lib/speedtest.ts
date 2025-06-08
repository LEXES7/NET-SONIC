import { SpeedTestResult, TestProgress } from './types';
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
      timestamp: new Date()
    };
  }

  private async measurePing(): Promise<number> {
    this.updateProgress('ping', 0, 0);
    
    const samples = 10;
    const pingResults: number[] = [];
    
    for (let i = 0; i < samples; i++) {
      // Add cache-busting parameter to prevent browser caching
      const cacheBuster = `?t=${Date.now()}${Math.random()}`;
      const start = performance.now();
      try {
        await fetch(`/api/ping${cacheBuster}`, { 
          method: 'HEAD',
          cache: 'no-store',
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
      const cacheBuster = `?t=${Date.now()}${Math.random()}`;
      const start = performance.now();
      try {
        await fetch(`/api/ping${cacheBuster}`, { 
          method: 'HEAD',
          cache: 'no-store',
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
      // Add cache-busting query parameter
      const cacheBuster = `?t=${Date.now()}${Math.random()}`;
      const start = performance.now();
      const response = await fetch(url + cacheBuster, { 
        cache: 'no-store',
        // Set a timeout to prevent extremely slow connections from hanging
        signal: AbortSignal.timeout(5000) 
      });
      const data = await response.blob();
      const end = performance.now();
      
      // Calculate speed in Mbps
      const fileSizeInBits = data.size * 8;
      const durationInSeconds = (end - start) / 1000;
      
      // Filter out unrealistically fast results (likely cached)
      if (durationInSeconds < 0.1) return 0;
      
      return fileSizeInBits / durationInSeconds / 1_000_000;
    } catch (e) {
      console.error('Single download test failed:', e);
      return 0;
    }
  }

  private async measureUploadSpeed(): Promise<number> {
    // Reset progress for upload test
    this.updateProgress('upload', 0, 0);
    
    const testDuration = 10000; // 10 seconds
    const startTime = Date.now();
    const speeds: number[] = [];
    
    try {
      while (Date.now() - startTime < testDuration) {
        const parallelUploads = 3;
        const payloadSize = this.uploadSizes[Math.floor(Math.random() * this.uploadSizes.length)];
        
        const uploadTasks = Array(parallelUploads).fill(0).map(() => 
          this.performSingleUploadTest(payloadSize)
        );
        
        const results = await Promise.all(uploadTasks);
        speeds.push(...results.filter(Boolean));
        
        // Update progress
        const elapsedTime = Date.now() - startTime;
        const progressPercent = Math.min(100, (elapsedTime / testDuration) * 100);
        
        // Calculate the current average speed for display
        const currentAvgSpeed = calculateAverage(speeds.slice(-5));
        
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
      for (let i = 0; i < view.length; i += 4096) {
        view[i] = Math.floor(Math.random() * 256);
      }
      
      // Upload the data and measure time
      const cacheBuster = `?t=${Date.now()}${Math.random()}`;
      const start = performance.now();
      await fetch(`/api/upload${cacheBuster}`, {
        method: 'POST',
        body: payload,
        headers: {
          'Content-Type': 'application/octet-stream'
        },
        // Set a timeout to prevent extremely slow connections from hanging
        signal: AbortSignal.timeout(5000)
      });
      const end = performance.now();
      
      // Calculate speed in Mbps (megabits per second)
      const payloadSizeInBits = sizeInBytes * 8;
      const durationInSeconds = (end - start) / 1000;
      
      // Filter out unrealistic results
      if (durationInSeconds < 0.01) return 0;
      
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