define([
  'jquery',
  'underscore',
  'backbone',
  'models/content_m',
  'DEM',
  'text!templates/index/index_tpl.html',
  'text!templates/index/main_body_tpl.html',
  'text!templates/index/detail_tpl.html',
], function($, _, Backbone, Content_m, DEM, tmplate, body_tpl, detail_tpl ){
	var Content = {
		'View'	: function () { 
			return Backbone.View.extend({
				initialize: function () {
					this.render();
				},
				render: function () {
					var template = _.template( tmplate );
					//render the template
					this.$el.html( template );
					if (this.model.has("id") || this.model.has("username")) {
						if (this.model.hasChanged) {
							this.model.on('change', this.main_body, this);
						} else {
							// if model has attribute named 'id' or 'username', and it hasn't changed value, load main_body immediately.
							this.main_body();
						}
					} else {
						// Otherwise, wait. if change happens, then load main_body.
						this.model.on('change', this.main_body, this);
					}
				},
				main_body: function () {
					var data = {};
					data.data = this.json();
					if (typeof data.data.id === 'undefined') {
						Backbone.history.navigate('404', true); // not found
					} else {
						data.website = DEM.website;
						var template = _.template( detail_tpl, data );
						//render the template
						this.$el.html( template );
					}
				},
				json: function() {
					return this.model.toJSON();
				},
			});
		},
		'Model': function () {
			return new Content_m();
		},
	}
	return Content;
});