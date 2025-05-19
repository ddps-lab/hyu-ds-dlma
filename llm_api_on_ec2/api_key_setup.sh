#!/bin/bash

# Prompt the user for their API key
read -p "Enter your Google API Key: " user_api_key

# Check if the API key was entered
if [ -z "$user_api_key" ]; then
  echo "No API key entered. Exiting."
  exit 1
fi

echo "Replacing 'GOOGLE_API_KEY' with your key in all .py files..."

# Find all .py files in the current directory and its subdirectories
# and replace the placeholder with the user's API key.
# This uses find and sed.

find . -type f -name "*.py" -exec sed -i "s/GOOGLE_API_KEY/$user_api_key/g" {} +

echo "Replacement complete."



