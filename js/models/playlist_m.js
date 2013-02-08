define([
	'jquery',
	'underscore',
	'backbone',
    'DEM'
], function($, _, Backbone, DEM){
  	var Playlists = Backbone.Model.extend({
		url: DEM.domain + "playlists?callback=?"
	});
	
	return Playlists;
});