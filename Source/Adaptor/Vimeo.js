/*
---
name: XtLightbox.Adaptor.Vimeo

description: extendable lightbox Vimeo Adaptor class

license: MIT-style

authors:
- Anton Suprun <kpobococ@gmail.com>

requires: [Core/Swiff, XtLightbox.Adaptor]

provides: [XtLightbox.Adaptor.Vimeo]

...
*/

XtLightbox.Adaptor.Vimeo = new Class({

	Extends: XtLightbox.Adaptor,

	$name: 'Vimeo',

	options: {
		width: 800,
		height: 450,
		title: true,
		byline: true,
		portrait: true,
		color: '00adef',
		autoplay: true,
		loop: false,
		iframe: true
	},

	check: function(element){
		var r = /https?:\/\/(?:www\.)?vimeo.com\/([0-9]+)(?:\?|$)/i.exec(element.href);
		if (r){
			element.$xtlightbox = element.$xtlightbox || {};
			element.$xtlightbox.VimeoId = r[1];
		}
		return r;
	},

	getContent: function(element){
		if (!XtLightbox.Adaptor.cached(element)) throw new Error('Element content must be loaded first');
		return XtLightbox.Adaptor.load(element);
	},

	getSize: function(element){
		if (!XtLightbox.Adaptor.cached(element)) throw new Error('Element content must be loaded first');
		return {
			x: this.options.width,
			y: this.options.height
		};
	},

	setSize: function(element, size){
		if (!XtLightbox.Adaptor.cached(element)) throw new Error('Element content must be loaded first');
		var obj = document.id(XtLightbox.Adaptor.load(element));
		if (!obj.set){
			obj.width = size.x;
			obj.height = size.y;
		} else obj.set({
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
		var params = {};
		if (this.options.iframe){
			if (!this.options.title) params.title = '0';
			if (!this.options.byline) params.byline = '0';
			if (!this.options.portrait) params.portrait = '0';
			if (this.options.color && this.options.color != '00adef') params.color = this.options.color;
			if (this.options.autoplay) params.autoplay = '1';
			if (this.options.loop) params.loop = '1';
		} else {
			params.clip_id = element.$xtlightbox.VimeoId;
			params.server = 'vimeo.com';
			params.show_title = this.options.title ? '1' : '0';
			params.show_byline = this.options.byline ? '1' : '0';
			params.show_portrait = this.options.portrait ? '1' : '0';
			params.color = this.options.color || '00adef';
			params.fullscreen = '1';
			params.autoplay = this.options.autoplay ? '1' : '0';
			params.loop = this.options.loop ? '1' : '0';
		}
		var a = [];
		for (var p in params){
			if (!params.hasOwnProperty(p)) continue;
			a.push(p + '=' + params[p]);
		}
		params = a.join('&');
		var obj;
		if (this.options.iframe){
			obj = new Element('iframe', {
				width: this.options.width,
				height: this.options.height,
				src: 'http://player.vimeo.com/video/' + element.$xtlightbox.VimeoId + '?' + params,
				frameborder: 0
			});
		} else {
			obj = new Swiff('http://vimeo.com/moogaloop.swf?' + params, {
				width: this.options.width,
				height: this.options.height,
				params: {
					allowFullScreen: 'true',
					movie: 'http://vimeo.com/moogaloop.swf?' + params,
					wMode: 'transparent',
					bgcolor: '#ff3300'
				}
			});
		}
		XtLightbox.Adaptor.cache(element, obj);
		callback(element);
		return this;
	}
});
