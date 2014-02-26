define( [
  "dojo/_base/declare",
  "dojo/_base/lang"
],

function(declare, lang) {
  return declare( "scidrive.SciServerLogin", null, {

    constructor: function(/*Object*/ kwArgs){
      lang.mixin(this, kwArgs);
    },
    
    loginFunc: function(regions, identity, share){
        var panel = this;
        this.vospaces = regions.map(function(vospace) {
            vospace.credentials = identity.regions[vospace.id];
            vospace.isShare = false;
            return vospace; 
        });

        var defaultReg = this.vospaces.filter(function(vospace, index, array) {
            return vospace.defaultRegion;
        });


    }

  });
});