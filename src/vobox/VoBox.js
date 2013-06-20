
define( [
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
  "dijit/Dialog",
  "vobox/OAuth",
  "dojo/text!vobox/resources/regions.json"
],

function(declare, lang, fx, connect, coreFx, aspect, domConstruct, xhr, JSON, ioQuery, Dialog, OAuth, regions) {
    return declare( "vobox.VoBox", null, {

        identity_ver: "1.4",

        constructor: function(args) {
            declare.safeMixin(this, args);

            /* Init identity object and make sure it's current version */
            var identity = {
                    ver:this.identity_ver,
                    regions: {}
            };

            if(undefined != localStorage.getItem('vospace_oauth_s')) {
                var curIdentity = JSON.parse(localStorage.getItem('vospace_oauth_s'));
                if(undefined == curIdentity.ver || (curIdentity.ver != this.identity_ver)){
                    localStorage.setItem('vospace_oauth_s', JSON.stringify(identity));
                } else {
                    identity = curIdentity;
                }
            } else {
                localStorage.setItem('vospace_oauth_s', JSON.stringify(identity));
            }

            /* End Init identity object */

            var share = ioQuery.queryToObject(dojo.doc.location.search.substr((dojo.doc.location.search[0] === "?" ? 1 : 0))).share;
            if(undefined != identity.useShare && undefined == share) {
                share = identity.useShare;
                delete identity.useShare;
                localStorage.setItem('vospace_oauth_s', JSON.stringify(identity));
            } else if(undefined != share) {
                identity.useShare = share;
                localStorage.setItem('vospace_oauth_s', JSON.stringify(identity));
            }

            this.loginFunc(JSON.parse(regions), identity, share);
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

            if(defaultReg.length > 0) {
                var vospace = defaultReg[0];
                
                if(share != undefined) {
                    var share_vospace = lang.clone(vospace);
                    delete share_vospace.credentials;
                    share_vospace.id = share;
                    share_vospace.isShare = true;
                    share_vospace.display = "Share";
                    if(undefined != identity.regions[share]) {
                        share_vospace.credentials = identity.regions[share];
                    }
                    this.vospaces.push(share_vospace);
                    vospace = share_vospace;
                }

                if(undefined == vospace.credentials){
                    console.debug("login to "+vospace.id);
                    this.login(vospace, null);
                } else {
                    if(vospace.credentials.stage == "request") { // contains request token
                        this.login2(vospace, null);
                    } else if(vospace.credentials.stage == "access") {
                        require(["vobox/VoboxPanel"], 
                            function(VoboxPanel){
                            if(undefined == dijit.byId("voboxWidget")) {
                                new VoboxPanel({
                                    id: "voboxWidget",
                                    app: panel
                                }, dojo.byId("voboxWidgetDiv"));
                                dijit.byId("voboxWidget").loginToVO(vospace, null); // with updated credentials
                                dijit.byId("voboxWidget").startup();

                                var anim = coreFx.combine([
                                    fx.fadeIn({
                                      node: "voboxWidget",
                                      duration: 1000
                                    }),
                                    fx.fadeOut({
                                      node: "loader",
                                      duration: 1000
                                    })
                                ]).play();

                                aspect.after(anim, "onEnd", function(){
                                    domConstruct.destroy("loader");
                                }, true);
                            } else {
                                dijit.byId("voboxWidget").loginToVO(vospace, null); // with updated credentials
                            }
                        });
                    }
                }
            } else {
                alert("Configuration error: Not found default region.");
            }

        },



        dialogAlert: function(txtTitle, txtContent) {
            var dialog = new Dialog({title: txtTitle, content: txtContent});
            dojo.body().appendChild(dialog.domNode);
            dialog.startup();
            dialog.show();
        },


        createNewVoTask: function(transferDirection/*push, pull*/, id) {
            var taskData;
            switch( transferDirection ){
            case "push":
                taskData = createPushToVoJob(id);
                break;
            case "pull":
                taskData = createPullFromVoJob(dijit.byId("pathInput").get("value"));
                break;
            default:
                alert("Error: not recognized the job type.");
                break;
            }
            
            dojo.xhrPost(dojox.io.OAuth.sign("POST", {
                url: obsCredentials[vo.id].url+"/transfers",
                postData: taskData,
                headers: { "Content-Type": "application/xml"},
                handleAs: "xml",
                sync: false,
                load: function(data){
                    var taskData2;
                    switch( transferDirection ){
                    case "push":
                        var dataUrl = selectSingleNode(data.documentElement, "//vos:protocol[@uri = 'ivo://ivoa.net/vospace/core#httpput']/vos:protocolEndpoint/text()", {vos: "http://www.ivoa.net/xml/VOSpace/v2.0"}).nodeValue;
                        taskData2 = createPushFromVoJob(clickedNode.i.id, dataUrl);
                        break;
                    case "pull":
                        var dataUrl = selectSingleNode(data.documentElement, "//vos:protocol[@uri = 'ivo://ivoa.net/vospace/core#httpget']/vos:protocolEndpoint/text()", {vos: "http://www.ivoa.net/xml/VOSpace/v2.0"}).nodeValue;
                        taskData2 = createPullToVoJob(clickedNode.i.id, dataUrl, transferType);
                        break;
                    }
                    
                    dojo.xhrPost(dojox.io.OAuth.sign("POST", {
                        url: transfersUrl,
                        postData: taskData2,
                        headers: { "Content-Type": "application/xml"},
                        handleAs: "text",
                        sync: false,
                        load: function(data){
                                reloadTasks();
                        },
                        error: function(error, data) {
                            alert(error+"\n"+data.xhr.responseText);
                        }
                    },getOAuthInfo()));
                    dijit.byId("extVoDlg").destroyDescendants(false);
                    dijit.byId("extVoDlg").destroyRecursive(false);
                },
                error: function(error, data) {
                    alert(error+"\n"+data.xhr.responseText);
                }
            },obsCredentials[vo.id]));
        },




        login: function(vospace, component, openWindow) {
            var app = this;
            var config = { consumer: {key: "sclient", secret: "ssecret"}};
            function success_reload(data) {
                var respObject = ioQuery.queryToObject(data);
                var reqToken = respObject.oauth_token;
                var tokenSecret = respObject.oauth_token_secret;

                vospace.credentials = {
                    stage:"request",
                    sig_method: 'HMAC-SHA1',
                    consumer: {
                        key: 'sclient',
                        secret: 'ssecret'
                    },
                    token: {
                        key: reqToken,
                        secret: tokenSecret
                    }
                };

                var identity = JSON.parse(localStorage.getItem('vospace_oauth_s'));

                identity.regions[vospace.id] = vospace.credentials;

                localStorage.setItem('vospace_oauth_s', JSON.stringify(identity));

                var authorizeUrl = vospace.url+"/authorize?provider=vao&action=initiate&oauth_token="+reqToken;
                authorizeUrl += "&oauth_callback="+document.location.href.slice(0,document.location.href.lastIndexOf('/')+1);
                if(vospace.isShare) {
                    authorizeUrl += "&share="+vospace.id;
                }
                document.location.href = authorizeUrl;
            }
            
            function success_open_window(data) {
                var respObject = ioQuery.queryToObject(data);
                var reqToken = respObject.oauth_token;
                var tokenSecret = respObject.oauth_token_secret;

                if(dijit.byId('formDialog') != undefined){
                    dijit.byId('formDialog').destroyRecursive();
                }

                var div = domConstruct.create("div", {
                        innerHTML: "Please authenticate at <a href='"+
                        vospace.url+"/authorize?provider=vao&action=initiate&oauth_token="+
                        reqToken+"' target='_blanc'>VAO</a> and click ",
                        align: "center"
                    });

                var button = new dijit.form.Button({
                    label: 'Done',
                    onClick: function () {
                        vospace.credentials = {
                            stage: "request",
                            sig_method: 'HMAC-SHA1',
                            consumer: {
                                key: 'sclient',
                                secret: 'ssecret'
                            },
                            token: {
                                key: reqToken,
                                secret: tokenSecret
                            }
                        };
                        var identity = JSON.parse(localStorage.getItem('vospace_oauth_s'));
                        identity.regions[vospace.id] = vospace.credentials;
                        localStorage.setItem('vospace_oauth_s', JSON.stringify(identity));

                        dijit.byId('formDialog').hide();
                        app.login2(vospace, component);
                    }
                });
                div.appendChild(button.domNode);

                var loginDialog = new dijit.Dialog({
                    id: 'formDialog',
                    title: "Authentication",
                    style: {width: "300px"},
                    content: div
                });
                dijit.byId('formDialog').show();
            }


            function failure(data, ioargs) { 
                if(ioargs.xhr.status == 400 || ioargs.xhr.status == 401 || ioargs.xhr.status == 503) { // OAuth errors
                    var errorResponse = ioargs.xhr.responseText;
                    if(errorResponse.split("&")[0] != undefined) {
                        var problem = errorResponse.split("&")[0].slice("oauth_problem=".length);
                        if(problem == "timestamp_refused"){
                            alert("Error logging in: request timestamp incorrect. Please check your computer system time.");
                        } else {
                            alert("Error logging in: "+ problem);
                        }

                    } else {
                        alert("Error logging in: "+ errorResponse);
                    }
                }
            }

            var xhrArgs = {
                url: vospace.url+'/request_token'+((vospace.isShare)?"?share="+vospace.id:""),
                handleAs: "text",
                preventCache: false,
                load: (openWindow?success_open_window:success_reload),
                error: failure
            };
            var args = OAuth.sign("POST", xhrArgs, config);
            dojo.xhrPost(args);

        },

        login2: function(vospace, component) {
            var panel = this;
            require(["vobox/VoboxPanel"], function(VoboxPanel){
                var url = vospace.url+"/access_token";

                dojo.xhrPost(OAuth.sign("POST", {
                    url: url,
                    handleAs: "text",
                    sync: false,
                    load: function(data) {
                        var respObject = ioQuery.queryToObject(data);
                        var token = respObject.oauth_token;
                        var tokenSecret = respObject.oauth_token_secret;

                        vospace.credentials.token = {
                            key: token,
                            secret: tokenSecret
                        };
                        vospace.credentials.stage = "access";

                        var identity = JSON.parse(localStorage.getItem('vospace_oauth_s'));
                        identity.regions[vospace.id] = vospace.credentials;
                        localStorage.setItem('vospace_oauth_s', JSON.stringify(identity));

                        if(undefined == dijit.byId("voboxWidget")) {
                            new VoboxPanel({
                                id: "voboxWidget",
                                app: panel
                            }, dojo.byId("voboxWidgetDiv"));
                            dijit.byId("voboxWidget").loginToVO(vospace, component); // with updated credentials
                            dijit.byId("voboxWidget").startup();

                            var anim = coreFx.combine([
                                fx.fadeIn({
                                  node: "voboxWidget",
                                  duration: 1000
                                }),
                                fx.fadeOut({
                                  node: "loader",
                                  duration: 1000
                                })
                            ]).play();

                            aspect.after(anim, "onEnd", function(){
                                domConstruct.destroy("loader");
                            }, true);
                        } else {
                            dijit.byId("voboxWidget").loginToVO(vospace, component); // with updated credentials
                        }
                    },
                    error: function(data, ioargs) {
                        console.error(data);
                        vospace.credentials = null;


                        var identity = JSON.parse(localStorage.getItem('vospace_oauth_s'));
                        delete identity.regions[vospace.id];
                        localStorage.setItem('vospace_oauth_s', JSON.stringify(identity));

                        if(ioargs.xhr.status == 401) {
                            panel.login(vospace, null);
                        } else {
                            alert("Error logging in: "+ ioargs.xhr.responseText);
                        }
                        
                    }
                },vospace.credentials));
            });

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
                dijit.byId("voboxWidget").loginSelect.removeOption(vospace.id);
            }

            dijit.byId("voboxWidget")._refreshRegions();

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
                dijit.byId("voboxWidget").loginToVO(defaultVospace, component);
            } else {
                dijit.byId("voboxWidget").loginToVO(authenticatedVospace, component);
            }

            var otherComponent = (component == panel1)?panel2:panel1;
            if(otherComponent != undefined && otherComponent.store.vospace.id == vospace.id && authenticatedVospace != undefined) {
                dijit.byId("voboxWidget").loginToVO(authenticatedVospace, otherComponent);
            }

            //component._refreshRegions();
                
        }

    });

});