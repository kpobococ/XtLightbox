XtLightbox
===========

XtLightbox stands for extendable lightbox. It allows for easy extension of any
kind. It is divided into three parts: Adaptors, Renderers and Base.

Adaptors control the contents of the lightbox. There are two Adaptors already
included: Image and YouTube. You can easily write more adaptors to embed anything
into the lightbox.

Renderers control how the lightbox is rendered and how the elements are positioned.
Currently only the default lightbox Renderer is included by default. Creating a
custom renderer allows you to completely tweak the look and feel of your lightbox.

Base puts everything together.

![Screenshot](http://url_to_project_screenshot)

How to use
----------

1. Include everything you need into your document:

    #HTML
    <!-- Base -->
    <script type="text/javascript" src="/XtLightbox/XtLightbox.js"></script>
    <!-- Adaptors -->
    <script type="text/javascript" src="/XtLightbox/Adaptor.js"></script>
    <script type="text/javascript" src="/XtLightbox/Adaptor/Image.js"></script>
    <!-- Renderers -->
    <script type="text/javascript" src="/XtLightbox/Renderer.js"></script>
    <script type="text/javascript" src="/XtLightbox/Renderer/Lightbox.js"></script>
    <!-- Renderer styles -->
    <link rel="stylesheet" type="text/css" href="/XtLightbox/Renderer/Lightbox/style.css" />

2. Create a collection of elements

    #HTML
    <div class="xtlightbox-gallery">
        <a href="/images/image1.jpg" title="Image 1">Image 1</a>
        <a href="/images/image2.jpg" title="Image 2">Image 2</a>
        <a href="/images/image3.jpg" title="Image 3">Image 3</a>
    </div>

3. Initialize the lightbox

    #JS
    window.addEvent('domready', function() {
        new XtLightbox('.xtlightbox-gallery a');
    });

Configuration
-------------

XtLightbox has several levels of configuration: Base config, Renderer config and
Adaptor config (on a per-adaptor basis). All of the options are passed to the
Base class. Each adaptor and renderer can introduce any number of additional
options. Here are the options, available so far:

**XtLightbox**

* `adaptors`: an array of adaptor names to be used with this instance. Defaults to `['Image']`
* `adaptorOptions`: additional adaptor configuration. See below.
* `renderer`: a name of a renderer to use with this instance. Defaults to `'Lightbox'`
* `rendererOptions`: additional renderer configuration. See below.
* `preload`: if true, all the content will be preloaded as soon as the lightbox is initialized. Defaults to `false`
* `loop`: if true, clicking next while on the last element in the collection will move the user to the first element in the collection and vice-versa. Defaults to `false`
* `closeKeys`: an array of key names, pressing which should trigger the lightbox to close. Defaults to `['esc']`,
* `nextKeys`: an array of key names, pressing which should trigger the lightbox to show next image. Defaults to `['right', 'space']`
* `prevKeys`: an array of key names, pressing which should trigger the lightbox to show previous image. Defaults to `['left']`
* `hideArrowsFor`: an array of adaptor names, the contents for which should not have the next/previous overlays. Some adaptors enforce this parameter.

**Adaptor: Image**

* `extensions`: an array of file extensions to treat as images. If `'jpg'` is present in this array, the `'jpeg'` extension is added automatically. Any hrefs that do not end in these extensions are skipped by the lightbox. Defaults to `['jpg', 'png', 'gif']`.
* `lightboxCompat`: if true, elements will be checked for having their `rel` attribute start with `'lighbox'` instead of checking for their extensions. Defaults to `true`

**Adaptor: YouTube**

* `width`: the width of the video. Defaults to `853`.
* `height`: the height of the video. Defaults to `505`.
* `hd`: if true, all the movies are loaded in HD quality, if available. Defaults to `true`.
* `related`: if true, related videos feature is included. Defaults to `false`.
* `autoplay`: if true, the video will be automatically played upon show. Defaults to `true`.

**Renderer**

* `positionText`: Used to specify a custom "Image x of y" string. Defaults to `'Image {x} of {total}'`
* `useMask`: if true, the Mask class from MooTools more will be used when showing the lightbox. Defaults to `true`.
* `maskOptions`: additional Mask options.

**Renderer: Lightbox**

* `maskFxOptions`: additional options for the Mask's Fx.Tween instance.
* `widthFxOptions`: additional options for the Fx.Tween, that is used to adjust lightbox width.
* `heightFxOptions`: additional options for the Fx.Tween, that is used to adjust lightbox height. Also used to adjust the `top` value.
* `contentFxOptions`: additional options for the Fx.Tween, that is used to reveal the content of the lightbox.
* `footerFxOptions`: additional options for the Fx.Tween, that is used to reveal the footer (content title and position) of the lightbox.

Setting Adaptor and Renderer options
------------------------------------

Let's assume you want to disable lightbox compatibility of the Image Adaptor and
adjust the position text for the Renderer. Here's how you do it:

    #JS
    window.addEvent('domready', function() {
        new XtLightbox('.xtlightbox-gallery a', {
            adaptorOptions: {
                Image: {
                    lightboxCompat: false
                }
            },
            rendererOptions: {
                positionText: "Image {x} of {total}. Use arrows to navigate, Esc to close."
            }
        });
    });


Control options
---------------

XtLightbox allows you to add and remove elements from the collection using the
Base class API:

    #JS
    var xtl = new XtLightbox();
    xtl.attach('.my-gallery');
    xtl.attach($('my-element'));
    xtl.attach($$('my-collection'));

An element will only be attached once and only to a single lightbox instance. To
detach any element, use this:

    #JS
    xtl.detach('.my-gallery');

Events
------

XtLightbox provides several events you can listen to. One idea is to load more
images using ajax when a user is close to viewing the last one in the collection.
Here is the list of all the supported events:

* `attach`: fired as soon as an element is attached. Takes attached element as the only argument. Fired several times for an element collection.
* `detach`: fired as soon as an element is detached. Takes detached element as the only argument. Fired several times for an element collection.
* `show`: fired as soon as the show sequence is started. Takes current element as the only argument.
* `hide`: fired as soon as the hide sequence is started. No arguments.
* `next`: fired as soon as the next button is pressed. Takes the next element as the only argument. Note, that the `show` event is fired next.
* `previous`: fired as soon as the previous button is pressed. Takes the previous element as the only argument. Note, that the `show` event is fired next.
* `clear`: fired when the lightbox instance is cleared of all elements. No arguments.
* `destroy`: fired when the lightbox instance is destroyed. Also fires the `clear` event.