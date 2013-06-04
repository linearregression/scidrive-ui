define([ 'dojo/has', 'require' ], function (has, require) {
	var app = {};

	if (has('host-browser')) {
		require([ './VoBox', 'dojo/domReady!' ], function (VoBox) {
			app = new VoBox();
		});
	}
});