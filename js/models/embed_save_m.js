define([
	'jquery',
	'underscore',
	'backbone',
	'DEM'
], function($, _, Backbone, DEM){
	var EmbedSave = Backbone.Model.extend({
		url: DEM.domain + "save_embed",
		defaults: {
			data		:	'',
			is_public	:	'',
			username	:	'',
			category	:	'',
			tags		:	'',
			hash		:	'',
			publc		:	''
		}
	});
	
	//var embedSave = new EmbedSave();
	
	return EmbedSave;
});