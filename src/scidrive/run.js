require({
	baseUrl: '',
	packages: [
		'dojo',
		'dijit',
		'dojox',
		{ name: 'scidrive', location: 'scidrive', map: {} },
		{ name: 'numeral', location: 'numeral', map: {} }
	]
}, [ 'scidrive' ]);