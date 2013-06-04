define( [
  "dojo/_base/declare"
], function(declare) {
var XMLWriter = declare( "vobox.XMLWriter", null, {


    constructor: function(args) {
        declare.safeMixin(this, args);
        this.XML= [];
        this.Nodes= [];
        this.State = "";
    },

    FormatXML: function(Str) {
        if (Str)
            return Str.replace(/&/g, "&amp;").replace(/\"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return ""
    },

    BeginNode: function(Name) {
        if (!Name) return;
        if (this.State=="beg") this.XML.push(">");
        this.State="beg";
        this.Nodes.push(Name);
        this.XML.push("<"+Name);
    },

    EndNode: function() {
        if (this.State=="beg")
        {
            this.XML.push("/>");
            this.Nodes.pop();
        }
        else if (this.Nodes.length>0)
            this.XML.push("</"+this.Nodes.pop()+">");
        this.State="";
    },

    Attrib: function(Name, Value) {
        if (this.State!="beg" || !Name) return;
        this.XML.push(" "+Name+"=\""+this.FormatXML(Value)+"\"");
    },

    WriteString: function(Value) {
        if (this.State=="beg") this.XML.push(">");
        this.XML.push(this.FormatXML(Value));
        this.State="";
    },

    Node: function(Name, Value) {
        if (!Name) return;
        if (this.State=="beg") this.XML.push(">");
        this.XML.push((Value=="" || !Value)?"<"+Name+"/>":"<"+Name+">"+this.FormatXML(Value)+"</"+Name+">");
        this.State="";
    },

    Close: function() {
        while (this.Nodes.length>0)
            this.EndNode();
        this.State="closed";
    },

    ToString: function(){
        return this.XML.join("");
    },















    // two functions to extract data from DOM object

    selectSingleNode: function (context, expression, namespaces){
      var doc = (context.nodeType != 9? context.ownerDocument : context);
      
      if (typeof doc.evaluate != "undefined"){
          var nsresolver = null;
          if(namespaces instanceof Object){
              nsresolver = function(prefix){return namespaces[prefix];};
          }
          
          var result = doc.evaluate(expression, context, nsresolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
          
          return (result !== null ? result.singleNodeValue : null);
          
      }else if(typeof context.selectSingleNode != "undefined"){
          //create namespace string
          if(namespaces instanceof Object){
              var ns = "";
              for(var prefix in namespaces){
                  if(namespaces.hasOwnProperty(prefix)){
                      ns += "xmlns:" + prefix + "='" + namespaces[prefix] + "' ";
                                              }
              }
              doc.setProperty("SelectionNamespaces", ns);
          }
          
          return context.selectSingleNode(expression);
          
      } else {
          throw new Error("no xpath engine found");
      }
    },// end function selectSingleNode()

    selectNodes: function (context, expression, namespaces){ //selecting multiple nodes in a crossbrowser fashion
          var doc = (context.nodeType != 9? context.ownerDocument : context);
      
      if (typeof doc.evaluate != "undefined"){
          var nsresolver = null;
          if(namespaces instanceof Object){
              nsresolver = function(prefix){return namespaces[prefix];};
          }
          
          var result = doc.evaluate(expression, context, nsresolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
          var nodes = new Array();
          
          if(result !== null){
              for (var i=0, len=result.snapshotLength; i < len; i++){
                  nodes.push(result.snapshotItem(i));
              }
          }
          
          return nodes;
          
      } else if (typeof context.slectNodes != "undefined"){
          //create namespace string
          if(namespaces instanceof Object){
              var ns = "";
              for(var prefix in namespaces){
                  if(namespaces.hasOwnProperty(prefix)){
                      ns += "xmlns:" + prefix + "='" + namespaces[prefix] + "' ";
                  }
              }
              doc.setProperty("SelectionNamespaces", ns);
          }
          
          var result = context.selectNodes(expression);
          var nodes = new Array();
          
          for (var i = 0, len= result.lenght; i<len; i++){
              nodes.push(result[i]);
          }
          
          return nodes;
          
      } else {
          
          throw new Error("no xpath engine");
          
      }
      
    },// end function selectNodes();

    createPullFromVoJob: function(id) {
        try
        {
            this.BeginNode("vos:transfer");
            this.Attrib("xsi:schemaLocation", "http://www.ivoa.net/xml/UWS/v1.0 UWS.xsd");
            this.Attrib("xmlns:xml", "http://www.w3.org/this/1998/namespace");
            this.Attrib("xmlns:uws", "http://www.ivoa.net/xml/UWS/v1.0");
            this.Attrib("xmlns:xlink", "http://www.w3.org/1999/xlink");
            this.Attrib("xmlns:vos", "http://www.ivoa.net/xml/VOSpace/v2.0");
            this.Attrib("xmlns:xsi", "http://www.w3.org/2001/thisSchema-instance");
                this.Node("vos:target",id);
                this.Node("vos:direction","pullFromVoSpace");
                this.Node("vos:view","ivo://ivoa.net/vospace/core#defaultview");
                this.BeginNode("vos:protocol");
                    this.Attrib("uri", "ivo://ivoa.net/vospace/core#httpget");
                this.EndNode();
            this.EndNode();
            this.Close(); // Takes care of unended tags.
            return this.ToString();
        }
        catch(Err)
        {
            alert("Error: " + Err.description);
        }
    },

    createPullToVoJob: function(id, url) {
        try
        {
            this.BeginNode("vos:transfer");
            this.Attrib("xmlns:xml", "http://www.w3.org/this/1998/namespace");
            this.Attrib("xmlns:uws", "http://www.ivoa.net/xml/UWS/v1.0");
            this.Attrib("xmlns:xlink", "http://www.w3.org/1999/xlink");
            this.Attrib("xmlns:vos", "http://www.ivoa.net/xml/VOSpace/v2.0");
            this.Attrib("xmlns:xsi", "http://www.w3.org/2001/thisSchema-instance");
            this.Attrib("xsi:schemaLocation", "http://www.ivoa.net/xml/UWS/v1.0 UWS.xsd");
                this.Node("vos:target",id);
                this.Node("vos:direction","pullToVoSpace");
                this.Node("vos:view","ivo://ivoa.net/vospace/core#defaultview");
                this.BeginNode("vos:protocol");
                    this.Attrib("uri", "ivo://ivoa.net/vospace/core#httpget");
                    this.Node("vos:protocolEndpoint",url);
                this.EndNode();
            this.EndNode();
            this.Close(); // Takes care of unended tags.
            return this.ToString();
        }
        catch(Err)
        {
            alert("Error: " + Err.description);
        }
    },

    createPushToVoJob: function(id) {
        try
        {
            this.BeginNode("vos:transfer");
            this.Attrib("xmlns:xml", "http://www.w3.org/this/1998/namespace");
            this.Attrib("xmlns:uws", "http://www.ivoa.net/xml/UWS/v1.0");
            this.Attrib("xmlns:xlink", "http://www.w3.org/1999/xlink");
            this.Attrib("xmlns:vos", "http://www.ivoa.net/xml/VOSpace/v2.0");
            this.Attrib("xmlns:xsi", "http://www.w3.org/2001/thisSchema-instance");
            this.Attrib("xsi:schemaLocation", "http://www.ivoa.net/xml/UWS/v1.0 UWS.xsd");
                this.Node("vos:target",id);
                this.Node("vos:direction","pushToVoSpace");
                this.Node("vos:view","ivo://ivoa.net/vospace/core#defaultview");
                this.BeginNode("vos:protocol");
                    this.Attrib("uri", "ivo://ivoa.net/vospace/core#httpput");
                this.EndNode();
            this.EndNode();
            this.Close(); // Takes care of unended tags.
            return this.ToString();
        }
        catch(Err)
        {
            alert("Error: " + Err.description);
        }
    },

    createPushFromVoJob: function(id, url) {
        try
        {
            this.BeginNode("vos:transfer");
            this.Attrib("xsi:schemaLocation", "http://www.ivoa.net/xml/UWS/v1.0 UWS.xsd");
            this.Attrib("xmlns:xml", "http://www.w3.org/this/1998/namespace");
            this.Attrib("xmlns:uws", "http://www.ivoa.net/xml/UWS/v1.0");
            this.Attrib("xmlns:xlink", "http://www.w3.org/1999/xlink");
            this.Attrib("xmlns:vos", "http://www.ivoa.net/xml/VOSpace/v2.0");
            this.Attrib("xmlns:xsi", "http://www.w3.org/2001/thisSchema-instance");
                this.Node("vos:target",id);
                this.Node("vos:direction","pushFromVoSpace");
                this.Node("vos:view","ivo://ivoa.net/vospace/core#defaultview");
                this.BeginNode("vos:protocol");
                    this.Attrib("uri", "ivo://ivoa.net/vospace/core#httpput");
                    this.Node("vos:protocolEndpoint",url);
                this.EndNode();
            this.EndNode();
            this.Close(); // Takes care of unended tags.
            return this.ToString();
        }
        catch(Err)
        {
            alert("Error: " + Err.description);
        }
    },

    createMoveJob: function(from, to) {
        try
        {
            this.BeginNode("vos:transfer");
            this.Attrib("xmlns:vos", "http://www.ivoa.net/xml/VOSpace/v2.0");
                this.Node("vos:target",from);
                this.Node("vos:direction",to);
                this.Node("vos:keepBytes","false");
            this.EndNode();
            this.Close(); // Takes care of unended tags.
            return this.ToString();
        }
        catch(Err)
        {
            alert("Error: " + Err.description);
        }
    },


    createNewNodeXml: function (type, id) {
        try
        {
            this.BeginNode("vos:node");
            this.Attrib("xmlns:xsi", "http://www.w3.org/2001/thisSchema-instance");
            this.Attrib("xsi:type", "vos:"+type);
            this.Attrib("xmlns:vos", "http://www.ivoa.net/xml/VOSpace/v2.0");
            this.Attrib("uri", id);

            /*this.BeginNode("vos:properties", "");
            this.BeginNode("vos:property");
            this.Attrib("uri", "ivo://ivoa.net/vospace/core#description");
            this.WriteString("data");
            this.EndNode();
            this.EndNode();*/

            this.Node("vos:properties", "");

            this.Node("vos:accepts", "");

            this.Node("vos:provides", "");

            this.Node("vos:capabilities", "");
            
            this.EndNode();
            this.Close(); // Takes care of unended tags.
            return this.ToString();
        }
        catch(Err)
        {
            alert("Error: " + Err.description);
        }
    },

    formatXml: function (xml) {
        var reg = /(>)(<)(\/*)/g;
        var wsexp = / *(.*) +\n/g;
        var contexp = /(<.+>)(.+\n)/g;
        xml = xml.replace(reg, '$1\n$2$3').replace(wsexp, '$1\n').replace(contexp, '$1\n$2');
        var pad = 0;
        var formatted = '';
        var lines = xml.split('\n');
        var indent = 0;
        var lastType = 'other';
        // 4 types of tags - single, closing, opening, other (text, doctype, comment) - 4*4 = 16 transitions 
        var transitions = {
            'single->single': 0,
            'single->closing': -1,
            'single->opening': 0,
            'single->other': 0,
            'closing->single': 0,
            'closing->closing': -1,
            'closing->opening': 0,
            'closing->other': 0,
            'opening->single': 1,
            'opening->closing': 0,
            'opening->opening': 1,
            'opening->other': 1,
            'other->single': 0,
            'other->closing': -1,
            'other->opening': 0,
            'other->other': 0
        };

        for (var i = 0; i < lines.length; i++) {
            var ln = lines[i];
            var single = Boolean(ln.match(/<.+\/>/)); // is this line a single tag? ex. <br />
            var closing = Boolean(ln.match(/<\/.+>/)); // is this a closing tag? ex. </a>
            var opening = Boolean(ln.match(/<[^!].*>/)); // is this even a tag (that's not <!something>)
            var type = single ? 'single' : closing ? 'closing' : opening ? 'opening' : 'other';
            var fromTo = lastType + '->' + type;
            lastType = type;
            var padding = '';

            indent += transitions[fromTo];
            for (var j = 0; j < indent; j++) {
                padding += '\t';
            }
            if (fromTo == 'opening->closing')
                formatted = formatted.substr(0, formatted.length - 1) + ln + '\n'; // substr removes line break (\n) from prev loop
            else
                formatted += padding + ln + '\n';
        }

        return formatted;
    }


});

return XMLWriter;

});
