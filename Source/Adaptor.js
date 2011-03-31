/*
---
name: XtLightbox.Adaptor

description: extendable lightbox Adaptor base

license: MIT-style

authors:
- Anton Suprun <kpobococ@gmail.com>

requires: [XtLightbox]

provides: [XtLightbox.Adaptor]

...
*/

(function(){

	var Adaptor = this.XtLightbox.Adaptor = new Class({

		Implements: Options,

		$name: '',

		options: {},

		initialize: function(options){
			this.setOptions(options);
		},

		check: function(element){
			return element.rel.test(/^lightbox/);
		},

		getContent: function(element){
			return '';
		},

		getTitle: function(element){
			return element.title;
		},

		getSize: function(element){
			return {x: 0, y: 0};
		},

		setSize: function(element, size){
			return this;
		},

		load: function(element, callback){
			callback(element);
			return this;
		},

		destroy: function(){
			return null;
		}

	});

	var count = 0,
		cache = {};

	Adaptor.cache = function(element, content){
		if (!element.$xtlightbox) throw new Error('Element must be attached to a lightbox');
		var a = element.$xtlightbox.adaptor, i = element.$xtlightbox.id;
		if (!i) i = element.$xtlightbox.id = ++count;
		cache[a + '-' + i] = content;
		return element;
	}

	Adaptor.load = function(element){
		if (!element.$xtlightbox) throw new Error('Element must be attached to a lightbox');
		if (!Adaptor.cached(element)) return null;
		var a = element.$xtlightbox.adaptor, i = element.$xtlightbox.id;
		return cache[a + '-' + i];
	}

	Adaptor.clear = function(element){
		if (!Adaptor.cached(element)) return element;
		var a = element.$xtlightbox.adaptor, i = element.$xtlightbox.id;
		cache[a + '-' + i] = null;
		return element;
	}

	Adaptor.cached = function(element){
		if (!element.$xtlightbox) return false;
		var i = element.$xtlightbox.id, a = element.$xtlightbox.adaptor;
		return i && a && cache[a + '-' + i];
	}

})();
