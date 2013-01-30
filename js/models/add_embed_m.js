define([
	'jquery',
	'underscore',
	'backbone',
	'DEM'
], function($, _, Backbone, DEM){
  	var Cat = Backbone.Model.extend({
		url: DEM.domain + "categories?callback=?"
	});
	
	return Cat;
});