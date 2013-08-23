define( [
  "dojo/_base/declare",
  "dojo/dom-construct",
  "vobox/XMLWriter"
],

function(declare, domConstruct, XMLWriter) {
    return declare( "vobox.MetadataViewer", null, {

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
            var metaRules = this.metaRules;
            var writer = new XMLWriter();
            var propertyNodes = writer.selectNodes(meta.documentElement, "/vos:node/vos:properties/vos:property", {"vos": "http://www.ivoa.net/xml/VOSpace/v2.0"});
            if(typeof propertyNodes !== "undefined" && propertyNodes instanceof Array) {
                propertyNodes.map(function(property) {
                    var propertyId = property.attributes.getNamedItem("uri").value;
                    var metaRule = metaRules[propertyId];
                    if(typeof metaRule !== "undefined" && typeof metaRule.output == "function") {
                        metaRule.output(property.firstChild.textContent, element);
                    }
                });
            }
        }
    });
}
);