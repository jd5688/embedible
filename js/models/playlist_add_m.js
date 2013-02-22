define([
	'jquery',
	'underscore',
	'backbone',
    'DEM'
], function($, _, Backbone, DEM){
  	var AddPlaylist = Backbone.Model.extend({
		url: DEM.domain + "add_playlist",
		defaults: {
			username	:	'',
			pl_name		:	'',
			publc		:	'',
			hash		:	''
		}
	});
	
	return AddPlaylist;
});