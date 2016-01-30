(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

/* **********************************************
     Begin prism-core.js
********************************************** */

var _self = typeof window !== 'undefined' ? window // if in browser
: typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope ? self // if in worker
: {} // if in node js
;

/**
 * Prism: Lightweight, robust, elegant syntax highlighting
 * MIT license http://www.opensource.org/licenses/mit-license.php/
 * @author Lea Verou http://lea.verou.me
 */

var Prism = function () {

	// Private helper vars
	var lang = /\blang(?:uage)?-(?!\*)(\w+)\b/i;

	var _ = _self.Prism = {
		util: {
			encode: function encode(tokens) {
				if (tokens instanceof Token) {
					return new Token(tokens.type, _.util.encode(tokens.content), tokens.alias);
				} else if (_.util.type(tokens) === 'Array') {
					return tokens.map(_.util.encode);
				} else {
					return tokens.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\u00a0/g, ' ');
				}
			},

			type: function type(o) {
				return Object.prototype.toString.call(o).match(/\[object (\w+)\]/)[1];
			},

			// Deep clone a language definition (e.g. to extend it)
			clone: function clone(o) {
				var type = _.util.type(o);

				switch (type) {
					case 'Object':
						var clone = {};

						for (var key in o) {
							if (o.hasOwnProperty(key)) {
								clone[key] = _.util.clone(o[key]);
							}
						}

						return clone;

					case 'Array':
						// Check for existence for IE8
						return o.map && o.map(function (v) {
							return _.util.clone(v);
						});
				}

				return o;
			}
		},

		languages: {
			extend: function extend(id, redef) {
				var lang = _.util.clone(_.languages[id]);

				for (var key in redef) {
					lang[key] = redef[key];
				}

				return lang;
			},

			/**
    * Insert a token before another token in a language literal
    * As this needs to recreate the object (we cannot actually insert before keys in object literals),
    * we cannot just provide an object, we need anobject and a key.
    * @param inside The key (or language id) of the parent
    * @param before The key to insert before. If not provided, the function appends instead.
    * @param insert Object with the key/value pairs to insert
    * @param root The object that contains `inside`. If equal to Prism.languages, it can be omitted.
    */
			insertBefore: function insertBefore(inside, before, insert, root) {
				root = root || _.languages;
				var grammar = root[inside];

				if (arguments.length == 2) {
					insert = arguments[1];

					for (var newToken in insert) {
						if (insert.hasOwnProperty(newToken)) {
							grammar[newToken] = insert[newToken];
						}
					}

					return grammar;
				}

				var ret = {};

				for (var token in grammar) {

					if (grammar.hasOwnProperty(token)) {

						if (token == before) {

							for (var newToken in insert) {

								if (insert.hasOwnProperty(newToken)) {
									ret[newToken] = insert[newToken];
								}
							}
						}

						ret[token] = grammar[token];
					}
				}

				// Update references in other language definitions
				_.languages.DFS(_.languages, function (key, value) {
					if (value === root[inside] && key != inside) {
						this[key] = ret;
					}
				});

				return root[inside] = ret;
			},

			// Traverse a language definition with Depth First Search
			DFS: function DFS(o, callback, type) {
				for (var i in o) {
					if (o.hasOwnProperty(i)) {
						callback.call(o, i, o[i], type || i);

						if (_.util.type(o[i]) === 'Object') {
							_.languages.DFS(o[i], callback);
						} else if (_.util.type(o[i]) === 'Array') {
							_.languages.DFS(o[i], callback, i);
						}
					}
				}
			}
		},
		plugins: {},

		highlightAll: function highlightAll(async, callback) {
			var elements = document.querySelectorAll('code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code');

			for (var i = 0, element; element = elements[i++];) {
				_.highlightElement(element, async === true, callback);
			}
		},

		highlightElement: function highlightElement(element, async, callback) {
			// Find language
			var language,
			    grammar,
			    parent = element;

			while (parent && !lang.test(parent.className)) {
				parent = parent.parentNode;
			}

			if (parent) {
				language = (parent.className.match(lang) || [, ''])[1];
				grammar = _.languages[language];
			}

			// Set language on the element, if not present
			element.className = element.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;

			// Set language on the parent, for styling
			parent = element.parentNode;

			if (/pre/i.test(parent.nodeName)) {
				parent.className = parent.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;
			}

			var code = element.textContent;

			var env = {
				element: element,
				language: language,
				grammar: grammar,
				code: code
			};

			if (!code || !grammar) {
				_.hooks.run('complete', env);
				return;
			}

			_.hooks.run('before-highlight', env);

			if (async && _self.Worker) {
				var worker = new Worker(_.filename);

				worker.onmessage = function (evt) {
					env.highlightedCode = evt.data;

					_.hooks.run('before-insert', env);

					env.element.innerHTML = env.highlightedCode;

					callback && callback.call(env.element);
					_.hooks.run('after-highlight', env);
					_.hooks.run('complete', env);
				};

				worker.postMessage(JSON.stringify({
					language: env.language,
					code: env.code,
					immediateClose: true
				}));
			} else {
				env.highlightedCode = _.highlight(env.code, env.grammar, env.language);

				_.hooks.run('before-insert', env);

				env.element.innerHTML = env.highlightedCode;

				callback && callback.call(element);

				_.hooks.run('after-highlight', env);
				_.hooks.run('complete', env);
			}
		},

		highlight: function highlight(text, grammar, language) {
			var tokens = _.tokenize(text, grammar);
			return Token.stringify(_.util.encode(tokens), language);
		},

		tokenize: function tokenize(text, grammar, language) {
			var Token = _.Token;

			var strarr = [text];

			var rest = grammar.rest;

			if (rest) {
				for (var token in rest) {
					grammar[token] = rest[token];
				}

				delete grammar.rest;
			}

			tokenloop: for (var token in grammar) {
				if (!grammar.hasOwnProperty(token) || !grammar[token]) {
					continue;
				}

				var patterns = grammar[token];
				patterns = _.util.type(patterns) === "Array" ? patterns : [patterns];

				for (var j = 0; j < patterns.length; ++j) {
					var pattern = patterns[j],
					    inside = pattern.inside,
					    lookbehind = !!pattern.lookbehind,
					    lookbehindLength = 0,
					    alias = pattern.alias;

					pattern = pattern.pattern || pattern;

					for (var i = 0; i < strarr.length; i++) {
						// Don’t cache length as it changes during the loop

						var str = strarr[i];

						if (strarr.length > text.length) {
							// Something went terribly wrong, ABORT, ABORT!
							break tokenloop;
						}

						if (str instanceof Token) {
							continue;
						}

						pattern.lastIndex = 0;

						var match = pattern.exec(str);

						if (match) {
							if (lookbehind) {
								lookbehindLength = match[1].length;
							}

							var from = match.index - 1 + lookbehindLength,
							    match = match[0].slice(lookbehindLength),
							    len = match.length,
							    to = from + len,
							    before = str.slice(0, from + 1),
							    after = str.slice(to + 1);

							var args = [i, 1];

							if (before) {
								args.push(before);
							}

							var wrapped = new Token(token, inside ? _.tokenize(match, inside) : match, alias);

							args.push(wrapped);

							if (after) {
								args.push(after);
							}

							Array.prototype.splice.apply(strarr, args);
						}
					}
				}
			}

			return strarr;
		},

		hooks: {
			all: {},

			add: function add(name, callback) {
				var hooks = _.hooks.all;

				hooks[name] = hooks[name] || [];

				hooks[name].push(callback);
			},

			run: function run(name, env) {
				var callbacks = _.hooks.all[name];

				if (!callbacks || !callbacks.length) {
					return;
				}

				for (var i = 0, callback; callback = callbacks[i++];) {
					callback(env);
				}
			}
		}
	};

	var Token = _.Token = function (type, content, alias) {
		this.type = type;
		this.content = content;
		this.alias = alias;
	};

	Token.stringify = function (o, language, parent) {
		if (typeof o == 'string') {
			return o;
		}

		if (_.util.type(o) === 'Array') {
			return o.map(function (element) {
				return Token.stringify(element, language, o);
			}).join('');
		}

		var env = {
			type: o.type,
			content: Token.stringify(o.content, language, parent),
			tag: 'span',
			classes: ['token', o.type],
			attributes: {},
			language: language,
			parent: parent
		};

		if (env.type == 'comment') {
			env.attributes['spellcheck'] = 'true';
		}

		if (o.alias) {
			var aliases = _.util.type(o.alias) === 'Array' ? o.alias : [o.alias];
			Array.prototype.push.apply(env.classes, aliases);
		}

		_.hooks.run('wrap', env);

		var attributes = '';

		for (var name in env.attributes) {
			attributes += (attributes ? ' ' : '') + name + '="' + (env.attributes[name] || '') + '"';
		}

		return '<' + env.tag + ' class="' + env.classes.join(' ') + '" ' + attributes + '>' + env.content + '</' + env.tag + '>';
	};

	if (!_self.document) {
		if (!_self.addEventListener) {
			// in Node.js
			return _self.Prism;
		}
		// In worker
		_self.addEventListener('message', function (evt) {
			var message = JSON.parse(evt.data),
			    lang = message.language,
			    code = message.code,
			    immediateClose = message.immediateClose;

			_self.postMessage(_.highlight(code, _.languages[lang], lang));
			if (immediateClose) {
				_self.close();
			}
		}, false);

		return _self.Prism;
	}

	// Get current script and highlight
	var script = document.getElementsByTagName('script');

	script = script[script.length - 1];

	if (script) {
		_.filename = script.src;

		if (document.addEventListener && !script.hasAttribute('data-manual')) {
			document.addEventListener('DOMContentLoaded', _.highlightAll);
		}
	}

	return _self.Prism;
}();

