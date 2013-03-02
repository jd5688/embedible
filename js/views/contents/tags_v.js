define([
  'jquery',
  'bootstrap',
  'jcrypt',
  'tooltip',
  'underscore',
  'backbone',
  'models/contents_m',
  'DEM',
  'text!templates/index/tags_body_tpl.html',
], function($, bootstrap, jcrypt, tooltip, _, Backbone, Contents_m, DEM, body_tpl){
	var Contents = {
		'View'	: function () { 
			return Backbone.View.extend({
				events: {
					'click input[type=button]': 'redir'
				},
				render: function () {
					var publc = DEM.ux();
					var ckey = publc + DEM.key();		
					// use jcrypt to encrypt
					hash = $().crypt({
						method: "md5",
						source: ckey}
					);

					this.model.fetch({ url : DEM.domain + "tagscloud?hash=" + hash + "&publc=" + publc + "&callback=?" });
					
					if (this.model.has("id")) {
						// if model has attribute named 'id', load main_body immediately.
						this.main_body();
					} else {
						// Otherwise, wait. if change happens, then load main_body.
						this.model.on('change', this.main_body, this);
					}
				},
				main_body: function () {
					var data = {};
					data.data = this.model.toJSON();
					data.website = DEM.website;
					data.uri = this.model.get('uri');
					data.tag = this.model.get('tag');
					
					var template = _.template( body_tpl, data );
					//render the template
					this.$el.html( template );
					
					$('.thumbnail').tooltip({
						selector: "input[rel=tooltip]",
						placement: "bottom"
					});
				},
				redir: function (e) {
					e.preventDefault();
					var clickedEl = $(e.currentTarget);
					var id = clickedEl.attr("id");
					Backbone.history.navigate("tags/" + id, true);
				},
				onClose: function(){
					this.model.unbind("change", this.render);
				}
			});
		},
		'Model': function () {
			return new Contents_m();
		},
	}
	return Contents;
});