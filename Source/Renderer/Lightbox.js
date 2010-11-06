XtLightbox.Renderer.Lightbox = new Class(
{
    Extends: XtLightbox.Renderer,

    options: {
        maskFxOptions: {},
        widthFxOptions: {},
        heightFxOptions: {},
        contentFxOptions: {},
        footerFxOptions: {}
    },

    create: function()
    {
        this.parent();
        this.fxWidth = new Fx.Tween(this.elWrapper, Object.merge({}, this.options.widthFxOptions, {
            property: 'width',
            onStart: function() {},
            onCancel: function() {},
            onComplete: function() {
                this.onWidthChange();
            }.bind(this)
        }));
        this.fxHeight = new Fx.Tween(this.elContent, Object.merge({}, this.options.heightFxOptions, {
            property: 'height',
            onStart: function() {},
            onCancel: function() {},
            onComplete: function() {
                this.onHeightChange();
            }.bind(this)
        }));
        this.fxTop = new Fx.Tween(this.element, Object.merge({}, this.options.heightFxOptions, {
            property: 'top',
            onStart: function() {},
            onCancel: function() {},
            onComplete: function() {}
        }));
        this.fxContent = new Fx.Tween(this.elContent, Object.merge({}, this.options.contentFxOptions, {
            property: 'opacity',
            onStart: function() {},
            onCancel: function() {},
            onComplete: function() {
                this.onContentRender();
            }.bind(this)
        }));
        this.fxFooter = new Fx.Tween(this.elFooter, Object.merge({}, this.options.footerFxOptions, {
            property: 'height',
            onStart: function() {
                this.elFooter.setStyle('overflow', 'hidden');
            }.bind(this),
            onCancel: function() {},
            onComplete: function() {
                this.elFooter.setStyle('overflow', '');
            }.bind(this)
        }));
    },

    inject: function()
    {
        this.parent();
        this.mask.addEvent('click', this.fireEvent.pass('close', this));
        this.removeEvents('show').removeEvents('hide');
        var fxShow = new Fx.Tween(this.mask, Object.merge({}, this.options.maskFxOptions, {
            property: 'opacity',
            onStart: function() {
                this.show();
            }.bind(this.mask),
            onCancel: function() {},
            onComplete: function() {}
        }));
        var fxHide = new Fx.Tween(this.mask, Object.merge({}, this.options.maskFxOptions, {
            property: 'opacity',
            onStart: function() {},
            onCancel: function() {},
            onComplete: function() {
                this.hide();
            }.bind(this.mask)
        }));
        var mo = this.options.maskOpacity || this.mask.toElement().getStyle('opacity') || 1;
        this.mask.toElement().setStyle('opacity', 0);
        this.addEvents({
            show: function() {
                fxHide.cancel();
                fxShow.start(mo);
            },
            hide: function() {
                fxShow.cancel();
                fxHide.start(0);
            }
        });
    },

    empty: function()
    {
        this.parent();
        this.elFooter.setStyle('display', 'none');
        this.btnPrev.setStyle('display', 'none');
        this.btnNext.setStyle('display', 'none');
        this.rOpts = {};
        this.rCont = null;
        this.rX = null;
        this.fxFooter.cancel();
        return this;
    },

    render: function(content, options)
    {
        if (!content) return this;
        options = Object.append({
            close: true
        }, options);
        this.empty();
        this.elTitle.set('text', options.title || '');
        if (options.position && options.total && options.total > 1) {
            this.elPosition.set('text', this.options.positionText.substitute({
                x: options.position,
                total: options.total
            }));
        }
        this.rOpts = options;
        this.rCont = content;
        this.resize(options.size);
        return this;
    },

    renderContent: function(callback)
    {
        callback = callback || function() {};
        this.fxContent.set(0).start(1);
        return this;
    },

    onContentRender: function()
    {
        this.btnPrev.setStyle('display', this.rOpts.prev ? '' : 'none');
        this.btnNext.setStyle('display', this.rOpts.next ? '' : 'none');
        if (!this.rOpts.next && !this.rOpts.prev) this.elArrows.setStyle('display', 'none');
        else this.elArrows.setStyle('display', '');
        this.btnClose.setStyle('display', this.rOpts.close ? '' : 'none');
        this.renderFooter();
    },

    renderFooter: function()
    {
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

    resize: function(size)
    {
        if (!this.shown) this.show();
        if (size && size.x && size.y) {
            var winY = window.getSize().y;
            this.elFooter.setStyles({
                display: '',
                height: ''
            });
            var wrpY = this.elWrapper.getSize().y;
            this.elFooter.setStyle('display', 'none');
            var wrpH = this.elWrapper.getStyle('height').toInt();
            var top = Math.round((winY - (wrpY - wrpH + size.y)) / 2);
            this.rX = size.x;
            this.fxHeight.start(size.y);
            this.fxTop.start(top);
        } else {
            // Reset size
            size = size || {};
            this.elWrapper.setStyle('width', size.x || '');
            this.elContent.setStyle('height', size.y || '');
            this.elFooter.setStyle('display', '');
            this.element.setStyle('top', Math.round((window.getSize().y - this.elWrapper.getSize().y) / 2));
            this.elFooter.setStyle('display', 'none');
        }
        return this;
    },

    onWidthChange: function()
    {
        this.elContent.grab(this.rCont);
        this.renderContent();
        return this;
    },

    onHeightChange: function()
    {
        this.fxWidth.start(this.rX);
        return this;
    }
});