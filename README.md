Sparse
======

Insanely Simple Text Parser for Node.js

# Using Sparse

Sparse exports a top-level function that takes four arguments:

* The string to parse
* The grammar to follow
* The initial token
* A processing function that accepts and returns the current node

This might look something like:

```JavaScript

var sparse = require('sparse');

var stack = sparse(textToParse, languageGrammar, 'initial-token', function(node, token) {
	if(!node.tokens)
		node.tokens = [];
	node.tokens.push('Name:' + token.name + ', Value:' + token.value);
	return node;
});

console.log(stack);
```

# Defining Grammar

Grammar is defined as a JavaScript object, with regex or string matching available. Here's a quick summary of features available:

```JavaScript
/**
 * Define grammar in an object
 */
var grammar = {

	/**
	 * Tokens are first-level properties of the grammar object.
	 */
	'token-name': {

		/**
		 * When /regex/ immediately follows token-name,
		 * switch to and process some-other-token.
		 */
		'some-other-token'	: /regex/,

		/**
		 * A single & will just drop the matched characters
		 */
		'&'					: 'skip this if found'
	}

	/**
	 * Every token referenced must exist, else an error will be thrown.
	 */
	'some-other-token': {

		/**
		 * An & followed by a token name will drop the characters
		 * and then switch to that token's context
		'&token-name'		: /./
	}
}
```

I'll explain using the simple-language example from the examples folder:

```JavaScript
/**
 * It's a good idea to name your grammar
 */
var simpleGrammar = {

	/**
	 * This is the initial token, and it will be referenced when calling sparse.
	 */
	'init': {

		/**
		 * Drop all whitespace
		 */
		'&' 				: /\s+/,

		/**
		 * When a word is found, call that 'variable-name'
		 */
		'variable-name'		: /\w+/
	},

	/**
	 * Define what happens after a 'variable-name'
	 */
	'variable-name': {

		/**
		 * Drop whitespace
		 */
		'&'					: /\s+/,

		/**
		 * We are entering a value, defined by the left parenthesis.
		 * Drop the parenthesis and any whitespace after it.
		 */
		'&variable-value'	: /\(\s*/
	},

	/**
	 * The variable-value starts out blank, since the parenthesis
	 * and white space were dropped. This gives us an opportunity
	 * to record a value when digits are matched by invoking @self.
	 *
	 * Furthermore, when the matching right parenthesis is found, move
	 * the parser back to the initial context and drop the matched text.
	 */
	'variable-value': {
		'@self'				: /\d+/,
		'&init'				: /\s*\)/
	}

};
```

To see this grammar in action, run `node ./examples/simple-language.js` and watch the console. Happy parsing!