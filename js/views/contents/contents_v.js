define([
  'jquery',
  'underscore',
  'backbone',
  'models/contents_m',
  'DEM',
  'text!templates/index/index_tpl.html',
  'text!templates/index/main_body_tpl.html',
  'text!templates/index/detail_tpl.html',
], function($, _, Backbone, Contents_m, DEM, tmplate, body_tpl, detail_tpl ){
	var Contents = {
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
						// if model has attribute named 'id' or 'username', load main_body immediately.
						this.main_body();
					} else {
						// Otherwise, wait. if change happens, then load main_body.
						this.model.on('change', this.main_body, this);
					}
				},
				main_body: function () {
					var data = {};
					data.data = this.json();
					data.website = DEM.website;
					var detail = data.data.detail;
					
					if (typeof detail !== "undefined") {
						// this is the detail page
						var template = _.template( detail_tpl, data );
					} else {
						// this is the list page
						var template = _.template( body_tpl, data );
					}
					//render the template
					this.$el.html( template );
				},
				json: function() {
					return this.model.toJSON();
				},
			});
		},
		'Model': function () {
			return new Contents_m();
		},
	}
	return Contents;
});