/**
 * Sparse - Insanely Simple Text Parser
 * @author Nate Ferrero
 *
 * @param string - the string to parse
 * @param grammar - grammatical rules
 * @param token - initial token
 * @param processor - function(token, node)
 */
module.exports = function(string, grammar, token, processor) {

	/**
	 * Setup
	 */
	var pos = {line: 1, col: 1};
	var stack = {};
	var node = stack;
	var lastMatch = '';

	/**
	 * Match start of string
	 */
	var matchStart = function(string, match) {

		/**
		 * Check type of match
		 * @todo Handle arrays
		 */
		switch(typeof match) {

			/**
			 * Handle regex matching
			 */
			case 'object':
				var matched = (new RegExp('^' + match.source)).exec(string);
				return matched !== null ? matched[0] : false;

			/**
			 * Handle literal matching
			 */
			case 'string':
				return string.substr(0, match.length) === match ? match : false;

			default:
				throw new Error('Parse Error: Invalid match type \'' + (typeof match) + '\'');
		}
	}

	/**
	 * Process while string has characters
	 */
	stringLoop: while(string.length) {

		/**
		 * Ensure token exists and context is valid
		 */
		context = grammar[token];
		if(typeof context !== 'object')
			throw new Error('Parse Error: Undefined token \'' + token + '\'');

		/**
		 * Check all tokens in context
		 */
		for(var test in context) {

			/**
			 * Check for match
			 */
			var match = matchStart(string, context[test]);

			/**
			 * Debugging
			 * @author Nate Ferrero
			 *$/console.log('Matching:', string, 'and', context[test], 'with result:', match);
			/**/

			/**
			 * Handle successful match
			 */
			if(match !== false) {

				/**
				 * Remove matched portion of string
				 */
				string = string.slice(match.length);

				/**
				 * Update line and column numbers
				 */
				var lines = match.split('\n');
				if(lines.length > 1) {
					pos.line += lines.length - 1;
					pos.col = 1;
				}
				pos.col += lines.pop().length;

				/**
				 * Handle & or &token drop
				 */
				if(test.charAt(0) == '&') {
					if(test.length > 1) {
						token = test.substr(1);
						lastMatch = match;
					}
					continue stringLoop;
				}

				/**
				 * Handle @self
				 */
				if(test !== '@self')
					token = test;

				/**
				 * Process token and continue
				 */
				node = processor(node, {name: token, value: match});
				lastMatch = match;
				continue stringLoop;
			}
		}

		/**
		 * No match at current position
		 */
		throw new Error('Parse Error: Invalid source after '+token+' \''+lastMatch+'\''+
			' at line '+pos.line+', column '+pos.col+': \'' + 
			string.slice(0, 15) + (string.length > 15 ? '…' : '') + '\'');
	}

	/**
	 * Return stack
	 */
	return stack;
}