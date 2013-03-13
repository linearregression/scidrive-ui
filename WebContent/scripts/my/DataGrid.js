define(["dojox/grid/EnhancedGrid", "dojo/_base/declare", "dojo/_base/array", "dojo/_base/lang", "dojo/_base/html",], 
          function(EnhancedGrid, declare, array, lang, html) {
    declare("my.DataGrid", [dojox.grid.EnhancedGrid], {
    	
	_currentPath : '/',
	pathWidget : null,
    _eventSource: null,
    _user: null,

    _fetch: function(start, isRender){
        // summary:
        //      Overwritten, see DataGrid._fetch()
        if(this.items){
            return this.inherited(arguments);
        }
        start = start || 0;
        if(this.store && !this._pending_requests[start]){
            if(!this._isLoaded && !this._isLoading){
                this._isLoading = true;
                this.showMessage(this.loadingMessage);
            }
            this._pending_requests[start] = true;
            try{
                var req = {
                    start: start,
                    count: this.rowsPerPage,
                    query: this.query,
                    sort: this.getSortProps(),
                    queryOptions: this.queryOptions,
                    isRender: isRender,
                                path: this._currentPath,

                    onBegin: lang.hitch(this, "_onFetchBegin"),
                    onComplete: lang.hitch(this, "_onFetchComplete"),
                    onError: lang.hitch(this, "_onFetchError")
                };
                this._storeLayerFetch(req);
            }catch(e){
                this._onFetchError(e, {start: start, count: this.rowsPerPage});
            }
        }
        return 0;
    },

	setCurrentPath: function(path) {
        this._currentPath = path;
		this.plugin('selector').clear();
		this._refresh(true);
        this._updateEventSource();
	},
	
    setUser: function(user) {
        if(this._user != user) {
            this._user = user;
            this._updateEventSource();
        }
    },

    _updateEventSource: function() {

        var panel = this;

        if(undefined != this._eventSource) {
          this._eventSource.close();
          this._eventSource = null;
        }

        if(undefined != this._user) {
            this._eventSource = new EventSource('updates?user='+this._user+'&path='+this._currentPath);
            
            this._eventSource.onmessage = function(e) {
              console.debug("Updated");
              panel.plugin('selector').clear();
              panel._refresh(true);
            };
            this._eventSource.onerror = function(e) {
                panel._eventSource.close();
                console.debug("Disconnected!!!");
                console.debug(e);
                panel._eventSource = null;
            };
        }
    },

	setStore: function(store) {
		var oldStore = this.store;
		this._currentPath = "/";
		this.inherited("setStore", arguments);
		if(null != oldStore){
			oldStore.close();
		}
	},

  	
	});

    return my.DataGrid;
});