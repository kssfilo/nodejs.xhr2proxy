/**
 * HTTP/HTTPS proxy plugin of connect/express for XHR(XMLHTTPRequest)
 * with referer restriction and appending Access-Control-Allow-Origin for cross domain XHR2
 * Based on cdroxy by macchadogj(thanks)
 */

var http = require('http'),
    url = require("url"),
    httpProxy = require('http-proxy'),
    http = require("http");


/**
 * adds an endpoint to proxy http calls.
 * @param {object} options 'prefix': prefix string,'referer': regex(prevent request unless matching),'acao':(append Access-Control-Allow-Origin to responses with this value, * for all)
 * @api public
 */

module.exports = function ( options ) {

    var proxy      = new httpProxy.RoutingProxy(),
        httpsProxy = new httpProxy.RoutingProxy({target: {https: true}});

    prefix = options&&options.prefix || 'proxy';
    var pattern = new RegExp("^\/" + prefix + "\/");
	var referer=options&&options.referer||null;
	var acao=options&&options.acao||null;

	if(acao!=null){
		var over=function(req,res,response){
			response.headers['Access-Control-Allow-Origin']=acao;
		}
		proxy.on('proxyResponse',over);
		httpsProxy.on('proxyResponse',over);
	}

    return function ( req, res, next ) {

        if(!req.url.match(pattern)) {  return next(); }
		if(referer!=null){ if(!req.headers.referer||!req.headers.referer.match(referer))return next(); }

        var backendUrl = req.url.substr( ("/" + prefix + "/").length ),
            parsedUrl = url.parse(backendUrl);

        if (!parsedUrl.hostname) {
            backendUrl = decodeURIComponent(backendUrl);
            parsedUrl = url.parse(backendUrl);
        }

        req.url = backendUrl;
        req.headers.host = parsedUrl.host;
		
        if(parsedUrl.protocol !== "https:"){
            proxy.proxyRequest(req, res, {
              host: parsedUrl.hostname,
              port: parsedUrl.port || 80
            });
        }else{
            console.log('sending https request to: ', backendUrl);
            httpsProxy.proxyRequest(req, res, {
              host: parsedUrl.hostname,
              port: parsedUrl.port || 443
            });
        }
    };
};
