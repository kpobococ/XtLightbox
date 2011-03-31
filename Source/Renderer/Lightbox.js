/*
---
name: XtLightbox.Renderer.Lightbox

description: extendable lightbox default Lightbox Renderer

license: MIT-style

authors:
- Anton Suprun <kpobococ@gmail.com>

requires: [Core/Fx.Tween, Core/Fx.Morph, XtLightbox.Renderer]

provides: [XtLightbox.Renderer.Lightbox]

...
*/

XtLightbox.Renderer.Lightbox = new Class({

	Extends: XtLightbox.Renderer,

	options: {
		maskFxOptions: {},
		widthFxOptions: {},
		heightFxOptions: {},
		contentFxOptions: {},
		footerFxOptions: {},
		hideArrowsFor: ['YouTube', 'Vimeo']
	},

	create: function(){
		this.parent();
		this.fxWidth = new Fx.Morph(this.element, Object.merge({}, this.options.widthFxOptions, {
			onStart: function(){},
			onCancel: function(){},
			onComplete: function(){
				this.onWidthChange();
			}.bind(this)
		}));
		this.fxTop = new Fx.Tween(this.element, Object.merge({}, this.options.heightFxOptions, {
			property: 'top',
			onStart: function(){},
			onCancel: function(){},
			onComplete: function(){}
		}));
		this.fxHeight = new Fx.Tween(this.elContent, Object.merge({}, this.options.heightFxOptions, {
			property: 'height',
			onStart: function(){},
			onCancel: function(){},
			onComplete: function(){
				this.onHeightChange();
			}.bind(this)
		}));
		this.fxContent = new Fx.Tween(this.elContent, Object.merge({}, this.options.contentFxOptions, {
			property: 'opacity',
			onStart: function(){},
			onCancel: function(){},
			onComplete: function(){
				this.onContentRender();
			}.bind(this)
		}));
		this.fxFooter = new Fx.Tween(this.elFooter, Object.merge({}, this.options.footerFxOptions, {
			property: 'height',
			onStart: function(){
				this.elFooter.setStyle('overflow', 'hidden');
			}.bind(this),
			onCancel: function(){},
			onComplete: function(){
				this.elFooter.setStyle('overflow', '');
			}.bind(this)
		}));
	},

	destroy: function(){
		delete this.fxWidth;
		delete this.fxTop;
		delete this.fxHeight;
		delete this.fxContent;
		delete this.fxFooter;
		return this.parent();
	},

	inject: function(){
		this.parent();
		this.removeEvents('show').removeEvents('hide');
		if (this.mask){
			this.mask.addEvent('click', this.fireEvent.pass('close', this));
			var fxShow = new Fx.Tween(this.mask, Object.merge({}, this.options.maskFxOptions, {
				property: 'opacity',
				onStart: function(){
					this.show();
				}.bind(this.mask),
				onCancel: function(){},
				onComplete: function(){}
			}));
			var fxHide = new Fx.Tween(this.mask, Object.merge({}, this.options.maskFxOptions, {
				property: 'opacity',
				onStart: function(){},
				onCancel: function(){},
				onComplete: function(){
					this.hide();
				}.bind(this.mask)
			}));
			var mo = this.options.maskOpacity || this.mask.toElement().getStyle('opacity') || 1;
			this.mask.toElement().setStyle('opacity', 0);
			this.addEvents({
				show: function(){
					fxHide.cancel();
					fxShow.start(mo);
				},
				hide: function(){
					fxShow.cancel();
					fxHide.start(0);
				}
			});
		}
	},

	empty: function(){
		this.parent();
		this.elFooter.setStyle('display', 'none');
		this.btnPrev.setStyle('display', 'none');
		this.btnNext.setStyle('display', 'none');
		this._opts = {};
		this._cont = null;
		this._fwopts = null;
		this.fxHeight.cancel();
		this.fxTop.cancel();
		this.fxWidth.cancel();
		this.fxContent.cancel();
		this.fxFooter.cancel();
		return this;
	},

	render: function(content, options){
		if (!content) return this;
		options = Object.append({
			close: true
		}, options);
		this.empty();
		this.elTitle.set('text', options.title || '');
		if (options.position && options.total && (!this.options.hideSinglePosition || options.total > 1)){
			this.elPosition.set('text', this.options.positionText.substitute({
				x: options.position,
				total: options.total
			}));
		}
		this._opts = options;
		this._cont = content;
		this.resize(options.size);
		return this;
	},

	renderContent: function(){
		this.fxContent.set(0).start(1);
		return this;
	},

	onContentRender: function(){
		this.btnPrev.setStyle('display', this._opts.prev ? '' : 'none');
		this.btnNext.setStyle('display', this._opts.next ? '' : 'none');
		if (this.options.hideArrowsFor.contains(this._opts.adaptor) || (!this._opts.next && !this._opts.prev)) this.elArrows.setStyle('display', 'none');
		else this.elArrows.setStyle('display', '');
		this.btnClose.setStyle('display', this._opts.close ? '' : 'none');
		this.renderFooter();
	},

	renderFooter: function(){
		this.elFooter.setStyles({
			visibility: 'hidden',
			display: ''
		});
		var y = this.elFooter.getSize().y;
		this.elFooter.setStyles({
			visibility: 'visible',
			height: 0
		});
		this.fxFooter.start(y);
		return this;
	},

	resize: function(size){
		if (!this.shown) this.show();
		var winSize = window.getSize(), elSize;
		if (size && size.x && size.y){
			this.elFooter.setStyles({
				display: '',
				height: ''
			});
			var elFull = this.element.getSize();
			var elBox = {
				x: this.elWrapper.getStyle('width').toInt(),
				y: this.elWrapper.getStyle('height').toInt()
			};
			var fY = this.elFooter.getSize().y;
			this.elFooter.setStyle('display', 'none');
			elSize = {
				x: elFull.x - elBox.x + size.x,
				y: elFull.y - elBox.y + size.y + fY
			};
			this._fwopts = {
				width: elSize.x,
				left: Math.round((winSize.x - elSize.x) / 2)
			};
			if (size.y != this.elContent.getStyle('height').toInt()){
				this.resizing = true;
				this.fxHeight.start(size.y);
				this.fxTop.start(Math.round((winSize.y - elSize.y) / 2));
			} else this.onHeightChange();
		} else {
			// Reset size
			size = size || {};
			this.element.setStyle('width', size.x || '');
			this.elContent.setStyle('height', size.y || '');
			this.elFooter.setStyle('display', '');
			elSize = this.element.getSize();
			this.elFooter.setStyle('display', 'none');
			this.element.setStyles({
				left: Math.round((winSize.x - elSize.x) / 2),
				top: Math.round((winSize.y - elSize.y) / 2)
			});
		}
		return this;
	},

	onWidthChange: function(){
		this.resizing = false;
		this.elContent.grab(this._cont);
		this.renderContent();
		return this;
	},

	onHeightChange: function(){
		if (this._fwopts.width != this.element.getStyle('width').toInt()) {
			this.resizing = true;
			this.fxWidth.start(this._fwopts);
		} else this.onWidthChange();
		return this;
	},

	reset: function(){
		if (!this.injected) return this;
		this.resize();
		this.empty();
		this.elFooter.setStyle('display', 'none');
		return this;
	}

});
