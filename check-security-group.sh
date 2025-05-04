#!/bin/bash

# Script to check and test port accessibility

# Get public IP
PUBLIC_IP=$(curl -s http://checkip.amazonaws.com)
echo "EC2 Public IP: $PUBLIC_IP"

# Check if netcat is installed
if ! command -v nc &> /dev/null; then
    echo "Installing netcat for port testing..."
    sudo apt update && sudo apt install -y netcat
fi

# Check if port 5000 is accessible locally
echo "Testing local access to port 5000..."
nc -zv localhost 5000 || echo "⚠️ Cannot connect to port 5000 locally"

# Check if Docker containers are running
echo -e "\nChecking running containers..."
docker ps

# Check security group rules (no AWS CLI needed)
echo -e "\n⚠️ IMPORTANT SECURITY GROUP CHECK"
echo "You need to ensure your EC2 security group allows:"
echo "1. Inbound TCP traffic on port 5000 (Backend API)"
echo "2. Inbound TCP traffic on port 3000 (Frontend)"
echo "3. Inbound TCP traffic on port 22 (SSH)"
echo -e "\nTo check your security group in the AWS Console:"
echo "1. Open EC2 Dashboard: https://console.aws.amazon.com/ec2/"
echo "2. Click on 'Security Groups' in the left sidebar"
echo "3. Find and click on the security group attached to this instance"
echo "4. Check the 'Inbound rules' tab"
echo "5. Add rules for ports 3000 and 5000 if they're missing"

# Check if the service is running on the specified port
echo -e "\nVerifying if services are listening on required ports..."
sudo netstat -tulnp | grep 5000 || echo "⚠️ No service listening on port 5000"
sudo netstat -tulnp | grep 3000 || echo "⚠️ No service listening on port 3000"

# Simplified fix to check if the backend can be reached via HTTP
echo -e "\nTesting HTTP connectivity to backend..."
curl -m 5 -s http://localhost:5000 || echo "⚠️ Cannot connect to backend locally via HTTP"

# Test if backend is accessible from outside
echo -e "\nTesting HTTP connectivity to backend from outside (this might take a moment)..."
curl -m 5 -s http://$PUBLIC_IP:5000 || echo "⚠️ Cannot connect to backend from outside via HTTP"

echo -e "\nIf port 5000 is not accessible, possible reasons:"
echo "1. Security group not allowing traffic on port 5000"
echo "2. Backend service not running or not listening on all interfaces"
echo "3. Firewall blocking the port"

echo -e "\nTo manually open ports 3000 and 5000 in the security group:"
echo "aws ec2 authorize-security-group-ingress --group-id YOUR_SECURITY_GROUP_ID --protocol tcp --port 3000 --cidr 0.0.0.0/0"
echo "aws ec2 authorize-security-group-ingress --group-id YOUR_SECURITY_GROUP_ID --protocol tcp --port 5000 --cidr 0.0.0.0/0"
echo -e "\n(Replace YOUR_SECURITY_GROUP_ID with your actual security group ID)" 