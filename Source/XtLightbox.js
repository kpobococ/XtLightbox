/*
---
name: XtLightbox

description: extendable lightbox Base

license: MIT-style

authors:
- Anton Suprun <kpobococ@gmail.com>

requires: [Core/1.3:Class.Extras, Core/1.3:Element]

provides: [XtLightbox]

...
*/

(function($){
var XtLightbox = this.XtLightbox = new Class({

	Implements: [Options, Events],

	options: {
		// onAttach: function(element){},
		// onDetach: function(element){},
		// onShow: function(element){},
		// onHide: function(){},
		// onNext: function(element){},
		// onPrevious: function(element){},
		// onClear: function(){},
		// onDestroy: function(){},
		adaptors: ['Image'],
		adaptorOptions: {},
		renderer: 'Lightbox',
		rendererOptions: {},
		preload: false,
		incrementalPreLoad: 3,
		loop: false,
		closeKeys: ['esc'],
		nextKeys: ['right', 'space'],
		prevKeys: ['left']
	},

	initialize: function(elements, options){
		this.setOptions(options);
		this.loadAdaptors();
		this.loadRenderer();
		var self = this;
		this.onElementClick = function(e){
			e.preventDefault();
			self.show(this);
		};
		$(document).addEvents({
			'keydown': function(e){
                if (self.shown){
                    if (self.options.closeKeys.contains(e.key)){
                        e.stop();
                        self.hide();
                    } else if (self.options.prevKeys.contains(e.key)){
                        e.stop();
                        self.previous();
                    } else if (self.options.nextKeys.contains(e.key)){
                        e.stop();
                        self.next();
                    }
                }
            },
			'keypress': function(e){
                if (!self.shown) return;
                // This stops browser default actions for bound keys
                if (self.options.closeKeys.contains(e.key)) e.stop();
                else if (self.options.prevKeys.contains(e.key)) e.stop();
                else if (self.options.nextKeys.contains(e.key)) e.stop();
            }
		});
		this.attach(elements);
	},

	loadAdaptors: function(){
		if (this.adaptors && this.adaptors.length > 0) return this;
		var adaptors = this.options.adaptors || ['Image'];
		this.adaptors = {};
		var valid = [];
		adaptors.each(function(name){
			if (!XtLightbox.Adaptor[name]) return null;
			var options = {};
			if (this.options.adaptorOptions && this.options.adaptorOptions[name]) options = this.options.adaptorOptions[name];
			var a = new XtLightbox.Adaptor[name](options);
			this.adaptors[name] = a;
			valid.push(a.$name);
		}, this);
		this.options.adaptors = valid;
		return this;
	},

	loadRenderer: function(){
		var name = this.options.renderer;
		if (!name || !XtLightbox.Renderer[name]) name = 'Lightbox';
		this.renderer = new XtLightbox.Renderer[name](this.options.rendererOptions);
		this.renderer.addEvents({
			next: this.next.bind(this),
			previous: this.previous.bind(this),
			close: this.hide.bind(this)
		});
		return this;
	},

	attach: function(elements){
		if (!instanceOf(elements, Elements)) elements = $$(elements);
		var i, l, a, n, e = new Elements;
		elements.each(function(el){
			if (el.$xtlightbox && el.$xtlightbox.adaptor) return null;
			for (i = 0, l = this.options.adaptors.length; i < l; i++){
				n = this.options.adaptors[i];
				a = this.adaptors[n];
				if (a.check(el)){
					el.$xtlightbox = el.$xtlightbox || {};
					el.$xtlightbox.adaptor = a.$name;
					e.push(el);
					el.addEvent('click', this.onElementClick);
					if (this.options.preload) a.load(el);
					break;
				}
			}
		}, this);
		if (e.length == 0) return this;
		if (this.elements) this.elements.append(e);
		else this.elements = e;
		this.fireEvent('attach', e);
		return this;
	},

	detach: function(elements){
		if (!instanceOf(elements, Elements)) elements = $$(elements);
		elements.each(function(el){
			this.elements.erase(el);
			el.removeEvent('click', this.onElementClick);
			delete el.$xtlightbox.adaptor;
		}, this);
		this.fireEvent('detach', elements);
		return this;
	},

	show: function(element){
		if (!element.$xtlightbox || !element.$xtlightbox.adaptor) return this;
		if (this.shown && this.current == element) return this;
		var name = element.$xtlightbox.adaptor;
		if (!this.adaptors[name]) return this;
		this.renderer.show();
		this.renderer.empty();
		var adaptor = this.adaptors[name];
		this.renderer.setLoading(true);
		adaptor.load(element, function(el){
			this.renderer.setLoading(false);
			var o = {
					title: adaptor.getTitle(el),
					total: this.elements.length,
					position: this.elements.indexOf(el) + 1,
					adaptor: element.$xtlightbox.adaptor
				};
			var loop = this.options.loop && o.total > 1;
			if (loop || o.position > 1) o.prev = true;
			if (loop || o.position < o.total) o.next = true;

			// max content size may depend on title size
			var maxSize = this.renderer.getMaxSize(o);
			o.size = adaptor.getSize(el);

			// check if max size is exceeded
			if (maxSize.x < o.size.x){
				o.size.y = Math.round(maxSize.x * o.size.y / o.size.x);
				o.size.x = maxSize.x;
			}
			if (maxSize.y < o.size.y){
				o.size.x = Math.round(o.size.x * maxSize.y / o.size.y);
				o.size.y = maxSize.y;
			}
			adaptor.setSize(el, o.size);
			var c = adaptor.getContent(el);
			this.renderer.render(c, o);

			// at this point we are done loading the image; optionally 'incremenetally' preload
			// note that the incremental preload functionality will preload backwards & forwards

			var a;
			for (a = 0; a < this.options.incrementalPreLoad; a++){
				if (o.position + a < o.total && this.elements[o.position + a]){
					this.adaptors[this.elements[o.position + a].$xtlightbox.adaptor].load(this.elements[o.position + a]);
				}
			}

			for (a = -this.options.incrementalPreLoad; a < 0; a++){
				if (o.position + a < 0 && this.elements[o.total + (o.position + a)]){
					this.adaptors[this.elements[o.total + (o.position + a)].$xtlightbox.adaptor].load(this.elements[o.total + (o.position + a)]);
				} else if (this.elements[o.position + a]) {
					this.adaptors[this.elements[o.position + a].$xtlightbox.adaptor].load(this.elements[o.position + a]);
				}
			}

		}.bind(this));
		this.current = element;
		this.shown = true;
		this.fireEvent('show', element);
		return this;
	},

	hide: function(){
		this.renderer.hide();
		this.current = null;
		this.shown = false;
		this.fireEvent('hide');
		return this;
	},

	next: function(){
		if (!this.elements || this.elements.length == 0) return this;
		if (!this.current) return this.show(this.elements[0]);
		var i = this.elements.indexOf(this.current);
		if (i + 1 == this.elements.length){
			if (this.options.loop) return this.show(this.elements[0]);
			return this;
		}
		this.fireEvent('next', this.elements[i + 1]);
		this.show(this.elements[i + 1]);
		return this;
	},

	previous: function(){
		if (!this.elements || this.elements.length == 0) return this;
		if (!this.current) return this.show(this.elements[0]);
		var i = this.elements.indexOf(this.current);
		if (i == 0){
			if (this.options.loop) return this.show(this.elements.getLast());
			return this;
		}
		this.fireEvent('previous', this.elements[i - 1]);
		this.show(this.elements[i - 1]);
		return this;
	},

	clear: function(){
		if (!this.elements) return this;
		this.elements.each(function(el){
			el.removeEvent('click', this.onElementClick);
			delete el.$xtlightbox.adaptor;
		});
		delete this.elements;
		this.fireEvent('clear');
		return this;
	},

	destroy: function(){
		this.clear();
		for (var i = this.adaptors.length; i--;) this.adaptors[i].destroy();
		this.adaptors.empty();
		this.renderer.destroy();
		delete this.adaptors;
		delete this.renderer;
		$(document).removeEvents({
			'keydown': this.onKeyPress,
			'keypress': this.onKeyPress
		});
		this.fireEvent('destroy');
		return null;
	},

	toElement: function(){
		return this.renderer.toElement();
	}

});
})(document.id);