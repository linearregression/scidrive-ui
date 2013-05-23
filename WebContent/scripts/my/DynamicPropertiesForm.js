define( [
"dojo/_base/declare", 
"dijit/form/Form",
"dijit/form/TextBox",
"dijit/form/Button",
"dijit/layout/ContentPane",
"dijit/layout/BorderContainer",
"dojo/dom-construct",
"dojo/request/xhr",
"dojo/on",
"dojo/dom-form",
],

function(declare, Form, TextBox, Button, ContentPane, BorderContainer, domConstruct, xhr, on, domForm) {
    return declare( "my.DynamicPropertiesForm", Form, {

        constructor: function(args) {
            declare.safeMixin(this, args);
        },

        onSubmit: function() { 
        },

        postCreate: function() {
            var form = this;
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
                    name: property.name,
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
                if (form.validate()) {
                    alert("saved: "+domForm.toJson(form.id));
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
            this.domNode.appendChild(bc.domNode);
        }
    });
}
);