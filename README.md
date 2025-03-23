# pomo.dor.o
A simple, open source Chrome extension for a Pomodoro time manager.

## Features

- Clean, minimal interface
- Create and manage up to 100 tasks
- Customize time duration for each task
- Visual and audio alerts when timer completes
- Pause, resume, and cancel functionality
- Task persistence between browser sessions

### Manual Installation (Developer Mode)

1. Download or clone this repository
2. In the directory, use the `build.sh` script to build the extension
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the downloaded folder and use the content within the `dist` folder
5. The extension should now be installed and available in your toolbar

## Usage

1. Click the pmo.dor.o icon in your browser toolbar to open the timer
2. Click the "..." menu button to access task management
3. Add tasks with custom durations using the task form
4. Select a task to start working on
5. Use the pause/resume button to control the timer
6. When the timer completes, you'll hear a chime and see visual alerts
7. Tasks are saved automatically between sessions

## Project Structure

```
POMO.Dor.0
├── dist                 # The dist folder where the extension is built
├── manifest.json        # Extension configuration
├── popup.html           # Main timer interface
├── popup.js             # Timer functionality
├── styles.css           # Styling for the extension
├── background.js        # Background service worker
├── landing.html         # Landing page
├── landing.js           # Landing page functionality
├── build.sh             # Script to build the extension
├── images/              # Icons and images
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── sounds/              # Audio files
    └── chime.mp3        # Timer completion sound
```
## Future Goals

1. Add an edit stored task feature.
2. Send data to my Google Calendar
3. Send data to Google Sheets for tracking personal efforts.
4. Add some AI, somewhere...


## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Acknowledgements

- Inspired by the Pomodoro Technique by Francesco Cirillo
- Built with vanilla JavaScript, HTML, and CSS
