define([
	'jquery',
	'underscore',
	'backbone'
], function($, _, Backbone){
  	var Session = Backbone.Model.extend({
  		defaults : {
  			username	:	''
  		}
  	});
  	
  	var session = new Session();
  	return session;
});