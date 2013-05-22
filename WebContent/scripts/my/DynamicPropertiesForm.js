define( [
"dojo/_base/declare", 
"dijit/form/Form",
"dijit/form/TextBox",
"dijit/form/Button",
"dijit/layout/ContentPane",
],

function(declare, Form, TextArea, Button, ContentPane) {
    return declare( "mypackage.MyForm", Form, {

        submitButton: new Button({
            type: "submit",
            label: "ready!"
        }),

        constructor: function(args) {
            declare.safeMixin(this, args);
        },

        onSubmit: function() { 
        },

        postCreate: function() {
            var bc = new BorderContainer({style: "height: 100%; width: 100%"});

            var cp_form = new ContentPane({
              region: "center", 
              style: "overflow: auto; box-shadow: 0px 3px 5px rgba(50, 50, 50, 0.75); margin: 10px; text-align: right;"
            });

            xhr(this.panel.current_panel.store.vospace.url + "/1/account/service_schema/"+this.service.id, {
              handleAs: "json"
            }).then(function(data){

              data.fields.map(function(property) {
                var propertyTextBox = new TextBox({
                    value: property.defaultValue,
                    placeHolder: property.name,
                    style: "width: 450px"
                });
                domConstruct.place("<label for='"+propertyTextBox.id+"'>"+property.name+" </h1>", cp_form.id);
                cp_form.addChild(propertyTextBox);
                domConstruct.place("<br/><br/>", cp_form.id);
              });

            }, function(err){
              console.error(err);
            });

            bc.addChild(cp_form);

            var validateAndSave=function() {
                var errorCount=editor.validate(true);
                if (errorCount==0) {
                    alert("saved: "+json.stringify(editor.get("plainValue")));
                }
            }
            var cp_buttons = new ContentPane({region: "bottom", style: "height: 45px; border: none; text-align: center;"});

            var updateButton = new Button({label: "Update", class:'dialogShadedButton'});
            on(updateButton, "click", validateAndSave);
            cp_buttons.addChild(updateButton);

            var cancelButton = new Button({label: "Clear", class:'dialogShadedButton'});
            on(cancelButton, "click", function(){editor.reset();});
            cp_buttons.addChild(cancelButton);
            
            bc.addChild(cp_buttons);

            bc.startup();

            this.addChild(bc);

        }
    });
}
);