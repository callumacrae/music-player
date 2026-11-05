#!/bin/bash

echo "making install directory and cloning from git. Password required"

sudo mkdir -p /var/www/

sudo git clone https://github.com/callumacrae/music-player.git /var/www/music-player

sudo chown -R "$USER" /var/www/music-player

echo "installing node"

# Download and install nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# in lieu of restarting the shell
\. "$HOME/.nvm/nvm.sh"

# Download and install Node.js:
nvm install 24

# Verify the Node.js version:
node -v # Should print "v24.13.0".

# Verify npm version:
npm -v # Should print "11.6.2".

echo "installing node dependencies"
cd /var/www/music-player/client

npm install
npm run build

cd ../server

npm install
npm run build
