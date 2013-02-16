define(function() {
	var DEM = DEM || {};
	
	DEM.domain 		= 	"http://localhost:8000/"; //python is listening on this port
	DEM.website		=	"http://localhost/~admin/"; //website url here
	DEM.root		=	"/~admin"; // the root url
	DEM.key			=	function () {
							return "ph1li9sVAi0";
						};
	DEM.ux			=	function () {
							return new Date().getTime();
						};
	return DEM;
});