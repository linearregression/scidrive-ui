define( [
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/on",
    "dijit/form/Form",
    "dijit/form/Button",
    "dojox/layout/TableContainer",
    "dojo/text!./templates/NewFilePanel.html"
],

function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, on, Form, Button, TableContainer, template) {
    return declare( "scidrive.AccountSettings", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // summary:
        //      Widget building the form for new file creation dialog

        templateString: template,

        postCreate: function(args) {
            this.inherited(arguments);
            var that = this;
            on(this.autoFilenameCheckbox, "change", function(evt) {
                that.newDataNodeName.set("disabled", evt);
                that.newDataNodeName.set("required", !evt);
                that.urlInput.set("required", evt);
            });

            on(this.submitButton, "click", function(evt) {
                if(that.newFileForm.validate()) {
                    that.newFileForm.execute();
                }
            });

        },

        startup: function() {
            this.inherited(arguments);
            this.newDataNodeName.set("required", false);
        },

        _mkfile: function() {
          var fileName = ".auto";
          if(!this.autoFilenameCheckbox.get('value')) {
            fileName = this.newDataNodeName.get('value');
          }
          
          if(this.urlInput.get('value') !== ""){
            var cur_panel = this.current_panel;
            cur_panel.store.pullToVoJob(cur_panel.store.vospace,
              cur_panel.store.getNodeVoId(cur_panel.gridWidget._currentPath+"/"+fileName),
              this.urlInput.get('value'));
          } else { // create empty file
            this.current_panel._mkfile(this.newDataNodeName.get('value'));
          }
          this.getParent().hide();
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