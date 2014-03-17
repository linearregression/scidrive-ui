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
            if (undefined == this.credentials && !this.isShare) {
                this.login(this);
            } else {
                console.log("Have credential: ");
                console.debug(this.credentials);
                console.log("Or have share: "+this.isShare);
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

            document.location.href = "http://zinc26.pha.jhu.edu:8080/?logout=true";

            // var authenticatedVospace, defaultVospace;

            // for(var i in this.vospaces) {
            //     var vospace = this.vospaces[i];
            //     if(vospace.defaultRegion) {
            //         defaultVospace = vospace;
            //     }
            //     if("undefined" === typeof authenticatedVospace && "undefined" !== typeof identity.regions[vospace.id]){
            //         authenticatedVospace = vospace;
            //     }
            // }

            // //First try to login to default vospace if is authenticated or don't have any authenticated at all
            // if("undefined" !== typeof identity.regions[defaultVospace.id] || "undefined" === typeof authenticatedVospace) {
            //     dijit.byId("scidriveWidget").loginToVO(defaultVospace, component);
            // } else {
            //     dijit.byId("scidriveWidget").loginToVO(authenticatedVospace, component);
            // }

                
        },

        request: function(url, method, args) {
            var that = this;
            var params = this.signRequest(url, method, args);
            var xhrPromise = xhr(url, params);
            xhrPromise.then(
                null,
                function(error) {
                    if(error.response.status == 401) {
                        that.login();
                    }
                });
            return xhrPromise;
        },

        signRequest: function(url, method, args) {
            var param = {};

            if("undefined" !== typeof args)
                param = args;

            if("undefined" === typeof param.headers)
                param.headers = {};

            if("undefined" !== typeof this.credentials)
                param.headers["X-Auth-Token"] = this.credentials.token;

            if(this.isShare) {
                param.headers["X-Share"] = this.id;
                console.debug(param);                
            }
            param.method = method;

            return param;
        }


    });
});