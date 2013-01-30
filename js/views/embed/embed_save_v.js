define([
	'jquery',
	'underscore',
  	'backbone',
  	'models/embed_save_m',
  	'mysession'
], function($, _, Backbone, embedSave, session){
	var SaveEmbed = Backbone.View.extend({
		model: embedSave,
		
		initialize: function () {
			this.render();
		},
		
		render: function () {
			this.data.data = this.$("#data").val();
			this.data.tags = this.$("#tags").val();
			this.data.is_public = this.$("#is_public").val();
			this.data.category = $("input:radio[name=category]:checked").val();
			this.data.username = session.getCookie("username");
			this.model.set(this.data);
		},
		
		data: {},
		
		save: function() {
			this.model.save(null, {
				// always results in error even if successful. maybe this is due to cross-domain
				// error: -> goes to success page
				error : function(options) {
					Backbone.history.navigate('embed/save/success', true);
				},
				success: function() {
					Backbone.history.navigate('embed/save/success', true);
				}
			});
		}
	});
	
	return SaveEmbed;
	//var saveEmbed = new SaveEmbed();
});