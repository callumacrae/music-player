# RFID Music Player

This project is designed to run on a [Raspberry Pi Zero](https://www.raspberrypi.com/products/raspberry-pi-zero/), a full bill of materials will be assembled in the near future. In short, you will need:

- Raspi Zero
- RFID reader (the pepper C1 USB model is what is being tested against - compatibility with other devices will need to be set up as a future feature)
- Raspberry Pi Zero USB hat (required to allow the pi to receive USB input)
- RFID tags

## Project structure

The project comprises of a client web app that resides in the `/client` folder, and a node application that communicates via serial with the reader, which is located in the `/server` folder.

## Running the project in development mode

- set up the target device with the RFID reader connected via USB
- run `npm install` in both the client and server directories.
- open two terminal sessions
- in one, navigate to the `/server` directory and run `npm build` (on first run), followed by `npm start`
- in the other, navigate to the `/client` directory and run `npm run dev`
- navigate to `http://localhost:3000/rfid-debug` to see the status of the reader integration
