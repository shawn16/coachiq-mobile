# CoachIQ RW Development Container
FROM node:20-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    bash \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm globally
RUN npm install -g pnpm

# Install Claude Code CLI globally
RUN npm install -g @anthropic-ai/claude-code

# Create non-root user
RUN useradd -m -s /bin/bash developer

# Create app directory and set ownership
RUN mkdir -p /app && chown developer:developer /app

# Switch to non-root user
USER developer

# Set working directory
WORKDIR /app

# Default command
CMD ["bash"]