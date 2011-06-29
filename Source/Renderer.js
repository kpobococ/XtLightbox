/*
---
name: XtLightbox.Renderer

description: extendable lightbox Renderer base

license: MIT-style

authors:
- Anton Suprun <kpobococ@gmail.com>

requires: [More/Mask, XtLightbox]

provides: [XtLightbox.Renderer]

...
*/

XtLightbox.Renderer = new Class({

	Implements: [Options, Events],

	options: {
		// onPrevious,
		// onNext,
		// onClose,
		// onShow,
		// onHide,
		// onDestroy,
		positionText: 'Image {x} of {total}',
		useMask: true,
		maskOptions: {},
		hideArrowsFor: [],
		hideSinglePosition: true
	},

	initialize: function(options){
		this.setOptions(options);
	},

	create: function(){
		if (this.element) return this;
		this.element = new Element('div.xt-lightbox').grab(
			this.elWrapper = new Element('div.xt-lightbox-wrapper').adopt(
				new Element('div.xt-lightbox-content-wrapper').adopt(
					this.elContent = new Element('div.xt-lightbox-content'),
					this.elArrows  = new Element('div.xt-lightbox-arrows').adopt(
						this.btnPrev = new Element('span.button.xt-lightbox-prev').addEvent('click', this.fireEvent.pass('previous', this)),
						this.btnNext = new Element('span.button.xt-lightbox-next').addEvent('click', this.fireEvent.pass('next', this))
					)
				),
				this.elFooter = new Element('div.xt-lightbox-footer').grab(
					new Element('div.xt-lightbox-footer-wrapper').adopt(
						this.btnClose = new Element('span.button.xt-lightbox-close').addEvent('click', this.fireEvent.pass('close', this)),
						this.elTitle	= new Element('div.xt-lightbox-title'),
						this.elPosition = new Element('div.xt-lightbox-position'),
						new Element('div.xt-clear')
					)
				)
			).addEvent('click', function(e) {
				e.stopPropagation();
			})
		).addEvent('click', this.fireEvent.pass('close', this));
		return this;
	},

	inject: function(){
		if (this.injected) return this;
		if (!this.element) this.create();
		var i = this.options.inject,
			t = i && i.target ? i.target : document.body,
			w = i && i.where  ? i.where  : 'inside';
		this.element.setStyle('display', 'none').inject(t, w);
		if (this.options.useMask && window.Mask) {
			this.mask = new Mask(document.body, Object.merge({
				'class': 'xt-lightbox-mask',
				onClick: this.fireEvent.pass('close', this)
			}, this.options.maskOptions));
			this.addEvents({
				show: this.mask.show.bind(this.mask),
				hide: this.mask.hide.bind(this.mask),
				destroy: this.mask.destroy.bind(this.mask)
			});
		}
		this.injected = true;
		return this;
	},

	setLoading: function(v){
		this.toElement()[this.loading = !!v ? 'addClass' : 'removeClass']('loading');
		return this;
	},

	show: function(){
		if (!this.injected) this.inject();
		if (this.shown) return this;
		this.element.setStyle('display', '');
		this.shown = true;
		this.resize();
		this.fireEvent('show');
		return this;
	},

	hide: function(){
		if (!this.injected || !this.shown) return this;
		this.reset();
		this.element.setStyle('display', 'none');
		this.shown = false;
		this.fireEvent('hide');
		return this;
	},

	reset: function(){
		if (!this.injected) return this;
		this.resize();
		this.empty();
		this.elFooter.setStyle('display', 'none');
		return this;
	},

	empty: function(){
		if (!this.element) return this;
		this.elTitle.empty();
		this.elPosition.empty();
		this.elContent.empty();
		return this;
	},

	render: function(content, options){
		if (!content) return this;
		options = Object.append({
			close: true
		}, options);
		this.empty();
		this.elTitle.set('text', options.title || '');
		if (options.position && options.total && (!this.options.hideSinglePosition || options.total > 1)) {
			this.elPosition.set('text', this.options.positionText.substitute({
				x: options.position,
				total: options.total
			}));
		}
		this.resize(options.size);
		this.elFooter.setStyle('display', '');
		this.elContent.empty().grab(content);
		this.btnPrev.setStyle('display', options.prev ? '' : 'none');
		this.btnNext.setStyle('display', options.next ? '' : 'none');
		if (this.options.hideArrowsFor.contains(this.rOpts.adaptor) || (!options.next && !options.prev)) this.elArrows.setStyle('display', 'none');
		else this.elArrows.setStyle('display', '');
		this.btnClose.setStyle('display', options.close ? '' : 'none');
		return this;
	},

	resize: function(size, callback){
		if (!this.shown) this.show();
		size = size || {};
		this.element.setStyles({
			width: size.x || '',
			height: size.y || ''
		});
		if (callback) callback();
		return this;
	},

	toElement: function(){
		if (!this.element) this.create();
		return this.element;
	},

	destroy: function(){
		this.element.destroy();
		this.fireEvent('destroy');
		return null;
	},

	getMaxSize: function(options){
		var t = this.elTitle.get('text'), p,
			d = this.elFooter.getStyle('display');
		this.elTitle.set('text', options.title || '');
		if (options.position && options.total && (!this.options.hideSinglePosition || options.total > 1)){
			p = this.elPosition.get('text');
			this.elPosition.set('text', this.options.positionText.substitute({
				x: options.position,
				total: options.total
			}));
		}
		this.elFooter.setStyle('display', '');
		var winSize  = window.getSize();
		var elSize   = this.element.getSize();
		var contSize = this.elContent.getSize();
		// revert state
		this.elTitle.set('text', t || '');
		if (p) this.elPosition.set('text', p);
		this.elFooter.setStyle('display', d);
		return {
			x: winSize.x - (elSize.x - contSize.x),
			y: winSize.y - (elSize.y - contSize.y)
		};
	}

});
