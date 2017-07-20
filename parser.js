
/**
 *	hmdoc.Parser
 *	written by Joel Dentici
 *	on 7/19/2017
 *
 *	Parses hmdoc comments into a list of DocModules
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
 *	parse :: ((string -> any), [string]) -> any
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

		const functions = comments.slice(1).map(parseFunction).sort(funcCmp);

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

function funcCmp(f1, f2) {
	const name1 = f1.name, name2 = f2.name;

	return name1.localeCompare(name2);
}

function modCmp(m1, m2) {
	const name1 = m1.name, name2 = m2.name;

	return name1.localeCompare(name2);
}

/**
 *	parseModules :: [string] -> [DocModule]
 *
 *	Parses module source code into DocModules.
 */
function parseModules(srcs) {
	return srcs.map(x => parseModule(getDocComments(x))).filter(x => x).sort(modCmp);
}

module.exports = parseModules;