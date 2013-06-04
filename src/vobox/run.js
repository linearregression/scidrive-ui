require({
	baseUrl: '',
	packages: [
		'dojo',
		'dijit',
		'dojox',
		{ name: 'vobox', location: 'vobox', map: {} },
		{ name: 'numeral', location: 'numeral', map: {} }
	]
}, [ 'vobox' ]);