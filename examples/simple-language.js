/**
 * Simple Language Example using Sparse
 * This little language assignes integer
 * values to arbitrary alphabetical keys!
 * @author Nate Ferrero
 */
var sparse = require('../index');
var async = require('async');

/**
 * Simple Language Grammar
 * Any key beginning with & is dropped and
 * not processed. We don't need the parenthesis.
 * @author Nate Ferrero
 */
var simpleGrammar = {

	'init': {
		'&' 				: /\s+/,
		'variable-name'		: /\w+/
	},

	'variable-name': {
		'&'					: /\s+/,
		'&variable-value'	: /\(\s*/
	},

	'variable-value': {
		'@self'				: /\d+/,
		'&init'				: /\s*\)/
	}

};

/**
 * Simple Language Test Function
 * @param input - string to parse
 * @param callback - function(result)
 */
var simple = function(input, desc, simpleCallback) {

	/**
	 * Log
	 */
	console.log('\n============= Simple Language Example ('+desc+') =============\n\nInput: "'+input+'"');

	/**
	 * Parse (synchronous)
	 */
	var _var;
	try {
		var stack = sparse(input, simpleGrammar, 'init', function(node, token) {
			switch(token.name) {
				case 'variable-name':
					if(node._)
						node = node._;
					var n = {};
					_var = token.value;
					n._ = node; 
					n[_var] = null;
					if(!node.variables)
						node.variables = [];
					node.variables.push(n);
					return n;
				case 'variable-value':
					node[_var] = parseInt(token.value);
					_var = null;
					return node._;
			}
		});
	}

	/**
	 * Handle parse errors
	 */
	catch(err) {
		return simpleCallback(err);
	}

	/**
	 * Log
	 */
	console.log('\nStack:', stack);

	/**
	 * Compiler method (asynchronous)
	 */
	var compile = function(node, compileCallback) {
		var keys = []
		for(var key in node.variables)
			keys.push(key);

		/**
		 * Render variables
		 */
		var renderVar = function(key, varCallback) {
			var vname;
			for(var v in node.variables[key])
				if(v != '_')
					vname = v;
			varCallback(null, '' + (parseInt(key)+1) + ") The value of "+ vname + ' is ' + node.variables[key][vname] + '.');
		}

		/**
		 * Render all async and in order
		 */
		async.map(keys, renderVar, function(err, result) {
			if(err) compileCallback(err);
			else compileCallback(null, '\n'+result.join('\n'));
		});
	};

	/**
	 * Actually compile
	 */
	compile(stack, simpleCallback);
}

/**
 * Valid Example
 */
var valid = [
	'ace(101) box(202) cat(303)',
	'door(404)	eel() foo	( 505 	) goo(',
	'	606',
	')'
].join('\n');

/**
 * Invalid example
 */
var invalid = '\n\n\n\t ace(10 1)';

/**
 * Process Examples
 */
simple(valid, 'Valid Example', function(err, result) {
	if(err) console.error(err);
	else console.log('\nCompiled: "'+result+'"');
});
simple(invalid, 'Invalid Example', function(err, result) {
	if(err) console.error(err);
	else console.log('\nCompiled: "'+result+'"');
});