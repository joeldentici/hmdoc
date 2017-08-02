#!/usr/bin/env node
const readFiles = require('./read.js');
const parseModules = require('./parser.js');
const generateHTML = require('./html.js');
const generateMD = require('./markdown.js');

/**
 *	hmdoc
 *	written by Joel Dentici
 *	on 6/18/2017
 *
 *	Usage:
 *	
 *	<code>hmdoc "Name of Project" path/to/src/code [output-type] [...extensions] > output.html</code>
 *
 *	or
 *
 *	<code>hmdoc "Name of Project" file [output-type] [...extensions] > output.html</code>
 *
 *	Generates documentation for JavaScript modules
 *	using JavaDoc style comments, but with HM type signatures
 *	rather than JavaDoc parameters. This is useful for applications/libraries
 *	written in a functional style.
 *
 *	This will also work with object oriented programs using the
 *	class keyword, as long as one class is used per module (file).
 */


/**
 *	makeDocs :: ((string, [DocModule]) -> string, string, string) -> string
 *
 *	Generates the documentation for a project. Takes the project name
 *	and project directory. Each source file from the directory and subdirectories
 *	is read and documentation comments are parsed from them. Then, output for
 *	each module is generated and combined to produce the resulting HTML documentation.
 *
 *	NOTE: Rather than passing the path to a directory, the path to a single file
 *	can also be used (it must be a JavaScript file of course).
 */
function makeDocs(generator, projectName, dir, exts) {
	//[string]
	const srcs = readFiles(dir, new Set(exts));
	//[DocModule]
	const modules = parseModules(srcs);
	//string
	return generate(projectName, modules);
}

const generators = {
	html: generateHTML,
	markdown: generateMD,
};

//get the project name and directory from command line arguments
const [_, __, name, dir, genName] = process.argv;

const generate = generators[genName || 'html'];
const exts = ['.js'].concat(process.argv.slice(5));

//read source code, parse comments, generate output and then print it to stdout
console.log(makeDocs(generate, name, dir, exts));