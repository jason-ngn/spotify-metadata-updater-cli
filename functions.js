const { readdirSync, lstatSync } = require("fs");
const NodeID3 = require("node-id3");
const path = require("path");

/**
 *
 * @param {string} dir
 */
const readTags = (dir) => {
	const tags = NodeID3.read(dir);

	return tags;
};

/**
 *
 * @param {string} dir
 * @param {NodeID3.Tags} tags
 */
const updateTags = (dir, tags) => {
	const res = NodeID3.update(tags, dir);

	if (res instanceof Error) {
		return false;
	} else {
		return true;
	}
};

/**
 *
 * @param {string} dir
 * @returns {{ audioPath: string; tags: NodeID3.Tags }[]}
 */
const readFiles = (dir) => {
	const songs = [];

	const readSongs = (dir) => {
		const files = readdirSync(dir);

		for (const file of files) {
			const stat = lstatSync(path.join(dir, file));

			if (stat.isDirectory()) {
				readSongs(path.join(dir, file));
			} else {
				if (file === ".DS_Store") continue;
				if (!file.endsWith(".mp3")) continue;

				const tags = readTags(path.join(dir, file));
				songs.push({
					audioPath: path.join(dir, file),
					tags,
				});
			}
		}
	};

	readSongs(dir);

	return songs;
};

const success = async (text) => {
	const { Chalk } = await import("chalk");
	const chalk = new Chalk();
	return chalk.green(`${chalk.bold("[SUCCESS]")} ${text}`);
};

const process = async (text) => {
	const { Chalk } = await import("chalk");
	const chalk = new Chalk();
	return chalk.yellow(`${chalk.bold("[PROCESS]")} ${text}`);
};

const error = async (text) => {
	const { Chalk } = await import("chalk");
	const chalk = new Chalk();
	return chalk.red(`${chalk.bold("[ERROR]")} ${text}`);
};

module.exports.readTags = readTags;
module.exports.updateTags = updateTags;
module.exports.readFiles = readFiles;
module.exports.success = success;
module.exports.process = process;
module.exports.error = error;
