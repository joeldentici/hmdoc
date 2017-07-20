
/**
 *	hmdoc.Markdown
 *	written by Joel Dentici
 *	on 7/19/2017
 *
 *	Markdown documentation generator
 */

function prettyHmType(hmType) {
	return hmType.replace(/->/g, '&#8594;').replace(/=>/g, '&#8658;');
}

function modLink(name) {
	return name
		.replace(/\s/g, '-')
		.replace(/\./g, '-')
		.toLowerCase();
}

function generateModuleSynopsis(module) {
	const link = modLink(module.name);

	return `* [${module.name}](#${link})`;
}

function generateFunctionDescription(fn) {
	const typeSig = prettyHmType(fn.hmType);

	return `
#### ${fn.name} :: ${typeSig}
${fn.description}
`.trim();
}

function getAuthors(authors) {
	if (authors.length > 1) {
		return authors.slice(0, -1).join(', ') 
			+ ', and ' 
			+ authors.slice(-1)[0];
	}
	else {
		return authors[0];
	}
}

function generateModuleDescription(module) {
	const anchor = `<a name="${modLink(module.name)}"></a>`

	const authors = getAuthors(module.author);

	const functions = module.functions
		.map(generateFunctionDescription).join('\n');

	return `
## ${module.name}
${anchor}
**Written By:** ${authors}

**Written On:** ${module.date}

${module.description}
${functions}
	`.trim();
}

function generateSynopsis(modules) {
	const list = modules.map(generateModuleSynopsis).join('\n');

	return `
## Modules:
Click a module name below to see its documentation

${list}`.trim();

}

function generateDescription(modules) {
	return modules.map(generateModuleDescription).join('\n');
}

function generateMarkdown(projectName, modules) {
	const synopsis = generateSynopsis(modules);
	const description = generateDescription(modules);

	return `
# ${projectName} Documentation

${synopsis}
${description}`.trim();

}

module.exports = generateMarkdown;