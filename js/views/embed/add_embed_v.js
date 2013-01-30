define([
	'jquery',
	'underscore',
  	'backbone',
  	'models/add_embed_m',
	'text!templates/embed/embed_tpl.html',
	'text!templates/embed/embed_data_tpl.html',
	'mysession'
], function($, _, Backbone, Cat, tmplate, embed_result, session){
	var cat = new Cat();
	cat.fetch();

	var EmbedView = Backbone.View.extend({
		model: cat,
		events: {
			"click input[type=radio]"	: "onRadioClick",
			'click #choose_cat'			: 'showSelect',
			'click #hide_cat'			: 'hideSelect',
			'click #submit'				: 'embedly', // the link was submitted.
			'click #save'				: 'navi', // #save does not get rendered until 'embedly' has rendered.
			'click #embCancel'			: 'redir'
		},
		initialize: function () {
			// check if user is logged
			var logged = session.checkCookie();
			if (logged === false) {
				// only logged in users can submit embed. so...
				Backbone.history.navigate('', true);
				return true;
			}
		
		
			if (this.model.has("key")) {
				// if model has attribute named 'key', render immediately.
				// means that the model has already been preloaded before and no need to
				// wait for change anymore. Waiting for change at this time, will result in
				// render() function not firing. So...
				this.render();
			} else {
				// Otherwise, wait. if change happens, then render.
				// means that this model has no attribute named 'key' yet. Probably this is a fresh connection
				// or a reload on /embed page. Calling the render() function without waiting
				// for change at this time will result in page not properly loaded. So...
				this.model.on('change', this.render, this);
			}
		},

		render: function () {			
			var attributes = this.json();
			var embedlyKey = attributes.key;
			var template = _.template( tmplate, attributes );
			//render the template
			this.$el.html( template );
		},
		json: function() {
			return this.model.toJSON();
		},
		showSelect: function() {
			// display the radio buttons
			this.$('#sf').fadeIn();
			this.$('#b1').hide();
			this.$('#b2').show();
		},
				
		hideSelect: function() {
			// hide the radio buttons
			this.$('#sf').fadeOut();
			this.$('#b1').show();
			this.$('#b2').hide();
		},
				
		onRadioClick: function() {
			// if radio button clicked
			this.hideSelect();
			// assign the value of the 'checked' radio to rvalue;
			rvalue = $("input:radio[name=category]:checked").val();
			// update the span #disp_cat
			this.$('#disp_cat').html(rvalue);
		},
				
		embedly: function() {
			var embedlyKey = this.json().key;
			var url = this.$('#url').val();

			if (embedlyKey !== undefined && url !== '') {
				var api = 'http://api.embed.ly/1/oembed?key=' + embedlyKey + '&url=' + url + '&format=json';
				$.get(api, function(data) {
					// data in firefox is 'string'. in chrome it's an 'object'
					// so convert to jSON obj if not yet an object
					if (typeof data !== 'object') {
						data = $.parseJSON(data);
					}
					var template = _.template( embed_result, data );
					$('#embedible').html( template );
				});
			} else {
				// display an error message. user did not input any URL
				alert('Please enter your URL');
			}
		},
		
		navi: function() {
			var categ = $("input:radio[name=category]:checked").val();
			
			if (categ !== undefined) {
				Backbone.history.navigate('embed/save', true);
			} else {
				alert('You need to choose category');
			}
		},
		
		redir: function(e) {
			this.$('#url').val('');
			$('#embedible').html( '<input type="submit" id="submit" name="submit" value="Send"/>' );
			//$('#embedible')
		}
	});
	
	return EmbedView;
});