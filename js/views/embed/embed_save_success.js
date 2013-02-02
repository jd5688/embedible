define([
  'jquery', 
  'underscore', 
  'backbone',
  'text!templates/embed/embed_success_tpl.html',
  'text!templates/embed/embed_fail_tpl.html',
], function($, _, Backbone, esuccess, efail){
	var EmbedSuccessFail = Backbone.View.extend({
		events: {
			'click #a_embed': 'gotoPage'
		},
		success: function() {
			var template = _.template( esuccess );
			//render the template
			this.$el.html( template );
		},
		
		fail: function() {
			var template = _.template( efail );
			//render the template
			this.$el.html( template );
		},
		
		gotoPage: function(e) {	
			e.preventDefault();
			Backbone.history.navigate('embed', true); // redirect to the embed main page
		}
	})
  return EmbedSuccessFail;
});