define([
  'jquery',
  'bootstrap',
  'underscore',
  'backbone',
  'mysession',
  'DEM',
  'text!templates/footer_tpl.html',
], function($, bootstrap, _, Backbone, session, DEM, footer){
	var Foot = {
		View: function () {
			return Backbone.View.extend({
				uri : '',
				events: {
					'click #clear_cache': 'clear_cache',
				},
				render: function () {
					var template = _.template( footer );
					//render the template
					this.$el.html( template );
				},
				clear_cache: function(e) {
					e.preventDefault();
					window.location.reload(true);
				}
			});
		}

	}
	return Foot;
});