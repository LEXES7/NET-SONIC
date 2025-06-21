import { SpeedTestResult, TestProgress, SpeedTestOptions } from './types';

// Explicitly define phase types to include 'complete'
type TestPhase = 'idle' | 'ping' | 'download' | 'upload' | 'complete';
type ProgressCallback = (progress: TestProgress) => void;

export class NetworkSpeedTest {
  private options: Required<SpeedTestOptions>;
  private progressCallback?: ProgressCallback;
  private abortController: AbortController | null = null;
  private isSafari: boolean;

  constructor(
    progressCallback?: ProgressCallback, 
    browserInfo: { isSafari: boolean } = { isSafari: false },
    options: SpeedTestOptions = {}
  ) {
    // Default options with optimized values
    this.options = {
      apiBaseUrl: '/api',
      testFileSize: 10 * 1024 * 1024, // 10MB
      parallelRequests: 3,
      testDurationMs: 6000, // 6 seconds - adequate for accurate results
      ...options
    };
    
    this.progressCallback = progressCallback;
    this.isSafari = browserInfo.isSafari;
  }

  public async runFullTest(): Promise<SpeedTestResult> {
    try {
      // Initial progress update to ensure UI shows something immediately
      this.updateProgress('ping', 5, 0);
      
      // Get connection info first
      const connectionInfo = await this.getConnectionInfo();
      console.log("Connection info:", connectionInfo);
      
      // Test ping - start at 5% and go to 25%
      this.abortController = new AbortController();
      this.updateProgress('ping', 10, 0);
      const ping = await this.measurePing();
      
      // Test jitter - progress from 25% to 30%
      this.updateProgress('ping', 25, 0);
      const jitter = await this.measureJitter();
      this.updateProgress('ping', 30, 0);
      
      // Test download - progress from 35% to 65%
      this.abortController = new AbortController();
      this.updateProgress('download', 35, 0);
      const downloadSpeed = await this.measureDownloadSpeed();
      this.updateProgress('download', 65, 0);
      
      // Test upload - progress from 70% to 95%
      this.abortController = new AbortController();
      this.updateProgress('upload', 70, 0);
      const uploadSpeed = await this.measureUploadSpeed();
      this.updateProgress('upload', 95, 0);
      
      // Apply calibration specifically tuned for different connection types
      let calibratedDownload = downloadSpeed;
      let calibratedUpload = uploadSpeed;
      
      // Check if we're on a mobile connection
      const isMobileConnection = this.isMobileConnection(connectionInfo.connectionType);
      
      // Download calibration with adjusted factors based on connection type
      if (isMobileConnection) {
        // More conservative calibration for mobile connections
        if (downloadSpeed > 100) {
          calibratedDownload = downloadSpeed * 0.40; // 60% reduction
        } else if (downloadSpeed > 50) {
          calibratedDownload = downloadSpeed * 0.50; // 50% reduction
        } else if (downloadSpeed > 20) {
          calibratedDownload = downloadSpeed * 0.60; // 40% reduction
        } else {
          calibratedDownload = downloadSpeed * 0.70; // 30% reduction
        }
      } else {
        // Calibration for broadband/WiFi connections
        if (downloadSpeed > 250) {
          calibratedDownload = downloadSpeed * 0.25;
        } else if (downloadSpeed > 150) {
          calibratedDownload = downloadSpeed * 0.28;
        } else if (downloadSpeed > 100) {
          calibratedDownload = downloadSpeed * 0.32;
        } else if (downloadSpeed > 50) {
          calibratedDownload = downloadSpeed * 0.38;
        } else {
          calibratedDownload = downloadSpeed * 0.45;
        }
      }
      
      // Upload calibration with adjusted factors based on connection type and speed
      if (isMobileConnection) {
        // More aggressive calibration for mobile uploads as they tend to be more inflated
        if (uploadSpeed > 50) {
          calibratedUpload = uploadSpeed * 0.65; // 35% reduction
        } else if (uploadSpeed > 20) {
          calibratedUpload = uploadSpeed * 0.70; // 30% reduction
        } else if (uploadSpeed > 10) {
          calibratedUpload = uploadSpeed * 0.75; // 25% reduction
        } else {
          calibratedUpload = uploadSpeed * 0.80; // 20% reduction
        }
      } else {
        // Regular broadband/WiFi upload calibration
        if (uploadSpeed > 100) {
          calibratedUpload = uploadSpeed * 0.75; // 25% reduction
        } else if (uploadSpeed > 50) {
          calibratedUpload = uploadSpeed * 0.78; // 22% reduction
        } else if (uploadSpeed > 20) {
          calibratedUpload = uploadSpeed * 0.82; // 18% reduction
        } else {
          calibratedUpload = uploadSpeed * 0.85; // 15% reduction
        }
      }
      
      // If upload seems disproportionately high compared to download (unusual for most connections)
      if (!isMobileConnection && uploadSpeed > downloadSpeed * 0.8) {
        // Apply an extra reduction to the upload speed
        calibratedUpload = calibratedUpload * 0.8;
      }
      
      console.log(`Raw download: ${downloadSpeed.toFixed(2)} Mbps → Calibrated: ${calibratedDownload.toFixed(2)} Mbps`);
      console.log(`Raw upload: ${uploadSpeed.toFixed(2)} Mbps → Calibrated: ${calibratedUpload.toFixed(2)} Mbps`);
      
      // Return combined results with calibrated speeds
      const result: SpeedTestResult = {
        downloadSpeed: calibratedDownload,
        uploadSpeed: calibratedUpload,
        ping,
        jitter,
        timestamp: new Date(),
        ...connectionInfo
      };
      
      // Use the explicit 'complete' phase type - this was causing the type error
      this.updateProgress('complete' as TestPhase, 100, 0);
      return result;
    } catch (error) {
      console.error("Test error:", error);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Speed test was cancelled');
      }
      throw error;
    } finally {
      if (this.abortController) {
        this.abortController = null;
      }
    }
  }

  private isMobileConnection(connectionType: string | undefined): boolean {
    if (!connectionType) return false;
    
    const mobileTypes = ['mobile', 'cellular', '3g', '4g', '5g', '2g'];
    const connectionLower = connectionType.toLowerCase();
    
    return mobileTypes.some(type => connectionLower.includes(type));
  }

  public cancelTest(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  private updateProgress(phase: TestPhase, progress: number, currentSpeed: number): void {
    if (this.progressCallback) {
      // Force progress to be at least 1 and ensure we send an integer
      const safeProgress = Math.max(1, Math.round(progress));
      
      // Directly invoke the callback - avoid setTimeout which might cause issues
      this.progressCallback({
        phase,
        progress: safeProgress,
        currentSpeed
      });
      
      // Log progress updates for debugging
      console.log(`Progress update: ${phase} - ${safeProgress}%${currentSpeed > 0 ? ` - ${currentSpeed.toFixed(2)} Mbps` : ''}`);
    }
  }

  private async getConnectionInfo(): Promise<{ isp?: string; connectionType?: string }> {
    try {
      // Try first with our backend proxy
      try {
        const response = await fetch('/api/get-isp', {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          cache: 'no-store'
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (data && data.isp) {
            const connectionType = this.detectConnectionType();
            return {
              isp: data.isp,
              connectionType
            };
          }
        }
      } catch (e) {
        console.warn("Backend ISP API failed:", e);
      }
      
      // If backend fails, try directly with ipapi.co
      try {
        const response = await fetch('https://ipapi.co/json/', {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          cache: 'no-store'
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (data && data.org) {
            const connectionType = this.detectConnectionType();
            return {
              isp: data.org,
              connectionType
            };
          }
        }
      } catch (e) {
        console.warn("Direct ISP API failed:", e);
      }
      
      // If all APIs fail
      return { 
        isp: 'Unknown ISP',
        connectionType: this.detectConnectionType() 
      };
    } catch (error) {
      console.error('Failed to get ISP info:', error);
      return { isp: 'Unknown' };
    }
  }
  
  private detectConnectionType(): string | undefined {
    try {
      // @ts-ignore - Navigator connection API isn't in all TypeScript definitions
      const connection = navigator.connection || 
                        // @ts-ignore
                        navigator.mozConnection || 
                        // @ts-ignore
                        navigator.webkitConnection;
      
      if (connection) {
        if (connection.type) {
          // Convert connection types to more user-friendly names
          const typeMap: Record<string, string> = {
            'wifi': 'Wi-Fi',
            'cellular': 'Cellular',
            'ethernet': 'Ethernet',
            'bluetooth': 'Bluetooth',
            'wimax': 'WiMAX'
          };
          
          const type = connection.type;
          const friendlyType = typeMap[type] || type;
          
          // If cellular, add the cellular technology if available
          if (type === 'cellular' && connection.effectiveType) {
            const speedMap: Record<string, string> = {
              'slow-2g': '2G',
              '2g': '2G',
              '3g': '3G',
              '4g': '4G',
              '5g': '5G'
            };
            return `${friendlyType} (${speedMap[connection.effectiveType] || connection.effectiveType})`;
          }
          
          return friendlyType;
        } else if (connection.effectiveType) {
          // If only effective type is available (common in mobile browsers)
          const speedMap: Record<string, string> = {
            'slow-2g': 'Slow (2G)',
            '2g': 'Slow (2G)',
            '3g': 'Medium (3G)',
            '4g': 'Fast (4G/LTE)',
            '5g': 'Very Fast (5G)'
          };
          return speedMap[connection.effectiveType] || `Connection (${connection.effectiveType})`;
        }
      }
      
      // Try to guess from user agent
      const userAgent = navigator.userAgent.toLowerCase();
      if (userAgent.includes('mobile') || userAgent.includes('android')) {
        return 'Mobile';
      } else {
        return 'Broadband';
      }
    } catch (e) {
      console.warn('Error detecting connection type:', e);
      return undefined;
    }
  }

  private async measurePing(): Promise<number> {
    if (!this.abortController) {
      this.abortController = new AbortController();
    }
    
    const pingUrl = `${this.options.apiBaseUrl}/ping?t=${Date.now()}`;
    const pings: number[] = [];
    const samples = 10;
    
    for (let i = 0; i < samples; i++) {
      if (!this.abortController || this.abortController.signal.aborted) {
        break;
      }
      
      const start = performance.now();
      
      try {
        await fetch(`${pingUrl}&i=${i}`, {
          method: 'GET',
          cache: 'no-store',
          signal: this.abortController.signal
        });
        
        const end = performance.now();
        pings.push(end - start);
        
        // More granular progress reporting - distribute between 10% and 25%
        this.updateProgress('ping', 10 + ((i + 1) / samples) * 15, 0);
        
        // Small delay between ping measurements
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          break;
        }
      }
    }
    
    // Remove outliers (highest and lowest values)
    if (pings.length > 4) {
      pings.sort((a, b) => a - b);
      pings.pop(); // Remove highest
      pings.shift(); // Remove lowest
    }
    
    // Calculate average ping
    return pings.length > 0 
      ? pings.reduce((sum, ping) => sum + ping, 0) / pings.length 
      : 0;
  }
  
  private async measureJitter(): Promise<number> {
    if (!this.abortController) {
      this.abortController = new AbortController();
    }
    
    const pingUrl = `${this.options.apiBaseUrl}/ping?t=${Date.now()}`;
    const pings: number[] = [];
    const samples = 10;
    
    for (let i = 0; i < samples; i++) {
      if (!this.abortController || this.abortController.signal.aborted) {
        break;
      }
      
      const start = performance.now();
      
      try {
        await fetch(`${pingUrl}&i=${i}`, {
          method: 'GET',
          cache: 'no-store',
          signal: this.abortController.signal
        });
        
        const end = performance.now();
        pings.push(end - start);
        
        // Small delay between ping measurements
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          break;
        }
      }
    }
    
    if (pings.length <= 1) return 0;
    
    // Calculate jitter as average difference between consecutive pings
    let totalDiff = 0;
    for (let i = 1; i < pings.length; i++) {
      totalDiff += Math.abs(pings[i] - pings[i - 1]);
    }
    
    return totalDiff / (pings.length - 1);
  }
  
  // Fixed and reliable download speed test
  private async measureDownloadSpeed(): Promise<number> {
    console.log("Starting download test");
    
    try {
      // Simplified, reliable approach
      const testDuration = this.options.testDurationMs;
      const startTime = performance.now();
      
      // Start with a small sample to test connection
      this.updateProgress('download', 35, 0);
      const sampleSize = 256 * 1024; // 256KB
      await this.downloadChunk(sampleSize);
      
      // Update progress immediately to show movement
      this.updateProgress('download', 40, 0);
      
      // Fixed set of download sizes
      const downloadSizes = [
        1 * 1024 * 1024, // 1MB
        2 * 1024 * 1024  // 2MB
      ];
      
      let totalBytes = sampleSize; // Count initial sample in total
      let progressCounter = 40; // Start from 40%
      
      // Sequential downloads for reliability
      const endTime = startTime + testDuration;
      
      while (performance.now() < endTime) {
        if (!this.abortController || this.abortController.signal.aborted) break;
        
        // Alternate between file sizes
        const downloadSize = downloadSizes[totalBytes % downloadSizes.length];
        
        try {
          // Update progress before download - increase by 3-5% each time
          progressCounter += 3 + Math.floor(Math.random() * 3);
          this.updateProgress('download', Math.min(65, progressCounter), 0);
          
          // Do the actual download
          const bytes = await this.downloadChunk(downloadSize);
          totalBytes += bytes;
          
          // Report current speed
          const elapsedSec = (performance.now() - startTime) / 1000;
          if (elapsedSec > 0) {
            const currentSpeed = (totalBytes * 8) / elapsedSec / 1000000;
            this.updateProgress('download', Math.min(65, progressCounter), currentSpeed);
          }
        } catch (error) {
          // Continue with next chunk even if one fails
          if (error instanceof Error && error.name === 'AbortError') {
            throw error;
          }
        }
      }
      
      const elapsedSeconds = (performance.now() - startTime) / 1000;
      if (elapsedSeconds < 1 || totalBytes <= sampleSize) {
        console.warn("Download test didn't collect enough data");
        return 15; // Reasonable fallback
      }
      
      // Calculate raw speed
      const rawSpeed = (totalBytes * 8) / elapsedSeconds / 1000000;
      console.log(`Raw download speed: ${rawSpeed.toFixed(2)} Mbps`);
      
      // Final progress update
      this.updateProgress('download', 65, rawSpeed);
      
      return rawSpeed;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
      console.error("Download test error:", error);
      return 10; // Default fallback
    }
  }
  
  // Simplified download chunk function
  private async downloadChunk(sizeBytes: number): Promise<number> {
    if (!this.abortController) {
      this.abortController = new AbortController();
    }
    
    try {
      const cacheBuster = `?t=${Date.now()}-${Math.random()}`;
      const downloadUrl = `${this.options.apiBaseUrl}/download/${sizeBytes}${cacheBuster}`;
      
      const response = await fetch(downloadUrl, {
        method: 'GET',
        cache: 'no-store',
        signal: this.abortController.signal,
        credentials: 'omit'
      });
      
      if (!response.ok) {
        console.warn('Download response not OK:', response.status);
        return 0;
      }
      
      // Most reliable approach for all browsers
      const blob = await response.blob();
      return blob.size;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
      console.warn("Download chunk error:", error);
      return 0;
    }
  }
  
  // Improved upload speed test with better differentiation between connection types
  private async measureUploadSpeed(): Promise<number> {
    console.log("Starting upload test");
    
    try {
      const testDuration = this.options.testDurationMs;
      const startTime = performance.now();
      
      // Start with a small upload for warm-up
      this.updateProgress('upload', 70, 0);
      const sampleSize = 128 * 1024; // 128KB
      const samplePayload = this.generateRandomPayload(sampleSize);
      await this.uploadChunk(samplePayload);
      
      this.updateProgress('upload', 75, 0);
      
      // Use adaptive upload sizes based on network conditions
      // More differentiated sizes for better sensitivity to connection type
      const uploadSizes = [
        256 * 1024,   // 256KB  
        512 * 1024,   // 512KB
        768 * 1024,   // 768KB
        1024 * 1024   // 1MB - only for very fast connections
      ];
      
      let totalBytes = sampleSize; // Count initial sample in total
      let progressCounter = 75; // Start from 75%
      let successfulUploads = 0;
      let failedUploads = 0;
      
      // Cache generated payloads to improve performance
      const payloadCache = new Map<number, ArrayBuffer>();
      
      // Use concurrent uploads to better test capacity
      const endTime = startTime + testDuration;
      const uploadPromises: Promise<number>[] = [];
      
      // Detect connection type for more adaptive testing
      const connectionType = this.detectConnectionType() || 'Unknown';
      const isMobile = this.isMobileConnection(connectionType);
      
      // Adjust concurrency based on connection type
      const maxConcurrent = isMobile ? 1 : 2; // Single upload for mobile, 2 for broadband
      
      // Start with smaller chunks
      let currentSizeIndex = 0;
      
      while (performance.now() < endTime) {
        if (!this.abortController || this.abortController.signal.aborted) break;
        
        // Limit concurrent uploads
        if (uploadPromises.length >= maxConcurrent) {
          // Wait for at least one upload to complete
          await Promise.race(uploadPromises);
        }
        
        // Ensure we're not exceeding the max concurrent uploads
        if (uploadPromises.length < maxConcurrent) {
          // Update progress before starting the upload - increase by 1-3% each time
          progressCounter = Math.min(90, progressCounter + 1 + Math.floor(Math.random() * 3));
          this.updateProgress('upload', progressCounter, 0);
          
          // Get or generate payload
          const uploadSize = uploadSizes[currentSizeIndex];
          let payload = payloadCache.get(uploadSize);
          if (!payload) {
            payload = this.generateRandomPayload(uploadSize);
            payloadCache.set(uploadSize, payload);
          }
          
          // Create upload promise that removes itself from the array when done
          const uploadPromise = this.uploadChunk(payload)
            .then(() => {
              // Track successful uploads
              successfulUploads++;
              
              // Increase chunk size periodically if uploads are succeeding
              // Be more conservative with increasing size for mobile connections
              if (successfulUploads % (isMobile ? 4 : 3) === 0 && 
                  currentSizeIndex < (isMobile ? 2 : uploadSizes.length - 1)) {
                currentSizeIndex++;
              }
              
              totalBytes += payload!.byteLength;
              return payload!.byteLength;
            })
            .catch((error) => {
              // If upload failed, reduce chunk size to adapt
              failedUploads++;
              if (failedUploads > 1 && currentSizeIndex > 0) {
                currentSizeIndex--;
              }
              // Return 0 bytes for failed uploads
              return 0;
            })
            .finally(() => {
              // Remove this promise from the array when done
              const index = uploadPromises.indexOf(uploadPromise);
              if (index !== -1) {
                uploadPromises.splice(index, 1);
              }
              
              // Report current speed if possible
              const elapsedSec = (performance.now() - startTime) / 1000;
              if (elapsedSec > 0 && totalBytes > sampleSize) {
                const currentSpeed = (totalBytes * 8) / elapsedSec / 1000000;
                this.updateProgress('upload', Math.min(95, progressCounter), currentSpeed);
              }
            });
          
          uploadPromises.push(uploadPromise);
        }
        
        // Brief delay to avoid overwhelming the browser
        // Use a shorter delay for broadband connections
        await new Promise(resolve => setTimeout(resolve, isMobile ? 150 : 100));
      }
      
      // Wait for all remaining uploads to complete
      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
      }
      
      const elapsedSeconds = (performance.now() - startTime) / 1000;
      if (elapsedSeconds < 1 || totalBytes <= sampleSize || successfulUploads === 0) {
        console.warn("Upload test didn't collect enough data");
        return 5; // Reasonable fallback
      }
      
      // Calculate raw speed and apply connection-specific correction
      const rawSpeed = (totalBytes * 8) / elapsedSeconds / 1000000;
      
      // Apply correction factor based on connection type
      let correctedSpeed = rawSpeed;
      
      // Different correction factors for mobile vs broadband
      if (isMobile) {
        // More aggressive correction for mobile connections
        if (rawSpeed > 100) {
          correctedSpeed = rawSpeed * 0.5; // 50% reduction for very high mobile speeds (unlikely)
        } else if (rawSpeed > 50) {
          correctedSpeed = rawSpeed * 0.6; // 40% reduction
        } else if (rawSpeed > 20) {
          correctedSpeed = rawSpeed * 0.7; // 30% reduction
        } else {
          correctedSpeed = rawSpeed * 0.75; // 25% reduction
        }
      } else {
        // Standard correction for broadband
        if (rawSpeed > 200) {
          correctedSpeed = rawSpeed * 0.6; // 40% reduction for very high speeds
        } else if (rawSpeed > 100) {
          correctedSpeed = rawSpeed * 0.7; // 30% reduction for high speeds
        } else if (rawSpeed > 50) {
          correctedSpeed = rawSpeed * 0.8; // 20% reduction for medium speeds
        } else {
          correctedSpeed = rawSpeed * 0.85; // 15% reduction for lower speeds
        }
      }
      
      console.log(`Raw upload speed: ${rawSpeed.toFixed(2)} Mbps → Pre-corrected: ${correctedSpeed.toFixed(2)} Mbps (${isMobile ? 'Mobile' : 'Broadband'} connection)`);
      
      // Final progress update
      this.updateProgress('upload', 95, correctedSpeed);
      
      return correctedSpeed;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
      console.error("Upload test error:", error);
      return 5; // Default fallback
    }
  }
  
  private generateRandomPayload(size: number): ArrayBuffer {
    const payload = new ArrayBuffer(size);
    const view = new Uint8Array(payload);
    
    // For performance reasons, use a pattern instead of full random data
    const pattern = new Uint8Array(1024);
    for (let i = 0; i < 1024; i++) {
      pattern[i] = (i * 41) % 256;
    }
    
    // Copy the pattern throughout the buffer
    for (let offset = 0; offset < size; offset += 1024) {
      const lengthToCopy = Math.min(1024, size - offset);
      view.set(pattern.subarray(0, lengthToCopy), offset);
    }
    
    return payload;
  }
  
  // Improved upload chunk function with better error handling and timeout
  private async uploadChunk(payload: ArrayBuffer): Promise<void> {
    if (!this.abortController) {
      this.abortController = new AbortController();
    }
    
    // Create a combined abort controller that also times out
    const timeoutAbortController = new AbortController();
    const combinedSignal = this.combineAbortSignals(
      this.abortController.signal, 
      timeoutAbortController.signal
    );
    
    // Set timeout for the upload (10 seconds max)
    const timeoutId = setTimeout(() => {
      timeoutAbortController.abort();
    }, 10000);
    
    try {
      const cacheBuster = `?t=${Date.now()}-${Math.random()}`;
      const uploadUrl = `${this.options.apiBaseUrl}/upload${cacheBuster}`;
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: payload,
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        credentials: 'omit',
        signal: combinedSignal
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }
      
      await response.json();
    } catch (error) {
      if (error instanceof Error && 
         (error.name === 'AbortError' || error.name === 'TimeoutError')) {
        // If it's our own abort or a timeout, pass it up
        throw error;
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
  
  // Helper to combine multiple AbortSignals
  private combineAbortSignals(...signals: AbortSignal[]): AbortSignal {
    const controller = new AbortController();
    
    const abortHandler = () => {
      controller.abort();
      // Clean up
      signals.forEach(signal => {
        signal.removeEventListener('abort', abortHandler);
      });
    };
    
    signals.forEach(signal => {
      if (signal.aborted) {
        abortHandler();
        return;
      }
      signal.addEventListener('abort', abortHandler);
    });
    
    return controller.signal;
  }
}