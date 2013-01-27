define([
	'jquery',
	'underscore',
  	'backbone',
  	'models/embed_save_m',
], function($, _, Backbone, embedSave){
	var SaveEmbed = Backbone.View.extend({
		model: embedSave,
		
		initialize: function () {
			this.render();
		},
		
		render: function () {
			this.data.provider = this.$("#provider").val();
			this.data.description = this.$("#description").val();
			this.data.xframe = this.$("#xframe").val();
			this.data.is_public = this.$("#is_public").val();
			this.data.category = $("input:radio[name=category]:checked").val();
			this.data.thumbnail = this.$("#thumbnail").val();
			this.data.user_id = 1;
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