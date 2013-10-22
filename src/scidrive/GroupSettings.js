define( [
    "dojo/_base/declare",
    "dijit/layout/ContentPane",
    "dijit/form/Button"
],

function(declare, ContentPane, Button) {
    return declare( "scidrive.GroupSettings", ContentPane, {

        constructor: function(args) {
            declare.safeMixin(this, args);
        },

        startup: function() {
            
        }
    });
}
);