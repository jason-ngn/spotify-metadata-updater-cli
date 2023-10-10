const { Command } = require("commander");
const { default: axios } = require("axios");
const { exit } = require("process");
const {
	readFiles,
	updateTags,
	success,
	process,
	error,
} = require("../functions");
const { ProgressBar } = require("@opentf/cli-pbar");

/**
 *
 * @param {Command} program
 * @param {any[]} args
 */
module.exports = (program, args) => {
	program
		.command("lyrics")
		.description("Updates lyrics of MP3 files with Spotify")
		.argument("directory", "The directory that holds the MP3 files")
		.action(async (directory) => {
			console.clear();
			const arrayOfSongs = readFiles(directory);

			const multiBar = new ProgressBar({
				autoClear: true,
				size: "MEDIUM",
				color: "g",
				bgColor: "gr",
			});

			let found = 0;
			let notFound = 0;
			let currentPercentage = Math.round((0 / arrayOfSongs.length) * 100);

			multiBar.start();

			const bar = multiBar.add({
				total: arrayOfSongs.length,
				value: 0,
				suffix: `0/${arrayOfSongs.length} | ${found} Found, ${notFound} Not Found`,
			});

			multiBar.add({
				progress: false,
			});

			const statusBar = multiBar.add({
				progress: false,
			});

			const baseURL = "https://lrclib.net/api/search";

			for (let i = 0; i < arrayOfSongs.length; i++) {
				const currentNumber = i + 1;
				currentPercentage = Math.round(
					(currentNumber / arrayOfSongs.length) * 100
				);
				const song = arrayOfSongs[i];

				bar.update({
					value: currentNumber,
					suffix: `${currentNumber}/${arrayOfSongs.length} | ${found} Found, ${notFound} Not Found`,
				});

				statusBar.update({
					suffix: `Status: ${await process(
						`Adding lyrics to ${song.tags.title}`
					)}`,
					progress: false,
				});

				const response = await axios.get(
					`${baseURL}?q=${encodeURIComponent(
						`${song.tags.title} ${song.tags.artist}`
					)}`
				);

				const filteredResults = response.data.filter((result) => {
					if (result.trackName !== song.tags.title) return false;
					if (result.artistName !== song.tags.artist) return false;
					if (result.albumName !== song.tags.album) return false;

					return true;
				});

				if (!filteredResults.length) {
					notFound++;

					statusBar.update({
						progress: false,
						suffix: `Status: ${await error(
							`Cannot find lyrics for ${song.tags.title}`
						)}`,
					});

					continue;
				}

				const trackFound = filteredResults[0];
				if (!trackFound.plainLyrics) {
					notFound++;

					statusBar.update({
						progress: false,
						suffix: `Status: ${await error(
							`Cannot find lyrics for ${song.tags.title}`
						)}`,
					});

					continue;
				}

				updateTags(song.audioPath, {
					unsynchronisedLyrics: {
						language: "vie",
						text: trackFound.plainLyrics,
					},
				});

				found++;

				statusBar.update({
					progress: false,
					suffix: `Status: ${await success(
						`Added lyrics to ${song.tags.title}`
					)}`,
				});
			}

			multiBar.stop(
				await success(
					`Successfully updated lyrics for ${arrayOfSongs.length} songs`
				)
			);
			exit(1);
		});
};
