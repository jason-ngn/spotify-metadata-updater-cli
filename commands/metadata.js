const { Command } = require("commander");
const { promisify } = require("util");
const { SpotifyApi } = require("@spotify/web-api-ts-sdk");
const { clientId, clientSecret } = require("../constants");
const {
	readFiles,
	updateTags,
	process,
	success,
	error,
} = require("../functions");
const { ProgressBar } = require("@opentf/cli-pbar");
const { default: axios } = require("axios");
const { TagConstants } = require("node-id3");
const { exit } = require("process");

const wait = promisify(setTimeout);

const sdk = SpotifyApi.withClientCredentials(clientId, clientSecret);

/**
 *
 * @param {Command} program
 * @param {any[]} args
 */
module.exports = (program, args) => {
	program
		.command("metadata")
		.description("Updates metadata of MP3 files with Spotify")
		.argument("directory", "The directory that holds the MP3 files")
		.action(async (directory) => {
			console.clear();
			const { Chalk } = await import("chalk");
			const chalk = new Chalk();
			const arrayOfSongs = readFiles(directory);

			let updated = 0;
			let notUpdated = 0;
			let currentPercentage = Math.round((0 / arrayOfSongs.length) * 100);

			const multiBar = new ProgressBar({
				autoClear: true,
				size: "MEDIUM",
			});
			multiBar.start();

			const bar = multiBar.add({
				total: arrayOfSongs.length,
				value: 0,
				suffix: `0/${arrayOfSongs.length} | ${updated} Updated, ${notUpdated} Not Updated`,
			});

			multiBar.add({
				progress: false,
			});

			multiBar.add({
				progress: false,
				suffix: "Status:",
			});

			multiBar.add({
				progress: false,
			});

			// Lines
			const line1 = multiBar.add({
				progress: false,
			});
			const line2 = multiBar.add({
				progress: false,
			});
			const line3 = multiBar.add({
				progress: false,
			});
			const line4 = multiBar.add({
				progress: false,
			});

			for (let i = 0; i < arrayOfSongs.length; i++) {
				const currentNumber = i + 1;
				currentPercentage = Math.round(
					(currentNumber / arrayOfSongs.length) * 100
				);
				const song = arrayOfSongs[i];
				const songName = song.tags.title;

				bar.update({
					value: currentNumber,
					suffix: `${currentNumber}/${arrayOfSongs.length} | ${updated} Updated, ${notUpdated} Not Updated`,
				});

				line1.update({
					suffix: await process(`Searching for the thumbnail of ${songName}`),
				});

				line2.update({
					suffix: "",
				});

				line3.update({
					suffix: "",
				});

				line4.update({
					suffix: "",
				});

				if (
					song.tags.comment &&
					song.tags.comment.text &&
					song.tags.comment.text === "done"
				) {
					notUpdated++;
					bar.update({
						value: currentNumber,
						suffix: `${currentNumber}/${arrayOfSongs.length} | ${updated} Updated, ${notUpdated} Not Updated`,
					});

					line1.update({
						suffix: await success(`Cover artwork already updated, skipping.`),
					});
					continue;
				}

				const results = await sdk.search(`${songName} ${song.tags.artist}`, [
					"track",
				]);

				const filteredTracks = results.tracks.items.filter((track) => {
					const songArtists = song.tags.artist.split(", ");
					const songAlbum = song.tags.album;

					if (songAlbum !== track.album.name) return false;

					const sortedResults = track.artists.some((artist) => {
						return songArtists.includes(artist.name);
					});

					if (sortedResults === false) return false;

					return true;
				});
				const trackFound = filteredTracks[0];
				const artwork = trackFound.album
					? trackFound.album.images.find(
							(image) => image.height === 640 && image.width === 640
					  )
					: undefined;

				if (!artwork) {
					notUpdated++;

					bar.update({
						value: currentNumber,
						suffix: `${currentNumber}/${arrayOfSongs.length} | ${updated} Updated, ${notUpdated} Not Updated`,
					});

					line1.update({
						suffix: await error(`Cannot find artwork for ${songName}`),
					});
					await wait(5000);
					continue;
				}

				const albumCover = artwork.url;

				const albumArtworkBuffer = await axios.get(albumCover, {
					responseType: "arraybuffer",
				});
				const trackNumber = `${trackFound.track_number.toLocaleString(
					"vi"
				)}/${trackFound.album.total_tracks.toLocaleString("vi")}`;

				updateTags(song.audioPath, {
					title: trackFound.name,
					artist: trackFound.artists.map((a) => a.name).join(", "),
					image: {
						mime: "image/jpeg",
						type: {
							id: TagConstants.AttachedPicture.PictureType.ILLUSTRATION,
						},
						description: "Album Artwork",
						imageBuffer: Buffer.from(albumArtworkBuffer.data, "utf-8"),
					},
					album: trackFound.album.name,
					TPE2: trackFound.album.artists.map((a) => a.name).join(", "),
					comment: {
						language: "vie",
						text: "done",
					},
					trackNumber: trackNumber,
					ISRC: trackFound.external_ids.isrc,
				});
				updated++;

				bar.update({
					value: currentNumber,
					suffix: `${currentNumber}/${arrayOfSongs.length} | ${updated} Updated, ${notUpdated} Not Updated`,
				});

				line1.update({
					suffix: await success(`Found artwork of ${songName}: ${albumCover}`),
				});

				line2.update({
					suffix: await success(
						`Artists: ${trackFound.artists.map((a) => a.name).join(", ")}`
					),
				});

				line3.update({
					suffix: await success(`Album: ${trackFound.album.name}`),
				});

				line4.update({
					suffix: await success(`Updated the file`),
				});

				if (i !== arrayOfSongs.length - 1) {
					for (let j = 0; j < 10; j++) {
						const currentSec = j + 1;
						line4.update({
							suffix: await process(
								`Moving on to the next song after ${
									10 - currentSec
								}s to prevent rate limits...`
							),
						});

						await wait(1000);
					}
				}
			}

			multiBar.stop(
				await success(
					`Successfully updated lyrics for ${arrayOfSongs.length} songs`
				)
			);
			exit(1);
		});
};
