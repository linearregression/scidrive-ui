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
"my/OAuth",
],

function(declare, Form, TextBox, Button, ToggleButton, ContentPane, BorderContainer, domConstruct, domStyle, xhr, on, domForm, OAuth) {
    return declare( "my.DynamicPropertiesForm", Form, {

        constructor: function(args) {
            declare.safeMixin(this, args);
            this.form_fields = [];
        },

        postCreate: function() {
            var form = this;
            var panel = this.panel;
            var bc = new BorderContainer({style: "height: 100%; width: 100%"});

            var cp_form = new ContentPane({
              region: "center", 
              style: "overflow: auto; box-shadow: 0px 3px 5px rgba(50, 50, 50, 0.75); margin: 10px; text-align: right;"
            });

            xhr(this.panel.current_panel.store.vospace.url + "/1/account/service_schema/" + this.service.id, {
                handleAs: "json"
            }).then(function(schema) {
                domConstruct.place("<div style='text-align: left; margin: 15px;'><h3>"+schema.description+"</h3></div>", cp_form.id);
                dojo.xhrGet(OAuth.sign("GET", {
                    url: panel.current_panel.store.vospace.url + "/1/account/service/" + form.service.id,
                    handleAs: "json",
                    async: true,
                    load: function(service_cred) {
                        if(schema.fields.length > 0) {
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
                        } else {
                            domConstruct.place("<div style='text-align: left; margin: 15px;'><h6 id='meta_extr_no_fields_label'>This metadata extractor has no additional configuration options.</h6></div>", cp_form.id);
                        }
                    },
                    error: function(data, ioargs) {
                        panel.current_panel._handleError(data, ioargs);
                    }
                }, panel.current_panel.store.vospace.credentials));
            }, function(err) {
                console.error(err);
            });

            bc.addChild(cp_form);

            var validateAndSave=function() {
                if (form.validate() && typeof(form.save) != "undefined") {
                    form.save(domForm.toJson(form.id));
                }
            }
            var cp_buttons = new ContentPane({region: "bottom", style: "height: 45px; border: none; text-align: center;"});

            this.onOffButton = new ToggleButton({
                class:'dialogShadedButton',
                checked: this.service.enabled,
                onChange: function(val){
                    form.form_fields.map(function(field){
                        field.set("disabled", !val);
                    });
                    if(dojo.byId('meta_extr_no_fields_label')) {
                        domStyle.set('meta_extr_no_fields_label', "color", val?"black":"gray");
                    }
                    this.set('label',val?'✔ Enabled':'✘ Disabled');
                },
                label: (this.service.enabled)?"✔ Enabled":"✘ Disabled"
            });
            domStyle.set(this.onOffButton, "width", "200px");
            cp_buttons.addChild(this.onOffButton);

            var updateButton = new Button({label: "Save", class:'dialogShadedButton'});
            on(updateButton, "click", validateAndSave);
            cp_buttons.addChild(updateButton);

            // var cancelButton = new Button({label: "Clear", class:'dialogShadedButton'});
            // on(cancelButton, "click", function(){editor.reset();});
            // cp_buttons.addChild(cancelButton);
            
            bc.addChild(cp_buttons);

            bc.startup();
            this.domNode.appendChild(bc.domNode);
        }
    });
}
);