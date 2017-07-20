/**
 *	hmdoc.HTML
 *	written by Joel Dentici
 *	on 7/19/2017
 *
 *	HTML documentation generator.
 */

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
 *	generateDocumentation :: (string, [DocModule]) -> string
 *
 *	Generates the output documentation for a project, which
 *	consists of a project name and a set of modules.
 */
function generateHTMLDocumentation(projectName, modules) {
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

module.exports = generateHTMLDocumentation;