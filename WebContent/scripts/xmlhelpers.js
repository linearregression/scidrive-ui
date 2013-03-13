// two functions to extract data from DOM object

function selectSingleNode(context, expression, namespaces){
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
}// end function selectSingleNode()

function selectNodes(context, expression, namespaces){ //selecting multiple nodes in a crossbrowser fashion
      var doc = (context.nodeType != 9? context.ownerDocument : context);
  
  if (typeof doc.evaluate != "undefined"){
      var nsresolver = null;
      if(namespaces instanceof Object){
          nsresolver = function(prefix){return namespaces[prefix];};
      }
      
      var result = doc.evaluate(expression, context, nsresolver, XPathResult.ORDERED_SNAPSHOT_TYPE, null);
      
      var nodes = new Array();
      
      if(result != null){
          for (var i=0, len=result.snapshotLength; i < len; i++){
              nodes.push(result.snapshotItem[i]);
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
  
}// end function selectNodes();

function createPullFromVoJob(id) {
    try
    {
        var XML=new XMLWriter();
        XML.BeginNode("vos:transfer");
        XML.Attrib("xsi:schemaLocation", "http://www.ivoa.net/xml/UWS/v1.0 UWS.xsd");
        XML.Attrib("xmlns:xml", "http://www.w3.org/XML/1998/namespace");
        XML.Attrib("xmlns:uws", "http://www.ivoa.net/xml/UWS/v1.0");
        XML.Attrib("xmlns:xlink", "http://www.w3.org/1999/xlink");
        XML.Attrib("xmlns:vos", "http://www.ivoa.net/xml/VOSpace/v2.0");
        XML.Attrib("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");
        	XML.Node("vos:target",id);
        	XML.Node("vos:direction","pullFromVoSpace");
        	XML.Node("vos:view","ivo://ivoa.net/vospace/core#defaultview");
        	XML.BeginNode("vos:protocol");
        		XML.Attrib("uri", "ivo://ivoa.net/vospace/core#httpget");
            XML.EndNode();
        XML.EndNode();
        XML.Close(); // Takes care of unended tags.
        return XML.ToString();
    }
    catch(Err)
    {
        alert("Error: " + Err.description);
    }
}

function createPullToVoJob(id, url) {
    try
    {
        var XML=new XMLWriter();
        XML.BeginNode("vos:transfer");
        XML.Attrib("xmlns:xml", "http://www.w3.org/XML/1998/namespace");
        XML.Attrib("xmlns:uws", "http://www.ivoa.net/xml/UWS/v1.0");
        XML.Attrib("xmlns:xlink", "http://www.w3.org/1999/xlink");
        XML.Attrib("xmlns:vos", "http://www.ivoa.net/xml/VOSpace/v2.0");
        XML.Attrib("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");
        XML.Attrib("xsi:schemaLocation", "http://www.ivoa.net/xml/UWS/v1.0 UWS.xsd");
        	XML.Node("vos:target",id);
        	XML.Node("vos:direction","pullToVoSpace");
        	XML.Node("vos:view","ivo://ivoa.net/vospace/core#defaultview");
        	XML.BeginNode("vos:protocol");
        		XML.Attrib("uri", "ivo://ivoa.net/vospace/core#httpget");
	        	XML.Node("vos:protocolEndpoint",url);
            XML.EndNode();
        XML.EndNode();
        XML.Close(); // Takes care of unended tags.
        return XML.ToString();
    }
    catch(Err)
    {
        alert("Error: " + Err.description);
    }
}

function createPushToVoJob(id) {
    try
    {
        var XML=new XMLWriter();
        XML.BeginNode("vos:transfer");
        XML.Attrib("xmlns:xml", "http://www.w3.org/XML/1998/namespace");
        XML.Attrib("xmlns:uws", "http://www.ivoa.net/xml/UWS/v1.0");
        XML.Attrib("xmlns:xlink", "http://www.w3.org/1999/xlink");
        XML.Attrib("xmlns:vos", "http://www.ivoa.net/xml/VOSpace/v2.0");
        XML.Attrib("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");
        XML.Attrib("xsi:schemaLocation", "http://www.ivoa.net/xml/UWS/v1.0 UWS.xsd");
        	XML.Node("vos:target",id);
        	XML.Node("vos:direction","pushToVoSpace");
        	XML.Node("vos:view","ivo://ivoa.net/vospace/core#defaultview");
        	XML.BeginNode("vos:protocol");
        		XML.Attrib("uri", "ivo://ivoa.net/vospace/core#httpput");
            XML.EndNode();
        XML.EndNode();
        XML.Close(); // Takes care of unended tags.
        return XML.ToString();
    }
    catch(Err)
    {
        alert("Error: " + Err.description);
    }
}

function createPushFromVoJob(id, url) {
    try
    {
        var XML=new XMLWriter();
        XML.BeginNode("vos:transfer");
        XML.Attrib("xsi:schemaLocation", "http://www.ivoa.net/xml/UWS/v1.0 UWS.xsd");
        XML.Attrib("xmlns:xml", "http://www.w3.org/XML/1998/namespace");
        XML.Attrib("xmlns:uws", "http://www.ivoa.net/xml/UWS/v1.0");
        XML.Attrib("xmlns:xlink", "http://www.w3.org/1999/xlink");
        XML.Attrib("xmlns:vos", "http://www.ivoa.net/xml/VOSpace/v2.0");
        XML.Attrib("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");
        	XML.Node("vos:target",id);
        	XML.Node("vos:direction","pushFromVoSpace");
        	XML.Node("vos:view","ivo://ivoa.net/vospace/core#defaultview");
        	XML.BeginNode("vos:protocol");
        		XML.Attrib("uri", "ivo://ivoa.net/vospace/core#httpput");
	        	XML.Node("vos:protocolEndpoint",url);
            XML.EndNode();
        XML.EndNode();
        XML.Close(); // Takes care of unended tags.
        return XML.ToString();
    }
    catch(Err)
    {
        alert("Error: " + Err.description);
    }
}

function createMoveJob(from, to) {
    try
    {
        var XML=new XMLWriter();
        XML.BeginNode("vos:transfer");
        XML.Attrib("xmlns:vos", "http://www.ivoa.net/xml/VOSpace/v2.0");
        	XML.Node("vos:target",from);
        	XML.Node("vos:direction",to);
        	XML.Node("vos:keepBytes","false");
        XML.EndNode();
        XML.Close(); // Takes care of unended tags.
        return XML.ToString();
    }
    catch(Err)
    {
        alert("Error: " + Err.description);
    }
}


function createNewNodeXml(type, id) {
    try
    {
        var XML=new XMLWriter();
        XML.BeginNode("vos:node");
        XML.Attrib("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");
        XML.Attrib("xsi:type", "vos:"+type);
        XML.Attrib("xmlns:vos", "http://www.ivoa.net/xml/VOSpace/v2.0");
        XML.Attrib("uri", id);

        /*XML.BeginNode("vos:properties", "");
        XML.BeginNode("vos:property");
        XML.Attrib("uri", "ivo://ivoa.net/vospace/core#description");
        XML.WriteString("data");
        XML.EndNode();
        XML.EndNode();*/

        XML.Node("vos:properties", "");

        XML.Node("vos:accepts", "");

        XML.Node("vos:provides", "");

        XML.Node("vos:capabilities", "");
        
        XML.EndNode();
        XML.Close(); // Takes care of unended tags.
        return XML.ToString();
    }
    catch(Err)
    {
        alert("Error: " + Err.description);
    }
}

function formatXml(xml) {
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
};
