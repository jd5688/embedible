define([
	'jquery',
	'underscore',
	'backbone',
	'DEM'
], function($, _, Backbone, DEM){
	var EmbedSave = Backbone.Model.extend({
		url: DEM.domain + "save_embed",
		defaults: {
			provider	:	'',
			description	:	'',
			xframe		:	'',
			is_public	:	'',
			user_id		:	'',
			category	:	'',
			thumbnail	:	''
		}
	});
	
	var embedSave = new EmbedSave();
	
	return embedSave;
});