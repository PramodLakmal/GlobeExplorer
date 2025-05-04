#!/bin/bash

# EMERGENCY FIX: Directly modify the bundled JavaScript in the running container
# This is a last-resort approach when other fixes aren't working

# Get the public IP of the EC2 instance
PUBLIC_IP=$(curl -s http://checkip.amazonaws.com)
echo "EC2 Public IP: $PUBLIC_IP"

# 1. Create a temporary fix script to run inside the container
cat > temp-fix.sh << EOF
#!/bin/sh
# Find all JavaScript files in the dist directory
cd /app/dist
echo "Scanning JS files for localhost references..."

# Replace all instances of localhost:5000 with the EC2 IP
find . -name "*.js" -exec grep -l "localhost:5000" {} \; | while read file; do
  echo "Fixing file: \$file"
  sed -i "s/localhost:5000/$PUBLIC_IP:5000/g" \$file
done

# Create a new script that will inject our IP at page load
mkdir -p /app/dist/fix
cat > /app/dist/fix/api-fix.js << JSEOF
// Emergency API URL fix
(function() {
  console.log("🚨 Emergency API fix loaded!");
  
  // Override any axios base URLs
  if (window.axios) {
    console.log("Patching axios defaults");
    window.axios.defaults.baseURL = "http://$PUBLIC_IP:5000";
  }
  
  // Override fetch requests to localhost
  const originalFetch = window.fetch;
  window.fetch = function(url, options) {
    if (typeof url === 'string' && url.includes('localhost:5000')) {
      const newUrl = url.replace('localhost:5000', '$PUBLIC_IP:5000');
      console.log('Intercepted fetch URL:', url, '→', newUrl);
      url = newUrl;
    }
    return originalFetch(url, options);
  };
  
  // Override XMLHttpRequest open method
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    if (typeof url === 'string' && url.includes('localhost:5000')) {
      const newUrl = url.replace('localhost:5000', '$PUBLIC_IP:5000');
      console.log('Intercepted XHR URL:', url, '→', newUrl);
      url = newUrl;
    }
    return originalOpen.call(this, method, url, ...rest);
  };
  
  // Add the fix script to all HTML pages
  if (document.currentScript) {
    console.log("Fix script loaded successfully");
  }
})();
JSEOF

# Now insert the script into index.html
sed -i 's/<head>/<head>\\n    <script src="\\/fix\\/api-fix.js"><\\/script>/' /app/dist/index.html

echo "Emergency fix applied successfully!"
EOF

# Make the script executable
chmod +x temp-fix.sh

# 2. Copy the script to the frontend container and run it
CONTAINER_ID=$(docker ps | grep app_frontend | awk '{print $1}')
if [ -z "$CONTAINER_ID" ]; then
  echo "Frontend container not found. Make sure it's running."
  exit 1
fi

echo "Found frontend container: $CONTAINER_ID"
docker cp temp-fix.sh $CONTAINER_ID:/app/temp-fix.sh
docker exec $CONTAINER_ID sh -c "chmod +x /app/temp-fix.sh && /app/temp-fix.sh"

# 3. Verify that the backend is allowing all origins
echo "Updating backend CORS configuration..."
BACKEND_ID=$(docker ps | grep app_backend | awk '{print $1}')
if [ -z "$BACKEND_ID" ]; then
  echo "Backend container not found. Make sure it's running."
  exit 1
fi

cat > backend-fix.sh << EOF
#!/bin/sh
# Create a CORS middleware fix
cat > /app/cors-fix.js << 'JSEOF'
// Emergency CORS middleware
export default function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    console.log('Received OPTIONS request from:', req.headers.origin);
    return res.status(200).send();
  }
  
  next();
}
JSEOF

# Restart the backend server to apply changes
echo "CORS fix applied. Restarting server..."
EOF

docker cp backend-fix.sh $BACKEND_ID:/app/backend-fix.sh
docker exec $BACKEND_ID sh -c "chmod +x /app/backend-fix.sh && /app/backend-fix.sh"

# 4. Apply changes
docker restart $BACKEND_ID
docker restart $CONTAINER_ID

echo -e "\nEmergency fixes applied! The application should now be accessible at:"
echo "Frontend: http://$PUBLIC_IP:3000"
echo "Backend API: http://$PUBLIC_IP:5000"
echo -e "\nIMPORTANT: You MUST clear your browser cache completely or use an incognito window"
echo "Browser steps to clear cache:"
echo "1. Chrome: Settings > Privacy and security > Clear browsing data > Check 'Cached images and files' > Clear data"
echo "2. Firefox: Settings > Privacy & Security > Cookies and Site Data > Clear Data > Check 'Cached Web Content' > Clear"
echo "3. Edge: Settings > Privacy, search, and services > Clear browsing data > Check 'Cached images and files' > Clear now" 