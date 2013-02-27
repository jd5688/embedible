define(function() {
	var DEM = DEM || {};
	
	DEM.domain 		= 	"http://192.168.1.105:8000/"; //python is listening on this port
	DEM.website		=	"http://192.168.1.105/~admin/"; //website url here
	DEM.root		=	"/~admin"; // the root url
	DEM.key			=	function () {
							return "ph1li9sVAi0";
						};
	DEM.ux			=	function () {
							return new Date().getTime();
						};
	DEM.$_GET		=	function (val) {
							var $GET = {}
							document.location.search.replace(/\??(?:([^=]+)=([^&]*)&?)/g, function () {
								function decode(s) {
									return decodeURIComponent(s.split("+").join(" "));
								}

								$GET[decode(arguments[1])] = decode(arguments[2]);
							});
							
							return $GET[val];
						};
	return DEM;
});