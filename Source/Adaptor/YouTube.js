/*
---
name: XtLightbox.Adaptor.YouTube

description: extendable lightbox YouTube Adaptor class

license: MIT-style

authors:
- Anton Suprun <kpobococ@gmail.com>

requires: [Core/Swiff, XtLightbox.Adaptor]

provides: [XtLightbox.Adaptor.YouTube]

...
*/

XtLightbox.Adaptor.YouTube = new Class({

	Extends: XtLightbox.Adaptor,

	$name: 'YouTube',

	options: {
		width: 853,
		height: 505,
		hd: true,
		fullscreen: false,
		related: false,
		autoplay: true,
		iframe: false
	},

	check: function(element){
		var l = /https?:\/\/(?:www\.)?youtube.com\/watch\?(?:\S+=\S*&)*v=([-a-z0-9_]+)(?:&|$)/i,
		s = /https?:\/\/(?:www\.)?youtu.be\/([-a-z0-9_]+)$/i;
		var r = l.exec(element.href);
		if (!r) r = s.exec(element.href);
		if (r){
			element.$xtlightbox = element.$xtlightbox || {};
			element.$xtlightbox.YouTubeId = r[1];
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
		if (this.options.iframe) params.wmode = 'transparent';
		if (this.options.fullscreen) params.fs = '1';
		if (!this.options.related) params.rel = '0';
		if (this.options.hd) params.hd = '1';
		if (this.options.autoplay) params.autoplay = '1';
		var a = [];
		for (var p in params){
			if (!params.hasOwnProperty(p)) continue;
			a.push(p + '=' + params[p]);
		}
		params = a.join('&');
		var obj;
		if (this.options.iframe) obj = new Element('iframe', {
			title: "YouTube video player",
			width: this.options.width,
			height: this.options.height,
			src: 'http://www.youtube.com/v/' + element.$xtlightbox.YouTubeId + '?' + params,
			frameborder: 0,
			allowfullscreen: ''
		});
		else obj = new Swiff('http://www.youtube.com/v/' + element.$xtlightbox.YouTubeId + '?' + params, {
			width: this.options.width,
			height: this.options.height,
			params: {
				allowFullScreen: 'true',
				wMode: 'transparent',
				bgcolor: '#ff3300'
			}
		});
		XtLightbox.Adaptor.cache(element, obj);
		callback(element);
		return this;
	}
});
