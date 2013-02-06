define([
	'jquery',
	'underscore',
	'backbone'
], function($, _, Backbone){
  	var Head_m = Backbone.Model.extend({
  		defaults: {
			"uri":  "home"
		  }
	});
	
	return Head_m;
});