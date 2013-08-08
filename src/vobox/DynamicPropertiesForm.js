define( [
"dojo/_base/declare", 
"dijit/form/Form",
"dijit/form/ValidationTextBox",
"dijit/form/Button",
"dijit/form/ToggleButton",
"dijit/layout/ContentPane",
"dijit/layout/BorderContainer",
"dojo/dom-construct",
"dojo/dom-style",
"dojo/request/xhr",
"dojo/on",
"dojo/dom-form",
"dojox/mobile/Switch",
"vobox/OAuth"
],

function(declare, Form, TextBox, Button, ToggleButton, ContentPane, BorderContainer, domConstruct, domStyle, xhr, on, domForm, Switch, OAuth) {
    return declare( "vobox.DynamicPropertiesForm", Form, {

        constructor: function(args) {
            declare.safeMixin(this, args);
            this.form_fields = [];
        },

        postCreate: function() {
            var form = this;
            var panel = this.panel;
            var bc = new BorderContainer({style: "height: 491px; width: 500px;", gutters: false});

            var cp_head = new ContentPane({
              region: "center", 
              style: "margin: 10px;"
            });
            bc.addChild(cp_head);


            this.onOffButton = new Switch({
                value: ((this.service.enabled)?"on":"off"),
                'class': "mblSwArcShape2"
            });

            on(this.onOffButton, "stateChanged", function(e){
                form.form_fields.map(function(field){
                    field.set("disabled", e == "off");
                });
            });

            cp_head.addChild(this.onOffButton);

            xhr(this.panel.current_panel.store.vospace.url + "/1/account/service_schema/" + this.service.id, {
                handleAs: "json"
            }).then(function(schema) {

                domConstruct.place("<div style='text-align: left; margin: 15px;'><h3>"+schema.description+"</h3></div>", cp_head.id);
                dojo.xhrGet(OAuth.sign("GET", {
                    url: panel.current_panel.store.vospace.url + "/1/account/service/" + form.service.id,
                    handleAs: "json",
                    async: true,
                    load: function(service_cred) {

                        if(schema.fields.length > 0) {
                            var cp_form = new ContentPane({
                              region: "bottom", 
                              style: "overflow: auto; box-shadow: 0px 3px 5px rgba(50, 50, 50, 0.75); margin: 10px; padding-top: 30px; text-align: right;"
                            });
                            cp_head.addChild(cp_form);

                            schema.fields.map(function(property) {
                                var propertyTextBox = new TextBox({
                                    value: (!form.service.enabled)?property.defaultValue:((service_cred[property.name] == null)?"":service_cred[property.name]),
                                    placeHolder: property.name,
                                    name: property.name,
                                    type: (property.password)?"password":"text",
                                    required: property.required,
                                    style: "width: 450px",
                                    disabled: !form.service.enabled
                                });
                                domConstruct.place("<label for='" + propertyTextBox.id + "'>" + property.name + " </h1>", cp_form.id);
                                cp_form.addChild(propertyTextBox);
                                form.form_fields.push(propertyTextBox);
                                domConstruct.place("<br/><br/>", cp_form.id);
                            });

                        }
                    },
                    error: function(data, ioargs) {
                        panel.current_panel._handleError(data, ioargs);
                    }
                }, panel.current_panel.store.vospace.credentials));
            }, function(err) {
                console.error(err);
            });

            var validateAndSave=function() {
                if (form.validate() && typeof(form.save) != "undefined") {
                    form.save(domForm.toJson(form.id));
                }
            }
            var cp_buttons = new ContentPane({region: "bottom", style: "height: 45px; border: none; text-align: center;"});

            var updateButton = new Button({label: "Save", 'class':'dialogShadedButton'});
            on(updateButton, "click", validateAndSave);
            cp_buttons.addChild(updateButton);

            // var cancelButton = new Button({label: "Clear", 'class':'dialogShadedButton'});
            // on(cancelButton, "click", function(){editor.reset();});
            // cp_buttons.addChild(cancelButton);
            
            bc.addChild(cp_buttons);

            bc.startup();
            this.domNode.appendChild(bc.domNode);
        }
    });
}
);