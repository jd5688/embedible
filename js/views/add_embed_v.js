define([
	'jquery',
	'underscore',
  	'backbone',
  	'models/add_embed_m',
	'text!templates/embed/embed_tpl.html',
	'text!templates/embed/embed_data_tpl.html',
], function($, _, Backbone, cat, tmplate, embed_result){
	var EmbedView = Backbone.View.extend({
		model: cat,
		events: {
			"click input[type=radio]": "onRadioClick",
			'click #choose_cat': 'showSelect',
			'click #hide_cat': 'hideSelect',
			'click #submit': 'embedly', // the link was submitted.
			'click #save': 'navi', // #save does not get rendered until 'embedly' has rendered.
		},
		initialize: function () {
			// when the document body has been fully loaded, render this
			this.model.on('change', this.render, this)
			//this.render();
		},
		render: function () {
			//this.model.fetch();
			//var attributes = this.model.toJSON();
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
					// data in firefox is 'string'. in chrome is 'object'
					// so convert to jSON obj if not an object
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
		}
	});
	
	return EmbedView;
});