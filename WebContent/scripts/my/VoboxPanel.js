define([
  "dojo/_base/declare", 
  "dojo/_base/array", 
  "dojo/_base/lang",
  "dojo/query",
  "dojo/dom-style",
  "dojo/dom-construct",
  "dojo/keys",
  "dojo/on",
  "dojo/fx/Toggler",
  "dojo/fx",
  "dojo/data/ItemFileWriteStore",
  "dojo/request/xhr",
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  "dijit/_WidgetsInTemplateMixin",
  "dijit/layout/BorderContainer",
  "dijit/layout/TabContainer",
  "dijit/layout/ContentPane",
  "dijit/Toolbar",
  "dijit/Tooltip",
  "dijit/ProgressBar",
  "dijit/form/Button",
  "dijit/form/Select",
  "dijit/form/MultiSelect",
  "dijit/form/ToggleButton",
  "dijit/form/TextBox",
  "dijit/Dialog",
  "dojox/layout/TableContainer",
  "my/OAuth",
  "my/FilePanel",
  "my/DataGrid",
  "my/VosyncReadStore",
  "my/JobsManager",
  "my/DynamicPropertiesForm",
  "dojo/text!./templates/VoboxPanel.html",
  ],
  function(declare, array, lang, query, domStyle, domConstruct, keys, on, Toggler, coreFx, ItemFileWriteStore, xhr, WidgetBase, TemplatedMixin, WidgetsInTemplateMixin,
    BorderContainer, TabContainer, ContentPane, Toolbar, Tooltip, ProgressBar, Button, Select, MultiSelect, ToggleButton, TextBox, Dialog, TableContainer,
    OAuth, FilePanel, DataGrid, VosyncReadStore, JobsManager, DynamicPropertiesForm, template) {
    return declare("my.VoboxPanel", [WidgetBase, TemplatedMixin, WidgetsInTemplateMixin], {
        templateString: template,

        panel1: null,
        panel2: null,
        current_panel: null,
        vospaces: null,

        uploadPanelToggler: null,
        uploadPanelTogglerState: false,

        updateCurrentPanel: function(panel) {

          var prev_panel = this.current_panel;

          this.current_panel = panel;

          thisPanel = this;
          var path = this.current_panel.gridWidget._currentPath;
          var pathTokens = path.split('/');

          function elmToHref(element, index, array){
              if(index > 0)
                  return "<span class='pathelm' name='"+element+"'>"+element+"</span>";
              else
                  return "<span class='pathelm' name=''>Root</span>";
          }

          var pathHtml = pathTokens.map(elmToHref);

          var curPath = pathHtml.join(" ▸ ");
          this.pathSelect2.innerHTML = curPath;

          query(".pathelm").forEach(function(item, num) {
              item.onclick = function(evt) {
                  var path = pathTokens.slice(0,num+1).join("/");
                  if(path.length == 0)
                      path = "/";
                  thisPanel.current_panel._updateStore(path);
              };
          });

          if(prev_panel != panel) {
              this._updateUserInfo();
              this._refreshRegions();
          }

        },

        postCreate: function() {
            this.inherited(arguments);

            this.uploadPanelToggler = new Toggler({
              node: this.fileuploads.id,
              showFunc: coreFx.wipeIn,
              hideFunc: coreFx.wipeOut
            });
            this.uploadPanelToggler.hide();

            this.connect(this.loginSelect, "onChange", function(id) {
              var vospaceChosenArr = vospaces.filter(function(elm, index, array) {
                return elm.id == id;
              });
              if(vospaceChosenArr.length > 0)
                this.loginToVO(vospaceChosenArr[0], this.current_panel);
              else
                console.debug("Something bad happened: can't find the region");
            });
            
            domStyle.set(this.id, "opacity", "0");
        },

        _mkdirDialog: function() {
            this.newContNodeName.reset();
            this.mkdirDialog.show();
        },

        _mkfileDialog: function() {
            this.newDataNodeName.reset();
            this.mkfileDialog.show();
        },

        _sharesDialog: function() {
          var panel = this;
          dojo.xhrGet(OAuth.sign("GET", {
              url: this.current_panel.store.vospace.url + "/1/shares",
              handleAs: "json",
              load: function(shares) {

                var sharesGridDiv = domConstruct.create("div", {
                  style: {width: '100%', height: '100%'}
                });

                var data = {
                  identifier: "share_id",
                  items: shares
                };
                var store = new ItemFileWriteStore({data: data});

                var layout = [[
                  {'name': 'ID', 'field': 'share_id', 'width': '30%',
                    formatter: function(col, rowIndex) {
                      var url = document.location.href.slice(0,document.location.href.lastIndexOf('/')+1);
                      return "<a href=\""+url+"?share="+col+"\" target=\"_blank\">"+col+"</a>";
                    }
                  },
                  {'name': 'Container', 'field': 'container', 'width': '30%'},
                  {'name': 'Group', 'field': 'group', 'width': '28%'},
                  {'name': 'Write', 'field': 'write_permission', 'width': '10%', 
                    formatter: function(col, rowIndex) {
                        return col?"✔":"✘";
                    }
                  },
                  {'name': 'Remove', 'field':'share_id', 'width':'12%', 
                    formatter: function(col, rowIndex) {
                      var rowdata = this.grid.getItem(rowIndex);
                      var share_id = rowdata['share_id'];
                      var w = new Button({
                        label: "⌫",
                        iconClass: "deleteShareButton",
                        showLabel: true,
                        onClick: function(item) {
                          if (confirm("Remove share?")){

                            dojo.xhrDelete(OAuth.sign("DELETE", {
                                url: panel.current_panel.store.vospace.url + "/1/shares/"+share_id,
                                load: function(data) {
                                  console.debug("refresh!");
                                  store.deleteItem(rowdata); 
                                  //grid._refresh();!!!!!!!!!
                                },
                                error: function(data, ioargs) {
                                  panel.current_panel._handleError(data, ioargs);
                                }
                            }, panel.current_panel.store.vospace.credentials));
                          }
                        }
                    });
                    w._destroyOnRemove=true;
                    return w;
                  }
                }
                ]];

                var grid = new DataGrid({
                    store: store,
                    structure: layout,
                    rowSelector: '0px'}, sharesGridDiv);


                var dlg = new dijit.Dialog({
                  title: "Containers Shares",
                  style: "width: 680px; height: 450px",
                  content: grid.domNode,
                  onHide: function() {
                    this.destroyRecursive();
                  }
                });

                dlg.show();

                grid.startup();


                //dlg.attr("content", grid.domNode);



              },
              error: function(data, ioargs) {
                panel.current_panel._handleError(data, ioargs);
              }
          }, this.current_panel.store.vospace.credentials));

          //this.sharesDialog.show();
        },

        _help: function() {
            this.helpDialog.show();
        },

        _logout: function() {
          if(null != this.current_panel)
            this.current_panel._logout();
          else
            console.error("Not logged in.");
        },

        _mkdir: function() {
            this.current_panel._mkdir(this.newContNodeName.get('value'));
        },

        _refresh: function() {
            this.current_panel._refresh();
        },

        _mkfile: function() {
           this.current_panel._mkfile(this.newDataNodeName.get('value'));
        },

        _onMkDirKey: function(evt) {
          if(!evt.altKey && !evt.metaKey && evt.keyCode === keys.ENTER){
            if(this.newContNodeName.isValid()) { // proper folder name
              this.mkdirDialog.hide();
              this._mkdir();
            }
          }
        },

        _onMkFileKey: function(evt) {
          if(!evt.altKey && !evt.metaKey && evt.keyCode === keys.ENTER){
            if(this.newDataNodeName.validate()) { // proper file name
              this.mkfileDialog.hide();
              this._mkfile();
            }
          }
        },

        _updateUserInfo: function() {

            var panel = this;

            function updateInfo(accountInfo) {
                panel.userLimitBar.update({
                  maximum: accountInfo.quota_info.quota,
                  progress: accountInfo.quota_info.normal
                });

                var tooltipText = "Used space: "+numeral(accountInfo.quota_info.normal*1024*1024*1024).format('0.0 b');
                panel.userLimitTooltip.set("label", tooltipText);
                dijit.Tooltip.defaultPosition=['below-centered'];
                panel.userLimitTooltip.set("connectId",panel.userLimitBar.id);
                panel.current_panel.gridWidget.setUser(accountInfo.display_name);
            }

            this.current_panel.getUserInfo(updateInfo);

        },

        loginToVO: function(vospace, component) {
            if(!vospace) {
                console.error("Unknown vospace "+id);
                return;
            }

            if(vospace.isShare) {
              if(this.secondPanelButton)
                this.secondPanelButton.destroyRecursive();
              if(this.setCasJobsCredentialsButton)
                this.setCasJobsCredentialsButton.destroyRecursive();
              if(this.sharesButton)
                this.sharesButton.destroyRecursive();
            }

            var panel = this;

            if(!vospace.credentials) {
                login(vospace, component, true);
            } else {
                if(component != null) {
                    var store = this.createStore(vospace);
                    store.parentPanel = component;
                    component.setStore(store);
                    this._updateUserInfo();
                    this._refreshRegions();
                } else { // init
                    if(undefined == this.panel1) {
                        this.panel1 = new FilePanel({
                            login: this.loginToVO,
                            store: this.createStore(vospace),
                            vospaces: vospaces,
                            createNewNodeXml: createNewNodeXml,
                            parentPanel: this
                            }).placeAt(this.panel1contentpane);
                        this.panel1.store.parentPanel = this.panel1;
                        this.updateCurrentPanel(this.panel1);
                    } else {
                        dojo.byId(this.panel2contentpane.id).style.width = "50%";
                        this.rootContainer.resize();
                        this.panel2 = new FilePanel({
                            login: this.loginToVO,
                            store: this.createStore(vospace),
                            style: {height: "100%"},
                            vospaces: vospaces,
                            createNewNodeXml: createNewNodeXml,
                            parentPanel: this
                            }).placeAt(this.panel2contentpane);
                        this.panel2.store.parentPanel = this.panel2;
                        this.updateCurrentPanel(this.panel2);
                        this.panel1.gridWidget.resize();
                    }
                }
            }
        },

        createStore: function(vospace) {
            return new my.VosyncReadStore({
                vospace: vospace,
                numRows: "items",
                pullFromVoJob: pullFromVoJob,
                pullToVoJob: pullToVoJob,
                moveJob: moveJob
            });
        },

        /* Returns the list of region options for regions select */
        _getCurrentRegions: function() {
          var myOptions = null;
          if(vospaces != null) {

              myOptions = vospaces.map(function(vospace) {
                var authenticated = (undefined != vospace.credentials)?"* ":"  ";
                var selected = vospace.id == this.current_panel.store.vospace.id;
                var option = {value: vospace.id, 
                              selected : selected,
                              label: authenticated+vospace.display
                            };
                
                return option; 
              }, this);

                /*if(undefined != vospace.share) {

                  var shareSelected = share.id == this.store.vospace.share.id;
                  var shareAuthenticated = share.id == this.store.vospace.share.id;

                  var option = {value: share.id, 
                                selected : shareSelected,
                                label: authenticated+vospace.display
                  myOptions.push(option);

                }*/

            }

            return myOptions;
        },

        _addPanel: function() {
            if(this.panel2 == undefined) {
                this.loginToVO(this.panel1.store.vospace, null);
            } else {
                this.panel2.destroyRecursive();
                this.panel2 = null;
                dojo.byId(this.panel2contentpane.id).style.width = "0%";
                this.rootContainer.resize();
                this.panel1.gridWidget.resize();
                this.updateCurrentPanel(this.panel1);
            }
        },

        _search: function() {
          var panel = this;
          dojo.xhrGet(OAuth.sign("GET", {
              url: panel.current_panel.store.vospace.url + "/1/cont_search?query="+this.searchInput.value,
              load: function(data) {
                var dlg = new dijit.Dialog({
                  title: "Search results",
                  content: data,
                  onHide: function() {
                    this.destroyRecursive();
                  }
                });

                dlg.show();

              },
              error: function(data, ioargs) {
                panel.current_panel._handleError(data, ioargs);
              }

          }, panel.current_panel.store.vospace.credentials));
        },

        hideUploadPanel: function() {
          var haveUploads = (this.panel1 != undefined && this.panel1._isUploading) || (this.panel2 != undefined && this.panel2._isUploading);


          if(this.uploadPanelTogglerState && !haveUploads) {
            this.uploadPanelTogglerState = false;
            this.uploadPanelToggler.hide();
          }
        },

        showUploadPanel: function() {
          if(!this.uploadPanelTogglerState) {
            this.uploadPanelTogglerState = true;
            this.uploadPanelToggler.show();
          }
        },

        _refreshRegions: function() {
          if(this.loginSelect.getOptions().length == 0) {
            this.loginSelect.addOption(this._getCurrentRegions());
          } else {
            this.loginSelect.updateOption(this._getCurrentRegions());
          }
        },

        _destroyJobs: function() { // destroys jobs grid
          this.transfersManager.destroyRecursive();
        },
        
        _showJobsManagerDialog: function() {

          var transfersManager = new JobsManager({
            vospace: this.current_panel.store.vospace,
            transfers_url: this.current_panel.store.vospace.url+"/1/transfers",
            style: "width: 800px; height: 500px;",
          });
          
          var dialog = new Dialog({
              content: transfersManager,
              onHide: function() {
                transfersManager.destroyRecursive();
                this.destroyRecursive();
              }
          });

          dialog.show();
      
        },

        _showProcessManagerDialog: function() {
          var panel = this;
          panel.current_panel.getUserInfo(function(userInfo) {
            var tabContainer = new TabContainer({
                    doLayout: false,
                    tabPosition: "left-h",
                    style: "height: 500px; width: 800px;",
                    tabStrip: true
                });

            userInfo.services.map(function(service) {
              var cp = new ContentPane({
                  title: ((service.enabled)?'✔ ':'✘ ')+service.title,
                  onShow: function() {

                    var form = new DynamicPropertiesForm({
                      style: "height: 100%; width: 100%",
                      panel: panel,
                      service: service,
                      save: function(jsonValues) {
                        if(this.onOffButton.get("value") == "on") {
                          dojo.xhrPut(OAuth.sign("PUT", {
                            url: panel.current_panel.store.vospace.url +"/1/account/service/"+service.id,
                            putData: jsonValues,
                            headers: { "Content-Type": "application/json"},
                            handleAs: "text",
                            load: function(data) {
                              cp.set("title",'✔'+cp.get("title").substring(1));
                              service.enabled = true;
                            },
                            error: function(data, ioargs) {
                              panel.current_panel._handleError(data, ioargs);
                            }

                          }, panel.current_panel.store.vospace.credentials));
                        } else {
                          dojo.xhrDelete(OAuth.sign("DELETE", {
                            url: panel.current_panel.store.vospace.url +"/1/account/service/"+service.id,
                            handleAs: "text",
                            load: function(data) {
                              cp.set("title",'✘'+cp.get("title").substring(1));
                              service.enabled = false;
                            },
                            error: function(data, ioargs) {
                              panel.current_panel._handleError(data, ioargs);
                            }

                          }, panel.current_panel.store.vospace.credentials));

                        }

                      }
                    });

                    this.addChild(form);
                    form.startup();
                  },
                  onHide: function() {
                    this.destroyDescendants();
                  }
              });
              tabContainer.addChild(cp);
            });

            var dialog = new Dialog({
                title: "Metadata extractors configuration",
                content: tabContainer,
                onHide: function() {
                  this.destroyRecursive();
                }
            });
            dialog.show();
          });
        },
    });

});