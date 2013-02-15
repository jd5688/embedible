define(function() {
	var DEM = DEM || {};
	
	DEM.domain 		= 	"http://192.168.254.112:8000/"; //python is listening on this port
	DEM.website		=	"http://192.168.254.112/~admin/"; //website url here
	DEM.root		=	"/~admin"; // the root url
	DEM.key			=	function () {
							return "ph1li9sVAi0";
						};
	DEM.ux			=	function () {
							return new Date().getTime();
						};
	return DEM;
});