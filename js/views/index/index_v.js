define([
  'jquery',
  'underscore',
  'backbone',
  'models/index_main_m',
  'text!templates/index/index_tpl.html',
  'text!templates/index/main_body_tpl.html',
], function($, _, Backbone, Index_m, tmplate, body_tpl){
	var Index = {
		'View'	: function () { 
			return Backbone.View.extend({
				initialize: function () {
					this.render();
				},
				render: function () {
					var template = _.template( tmplate );
					//render the template
					this.$el.html( template );
					
					if (this.model.has("username")) {
						// if model has attribute named 'username', load main_body immediately.
						this.main_body();
					} else {
						// Otherwise, wait. if change happens, then load main_body.
						this.model.on('change', this.main_body, this);
					}
				},
				main_body: function () {
					var data = {};
					data.data = this.json();
					var template = _.template( body_tpl, data );
					//render the template
					this.$el.html( template );
				},
				json: function() {
					return this.model.toJSON();
				},
			});
		},
		'Main'	: function () {
			return new Index_m();
		},
	}
	return Index;
});