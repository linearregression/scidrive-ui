define( [
  "dojo/_base/declare",
  "dojo/dom-construct",
  "scidrive/XMLWriter",
  "dojox/xml/parser",
  "scidrive/OAuth"
],

function(declare, domConstruct, XMLWriter, DomParser, OAuth) {
    return declare( "scidrive.MetadataViewer", null, {

        constructor: function(args) {
            declare.safeMixin(this, args);
            this.metaRules = {};
            var viewer = this;

            this.metaRules['ivo://ivoa.net/vospace/core#date'] = {
                "output": function(item, element) {
                    domConstruct.place("<div>Modified: "+item+"</div>", element);
                }
            }

            this.metaRules['ivo://ivoa.net/vospace/core#simulation_id'] = {
                "output": function(item, element) {
                    domConstruct.place("<div>ENZO simulation ID: "+item+"</div>", element);
                }
            }

            this.metaRules['ivo://ivoa.net/vospace/core#simulation_dataset'] = {
                "output": function(item, element) {
                    if(typeof item !== "undefined") {
                        item.split(" ").map(function(datasetId) {
                            domConstruct.place("<div>ENZO simulation dataset: "+datasetId+"</div>", element);
                        });
                    }
                }
            }

            this.metaRules['ivo://ivoa.net/vospace/core#external_link'] = {
                "output": function(item, element) {
                    if(typeof item !== "undefined") {
                        var max_len = 80;
                        item.split(" ").map(function(link) {
                            var display = (link.length < max_len)?link:link.substring(0, max_len)+"...";
                            domConstruct.place("<div>Link to data: <a href='"+link+"' target='_blank'>"+display+"</a></div>", element);
                        });
                    }
                }
            }

            this.metaRules['ivo://ivoa.net/vospace/core#processing'] = {
                "output": function(item, element) {
                    domConstruct.place("<div>Metadata extraction status: "+item+"</div>", element);
                }
            }

            this.metaRules['ivo://ivoa.net/vospace/core#error_message'] = {
                "output": function(item, element) {
                    domConstruct.place("<div>Metadata extraction error: "+item+"</div>", element);
                }
            }

        },

        parse: function(meta, element) {
            var that = this;
            this.meta = meta;
            var metaRules = this.metaRules;
            var writer = new XMLWriter();
            console.debug(meta);
            console.debug(element);
            var propertyNodes = writer.selectNodes(meta.documentElement, "/vos:node/vos:properties/vos:property", {"vos": "http://www.ivoa.net/xml/VOSpace/v2.0"});
            if(typeof propertyNodes !== "undefined" && propertyNodes instanceof Array) {

                var form = new dijit.form.Form({
                    action: '',
                    method: ''
                }, dojo.doc.createElement('div'));

                var addpropbtn = new dijit.form.Button({
                    label: "Add",
                    onClick: function(event) {
                        that.addProperty(form);
                    }
                }, dojo.doc.createElement('button'));

                var submitbtn = new dijit.form.Button({
                    label: "Submit",
                    onClick: function(event) {
                        if(form.validate()) {
                            console.debug(form.get('value'));
                        } else {
                            alert('Form contains invalid data.  Please correct first');
                        }
                    }
                }, dojo.doc.createElement('button'));

                domConstruct.place(form.domNode, element);

                form.domNode.appendChild(addpropbtn.domNode);
                form.domNode.appendChild(submitbtn.domNode);
                dojo.place("<br/>", form.domNode);

                propertyNodes.map(function(property) {
                    var propertyId = property.attributes.getNamedItem("uri").value;
                    var metaRule = metaRules[propertyId];
                    var textbox = new dijit.form.ValidationTextBox({
                        name: propertyId.split('#')[1],
                        required: true,
                        type: 'text',
                        trim: true,
                        label: "Input",
                        value: property.firstChild.textContent,
                        onChange: function(obj) {
                            that.submitMeta(propertyId, obj);
                        }
                    }, dojo.doc.createElement('input'));

                    dojo.place("<label>"+propertyId+"</label>", form.domNode);
                    form.domNode.appendChild(textbox.domNode);
                    dojo.place("<br/>", form.domNode);
                });



            }
        },

        addProperty: function(form) {
            var that = this;
            var prop_uri = prompt("Property name?", "ivo://ivoa.net/vospace/core#property");
            var textbox = new dijit.form.ValidationTextBox({
                name: prop_uri.split('#')[1],
                required: true,
                type: 'text',
                trim: true,
                label: "Input",
                value: "Value",
                onChange: function(obj) {
                    that.submitMeta(prop_uri, obj);
                }
            }, dojo.doc.createElement('input'));

            dojo.place("<label>"+prop_uri+"</label>", form.domNode);
            form.domNode.appendChild(textbox.domNode);
            dojo.place("<br/>", form.domNode);

        },

        submitMeta: function(id, value) {
            var that = this;
            var jsdom = this.meta;
            props = jsdom.getElementsByTagName("property");

            var found = false;
            for (var i = 0; i < props.length; i++) {
                var uri = props[i].getAttribute("uri");
                if ( uri == id ) {
                    dojox.xml.parser.textContent(props[i], value);
                    found = true;
                }
            }
            if(!found){
                var newel=jsdom.createElement("property");
                dojox.xml.parser.textContent(newel, value);
                newel.setAttribute("uri",id)
                jsdom.getElementsByTagName("properties")[0].appendChild(newel);
            }

            console.debug(jsdom.getElementsByTagName("property")[0]);
            dojo.xhrPost(OAuth.sign("POST", {
                url: that.url,
                postData: dojox.xml.parser.innerXML(jsdom),
                handleAs: "text",
                sync: false,
                load: function(data){
                }, error: function(error, data) {
                        alert(error+"\n"+data.xhr.responseText);
                }
            }, that.panel.store.vospace.credentials));
        }
    });
}
);
