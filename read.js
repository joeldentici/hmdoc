const fs = require('fs');
const path = require('path');

/**
 *	hmdoc.Read
 *	written by Joel Dentici
 *	on 7/19/2017
 *
 *	Reads the source of each JavaScript file in
 *	a directory (recursively).
 */

/**
 *	concat :: [[a]] -> [a]
 *
 *	Flattens a nested list by one level.
 */
function concat(arr) {
	return [].concat(...arr);
}

/**
 *	readFiles :: string -> [string]
 *
 *	Reads all the files in a directory into a list,
 *	recursively reading each subdirectory that is found.
 */
function readFiles(dir) {
	//special case to make sure we can handle
	//a single file rather than directory
	if (fs.statSync(dir).isFile()) {
		if (dir.endsWith('.js'))
			return [fs.readFileSync(dir).toString()];
		else {
			console.error('Expected JS file');
			process.exit(1);
		}
	}

	const fileNames = fs.readdirSync(dir).map(x => path.join(dir, x));
	const fileStats = fileNames.map(x => [x, fs.statSync(x)]);

	const files = fileStats
		.filter(([n,stats]) => stats.isFile())
		.map(([n, stats]) => n)
		.filter(n => !n.startsWith('.') && n.endsWith('.js'));

	const dirs = fileStats
		.filter(([n,stats]) => !stats.isFile())
		.map(([n, stats]) => n);

	const subDirFiles = concat(dirs.map(readFiles));

	const dirFiles = files.map(x => fs.readFileSync(x).toString());

	return dirFiles.concat(subDirFiles);
}

module.exports = readFiles;