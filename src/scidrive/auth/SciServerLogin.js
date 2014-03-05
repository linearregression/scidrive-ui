define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/fx",
    "dojo/_base/connect",
    "dojo/fx",
    "dojo/aspect",
    "dojo/dom-construct",
    "dojo/request/xhr", 
    "dojo/json",
    "dojo/io-query",
    "dojo/has",
    "dojo/sniff",
    "dijit/Dialog"
], function(declare, lang, fx, connect, coreFx, aspect, domConstruct, xhr, JSON, ioQuery, has, sniff, Dialog) {
    return declare("scidrive.SciServerLogin", null, {

        constructor: function( /*Object*/ kwArgs) {
            lang.mixin(this, kwArgs);
            var token = ioQuery.queryToObject(dojo.doc.location.search.substr((dojo.doc.location.search[0] === "?" ? 1 : 0))).token;
            if("undefined" !== typeof token) {
                this.credentials = {token: token};
            }
        },

        loginFunc: function(identity, share) {
            var that = this;
            if (undefined == this.credentials) {
                console.debug("login to " + this.id);
                this.login(this);
            } else {
                console.debug(this.credentials);
                require(["scidrive/ScidrivePanel"], function(ScidrivePanel) {
                    if (undefined == dijit.byId("scidriveWidget")) {
                        var pan = new ScidrivePanel({
                            id: "scidriveWidget",
                            style: "width: 100%; height: 100%; opacity: 0;",
                            app: that
                        });
                        pan.placeAt(document.body);
                        dijit.byId("scidriveWidget").loginToVO(that, null); // with updated credentials
                        dijit.byId("scidriveWidget").startup();
                        var anim = coreFx.combine([
                            fx.fadeIn({
                                node: "scidriveWidget",
                                duration: 1000
                            }),
                            fx.fadeOut({
                                node: "loader",
                                duration: 1000
                            })
                        ]).play();

                        aspect.after(anim, "onEnd", function() {
                            domConstruct.destroy("loader");
                        }, true);
                    } else {
                        dijit.byId("scidriveWidget").loginToVO(that, null); // with updated credentials
                    }
                });

            }
        },

        login: function(component) {
            var that = this;
            document.location.href = "http://zinc26.pha.jhu.edu:8080/?callbackUrl=http://dimm.pha.jhu.edu/scidrive/scidrive.html";
        },

        logout: function(vospace, component) {
            var identity = JSON.parse(localStorage.getItem('vospace_oauth_s'));
            delete identity.regions[vospace.id];
            localStorage.setItem('vospace_oauth_s', JSON.stringify(identity));

            delete vospace.credentials;

            if(vospace.isShare) {
                this.vospaces = this.vospaces.filter(function(curvospace, index, array) {
                    return curvospace.id != vospace.id;
                });
                dijit.byId("scidriveWidget").loginSelect.removeOption(vospace.id);
            }

            dijit.byId("scidriveWidget")._refreshRegions();

            var authenticatedVospace, defaultVospace;

            for(var i in this.vospaces) {
                var vospace = this.vospaces[i];
                if(vospace.defaultRegion) {
                    defaultVospace = vospace;
                }
                if(undefined == authenticatedVospace && undefined != identity.regions[vospace.id]){
                    authenticatedVospace = vospace;
                }
            }

            //First try to login to default vospace if is authenticated or don't have any authenticated at all
            if(undefined != identity.regions[defaultVospace.id] || undefined == authenticatedVospace) {
                dijit.byId("scidriveWidget").loginToVO(defaultVospace, component);
            } else {
                dijit.byId("scidriveWidget").loginToVO(authenticatedVospace, component);
            }

            var otherComponent = (component == panel1)?panel2:panel1;
            if(otherComponent != undefined && otherComponent.store.vospace.id == vospace.id && authenticatedVospace != undefined) {
                dijit.byId("scidriveWidget").loginToVO(authenticatedVospace, otherComponent);
            }

            //component._refreshRegions();
                
        },



        request: function(url, method, args) {
            var params = {
                headers: {
                    'X-Auth-Token': this.credentials.token
                }
            };

            if("undefined" !== typeof args)
                params = lang.mixin(params, args);

            params = lang.mixin(params, {"method": method});
            console.debug(params);

            return xhr(url, params);
        }


    });
});