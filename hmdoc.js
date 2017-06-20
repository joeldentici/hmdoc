#!/usr/bin/env node

/**
 *	hmdoc
 *	written by Joel Dentici
 *	on 6/18/2017
 *
 *	Usage:
 *	
 *	<code>hmdoc "Name of Project" path/to/src/code > output.html</code>
 *
 *	or
 *
 *	<code>hmdoc "Name of Project" file.js > output.html</code>
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
 *	getDocComments :: string -> [string]
 *
 *	Extracts comments from the source code and
 *	returns a list of comments.
 */
function getDocComments(src) {
	//we need a single line for the regex matching to work
	const noNewLines = src.replace(/\n/g, '<$NEWLINE$>');

	//match doc comments, and then add back new lines
	const matches = (noNewLines.match(/\/\*\*(.*?)\*\//g) || [])
		.map(x => x.replace(/<\$NEWLINE\$>/g, '\n'));

	//remove the doc comment slashes and asterisks from each comment
	const comments = matches.map(x =>
		x.replace(/\/\*\*/g, '')
		 .replace(/\*\//g, '')
		 .replace(/ *\*\t/g, '')
		 .replace(/ *\*/g, '')
		 .trim()
	);

	return comments;
}

/**
 *	DocFunction.new :: Object -> DocFunction
 *
 *	Construct a DocFunction object. This is just
 *	convenience to fill in default values for the
 *	DocFunction, otherwise POJO would be used.
 */
class DocFunction {
	constructor({name, hmType, description}) {
		this.name = name || '';
		this.hmType = hmType || '';
		this.description = description || '';
	}
}

/**
 *	DocModule.new :: Object -> DocModule
 *
 *	Construct a DocModule object. This is just
 *	convenience to fill in default values for the
 *	DocModule, otherwise POJO would be used.
 */
class DocModule {
	constructor({name, author, date, description, functions}) {
		this.name = name || '';
		this.author = author || [];
		this.date = date || '';
		this.functions = functions || [];
		this.description = description || '';
	}
}

/**
 *	parseFunction :: string -> DocFunction
 *
 *	Parses the comment for a function and creates
 *	a DocFunction object that represents the comment.
 */
function parseFunction(comment) {
	const funcComment = comment.split("\n");

	const name = funcComment[0].substring(0,
	 funcComment[0].indexOf("::")).trim();

	const hmType = funcComment[0].substring(
	 funcComment[0].indexOf("::") + 2).trim();

	const description = funcComment.slice(1).map(x => x.trim()).join("\n");

	return new DocFunction({
		name,
		hmType,
		description
	});
}

/**
 *	parseAuthor :: string -> [string]
 *
 *	Attempts to parse the author from a line
 *	in a comment.
 */
function parseAuthor(line) {
	if (line.startsWith("written by")) {
		const authorText = line.substring("written by ".length);
		const authors = authorText.split("and").map(x => x.trim());
		return authors;
	}
	else {
		return null;
	}
}

/**
 *	parseDate :: string -> string
 *
 *	Attempts to parse the date from a line
 *	in a comment.
 */
function parseDate(line) {
	if (line.startsWith('on')) {
		const date = line.substring('on '.length);
		return date;
	}
	else {
		return null;
	}
}

/**
 *	parse :: (string -> any) -> [string] -> any
 *
 *	Attempts to parse, given a parser, the provided
 *	lines. If any are parseable with the parser, the
 *	result is returned, otherwise null is returned.
 */
function parse(parser, lines) {
	let result = null;
	let i = 0;
	while (!result && i < lines.length) {
		result = parser(lines[i++]);
	}
	return result;
}

/**
 *	parseModule :: [string] -> DocModule
 *
 *	Parses the comments into a DocModule object. This
 *	should include the module information as well as
 *	each of the parsed DocFunction comments, as DocFunctions.
 */
function parseModule(comments) {
	try {
		const modComment = comments[0].split("\n");

		const name = modComment[0];
		const author = parse(parseAuthor, modComment);
		const date = parse(parseDate, modComment);
		const description = modComment.slice(3).join('\n').trim();

		const functions = comments.slice(1).map(parseFunction);

		return new DocModule({
			name,
			author,
			date,
			functions,
			description
		});		
	}
	catch (e) { return null; }
}

/**
 *	parseModules :: [string] -> [DocModule]
 *
 *	Parses module source code into DocModules.
 */
function parseModules(srcs) {
	return srcs.map(x => parseModule(getDocComments(x))).filter(x => x);
}

/**
 *	prettyHmType :: string -> string
 *
 *	Replaces the ascii arrows used in the HM type signatures
 *	with unicode arrows that look nicer.
 */
function prettyHmType(hmType) {
	return hmType.replace(/->/g, '&#8594;').replace(/=>/g, '&#8658;');
}

/**
 *	generateFunctionSynopsis :: DocModule -> DocFunction -> HTML
 *
 *	Generates a list item containing a link to the DocFunction description
 *	for a DocFunction.
 */
function generateFunctionSynopsis(module) {
	return function(fn) {
		return `
			<li>
				<a href="#doc.module.${module.name}.func.${fn.name}">
					<b>${fn.name}</b>
				</a> <b>::</b> ${prettyHmType(fn.hmType)}
			</li>
		`;
	}
}

/**
 *	generateModuleSynopsis :: DocModule -> HTML
 *
 *	Generates a component giving a link to the DocModule description
 *	that contains a list of links to DocFunction descriptions.
 */
function generateModuleSynopsis(module) {
	return `
		<div class="module-header">
			<div class="module-name">
			Module: <a href="#doc.module.${module.name}">${module.name}</a>
			</div>
			<ul class="module-functions">
				${module.functions.map(generateFunctionSynopsis(module)).join('')}
			</ul>
		</div>
	`;
}

/**
 *	generateFunctionDescription :: DocModule -> DocFunction -> HTML
 *
 *	Generates a component describing the information contained in the
 *	DocFunction object.
 */
function generateFunctionDescription(module) {
	return function(fn) {
		return `
			<div class="function-description"
			id="doc.module.${module.name}.func.${fn.name}">
				<div class="function-name">
					<b>${fn.name}</b> <b>::</b> ${prettyHmType(fn.hmType)}
				</div>
				<div class="function-desc">
					${fn.description.replace(/\n\n/g, "<br><br>")}
				</div>
			</div>
		`;
	}
}

/**
 *	generateModuleDescription :: DocModule -> HTML
 *
 *	Generates a component describing the information contained in
 *	the DocModule object. This includes subcomponents for each of
 *	the DocFunctions in the DocModule.
 */
function generateModuleDescription(module) {
	return `
		<div class="module-description" id="doc.module.${module.name}">
			<div class="module-name">
				Module: ${module.name}
			</div>
			<div class="module-author">
			<b>Written By:</b> ${module.author.join(' and ')}
			</div>
			<div class="module-date">
			<b>Written On:</b> ${module.date}
			</div>
			<div class="module-desc">
			${module.description.replace(/\n\n/g, "<br><br>")}
			</div>
			<div class="module-functions">
				${module.functions.map(generateFunctionDescription(module)).join('')}
			</div>
		</div>
	`;
}

/**
 *	generateSynopsis :: [DocModule] -> HTML
 *
 *	Generates a synopsis for each DocModule and concatenates
 *	the resulting HTML.
 */
function generateSynopsis(modules) {
	return modules.map(generateModuleSynopsis).join('');
}

/**
 *	generateDescription :: [DocModule] -> HTML
 *
 *	Generates a description for each DocModule and concatenates
 *	the resulting HTML.
 */
function generateDescription(modules) {
	return modules.map(generateModuleDescription).join('');
}

/**
 *	generateDocumentation :: string -> [DocModule] -> HTML
 *
 *	Generates the output documentation for a project, which
 *	consists of a project name and a set of modules.
 */
function generateDocumentation(projectName, modules) {
	const syn = generateSynopsis(modules);
	const des = generateDescription(modules);
	const date = new Date().toLocaleString();
	return `
	<html>
		<head>
			<title>${projectName} Documentation</title>
			<style>
				.module-header, .module-description {
					background-color: #EFEFEF;
				}

				.function-description {
					background-color: #DDD;
				}

				.module-header {
					border: 1px solid;
					border-radius: 5px;
					padding: 10px;
					margin: 10px 0 10px 0;
				}
				.module-name {
					font-weight: bold;
				}
				.module-description .module-name {
					font-size: 120%;
				}
				ul.module-functions {
					list-style: none;
				}
				.module-description {
					border: 1px solid;
					border-radius: 5px;
					padding: 10px;
					margin: 10px 0 10px 0;
				}
				.module-name, .module-author,
				.module-date {
					margin: 2px 0 2px 0;
				}
				.module-desc {
					margin: 10px 0 10px 20px;
				}

				.function-description {
					backgound-color: #EFEFEF;
					border: 1px dotted;
					border-radius: 5px;
					padding: 10px;
					margin: 5px 0 5px 0;
				}

				.function-desc {
					margin: 5px 0 5px 20px;
				}

				a:visited {
					color: #00F
				}

				a {
					text-decoration: none;
					border-bottom: 1px solid transparent;
					transition: all ease-in-out 0.5s;
				}

				a:hover {
					text-decoration: none;
					border-color: #00F;
				}

				.top-scroll {
					position: fixed;
					bottom: 0;
					right: 10px;
					font-weight: bold;
					font-size: 180%;
					border: 1px solid;
					border-radius: 5px;
					padding: 10px 20px;
					background-color: #EFEFEF;
					opacity: 0.8;
					cursor: pointer;
				}
			</style>
			<script type="text/javascript">
				window.onload = function() {
					var links = document.querySelectorAll('a');
					links.forEach(link => link.addEventListener('click', function(e) {
						e.preventDefault();
						var elm = this.href.substring(this.href.indexOf('#') + 1);
						scrollToItemId(elm, 2);
					}));

					document.querySelector('.top-scroll').addEventListener('click', function() {
						scrollToItemId('top', 2);
					});

					window.onscroll();
				}

				window.onscroll = function() {
					document.querySelector('.top-scroll').style.visibility = 
						document.body.scrollTop > 100 ? 'visible' : 'hidden';
				}

				function scrollToItemId(scrollToId, scrollTime) {
					scrollTime *= 1000;
			        var item = document.getElementById(scrollToId);

			        var from = document.body.scrollTop;
			        var to = item.offsetTop;

			        var startTime = Date.now();

				    function ease(k) {
				    	return 0.5 * (1 - Math.cos(Math.PI * k));
				    }

			        (function scroll() {
			        	var elapsed = (Date.now() - startTime) / scrollTime;
			        	if (elapsed > 1)
			        		elapsed = 1;
			        	var change = ease(elapsed);
			        	var currentPos = from + (to - from) * change;

			            document.body.scrollTop = currentPos;
			            if (currentPos !== to) {
			                requestAnimationFrame(scroll);
			            }
			            else {
			            	window.location.hash = '#' + scrollToId;
			            }
			        })();
			    }
			</script>
		</head>
		<body>
			<div class="project-header" id="top">
			<h1>${projectName} Documentation</h1>
			</div>
			<div class="project-synopsis">
			<h2>Module List</h2>
			${syn}
			</div>
			<div class="project-description">
			<h2>Module Description</h2>
			${des}
			</div>

			<div class="top-scroll">
					<a href="#top">&#8593;</a>
			</div>

			<div class="footer">
			This documentation was generated by <code>hmdoc</code> on <code>${date}</code>
			</div>
		</body>
	</html>
	`;
}

/**
 *	generateDocumentationFromSource :: string -> [string] -> HTML
 *
 *	Generates the output documentation for a project. This takes
 *	the source code of the modules to parse and parses them as well
 *	before generating the documentation.
 */
function generateDocumentationFromSource(projectName, srcs) {
	return generateDocumentation(projectName, parseModules(srcs));
}


const fs = require('fs');
const path = require('path');

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

/**
 *	generateDocumentationFromDirectory :: string -> string -> HTML
 *
 *	Generates the documentation for a project. Takes the project name
 *	and project directory. Each source file from the directory and subdirectories
 *	is read and documentation comments are parsed from them. Then, output for
 *	each module is generated and combined to produce the resulting HTML documentation.
 *
 *	NOTE: Rather than passing the path to a directory, the path to a single file
 *	can also be used (it must be a JavaScript file of course).
 */
function generateDocumentationFromDirectory(projectName, dir) {
	const srcs = readFiles(dir);
	return generateDocumentationFromSource(projectName, srcs);
}

//get the project name and directory from command line arguments
const [_, __, name, dir] = process.argv;
//read source code, parse comments, generate output HTML and then print it to stdout
console.log(generateDocumentationFromDirectory(name, dir));