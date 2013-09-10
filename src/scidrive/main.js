define([ 'dojo/has', 'require' ], function (has, require) {
	var app = {};

	if (has('host-browser')) {
		require([ './SciDrive', 'dojo/domReady!' ], function (SciDrive) {
			app = new SciDrive();
		});
	}
});