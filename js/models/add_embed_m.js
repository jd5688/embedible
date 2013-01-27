define([
	'jquery',
	'underscore',
	'backbone',
	'DEM'
], function($, _, Backbone, DEM){
  	var Cat = Backbone.Model.extend({
		url: DEM.domain + "categories?callback=?"
	});
	
	var cat = new Cat();
	cat.fetch();
	
	return cat;
});