if (typeof module !== 'undefined' && module.exports) {
	module.exports = Prism;
}

// hack for components to work correctly in node.js
if (typeof global !== 'undefined') {
	global.Prism = Prism;
}

/* **********************************************
     Begin prism-markup.js
********************************************** */

Prism.languages.markup = {
	'comment': /<!--[\w\W]*?-->/,
	'prolog': /<\?[\w\W]+?\?>/,
	'doctype': /<!DOCTYPE[\w\W]+?>/,
	'cdata': /<!\[CDATA\[[\w\W]*?]]>/i,
	'tag': {
		pattern: /<\/?(?!\d)[^\s>\/=.$<]+(?:\s+[^\s>\/=]+(?:=(?:("|')(?:\\\1|\\?(?!\1)[\w\W])*\1|[^\s'">=]+))?)*\s*\/?>/i,
		inside: {
			'tag': {
				pattern: /^<\/?[^\s>\/]+/i,
				inside: {
					'punctuation': /^<\/?/,
					'namespace': /^[^\s>\/:]+:/
				}
			},
			'attr-value': {
				pattern: /=(?:('|")[\w\W]*?(\1)|[^\s>]+)/i,
				inside: {
					'punctuation': /[=>"']/
				}
			},
			'punctuation': /\/?>/,
			'attr-name': {
				pattern: /[^\s>\/]+/,
				inside: {
					'namespace': /^[^\s>\/:]+:/
				}
			}

		}
	},
	'entity': /&#?[\da-z]{1,8};/i
};

// Plugin to make entity title show the real entity, idea by Roman Komarov
Prism.hooks.add('wrap', function (env) {

	if (env.type === 'entity') {
		env.attributes['title'] = env.content.replace(/&amp;/, '&');
	}
});

Prism.languages.xml = Prism.languages.markup;
Prism.languages.html = Prism.languages.markup;
Prism.languages.mathml = Prism.languages.markup;
Prism.languages.svg = Prism.languages.markup;

/* **********************************************
     Begin prism-css.js
********************************************** */

Prism.languages.css = {
	'comment': /\/\*[\w\W]*?\*\//,
	'atrule': {
		pattern: /@[\w-]+?.*?(;|(?=\s*\{))/i,
		inside: {
			'rule': /@[\w-]+/
			// See rest below
		}
	},
	'url': /url\((?:(["'])(\\(?:\r\n|[\w\W])|(?!\1)[^\\\r\n])*\1|.*?)\)/i,
	'selector': /[^\{\}\s][^\{\};]*?(?=\s*\{)/,
	'string': /("|')(\\(?:\r\n|[\w\W])|(?!\1)[^\\\r\n])*\1/,
	'property': /(\b|\B)[\w-]+(?=\s*:)/i,
	'important': /\B!important\b/i,
	'function': /[-a-z0-9]+(?=\()/i,
	'punctuation': /[(){};:]/
};

Prism.languages.css['atrule'].inside.rest = Prism.util.clone(Prism.languages.css);

if (Prism.languages.markup) {
	Prism.languages.insertBefore('markup', 'tag', {
		'style': {
			pattern: /(<style[\w\W]*?>)[\w\W]*?(?=<\/style>)/i,
			lookbehind: true,
			inside: Prism.languages.css,
			alias: 'language-css'
		}
	});

	Prism.languages.insertBefore('inside', 'attr-value', {
		'style-attr': {
			pattern: /\s*style=("|').*?\1/i,
			inside: {
				'attr-name': {
					pattern: /^\s*style/i,
					inside: Prism.languages.markup.tag.inside
				},
				'punctuation': /^\s*=\s*['"]|['"]\s*$/,
				'attr-value': {
					pattern: /.+/i,
					inside: Prism.languages.css
				}
			},
			alias: 'language-css'
		}
	}, Prism.languages.markup.tag);
}

/* **********************************************
     Begin prism-clike.js
********************************************** */

Prism.languages.clike = {
	'comment': [{
		pattern: /(^|[^\\])\/\*[\w\W]*?\*\//,
		lookbehind: true
	}, {
		pattern: /(^|[^\\:])\/\/.*/,
		lookbehind: true
	}],
	'string': /(["'])(\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
	'class-name': {
		pattern: /((?:\b(?:class|interface|extends|implements|trait|instanceof|new)\s+)|(?:catch\s+\())[a-z0-9_\.\\]+/i,
		lookbehind: true,
		inside: {
			punctuation: /(\.|\\)/
		}
	},
	'keyword': /\b(if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/,
	'boolean': /\b(true|false)\b/,
	'function': /[a-z0-9_]+(?=\()/i,
	'number': /\b-?(?:0x[\da-f]+|\d*\.?\d+(?:e[+-]?\d+)?)\b/i,
	'operator': /--?|\+\+?|!=?=?|<=?|>=?|==?=?|&&?|\|\|?|\?|\*|\/|~|\^|%/,
	'punctuation': /[{}[\];(),.:]/
};

/* **********************************************
     Begin prism-javascript.js
********************************************** */

Prism.languages.javascript = Prism.languages.extend('clike', {
	'keyword': /\b(as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|var|void|while|with|yield)\b/,
	'number': /\b-?(0x[\dA-Fa-f]+|0b[01]+|0o[0-7]+|\d*\.?\d+([Ee][+-]?\d+)?|NaN|Infinity)\b/,
	// Allow for all non-ASCII characters (See http://stackoverflow.com/a/2008444)
	'function': /[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*(?=\()/i
});

Prism.languages.insertBefore('javascript', 'keyword', {
	'regex': {
		pattern: /(^|[^/])\/(?!\/)(\[.+?]|\\.|[^/\\\r\n])+\/[gimyu]{0,5}(?=\s*($|[\r\n,.;})]))/,
		lookbehind: true
	}
});

Prism.languages.insertBefore('javascript', 'class-name', {
	'template-string': {
		pattern: /`(?:\\`|\\?[^`])*`/,
		inside: {
			'interpolation': {
				pattern: /\$\{[^}]+\}/,
				inside: {
					'interpolation-punctuation': {
						pattern: /^\$\{|\}$/,
						alias: 'punctuation'
					},
					rest: Prism.languages.javascript
				}
			},
			'string': /[\s\S]+/
		}
	}
});

if (Prism.languages.markup) {
	Prism.languages.insertBefore('markup', 'tag', {
		'script': {
			pattern: /(<script[\w\W]*?>)[\w\W]*?(?=<\/script>)/i,
			lookbehind: true,
			inside: Prism.languages.javascript,
			alias: 'language-javascript'
		}
	});
}

Prism.languages.js = Prism.languages.javascript;

/* **********************************************
     Begin prism-file-highlight.js
********************************************** */

(function () {
	if (typeof self === 'undefined' || !self.Prism || !self.document || !document.querySelector) {
		return;
	}

	self.Prism.fileHighlight = function () {

		var Extensions = {
			'js': 'javascript',
			'html': 'markup',
			'svg': 'markup',
			'xml': 'markup',
			'py': 'python',
			'rb': 'ruby',
			'ps1': 'powershell',
			'psm1': 'powershell'
		};

		if (Array.prototype.forEach) {
			// Check to prevent error in IE8
			Array.prototype.slice.call(document.querySelectorAll('pre[data-src]')).forEach(function (pre) {
				var src = pre.getAttribute('data-src');

				var language,
				    parent = pre;
				var lang = /\blang(?:uage)?-(?!\*)(\w+)\b/i;
				while (parent && !lang.test(parent.className)) {
					parent = parent.parentNode;
				}

				if (parent) {
					language = (pre.className.match(lang) || [, ''])[1];
				}

				if (!language) {
					var extension = (src.match(/\.(\w+)$/) || [, ''])[1];
					language = Extensions[extension] || extension;
				}

				var code = document.createElement('code');
				code.className = 'language-' + language;

				pre.textContent = '';

				code.textContent = 'Loading…';

				pre.appendChild(code);

				var xhr = new XMLHttpRequest();

				xhr.open('GET', src, true);

				xhr.onreadystatechange = function () {
					if (xhr.readyState == 4) {

						if (xhr.status < 400 && xhr.responseText) {
							code.textContent = xhr.responseText;

							Prism.highlightElement(code);
						} else if (xhr.status >= 400) {
							code.textContent = '✖ Error ' + xhr.status + ' while fetching file: ' + xhr.statusText;
						} else {
							code.textContent = '✖ Error: File does not exist or is empty';
						}
					}
				};

				xhr.send(null);
			});
		}
	};

	self.Prism.fileHighlight();
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],2:[function(require,module,exports){
'use strict';

require('../bower_components/prism/prism');

},{"../bower_components/prism/prism":1}]},{},[2])


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInNjcmlwdHMvYm93ZXJfY29tcG9uZW50cy9wcmlzbS9wcmlzbS5qcyIsInNjcmlwdHMvc2NyaXB0cy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7OztBQ0tBLElBQUksUUFBUSxPQUFRLE1BQVAsS0FBa0IsV0FBbEIsR0FDVjtBQURTLEVBR1YsT0FBUSxpQkFBUCxLQUE2QixXQUE3QixJQUE0QyxnQkFBZ0IsaUJBQWhCLEdBQzNDO0FBREYsRUFFRSxFQUZGO0FBSFU7Ozs7Ozs7O0FBY1osSUFBSSxRQUFRLFlBQVc7OztBQUd2QixLQUFJLE9BQU8sZ0NBQVAsQ0FIbUI7O0FBS3ZCLEtBQUksSUFBSSxNQUFNLEtBQU4sR0FBYztBQUNyQixRQUFNO0FBQ0wsV0FBUSxnQkFBVSxNQUFWLEVBQWtCO0FBQ3pCLFFBQUksa0JBQWtCLEtBQWxCLEVBQXlCO0FBQzVCLFlBQU8sSUFBSSxLQUFKLENBQVUsT0FBTyxJQUFQLEVBQWEsRUFBRSxJQUFGLENBQU8sTUFBUCxDQUFjLE9BQU8sT0FBUCxDQUFyQyxFQUFzRCxPQUFPLEtBQVAsQ0FBN0QsQ0FENEI7S0FBN0IsTUFFTyxJQUFJLEVBQUUsSUFBRixDQUFPLElBQVAsQ0FBWSxNQUFaLE1BQXdCLE9BQXhCLEVBQWlDO0FBQzNDLFlBQU8sT0FBTyxHQUFQLENBQVcsRUFBRSxJQUFGLENBQU8sTUFBUCxDQUFsQixDQUQyQztLQUFyQyxNQUVBO0FBQ04sWUFBTyxPQUFPLE9BQVAsQ0FBZSxJQUFmLEVBQXFCLE9BQXJCLEVBQThCLE9BQTlCLENBQXNDLElBQXRDLEVBQTRDLE1BQTVDLEVBQW9ELE9BQXBELENBQTRELFNBQTVELEVBQXVFLEdBQXZFLENBQVAsQ0FETTtLQUZBO0lBSEE7O0FBVVIsU0FBTSxjQUFVLENBQVYsRUFBYTtBQUNsQixXQUFPLE9BQU8sU0FBUCxDQUFpQixRQUFqQixDQUEwQixJQUEx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QUosQ0FBZ0IsSUFBaEIsRUF6QjZGOztBQTJCN0YsUUFBSSxNQUFNLElBQUksY0FBSixFQUFOLENBM0J5Rjs7QUE2QjdGLFFBQUksSUFBSixDQUFTLEtBQVQsRUFBZ0IsR0FBaEIsRUFBcUIsSUFBckIsRUE3QjZGOztBQStCN0YsUUFBSSxrQkFBSixHQUF5QixZQUFZO0FBQ3BDLFNBQUksSUFBSSxVQUFKLElBQWtCLENBQWxCLEVBQXFCOztBQUV4QixVQUFJLElBQUksTUFBSixHQUFhLEdBQWIsSUFBb0IsSUFBSSxZQUFKLEVBQWtCO0FBQ3pDLFlBQUssV0FBTCxHQUFtQixJQUFJLFlBQUosQ0FEc0I7O0FBR3pDLGFBQU0sZ0JBQU4sQ0FBdUIsSUFBdkIsRUFIeUM7T0FBMUMsTUFLSyxJQUFJLElBQUksTUFBSixJQUFjLEdBQWQsRUFBbUI7QUFDM0IsWUFBSyxXQUFMLEdBQW1CLGFBQWEsSUFBSSxNQUFKLEdBQWEsd0JBQTFCLEdBQXFELElBQUksVUFBSixDQUQ3QztPQUF2QixNQUdBO0FBQ0osWUFBSyxXQUFMLEdBQW1CLDBDQUFuQixDQURJO09BSEE7TUFQTjtLQUR3QixDQS9Cb0U7O0FBZ0Q3RixRQUFJLElBQUosQ0FBUyxJQUFULEVBaEQ2RjtJQUFmLENBQS9FLENBRDJCO0dBQTVCO0VBYjBCLENBTGY7O0FBeUVaLE1BQUssS0FBTCxDQUFXLGFBQVgsR0F6RVk7Q0FBWixDQUFEOzs7OztBQ3huQkE7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoic2NyaXB0cy9tYWluLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcbi8qICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgQmVnaW4gcHJpc20tY29yZS5qc1xuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xuXG52YXIgX3NlbGYgPSAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpXG5cdD8gd2luZG93ICAgLy8gaWYgaW4gYnJvd3NlclxuXHQ6IChcblx0XHQodHlwZW9mIFdvcmtlckdsb2JhbFNjb3BlICE9PSAndW5kZWZpbmVkJyAmJiBzZWxmIGluc3RhbmNlb2YgV29ya2VyR2xvYmFsU2NvcGUpXG5cdFx0PyBzZWxmIC8vIGlmIGluIHdvcmtlclxuXHRcdDoge30gICAvLyBpZiBpbiBub2RlIGpzXG5cdCk7XG5cbi8qKlxuICogUHJpc206IExpZ2h0d2VpZ2h0LCByb2J1c3QsIGVsZWdhbnQgc3ludGF4IGhpZ2hsaWdodGluZ1xuICogTUlUIGxpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHAvXG4gKiBAYXV0aG9yIExlYSBWZXJvdSBodHRwOi8vbGVhLnZlcm91Lm1lXG4gKi9cblxudmFyIFByaXNtID0gKGZ1bmN0aW9uKCl7XG5cbi8vIFByaXZhdGUgaGVscGVyIHZhcnNcbnZhciBsYW5nID0gL1xcYmxhbmcoPzp1YWdlKT8tKD8hXFwqKShcXHcrKVxcYi9pO1xuXG52YXIgXyA9IF9zZWxmLlByaXNtID0ge1xuXHR1dGlsOiB7XG5cdFx0ZW5jb2RlOiBmdW5jdGlvbiAodG9rZW5zKSB7XG5cdFx0XHRpZiAodG9rZW5zIGluc3RhbmNlb2YgVG9rZW4pIHtcblx0XHRcdFx0cmV0dXJuIG5ldyBUb2tlbih0b2tlbnMudHlwZSwgXy51dGlsLmVuY29kZSh0b2tlbnMuY29udGVudCksIHRva2Vucy5hbGlhcyk7XG5cdFx0XHR9IGVsc2UgaWYgKF8udXRpbC50eXBlKHRva2VucykgPT09ICdBcnJheScpIHtcblx0XHRcdFx0cmV0dXJuIHRva2Vucy5tYXAoXy51dGlsLmVuY29kZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gdG9rZW5zLnJlcGxhY2UoLyYvZywgJyZhbXA7JykucmVwbGFjZSgvPC9nLCAnJmx0OycpLnJlcGxhY2UoL1xcdTAwYTAvZywgJyAnKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0dHlwZTogZnVuY3Rpb24gKG8pIHtcblx0XHRcdHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobykubWF0Y2goL1xcW29iamVjdCAoXFx3KylcXF0vKVsxXTtcblx0XHR9LFxuXG5cdFx0Ly8gRGVlcCBjbG9uZSBhIGxhbmd1YWdlIGRlZmluaXRpb24gKGUuZy4gdG8gZXh0ZW5kIGl0KVxuXHRcdGNsb25lOiBmdW5jdGlvbiAobykge1xuXHRcdFx0dmFyIHR5cGUgPSBfLnV0aWwudHlwZShvKTtcblxuXHRcdFx0c3dpdGNoICh0eXBlKSB7XG5cdFx0XHRcdGNhc2UgJ09iamVjdCc6XG5cdFx0XHRcdFx0dmFyIGNsb25lID0ge307XG5cblx0XHRcdFx0XHRmb3IgKHZhciBrZXkgaW4gbykge1xuXHRcdFx0XHRcdFx0aWYgKG8uaGFzT3duUHJvcGVydHkoa2V5KSkge1xuXHRcdFx0XHRcdFx0XHRjbG9uZVtrZXldID0gXy51dGlsLmNsb25lKG9ba2V5XSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0cmV0dXJuIGNsb25lO1xuXG5cdFx0XHRcdGNhc2UgJ0FycmF5Jzpcblx0XHRcdFx0XHQvLyBDaGVjayBmb3IgZXhpc3RlbmNlIGZvciBJRThcblx0XHRcdFx0XHRyZXR1cm4gby5tYXAgJiYgby5tYXAoZnVuY3Rpb24odikgeyByZXR1cm4gXy51dGlsLmNsb25lKHYpOyB9KTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIG87XG5cdFx0fVxuXHR9LFxuXG5cdGxhbmd1YWdlczoge1xuXHRcdGV4dGVuZDogZnVuY3Rpb24gKGlkLCByZWRlZikge1xuXHRcdFx0dmFyIGxhbmcgPSBfLnV0aWwuY2xvbmUoXy5sYW5ndWFnZXNbaWRdKTtcblxuXHRcdFx0Zm9yICh2YXIga2V5IGluIHJlZGVmKSB7XG5cdFx0XHRcdGxhbmdba2V5XSA9IHJlZGVmW2tleV07XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBsYW5nO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBJbnNlcnQgYSB0b2tlbiBiZWZvcmUgYW5vdGhlciB0b2tlbiBpbiBhIGxhbmd1YWdlIGxpdGVyYWxcblx0XHQgKiBBcyB0aGlzIG5lZWRzIHRvIHJlY3JlYXRlIHRoZSBvYmplY3QgKHdlIGNhbm5vdCBhY3R1YWxseSBpbnNlcnQgYmVmb3JlIGtleXMgaW4gb2JqZWN0IGxpdGVyYWxzKSxcblx0XHQgKiB3ZSBjYW5ub3QganVzdCBwcm92aWRlIGFuIG9iamVjdCwgd2UgbmVlZCBhbm9iamVjdCBhbmQgYSBrZXkuXG5cdFx0ICogQHBhcmFtIGluc2lkZSBUaGUga2V5IChvciBsYW5ndWFnZSBpZCkgb2YgdGhlIHBhcmVudFxuXHRcdCAqIEBwYXJhbSBiZWZvcmUgVGhlIGtleSB0byBpbnNlcnQgYmVmb3JlLiBJZiBub3QgcHJvdmlkZWQsIHRoZSBmdW5jdGlvbiBhcHBlbmRzIGluc3RlYWQuXG5cdFx0ICogQHBhcmFtIGluc2VydCBPYmplY3Qgd2l0aCB0aGUga2V5L3ZhbHVlIHBhaXJzIHRvIGluc2VydFxuXHRcdCAqIEBwYXJhbSByb290IFRoZSBvYmplY3QgdGhhdCBjb250YWlucyBgaW5zaWRlYC4gSWYgZXF1YWwgdG8gUHJpc20ubGFuZ3VhZ2VzLCBpdCBjYW4gYmUgb21pdHRlZC5cblx0XHQgKi9cblx0XHRpbnNlcnRCZWZvcmU6IGZ1bmN0aW9uIChpbnNpZGUsIGJlZm9yZSwgaW5zZXJ0LCByb290KSB7XG5cdFx0XHRyb290ID0gcm9vdCB8fCBfLmxhbmd1YWdlcztcblx0XHRcdHZhciBncmFtbWFyID0gcm9vdFtpbnNpZGVdO1xuXHRcdFx0XG5cdFx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAyKSB7XG5cdFx0XHRcdGluc2VydCA9IGFyZ3VtZW50c1sxXTtcblx0XHRcdFx0XG5cdFx0XHRcdGZvciAodmFyIG5ld1Rva2VuIGluIGluc2VydCkge1xuXHRcdFx0XHRcdGlmIChpbnNlcnQuaGFzT3duUHJvcGVydHkobmV3VG9rZW4pKSB7XG5cdFx0XHRcdFx0XHRncmFtbWFyW25ld1Rva2VuXSA9IGluc2VydFtuZXdUb2tlbl07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHRyZXR1cm4gZ3JhbW1hcjtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0dmFyIHJldCA9IHt9O1xuXG5cdFx0XHRmb3IgKHZhciB0b2tlbiBpbiBncmFtbWFyKSB7XG5cblx0XHRcdFx0aWYgKGdyYW1tYXIuaGFzT3duUHJvcGVydHkodG9rZW4pKSB7XG5cblx0XHRcdFx0XHRpZiAodG9rZW4gPT0gYmVmb3JlKSB7XG5cblx0XHRcdFx0XHRcdGZvciAodmFyIG5ld1Rva2VuIGluIGluc2VydCkge1xuXG5cdFx0XHRcdFx0XHRcdGlmIChpbnNlcnQuaGFzT3duUHJvcGVydHkobmV3VG9rZW4pKSB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0W25ld1Rva2VuXSA9IGluc2VydFtuZXdUb2tlbl07XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRyZXRbdG9rZW5dID0gZ3JhbW1hclt0b2tlbl07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0Ly8gVXBkYXRlIHJlZmVyZW5jZXMgaW4gb3RoZXIgbGFuZ3VhZ2UgZGVmaW5pdGlvbnNcblx0XHRcdF8ubGFuZ3VhZ2VzLkRGUyhfLmxhbmd1YWdlcywgZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuXHRcdFx0XHRpZiAodmFsdWUgPT09IHJvb3RbaW5zaWRlXSAmJiBrZXkgIT0gaW5zaWRlKSB7XG5cdFx0XHRcdFx0dGhpc1trZXldID0gcmV0O1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0cmV0dXJuIHJvb3RbaW5zaWRlXSA9IHJldDtcblx0XHR9LFxuXG5cdFx0Ly8gVHJhdmVyc2UgYSBsYW5ndWFnZSBkZWZpbml0aW9uIHdpdGggRGVwdGggRmlyc3QgU2VhcmNoXG5cdFx0REZTOiBmdW5jdGlvbihvLCBjYWxsYmFjaywgdHlwZSkge1xuXHRcdFx0Zm9yICh2YXIgaSBpbiBvKSB7XG5cdFx0XHRcdGlmIChvLmhhc093blByb3BlcnR5KGkpKSB7XG5cdFx0XHRcdFx0Y2FsbGJhY2suY2FsbChvLCBpLCBvW2ldLCB0eXBlIHx8IGkpO1xuXG5cdFx0XHRcdFx0aWYgKF8udXRpbC50eXBlKG9baV0pID09PSAnT2JqZWN0Jykge1xuXHRcdFx0XHRcdFx0Xy5sYW5ndWFnZXMuREZTKG9baV0sIGNhbGxiYWNrKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSBpZiAoXy51dGlsLnR5cGUob1tpXSkgPT09ICdBcnJheScpIHtcblx0XHRcdFx0XHRcdF8ubGFuZ3VhZ2VzLkRGUyhvW2ldLCBjYWxsYmFjaywgaSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRwbHVnaW5zOiB7fSxcblx0XG5cdGhpZ2hsaWdodEFsbDogZnVuY3Rpb24oYXN5bmMsIGNhbGxiYWNrKSB7XG5cdFx0dmFyIGVsZW1lbnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnY29kZVtjbGFzcyo9XCJsYW5ndWFnZS1cIl0sIFtjbGFzcyo9XCJsYW5ndWFnZS1cIl0gY29kZSwgY29kZVtjbGFzcyo9XCJsYW5nLVwiXSwgW2NsYXNzKj1cImxhbmctXCJdIGNvZGUnKTtcblxuXHRcdGZvciAodmFyIGk9MCwgZWxlbWVudDsgZWxlbWVudCA9IGVsZW1lbnRzW2krK107KSB7XG5cdFx0XHRfLmhpZ2hsaWdodEVsZW1lbnQoZWxlbWVudCwgYXN5bmMgPT09IHRydWUsIGNhbGxiYWNrKTtcblx0XHR9XG5cdH0sXG5cblx0aGlnaGxpZ2h0RWxlbWVudDogZnVuY3Rpb24oZWxlbWVudCwgYXN5bmMsIGNhbGxiYWNrKSB7XG5cdFx0Ly8gRmluZCBsYW5ndWFnZVxuXHRcdHZhciBsYW5ndWFnZSwgZ3JhbW1hciwgcGFyZW50ID0gZWxlbWVudDtcblxuXHRcdHdoaWxlIChwYXJlbnQgJiYgIWxhbmcudGVzdChwYXJlbnQuY2xhc3NOYW1lKSkge1xuXHRcdFx0cGFyZW50ID0gcGFyZW50LnBhcmVudE5vZGU7XG5cdFx0fVxuXG5cdFx0aWYgKHBhcmVudCkge1xuXHRcdFx0bGFuZ3VhZ2UgPSAocGFyZW50LmNsYXNzTmFtZS5tYXRjaChsYW5nKSB8fCBbLCcnXSlbMV07XG5cdFx0XHRncmFtbWFyID0gXy5sYW5ndWFnZXNbbGFuZ3VhZ2VdO1xuXHRcdH1cblxuXHRcdC8vIFNldCBsYW5ndWFnZSBvbiB0aGUgZWxlbWVudCwgaWYgbm90IHByZXNlbnRcblx0XHRlbGVtZW50LmNsYXNzTmFtZSA9IGVsZW1lbnQuY2xhc3NOYW1lLnJlcGxhY2UobGFuZywgJycpLnJlcGxhY2UoL1xccysvZywgJyAnKSArICcgbGFuZ3VhZ2UtJyArIGxhbmd1YWdlO1xuXG5cdFx0Ly8gU2V0IGxhbmd1YWdlIG9uIHRoZSBwYXJlbnQsIGZvciBzdHlsaW5nXG5cdFx0cGFyZW50ID0gZWxlbWVudC5wYXJlbnROb2RlO1xuXG5cdFx0aWYgKC9wcmUvaS50ZXN0KHBhcmVudC5ub2RlTmFtZSkpIHtcblx0XHRcdHBhcmVudC5jbGFzc05hbWUgPSBwYXJlbnQuY2xhc3NOYW1lLnJlcGxhY2UobGFuZywgJycpLnJlcGxhY2UoL1xccysvZywgJyAnKSArICcgbGFuZ3VhZ2UtJyArIGxhbmd1YWdlO1xuXHRcdH1cblxuXHRcdHZhciBjb2RlID0gZWxlbWVudC50ZXh0Q29udGVudDtcblxuXHRcdHZhciBlbnYgPSB7XG5cdFx0XHRlbGVtZW50OiBlbGVtZW50LFxuXHRcdFx0bGFuZ3VhZ2U6IGxhbmd1YWdlLFxuXHRcdFx0Z3JhbW1hcjogZ3JhbW1hcixcblx0XHRcdGNvZGU6IGNvZGVcblx0XHR9O1xuXG5cdFx0aWYgKCFjb2RlIHx8ICFncmFtbWFyKSB7XG5cdFx0XHRfLmhvb2tzLnJ1bignY29tcGxldGUnLCBlbnYpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdF8uaG9va3MucnVuKCdiZWZvcmUtaGlnaGxpZ2h0JywgZW52KTtcblxuXHRcdGlmIChhc3luYyAmJiBfc2VsZi5Xb3JrZXIpIHtcblx0XHRcdHZhciB3b3JrZXIgPSBuZXcgV29ya2VyKF8uZmlsZW5hbWUpO1xuXG5cdFx0XHR3b3JrZXIub25tZXNzYWdlID0gZnVuY3Rpb24oZXZ0KSB7XG5cdFx0XHRcdGVudi5oaWdobGlnaHRlZENvZGUgPSBldnQuZGF0YTtcblxuXHRcdFx0XHRfLmhvb2tzLnJ1bignYmVmb3JlLWluc2VydCcsIGVudik7XG5cblx0XHRcdFx0ZW52LmVsZW1lbnQuaW5uZXJIVE1MID0gZW52LmhpZ2hsaWdodGVkQ29kZTtcblxuXHRcdFx0XHRjYWxsYmFjayAmJiBjYWxsYmFjay5jYWxsKGVudi5lbGVtZW50KTtcblx0XHRcdFx0Xy5ob29rcy5ydW4oJ2FmdGVyLWhpZ2hsaWdodCcsIGVudik7XG5cdFx0XHRcdF8uaG9va3MucnVuKCdjb21wbGV0ZScsIGVudik7XG5cdFx0XHR9O1xuXG5cdFx0XHR3b3JrZXIucG9zdE1lc3NhZ2UoSlNPTi5zdHJpbmdpZnkoe1xuXHRcdFx0XHRsYW5ndWFnZTogZW52Lmxhbmd1YWdlLFxuXHRcdFx0XHRjb2RlOiBlbnYuY29kZSxcblx0XHRcdFx0aW1tZWRpYXRlQ2xvc2U6IHRydWVcblx0XHRcdH0pKTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRlbnYuaGlnaGxpZ2h0ZWRDb2RlID0gXy5oaWdobGlnaHQoZW52LmNvZGUsIGVudi5ncmFtbWFyLCBlbnYubGFuZ3VhZ2UpO1xuXG5cdFx0XHRfLmhvb2tzLnJ1bignYmVmb3JlLWluc2VydCcsIGVudik7XG5cblx0XHRcdGVudi5lbGVtZW50LmlubmVySFRNTCA9IGVudi5oaWdobGlnaHRlZENvZGU7XG5cblx0XHRcdGNhbGxiYWNrICYmIGNhbGxiYWNrLmNhbGwoZWxlbWVudCk7XG5cblx0XHRcdF8uaG9va3MucnVuKCdhZnRlci1oaWdobGlnaHQnLCBlbnYpO1xuXHRcdFx0Xy5ob29rcy5ydW4oJ2NvbXBsZXRlJywgZW52KTtcblx0XHR9XG5cdH0sXG5cblx0aGlnaGxpZ2h0OiBmdW5jdGlvbiAodGV4dCwgZ3JhbW1hciwgbGFuZ3VhZ2UpIHtcblx0XHR2YXIgdG9rZW5zID0gXy50b2tlbml6ZSh0ZXh0LCBncmFtbWFyKTtcblx0XHRyZXR1cm4gVG9rZW4uc3RyaW5naWZ5KF8udXRpbC5lbmNvZGUodG9rZW5zKSwgbGFuZ3VhZ2UpO1xuXHR9LFxuXG5cdHRva2VuaXplOiBmdW5jdGlvbih0ZXh0LCBncmFtbWFyLCBsYW5ndWFnZSkge1xuXHRcdHZhciBUb2tlbiA9IF8uVG9rZW47XG5cblx0XHR2YXIgc3RyYXJyID0gW3RleHRdO1xuXG5cdFx0dmFyIHJlc3QgPSBncmFtbWFyLnJlc3Q7XG5cblx0XHRpZiAocmVzdCkge1xuXHRcdFx0Zm9yICh2YXIgdG9rZW4gaW4gcmVzdCkge1xuXHRcdFx0XHRncmFtbWFyW3Rva2VuXSA9IHJlc3RbdG9rZW5dO1xuXHRcdFx0fVxuXG5cdFx0XHRkZWxldGUgZ3JhbW1hci5yZXN0O1xuXHRcdH1cblxuXHRcdHRva2VubG9vcDogZm9yICh2YXIgdG9rZW4gaW4gZ3JhbW1hcikge1xuXHRcdFx0aWYoIWdyYW1tYXIuaGFzT3duUHJvcGVydHkodG9rZW4pIHx8ICFncmFtbWFyW3Rva2VuXSkge1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHBhdHRlcm5zID0gZ3JhbW1hclt0b2tlbl07XG5cdFx0XHRwYXR0ZXJucyA9IChfLnV0aWwudHlwZShwYXR0ZXJucykgPT09IFwiQXJyYXlcIikgPyBwYXR0ZXJucyA6IFtwYXR0ZXJuc107XG5cblx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgcGF0dGVybnMubGVuZ3RoOyArK2opIHtcblx0XHRcdFx0dmFyIHBhdHRlcm4gPSBwYXR0ZXJuc1tqXSxcblx0XHRcdFx0XHRpbnNpZGUgPSBwYXR0ZXJuLmluc2lkZSxcblx0XHRcdFx0XHRsb29rYmVoaW5kID0gISFwYXR0ZXJuLmxvb2tiZWhpbmQsXG5cdFx0XHRcdFx0bG9va2JlaGluZExlbmd0aCA9IDAsXG5cdFx0XHRcdFx0YWxpYXMgPSBwYXR0ZXJuLmFsaWFzO1xuXG5cdFx0XHRcdHBhdHRlcm4gPSBwYXR0ZXJuLnBhdHRlcm4gfHwgcGF0dGVybjtcblxuXHRcdFx0XHRmb3IgKHZhciBpPTA7IGk8c3RyYXJyLmxlbmd0aDsgaSsrKSB7IC8vIERvbuKAmXQgY2FjaGUgbGVuZ3RoIGFzIGl0IGNoYW5nZXMgZHVyaW5nIHRoZSBsb29wXG5cblx0XHRcdFx0XHR2YXIgc3RyID0gc3RyYXJyW2ldO1xuXG5cdFx0XHRcdFx0aWYgKHN0cmFyci5sZW5ndGggPiB0ZXh0Lmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0Ly8gU29tZXRoaW5nIHdlbnQgdGVycmlibHkgd3JvbmcsIEFCT1JULCBBQk9SVCFcblx0XHRcdFx0XHRcdGJyZWFrIHRva2VubG9vcDtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoc3RyIGluc3RhbmNlb2YgVG9rZW4pIHtcblx0XHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHBhdHRlcm4ubGFzdEluZGV4ID0gMDtcblxuXHRcdFx0XHRcdHZhciBtYXRjaCA9IHBhdHRlcm4uZXhlYyhzdHIpO1xuXG5cdFx0XHRcdFx0aWYgKG1hdGNoKSB7XG5cdFx0XHRcdFx0XHRpZihsb29rYmVoaW5kKSB7XG5cdFx0XHRcdFx0XHRcdGxvb2tiZWhpbmRMZW5ndGggPSBtYXRjaFsxXS5sZW5ndGg7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdHZhciBmcm9tID0gbWF0Y2guaW5kZXggLSAxICsgbG9va2JlaGluZExlbmd0aCxcblx0XHRcdFx0XHRcdFx0bWF0Y2ggPSBtYXRjaFswXS5zbGljZShsb29rYmVoaW5kTGVuZ3RoKSxcblx0XHRcdFx0XHRcdFx0bGVuID0gbWF0Y2gubGVuZ3RoLFxuXHRcdFx0XHRcdFx0XHR0byA9IGZyb20gKyBsZW4sXG5cdFx0XHRcdFx0XHRcdGJlZm9yZSA9IHN0ci5zbGljZSgwLCBmcm9tICsgMSksXG5cdFx0XHRcdFx0XHRcdGFmdGVyID0gc3RyLnNsaWNlKHRvICsgMSk7XG5cblx0XHRcdFx0XHRcdHZhciBhcmdzID0gW2ksIDFdO1xuXG5cdFx0XHRcdFx0XHRpZiAoYmVmb3JlKSB7XG5cdFx0XHRcdFx0XHRcdGFyZ3MucHVzaChiZWZvcmUpO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHR2YXIgd3JhcHBlZCA9IG5ldyBUb2tlbih0b2tlbiwgaW5zaWRlPyBfLnRva2VuaXplKG1hdGNoLCBpbnNpZGUpIDogbWF0Y2gsIGFsaWFzKTtcblxuXHRcdFx0XHRcdFx0YXJncy5wdXNoKHdyYXBwZWQpO1xuXG5cdFx0XHRcdFx0XHRpZiAoYWZ0ZXIpIHtcblx0XHRcdFx0XHRcdFx0YXJncy5wdXNoKGFmdGVyKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0QXJyYXkucHJvdG90eXBlLnNwbGljZS5hcHBseShzdHJhcnIsIGFyZ3MpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBzdHJhcnI7XG5cdH0sXG5cblx0aG9va3M6IHtcblx0XHRhbGw6IHt9LFxuXG5cdFx0YWRkOiBmdW5jdGlvbiAobmFtZSwgY2FsbGJhY2spIHtcblx0XHRcdHZhciBob29rcyA9IF8uaG9va3MuYWxsO1xuXG5cdFx0XHRob29rc1tuYW1lXSA9IGhvb2tzW25hbWVdIHx8IFtdO1xuXG5cdFx0XHRob29rc1tuYW1lXS5wdXNoKGNhbGxiYWNrKTtcblx0XHR9LFxuXG5cdFx0cnVuOiBmdW5jdGlvbiAobmFtZSwgZW52KSB7XG5cdFx0XHR2YXIgY2FsbGJhY2tzID0gXy5ob29rcy5hbGxbbmFtZV07XG5cblx0XHRcdGlmICghY2FsbGJhY2tzIHx8ICFjYWxsYmFja3MubGVuZ3RoKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0Zm9yICh2YXIgaT0wLCBjYWxsYmFjazsgY2FsbGJhY2sgPSBjYWxsYmFja3NbaSsrXTspIHtcblx0XHRcdFx0Y2FsbGJhY2soZW52KTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn07XG5cbnZhciBUb2tlbiA9IF8uVG9rZW4gPSBmdW5jdGlvbih0eXBlLCBjb250ZW50LCBhbGlhcykge1xuXHR0aGlzLnR5cGUgPSB0eXBlO1xuXHR0aGlzLmNvbnRlbnQgPSBjb250ZW50O1xuXHR0aGlzLmFsaWFzID0gYWxpYXM7XG59O1xuXG5Ub2tlbi5zdHJpbmdpZnkgPSBmdW5jdGlvbihvLCBsYW5ndWFnZSwgcGFyZW50KSB7XG5cdGlmICh0eXBlb2YgbyA9PSAnc3RyaW5nJykge1xuXHRcdHJldHVybiBvO1xuXHR9XG5cblx0aWYgKF8udXRpbC50eXBlKG8pID09PSAnQXJyYXknKSB7XG5cdFx0cmV0dXJuIG8ubWFwKGZ1bmN0aW9uKGVsZW1lbnQpIHtcblx0XHRcdHJldHVybiBUb2tlbi5zdHJpbmdpZnkoZWxlbWVudCwgbGFuZ3VhZ2UsIG8pO1xuXHRcdH0pLmpvaW4oJycpO1xuXHR9XG5cblx0dmFyIGVudiA9IHtcblx0XHR0eXBlOiBvLnR5cGUsXG5cdFx0Y29udGVudDogVG9rZW4uc3RyaW5naWZ5KG8uY29udGVudCwgbGFuZ3VhZ2UsIHBhcmVudCksXG5cdFx0dGFnOiAnc3BhbicsXG5cdFx0Y2xhc3NlczogWyd0b2tlbicsIG8udHlwZV0sXG5cdFx0YXR0cmlidXRlczoge30sXG5cdFx0bGFuZ3VhZ2U6IGxhbmd1YWdlLFxuXHRcdHBhcmVudDogcGFyZW50XG5cdH07XG5cblx0aWYgKGVudi50eXBlID09ICdjb21tZW50Jykge1xuXHRcdGVudi5hdHRyaWJ1dGVzWydzcGVsbGNoZWNrJ10gPSAndHJ1ZSc7XG5cdH1cblxuXHRpZiAoby5hbGlhcykge1xuXHRcdHZhciBhbGlhc2VzID0gXy51dGlsLnR5cGUoby5hbGlhcykgPT09ICdBcnJheScgPyBvLmFsaWFzIDogW28uYWxpYXNdO1xuXHRcdEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KGVudi5jbGFzc2VzLCBhbGlhc2VzKTtcblx0fVxuXG5cdF8uaG9va3MucnVuKCd3cmFwJywgZW52KTtcblxuXHR2YXIgYXR0cmlidXRlcyA9ICcnO1xuXG5cdGZvciAodmFyIG5hbWUgaW4gZW52LmF0dHJpYnV0ZXMpIHtcblx0XHRhdHRyaWJ1dGVzICs9IChhdHRyaWJ1dGVzID8gJyAnIDogJycpICsgbmFtZSArICc9XCInICsgKGVudi5hdHRyaWJ1dGVzW25hbWVdIHx8ICcnKSArICdcIic7XG5cdH1cblxuXHRyZXR1cm4gJzwnICsgZW52LnRhZyArICcgY2xhc3M9XCInICsgZW52LmNsYXNzZXMuam9pbignICcpICsgJ1wiICcgKyBhdHRyaWJ1dGVzICsgJz4nICsgZW52LmNvbnRlbnQgKyAnPC8nICsgZW52LnRhZyArICc+JztcblxufTtcblxuaWYgKCFfc2VsZi5kb2N1bWVudCkge1xuXHRpZiAoIV9zZWxmLmFkZEV2ZW50TGlzdGVuZXIpIHtcblx0XHQvLyBpbiBOb2RlLmpzXG5cdFx0cmV0dXJuIF9zZWxmLlByaXNtO1xuXHR9XG4gXHQvLyBJbiB3b3JrZXJcblx0X3NlbGYuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uKGV2dCkge1xuXHRcdHZhciBtZXNzYWdlID0gSlNPTi5wYXJzZShldnQuZGF0YSksXG5cdFx0ICAgIGxhbmcgPSBtZXNzYWdlLmxhbmd1YWdlLFxuXHRcdCAgICBjb2RlID0gbWVzc2FnZS5jb2RlLFxuXHRcdCAgICBpbW1lZGlhdGVDbG9zZSA9IG1lc3NhZ2UuaW1tZWRpYXRlQ2xvc2U7XG5cblx0XHRfc2VsZi5wb3N0TWVzc2FnZShfLmhpZ2hsaWdodChjb2RlLCBfLmxhbmd1YWdlc1tsYW5nXSwgbGFuZykpO1xuXHRcdGlmIChpbW1lZGlhdGVDbG9zZSkge1xuXHRcdFx0X3NlbGYuY2xvc2UoKTtcblx0XHR9XG5cdH0sIGZhbHNlKTtcblxuXHRyZXR1cm4gX3NlbGYuUHJpc207XG59XG5cbi8vIEdldCBjdXJyZW50IHNjcmlwdCBhbmQgaGlnaGxpZ2h0XG52YXIgc2NyaXB0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpO1xuXG5zY3JpcHQgPSBzY3JpcHRbc2NyaXB0Lmxlbmd0aCAtIDFdO1xuXG5pZiAoc2NyaXB0KSB7XG5cdF8uZmlsZW5hbWUgPSBzY3JpcHQuc3JjO1xuXG5cdGlmIChkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyICYmICFzY3JpcHQuaGFzQXR0cmlidXRlKCdkYXRhLW1hbnVhbCcpKSB7XG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIF8uaGlnaGxpZ2h0QWxsKTtcblx0fVxufVxuXG5yZXR1cm4gX3NlbGYuUHJpc207XG5cbn0pKCk7XG5cbmlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuXHRtb2R1bGUuZXhwb3J0cyA9IFByaXNtO1xufVxuXG4vLyBoYWNrIGZvciBjb21wb25lbnRzIHRvIHdvcmsgY29ycmVjdGx5IGluIG5vZGUuanNcbmlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJykge1xuXHRnbG9iYWwuUHJpc20gPSBQcmlzbTtcbn1cblxuXG4vKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgIEJlZ2luIHByaXNtLW1hcmt1cC5qc1xuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xuXG5QcmlzbS5sYW5ndWFnZXMubWFya3VwID0ge1xuXHQnY29tbWVudCc6IC88IS0tW1xcd1xcV10qPy0tPi8sXG5cdCdwcm9sb2cnOiAvPFxcP1tcXHdcXFddKz9cXD8+Lyxcblx0J2RvY3R5cGUnOiAvPCFET0NUWVBFW1xcd1xcV10rPz4vLFxuXHQnY2RhdGEnOiAvPCFcXFtDREFUQVxcW1tcXHdcXFddKj9dXT4vaSxcblx0J3RhZyc6IHtcblx0XHRwYXR0ZXJuOiAvPFxcLz8oPyFcXGQpW15cXHM+XFwvPS4kPF0rKD86XFxzK1teXFxzPlxcLz1dKyg/Oj0oPzooXCJ8JykoPzpcXFxcXFwxfFxcXFw/KD8hXFwxKVtcXHdcXFddKSpcXDF8W15cXHMnXCI+PV0rKSk/KSpcXHMqXFwvPz4vaSxcblx0XHRpbnNpZGU6IHtcblx0XHRcdCd0YWcnOiB7XG5cdFx0XHRcdHBhdHRlcm46IC9ePFxcLz9bXlxccz5cXC9dKy9pLFxuXHRcdFx0XHRpbnNpZGU6IHtcblx0XHRcdFx0XHQncHVuY3R1YXRpb24nOiAvXjxcXC8/Lyxcblx0XHRcdFx0XHQnbmFtZXNwYWNlJzogL15bXlxccz5cXC86XSs6L1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0J2F0dHItdmFsdWUnOiB7XG5cdFx0XHRcdHBhdHRlcm46IC89KD86KCd8XCIpW1xcd1xcV10qPyhcXDEpfFteXFxzPl0rKS9pLFxuXHRcdFx0XHRpbnNpZGU6IHtcblx0XHRcdFx0XHQncHVuY3R1YXRpb24nOiAvWz0+XCInXS9cblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdCdwdW5jdHVhdGlvbic6IC9cXC8/Pi8sXG5cdFx0XHQnYXR0ci1uYW1lJzoge1xuXHRcdFx0XHRwYXR0ZXJuOiAvW15cXHM+XFwvXSsvLFxuXHRcdFx0XHRpbnNpZGU6IHtcblx0XHRcdFx0XHQnbmFtZXNwYWNlJzogL15bXlxccz5cXC86XSs6L1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHR9XG5cdH0sXG5cdCdlbnRpdHknOiAvJiM/W1xcZGEtel17MSw4fTsvaVxufTtcblxuLy8gUGx1Z2luIHRvIG1ha2UgZW50aXR5IHRpdGxlIHNob3cgdGhlIHJlYWwgZW50aXR5LCBpZGVhIGJ5IFJvbWFuIEtvbWFyb3ZcblByaXNtLmhvb2tzLmFkZCgnd3JhcCcsIGZ1bmN0aW9uKGVudikge1xuXG5cdGlmIChlbnYudHlwZSA9PT0gJ2VudGl0eScpIHtcblx0XHRlbnYuYXR0cmlidXRlc1sndGl0bGUnXSA9IGVudi5jb250ZW50LnJlcGxhY2UoLyZhbXA7LywgJyYnKTtcblx0fVxufSk7XG5cblByaXNtLmxhbmd1YWdlcy54bWwgPSBQcmlzbS5sYW5ndWFnZXMubWFya3VwO1xuUHJpc20ubGFuZ3VhZ2VzLmh0bWwgPSBQcmlzbS5sYW5ndWFnZXMubWFya3VwO1xuUHJpc20ubGFuZ3VhZ2VzLm1hdGhtbCA9IFByaXNtLmxhbmd1YWdlcy5tYXJrdXA7XG5QcmlzbS5sYW5ndWFnZXMuc3ZnID0gUHJpc20ubGFuZ3VhZ2VzLm1hcmt1cDtcblxuXG4vKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgIEJlZ2luIHByaXNtLWNzcy5qc1xuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xuXG5QcmlzbS5sYW5ndWFnZXMuY3NzID0ge1xuXHQnY29tbWVudCc6IC9cXC9cXCpbXFx3XFxXXSo/XFwqXFwvLyxcblx0J2F0cnVsZSc6IHtcblx0XHRwYXR0ZXJuOiAvQFtcXHctXSs/Lio/KDt8KD89XFxzKlxceykpL2ksXG5cdFx0aW5zaWRlOiB7XG5cdFx0XHQncnVsZSc6IC9AW1xcdy1dKy9cblx0XHRcdC8vIFNlZSByZXN0IGJlbG93XG5cdFx0fVxuXHR9LFxuXHQndXJsJzogL3VybFxcKCg/OihbXCInXSkoXFxcXCg/OlxcclxcbnxbXFx3XFxXXSl8KD8hXFwxKVteXFxcXFxcclxcbl0pKlxcMXwuKj8pXFwpL2ksXG5cdCdzZWxlY3Rvcic6IC9bXlxce1xcfVxcc11bXlxce1xcfTtdKj8oPz1cXHMqXFx7KS8sXG5cdCdzdHJpbmcnOiAvKFwifCcpKFxcXFwoPzpcXHJcXG58W1xcd1xcV10pfCg/IVxcMSlbXlxcXFxcXHJcXG5dKSpcXDEvLFxuXHQncHJvcGVydHknOiAvKFxcYnxcXEIpW1xcdy1dKyg/PVxccyo6KS9pLFxuXHQnaW1wb3J0YW50JzogL1xcQiFpbXBvcnRhbnRcXGIvaSxcblx0J2Z1bmN0aW9uJzogL1stYS16MC05XSsoPz1cXCgpL2ksXG5cdCdwdW5jdHVhdGlvbic6IC9bKCl7fTs6XS9cbn07XG5cblByaXNtLmxhbmd1YWdlcy5jc3NbJ2F0cnVsZSddLmluc2lkZS5yZXN0ID0gUHJpc20udXRpbC5jbG9uZShQcmlzbS5sYW5ndWFnZXMuY3NzKTtcblxuaWYgKFByaXNtLmxhbmd1YWdlcy5tYXJrdXApIHtcblx0UHJpc20ubGFuZ3VhZ2VzLmluc2VydEJlZm9yZSgnbWFya3VwJywgJ3RhZycsIHtcblx0XHQnc3R5bGUnOiB7XG5cdFx0XHRwYXR0ZXJuOiAvKDxzdHlsZVtcXHdcXFddKj8+KVtcXHdcXFddKj8oPz08XFwvc3R5bGU+KS9pLFxuXHRcdFx0bG9va2JlaGluZDogdHJ1ZSxcblx0XHRcdGluc2lkZTogUHJpc20ubGFuZ3VhZ2VzLmNzcyxcblx0XHRcdGFsaWFzOiAnbGFuZ3VhZ2UtY3NzJ1xuXHRcdH1cblx0fSk7XG5cdFxuXHRQcmlzbS5sYW5ndWFnZXMuaW5zZXJ0QmVmb3JlKCdpbnNpZGUnLCAnYXR0ci12YWx1ZScsIHtcblx0XHQnc3R5bGUtYXR0cic6IHtcblx0XHRcdHBhdHRlcm46IC9cXHMqc3R5bGU9KFwifCcpLio/XFwxL2ksXG5cdFx0XHRpbnNpZGU6IHtcblx0XHRcdFx0J2F0dHItbmFtZSc6IHtcblx0XHRcdFx0XHRwYXR0ZXJuOiAvXlxccypzdHlsZS9pLFxuXHRcdFx0XHRcdGluc2lkZTogUHJpc20ubGFuZ3VhZ2VzLm1hcmt1cC50YWcuaW5zaWRlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdCdwdW5jdHVhdGlvbic6IC9eXFxzKj1cXHMqWydcIl18WydcIl1cXHMqJC8sXG5cdFx0XHRcdCdhdHRyLXZhbHVlJzoge1xuXHRcdFx0XHRcdHBhdHRlcm46IC8uKy9pLFxuXHRcdFx0XHRcdGluc2lkZTogUHJpc20ubGFuZ3VhZ2VzLmNzc1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0YWxpYXM6ICdsYW5ndWFnZS1jc3MnXG5cdFx0fVxuXHR9LCBQcmlzbS5sYW5ndWFnZXMubWFya3VwLnRhZyk7XG59XG5cbi8qICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgQmVnaW4gcHJpc20tY2xpa2UuanNcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cblxuUHJpc20ubGFuZ3VhZ2VzLmNsaWtlID0ge1xuXHQnY29tbWVudCc6IFtcblx0XHR7XG5cdFx0XHRwYXR0ZXJuOiAvKF58W15cXFxcXSlcXC9cXCpbXFx3XFxXXSo/XFwqXFwvLyxcblx0XHRcdGxvb2tiZWhpbmQ6IHRydWVcblx0XHR9LFxuXHRcdHtcblx0XHRcdHBhdHRlcm46IC8oXnxbXlxcXFw6XSlcXC9cXC8uKi8sXG5cdFx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdFx0fVxuXHRdLFxuXHQnc3RyaW5nJzogLyhbXCInXSkoXFxcXCg/OlxcclxcbnxbXFxzXFxTXSl8KD8hXFwxKVteXFxcXFxcclxcbl0pKlxcMS8sXG5cdCdjbGFzcy1uYW1lJzoge1xuXHRcdHBhdHRlcm46IC8oKD86XFxiKD86Y2xhc3N8aW50ZXJmYWNlfGV4dGVuZHN8aW1wbGVtZW50c3x0cmFpdHxpbnN0YW5jZW9mfG5ldylcXHMrKXwoPzpjYXRjaFxccytcXCgpKVthLXowLTlfXFwuXFxcXF0rL2ksXG5cdFx0bG9va2JlaGluZDogdHJ1ZSxcblx0XHRpbnNpZGU6IHtcblx0XHRcdHB1bmN0dWF0aW9uOiAvKFxcLnxcXFxcKS9cblx0XHR9XG5cdH0sXG5cdCdrZXl3b3JkJzogL1xcYihpZnxlbHNlfHdoaWxlfGRvfGZvcnxyZXR1cm58aW58aW5zdGFuY2VvZnxmdW5jdGlvbnxuZXd8dHJ5fHRocm93fGNhdGNofGZpbmFsbHl8bnVsbHxicmVha3xjb250aW51ZSlcXGIvLFxuXHQnYm9vbGVhbic6IC9cXGIodHJ1ZXxmYWxzZSlcXGIvLFxuXHQnZnVuY3Rpb24nOiAvW2EtejAtOV9dKyg/PVxcKCkvaSxcblx0J251bWJlcic6IC9cXGItPyg/OjB4W1xcZGEtZl0rfFxcZCpcXC4/XFxkKyg/OmVbKy1dP1xcZCspPylcXGIvaSxcblx0J29wZXJhdG9yJzogLy0tP3xcXCtcXCs/fCE9Pz0/fDw9P3w+PT98PT0/PT98JiY/fFxcfFxcfD98XFw/fFxcKnxcXC98fnxcXF58JS8sXG5cdCdwdW5jdHVhdGlvbic6IC9be31bXFxdOygpLC46XS9cbn07XG5cblxuLyogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICBCZWdpbiBwcmlzbS1qYXZhc2NyaXB0LmpzXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG5cblByaXNtLmxhbmd1YWdlcy5qYXZhc2NyaXB0ID0gUHJpc20ubGFuZ3VhZ2VzLmV4dGVuZCgnY2xpa2UnLCB7XG5cdCdrZXl3b3JkJzogL1xcYihhc3xhc3luY3xhd2FpdHxicmVha3xjYXNlfGNhdGNofGNsYXNzfGNvbnN0fGNvbnRpbnVlfGRlYnVnZ2VyfGRlZmF1bHR8ZGVsZXRlfGRvfGVsc2V8ZW51bXxleHBvcnR8ZXh0ZW5kc3xmaW5hbGx5fGZvcnxmcm9tfGZ1bmN0aW9ufGdldHxpZnxpbXBsZW1lbnRzfGltcG9ydHxpbnxpbnN0YW5jZW9mfGludGVyZmFjZXxsZXR8bmV3fG51bGx8b2Z8cGFja2FnZXxwcml2YXRlfHByb3RlY3RlZHxwdWJsaWN8cmV0dXJufHNldHxzdGF0aWN8c3VwZXJ8c3dpdGNofHRoaXN8dGhyb3d8dHJ5fHR5cGVvZnx2YXJ8dm9pZHx3aGlsZXx3aXRofHlpZWxkKVxcYi8sXG5cdCdudW1iZXInOiAvXFxiLT8oMHhbXFxkQS1GYS1mXSt8MGJbMDFdK3wwb1swLTddK3xcXGQqXFwuP1xcZCsoW0VlXVsrLV0/XFxkKyk/fE5hTnxJbmZpbml0eSlcXGIvLFxuXHQvLyBBbGxvdyBmb3IgYWxsIG5vbi1BU0NJSSBjaGFyYWN0ZXJzIChTZWUgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjAwODQ0NClcblx0J2Z1bmN0aW9uJzogL1tfJGEtekEtWlxceEEwLVxcdUZGRkZdW18kYS16QS1aMC05XFx4QTAtXFx1RkZGRl0qKD89XFwoKS9pXG59KTtcblxuUHJpc20ubGFuZ3VhZ2VzLmluc2VydEJlZm9yZSgnamF2YXNjcmlwdCcsICdrZXl3b3JkJywge1xuXHQncmVnZXgnOiB7XG5cdFx0cGF0dGVybjogLyhefFteL10pXFwvKD8hXFwvKShcXFsuKz9dfFxcXFwufFteL1xcXFxcXHJcXG5dKStcXC9bZ2lteXVdezAsNX0oPz1cXHMqKCR8W1xcclxcbiwuO30pXSkpLyxcblx0XHRsb29rYmVoaW5kOiB0cnVlXG5cdH1cbn0pO1xuXG5QcmlzbS5sYW5ndWFnZXMuaW5zZXJ0QmVmb3JlKCdqYXZhc2NyaXB0JywgJ2NsYXNzLW5hbWUnLCB7XG5cdCd0ZW1wbGF0ZS1zdHJpbmcnOiB7XG5cdFx0cGF0dGVybjogL2AoPzpcXFxcYHxcXFxcP1teYF0pKmAvLFxuXHRcdGluc2lkZToge1xuXHRcdFx0J2ludGVycG9sYXRpb24nOiB7XG5cdFx0XHRcdHBhdHRlcm46IC9cXCRcXHtbXn1dK1xcfS8sXG5cdFx0XHRcdGluc2lkZToge1xuXHRcdFx0XHRcdCdpbnRlcnBvbGF0aW9uLXB1bmN0dWF0aW9uJzoge1xuXHRcdFx0XHRcdFx0cGF0dGVybjogL15cXCRcXHt8XFx9JC8sXG5cdFx0XHRcdFx0XHRhbGlhczogJ3B1bmN0dWF0aW9uJ1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0cmVzdDogUHJpc20ubGFuZ3VhZ2VzLmphdmFzY3JpcHRcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdCdzdHJpbmcnOiAvW1xcc1xcU10rL1xuXHRcdH1cblx0fVxufSk7XG5cbmlmIChQcmlzbS5sYW5ndWFnZXMubWFya3VwKSB7XG5cdFByaXNtLmxhbmd1YWdlcy5pbnNlcnRCZWZvcmUoJ21hcmt1cCcsICd0YWcnLCB7XG5cdFx0J3NjcmlwdCc6IHtcblx0XHRcdHBhdHRlcm46IC8oPHNjcmlwdFtcXHdcXFddKj8+KVtcXHdcXFddKj8oPz08XFwvc2NyaXB0PikvaSxcblx0XHRcdGxvb2tiZWhpbmQ6IHRydWUsXG5cdFx0XHRpbnNpZGU6IFByaXNtLmxhbmd1YWdlcy5qYXZhc2NyaXB0LFxuXHRcdFx0YWxpYXM6ICdsYW5ndWFnZS1qYXZhc2NyaXB0J1xuXHRcdH1cblx0fSk7XG59XG5cblByaXNtLmxhbmd1YWdlcy5qcyA9IFByaXNtLmxhbmd1YWdlcy5qYXZhc2NyaXB0O1xuXG4vKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgIEJlZ2luIHByaXNtLWZpbGUtaGlnaGxpZ2h0LmpzXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG5cbihmdW5jdGlvbiAoKSB7XG5cdGlmICh0eXBlb2Ygc2VsZiA9PT0gJ3VuZGVmaW5lZCcgfHwgIXNlbGYuUHJpc20gfHwgIXNlbGYuZG9jdW1lbnQgfHwgIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRzZWxmLlByaXNtLmZpbGVIaWdobGlnaHQgPSBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBFeHRlbnNpb25zID0ge1xuXHRcdFx0J2pzJzogJ2phdmFzY3JpcHQnLFxuXHRcdFx0J2h0bWwnOiAnbWFya3VwJyxcblx0XHRcdCdzdmcnOiAnbWFya3VwJyxcblx0XHRcdCd4bWwnOiAnbWFya3VwJyxcblx0XHRcdCdweSc6ICdweXRob24nLFxuXHRcdFx0J3JiJzogJ3J1YnknLFxuXHRcdFx0J3BzMSc6ICdwb3dlcnNoZWxsJyxcblx0XHRcdCdwc20xJzogJ3Bvd2Vyc2hlbGwnXG5cdFx0fTtcblxuXHRcdGlmKEFycmF5LnByb3RvdHlwZS5mb3JFYWNoKSB7IC8vIENoZWNrIHRvIHByZXZlbnQgZXJyb3IgaW4gSUU4XG5cdFx0XHRBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdwcmVbZGF0YS1zcmNdJykpLmZvckVhY2goZnVuY3Rpb24gKHByZSkge1xuXHRcdFx0XHR2YXIgc3JjID0gcHJlLmdldEF0dHJpYnV0ZSgnZGF0YS1zcmMnKTtcblxuXHRcdFx0XHR2YXIgbGFuZ3VhZ2UsIHBhcmVudCA9IHByZTtcblx0XHRcdFx0dmFyIGxhbmcgPSAvXFxibGFuZyg/OnVhZ2UpPy0oPyFcXCopKFxcdyspXFxiL2k7XG5cdFx0XHRcdHdoaWxlIChwYXJlbnQgJiYgIWxhbmcudGVzdChwYXJlbnQuY2xhc3NOYW1lKSkge1xuXHRcdFx0XHRcdHBhcmVudCA9IHBhcmVudC5wYXJlbnROb2RlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKHBhcmVudCkge1xuXHRcdFx0XHRcdGxhbmd1YWdlID0gKHByZS5jbGFzc05hbWUubWF0Y2gobGFuZykgfHwgWywgJyddKVsxXTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICghbGFuZ3VhZ2UpIHtcblx0XHRcdFx0XHR2YXIgZXh0ZW5zaW9uID0gKHNyYy5tYXRjaCgvXFwuKFxcdyspJC8pIHx8IFssICcnXSlbMV07XG5cdFx0XHRcdFx0bGFuZ3VhZ2UgPSBFeHRlbnNpb25zW2V4dGVuc2lvbl0gfHwgZXh0ZW5zaW9uO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dmFyIGNvZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjb2RlJyk7XG5cdFx0XHRcdGNvZGUuY2xhc3NOYW1lID0gJ2xhbmd1YWdlLScgKyBsYW5ndWFnZTtcblxuXHRcdFx0XHRwcmUudGV4dENvbnRlbnQgPSAnJztcblxuXHRcdFx0XHRjb2RlLnRleHRDb250ZW50ID0gJ0xvYWRpbmfigKYnO1xuXG5cdFx0XHRcdHByZS5hcHBlbmRDaGlsZChjb2RlKTtcblxuXHRcdFx0XHR2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cblx0XHRcdFx0eGhyLm9wZW4oJ0dFVCcsIHNyYywgdHJ1ZSk7XG5cblx0XHRcdFx0eGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRpZiAoeGhyLnJlYWR5U3RhdGUgPT0gNCkge1xuXG5cdFx0XHRcdFx0XHRpZiAoeGhyLnN0YXR1cyA8IDQwMCAmJiB4aHIucmVzcG9uc2VUZXh0KSB7XG5cdFx0XHRcdFx0XHRcdGNvZGUudGV4dENvbnRlbnQgPSB4aHIucmVzcG9uc2VUZXh0O1xuXG5cdFx0XHRcdFx0XHRcdFByaXNtLmhpZ2hsaWdodEVsZW1lbnQoY29kZSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNlIGlmICh4aHIuc3RhdHVzID49IDQwMCkge1xuXHRcdFx0XHRcdFx0XHRjb2RlLnRleHRDb250ZW50ID0gJ+KcliBFcnJvciAnICsgeGhyLnN0YXR1cyArICcgd2hpbGUgZmV0Y2hpbmcgZmlsZTogJyArIHhoci5zdGF0dXNUZXh0O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGNvZGUudGV4dENvbnRlbnQgPSAn4pyWIEVycm9yOiBGaWxlIGRvZXMgbm90IGV4aXN0IG9yIGlzIGVtcHR5Jztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0eGhyLnNlbmQobnVsbCk7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0fTtcblxuXHRzZWxmLlByaXNtLmZpbGVIaWdobGlnaHQoKTtcblxufSkoKTtcbiIsIid1c2Ugc3RyaWN0JztcblxucmVxdWlyZSgnLi4vYm93ZXJfY29tcG9uZW50cy9wcmlzbS9wcmlzbScpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKemIzVnlZMlZ6SWpwYlhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWlJc0ltWnBiR1VpT2lKdFlXbHVMbXB6SWl3aWMyOTFjbU5sYzBOdmJuUmxiblFpT2x0ZGZRPT0iXX0=
