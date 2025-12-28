#!/bin/bash

# Navigate to the project root directory if script is run from inside server_fastapi
# (Adjust this logic depending on where you expect the user to run it from. 
# This assumes run_server.sh is inside server_fastapi/ and you run it from there or root)

# Get the directory of the script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Go to project root (where .env is expected to be reachable by settings logic)
cd "$PROJECT_ROOT"

# Allow PORT override from command line argument
# Usage: ./run_server.sh [PORT]
if [ ! -z "$1" ]; then
    export PORT=$1
    echo "🔌 Using PORT from argument: $PORT"
fi

echo "Setting up Python Virtual Environment..."

# Check if venv exists, create if not
if [ ! -d "server_fastapi/venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv server_fastapi/venv
fi

# Activate venv
source server_fastapi/venv/bin/activate

# Install dependencies
echo "Installing/Updating dependencies..."
pip install -r server_fastapi/requirements.txt

# Start Server
echo "🔥 Starting FastAPI Server..."
# Run module from project root
python3 -m server_fastapi.main
