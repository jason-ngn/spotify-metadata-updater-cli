# spotify-metadata-updater-cli

A CLI to update MP3 files' metadata using Spotify API.

## Table of contents

- [Installation](#installation)
- [Usage](#usage)
  - [Metadata Updater](#metadata-updater)
  - [Lyrics Updater](#lyrics-updater)
- [Contributing](#contributing)
- [Credits](#credits)
- [License](#license)

## Installation

Paste this command and run in your command line.

```bash
npm install spotify-metadata-updater-cli
```

## Usage

### Metadata Updater

Specify a folder that contains all of the MP3 files to the CLI.

```bash
metadata-updater metadata <folder>
```

You can also update just one MP3 file.

```bash
metadata-updater metadata <path/to/file.mp3>
```

### Lyrics Updater

Specify a folder that contains all of the MP3 files to the CLI.

```bash
metadata-updater lyrics <folder>
```

You can also get the lyrics of just one MP3 file.

```bash
metadata-updater lyrics <path/to/file.mp3>
```

## Contributing

Pull requests are welcome. For issues, please open an issue first to discuss. For changes, please also open an issue to discuss about changes you would like to make.

Please also update tests as appropriate.

## Credits

[jason-ngn](https://github.com/jason-ngn)

## License

[MIT](https://choosealicense.com/licenses/mit/)
