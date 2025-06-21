const fs = require('fs');
const path = require('path');

// Define paths
const outputDir = path.join(__dirname, '..', '.next');
const indexPath = path.join(outputDir, 'index.html');

// Create simple index.html file if it doesn't exist
if (!fs.existsSync(indexPath)) {
  console.log('Creating index.html file for Netlify...');
  
  const indexContent = `
<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="refresh" content="0;url=/" />
    <title>NET SONIC - Network Speed Test</title>
  </head>
  <body>
    <p>Redirecting to homepage...</p>
  </body>
</html>
  `.trim();
  
  // Create the file
  fs.writeFileSync(indexPath, indexContent);
  console.log('Created index.html file for Netlify at:', indexPath);
} else {
  console.log('index.html already exists at:', indexPath);
}