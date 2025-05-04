# AWS EC2 Setup Guide

## EC2 Instance Prerequisites

1. Launch an EC2 instance with Amazon Linux 2 or Ubuntu (recommended t2.micro for testing, t2.small or larger for production)
2. Make sure the following ports are open in your security group:
   - Port 22 (SSH)
   - Port 3000 (Frontend)
   - Port 5000 (Backend API)

## Installing Docker and Docker Compose

SSH into your EC2 instance and run the following commands:

### For Amazon Linux 2:

```bash
# Update system packages
sudo yum update -y

# Install Docker
sudo amazon-linux-extras install docker -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Log out and log back in to apply docker group membership
# Or run the following to apply changes in current session:
newgrp docker
```

### For Ubuntu:

```bash
# Update system packages
sudo apt update
sudo apt upgrade -y

# Install Docker
sudo apt install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install -y docker-compose

# Log out and log back in to apply docker group membership
# Or run the following to apply changes in current session:
newgrp docker
```

## Setup App Directory

```bash
mkdir -p ~/app
```

## GitHub Secrets Setup

In your GitHub repository, go to Settings > Secrets and add the following secrets:

1. `AWS_ACCESS_KEY_ID`: Your AWS access key ID
2. `AWS_SECRET_ACCESS_KEY`: Your AWS secret access key
3. `AWS_REGION`: Your AWS region (e.g., us-east-1)
4. `EC2_HOST`: Your EC2 instance's public IP or DNS
5. `EC2_USERNAME`: The username for SSH (e.g., ec2-user or ubuntu)
6. `EC2_SSH_KEY`: Your private SSH key that matches the public key used for the EC2 instance
7. `JWT_SECRET`: A secure random string for JWT token encryption

## Manual Deployment (if needed)

If you prefer to deploy manually, after SSH into your EC2 instance, run:

```bash
cd ~/app
docker-compose up -d --build
```

## Viewing Logs

To view logs for your containers:

```bash
# View all container logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View logs for a specific service
docker-compose logs frontend
docker-compose logs backend
docker-compose logs mongodb
```

## Troubleshooting

If you encounter any issues:

1. Check if containers are running: `docker ps`
2. Check detailed logs: `docker-compose logs [service_name]`
3. Restart the services: `docker-compose restart`
4. Rebuild if needed: `docker-compose up -d --build` 