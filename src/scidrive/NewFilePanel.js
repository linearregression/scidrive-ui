define( [
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojox/grid/DataGrid",
    "dojo/request/xhr",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dijit/form/Form",
    "dijit/form/Button",
    "dojox/layout/TableContainer",
    "scidrive/OAuth",
    "dojo/text!./templates/NewFilePanel.html"
],

function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, ContentPane, xhr, domConstruct, domStyle, Form, Button, TableContainer, OAuth, template) {
    return declare( "scidrive.AccountSettings", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

        templateString: template,

        postCreate: function(args) {
            var that = this;
            this.inherited(arguments);
        },

        startup: function() {
            this.inherited(arguments);
        },

        _mkfile: function() {
          var fileName = ".auto";
          if(!this.autoFilenameCheckbox.get('value')) {
            fileName = this.newDataNodeName.get('value');
          }
          
          if(this.urlInput.get('value') !== ""){
            var cur_panel = this.current_panel;
            cur_panel.store.pullToVoJob(cur_panel.store.vospace,
              cur_panel.store.getNodeVoId(cur_panel.gridWidget._currentPath+"/.auto"),
              this.urlInput.get('value'));
          } else { // create empty file
            cur_panel._mkfile(this.newDataNodeName.get('value'));
          }
        },

        _onMkFileKey: function(evt) {
          if(!evt.altKey && !evt.metaKey && evt.keyCode === keys.ENTER){
            if(this.newDataNodeName.validate()) { // proper file name
              this.mkfileDialog.hide();
              if(typeof this._mkfile() !== "undefined" )
                this._mkfile();
            }
          }
        }


    });
}
);