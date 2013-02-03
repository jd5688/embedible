define(function() {
	var DEM = DEM || {};
	
	DEM.domain 		= 	"http://localhost:8000/"; //python is listening on this port
	DEM.website		=	"http://localhost/~admin/"; //website url here
	DEM.root		=	"/~admin"; // the root url
	
	return DEM;
});