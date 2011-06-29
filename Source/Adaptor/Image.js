/*
---
name: XtLightbox.Adaptor.Image

description: extendable lightbox Image Adaptor class

license: MIT-style

authors:
- Anton Suprun <kpobococ@gmail.com>

requires: [XtLightbox.Adaptor]

provides: [XtLightbox.Adaptor.Image]

...
*/

XtLightbox.Adaptor.Image = new Class({

	Extends: XtLightbox.Adaptor,

	$name: 'Image',

	options: {
		extensions: ['jpg', 'png', 'gif'],
		lightboxCompat: true
	},

	initialize: function(options){
		this.parent(options);
		var e = this.options.extensions || [];
		if (e.contains('jpg') && !e.contains('jpeg')) e.push('jpeg');
	},

	check: function(element){
		return this.options.lightboxCompat ? this.parent(element) : element.href.test('\\.(?:' + this.options.extensions.join('|') + ')$', 'i');
	},

	getContent: function(element){
		if (!XtLightbox.Adaptor.cached(element)) throw new Error('Element content must be loaded first');
		return XtLightbox.Adaptor.load(element);
	},

	getSize: function(element){
		if (!XtLightbox.Adaptor.cached(element)) throw new Error('Element content must be loaded first');
		var img = XtLightbox.Adaptor.load(element);
		return {
			x: img.naturalWidth,
			y: img.naturalHeight
		};
	},

	setSize: function(element, size){
		if (!XtLightbox.Adaptor.cached(element)) throw new Error('Element content must be loaded first');
		var img = XtLightbox.Adaptor.load(element);
		img.set({
			width: size.x,
			height: size.y
		});
		return this;
	},

	load: function(element, callback){
		callback = callback || function(){};
		if (XtLightbox.Adaptor.cached(element)){
			callback(element);
			return this;
		}
		new Element('img').addEvent('load', function(){
			if (!this.naturalWidth) this.naturalWidth = this.width;
			if (!this.naturalHeight) this.naturalHeight = this.height;
			XtLightbox.Adaptor.cache(element, this);
			callback(element);
		}).set({
			src: element.href,
			alt: ''
		});
		return this;
	}
});
