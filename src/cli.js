const { readdirSync, lstatSync } = require("fs");
const path = require("path");
const { Command } = require("commander");

function readCommands(dir, program, args) {
	const files = readdirSync(dir);

	for (const file of files) {
		const stat = lstatSync(path.join(dir, file));

		if (stat.isDirectory()) {
			readCommands(path.join(dir, file));
		} else {
			if (!file.endsWith(".js")) continue;

			const fileObject = require(path.join(dir, file));

			fileObject(program, args);
		}
	}

	program.parse();
}

module.exports = (args) => {
	const program = new Command();

	program
		.name("metadata-updater")
		.description("The CLI to update MP3 files with Spotify metadata");

	readCommands(path.join(__dirname, "../commands"), program, args);
};
