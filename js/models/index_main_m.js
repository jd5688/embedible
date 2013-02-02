define([
	'jquery',
	'underscore',
	'backbone',
    'DEM'
], function($, _, Backbone, DEM){
  	var Index = Backbone.Model.extend({
		url: DEM.domain + "getembed?callback=?"
	});
	
	return Index;
});