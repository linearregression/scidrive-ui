var panel1, panel2;

var vospaces;

// Parameter for sharing folders
var shareParam;

var identity_ver = "1.4";

dojo.addOnLoad(function() {
	// return;
	setTimeout(function() {
    require(["dojo/request/xhr", "dojo/_base/lang"], function(xhr, lang){

		/* Init identity object and make sure it's current version */
		var identity = {
    			ver:identity_ver,
    			regions: {}
    	};

		if(undefined != localStorage.getItem('vospace_oauth_s')) {
			var curIdentity = dojo.fromJson(localStorage.getItem('vospace_oauth_s'));
			if(undefined == curIdentity.ver || (curIdentity.ver != identity_ver)){
		        localStorage.setItem('vospace_oauth_s', dojo.toJson(identity));
			} else {
				identity = curIdentity;
			}
		} else {
	        localStorage.setItem('vospace_oauth_s', dojo.toJson(identity));
		}

		/* End Init identity object */

		var share = dojo.queryToObject(dojo.doc.location.search.substr((dojo.doc.location.search[0] === "?" ? 1 : 0))).share;
		if(undefined != identity.useShare && undefined == share) {
			share = identity.useShare;
			delete identity.useShare;
	        localStorage.setItem('vospace_oauth_s', dojo.toJson(identity));
   		} else if(undefined != share) {
			identity.useShare = share;
	        localStorage.setItem('vospace_oauth_s', dojo.toJson(identity));
   		}

    	var loginFunc = function(data){
        	vospaces = data.map(function(vospace) {
        		vospace.credentials = identity.regions[vospace.id];
        		vospace.isShare = false;
        		return vospace; 
        	});

        	var defaultReg = vospaces.filter(function(vospace, index, array) {
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
        			vospaces.push(share_vospace);
        			vospace = share_vospace;
    			}

				if(undefined == vospace.credentials){
					console.debug("login to "+vospace.id);
					login(vospace, null);
				} else {
	    			if(vospace.credentials.stage == "request") { // contains request token
	    				login2(vospace, null);
	    			} else if(vospace.credentials.stage == "access") {
					    require(["my/VoboxPanel"], function(VoboxPanel){
				            if(undefined == dijit.byId("voboxWidget")) {
					            new VoboxPanel({
					            	id: "voboxWidget"
					            }, dojo.byId("voboxWidgetDiv"));
				            	dijit.byId("voboxWidget").loginToVO(vospace, null); // with updated credentials
				            	dijit.byId("voboxWidget").startup();
				            } else {
				            	dijit.byId("voboxWidget").loginToVO(vospace, null); // with updated credentials
				            }
			            });
		        	}
		        }
        	} else {
        		alert("Configuration error: Not found default region.");
        	}

        };
    	
    	// load regions from service
    	/*dojo.xhrGet({
			url: rootPrefix+"/vospace-2.0/1/regions/info",
			handleAs: "json",
	        load: loginFunc, 
	        error: function(error) { // regions are not supported
	        	dojo.xhrGet({
	    			url: "regions.json",
	    			handleAs: "json",
	    	        load: loginFunc, 
	    	        error: function(error) { // regions are not supported
	    	        	alert("Error: can't load the regions info");
	    	        }
	    	    });
	        }
	    });*/

    	xhr("regions.json", {
			handleAs: "json",
			preventCache: true
		}).then(
			loginFunc, 
	        function(error) { // regions are not supported
	        	console.error("Error: can't load the regions info");
	        }
	    );
    });
    }, 500);

});


function dialogAlert(txtTitle, txtContent) {
    require(["dijit/Dialog"], function(Dialog){
	    var dialog = new dijit.Dialog({title: txtTitle, content: txtContent});
	    dojo.body().appendChild(dialog.domNode);
	    dialog.startup();
	    dialog.show();
    });
}

function pullFromVoJob(vospace, id, handler/*function*/, args/*handler args*/) {
    require(["my/OAuth", "dojo/request/xhr"], function(OAuth, xhr){
		var reqData = createPullFromVoJob(id);

	    dojo.xhrPost(OAuth.sign("POST", {
			url: vospace.url+"/transfers",
            headers: { "Content-Type": "application/xml"},
			postData: reqData,
			handleAs: "xml",
	        sync: false,
	        handle: function(data, ioargs){
	        	if(undefined != data) {
		        	var endpoint = selectSingleNode(data.documentElement, "//vos:protocolEndpoint/text()", {vos: "http://www.ivoa.net/xml/VOSpace/v2.0"}).nodeValue;
		        	console.debug("Got endpoint for pullFrom job: "+endpoint);
		        	if(null != handler) {
		        		if(null == args)
		        			args = [];
		        		args.push(endpoint);
		        		handler.apply(this, args);
		        	}
	        	} else {
		            console.error("Error creating new pullFrom task");
	        	}
	        }, error: function(err) {
	        	console.debug(err);
	        }
	    }, vospace.credentials));
    });
}

function pullToVoJob(vospace, id, endpoint) {
	console.debug("Pulling "+endpoint+" to "+id);
    require(["my/OAuth"], function(OAuth){
		var reqData = createPullToVoJob(id, endpoint);
	    dojo.xhrPost(OAuth.sign("POST", {
			url: vospace.url+"/transfers",
            headers: { "Content-Type": "application/xml"},
  			postData: reqData,
			handleAs: "xml",
	        sync: false,
	        handle: function(data, ioargs){
	        	console.debug("Created pullToJob");
	        }
	    }, vospace.credentials));
    });
}

function moveJob(vospace, from, to) {
	console.debug("Moving from"+from+" to "+to);
    require(["my/OAuth"], function(OAuth){
		var reqData = createMoveJob(from, to);
	    dojo.xhrPost(OAuth.sign("POST", {
			url: vospace.url+"/transfers",
            headers: { "Content-Type": "application/xml"},
			postData: reqData,
			handleAs: "xml",
	        sync: false,
	        handle: function(data, ioargs){
	        	console.debug("Created move Job");
	        }
	    }, vospace.credentials));
    });
}


function createNewVoTask(transferDirection/*push, pull*/, id) {
	var taskData;
	switch(	transferDirection ){
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
    		switch(	transferDirection ){
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
}