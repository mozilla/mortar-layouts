
# Mortar Layouts

This is a UI library that is used in many of the [mortar](https://github.com/mozilla/mortar) templates. Mortar is a collection of templates that help developers get started writing web apps quickly, whether it's for Firefox OS or other platforms.

It is powered by [backbone.js](http://backbonejs.org/) so that you can quickly use "models" to work with your app's data. Any changes to this data are propagated across the app automatically.

For now, this library is only usable with [require.js](http://requirejs.org/). In the future we will most likely make this optional.

This library requires [backbone.js](http://backbonejs.org/), [zepto](http://zeptojs.com/), [underscore](http://underscorejs.org/), and [x-tags](https://github.com/mozilla/x-tag). If you use the [mortar templates](https://github.com/mozilla/mortar/), all of this is already hooked up for you.

# Installation

Download this library and put it somewhere that [require.js](http://requirejs.org/) can find it. Somewhere in your app, simply add this javascript:

```js
require('layouts/layouts');
```

This assumes that the library was downloaded to a `layouts` library the requirejs finds. Your actual path may be different. The important thing is to include the layouts.js file from this project.

This installs the `x-view` and `x-listview` tags.

# Usage

## HTML

This library introduces two tags using the [x-tags](https://github.com/mozilla/x-tag) library, a polyfill for the [Web Components](http://dvcs.w3.org/hg/webcomponents/raw-file/tip/explainer/index.html) specification.

### x-view

The `x-view` tag is a basic building block like `div`. The difference is that it has a few special features specific for building apps.

* Every `x-view` tag has a [backbone.js](http://backbonejs.org/) [view](http://backbonejs.org/#View) instance. This means that it's easy to display your data, and updates are automatically propagated across your app.

* A `div` tag is meant to group content into different places on the page. An `x-view` tag is different; it is primarily meant to separate "pages" in your app. For example, when several `x-view` tags are siblings, only one is displayed at a time. The app is meant to "open" and "close" the other views.

* Each `x-view` tag has a navigation stack. If you open a view by pushing it onto another one, it is added to the stack. When the opened view is closed, the user will see the original view that was displayed.

* If a `data-first` attribute on an `x-view` tag is set to "true", it will appear first instead of any of its sibling `x-view` tags. By default, the first `x-view` in a set of `x-view` siblings is shown.

* You can compose and nest `x-view` tags. One example of why you'd want to do this is if you wanted a global header or footer. If you have a global `x-view` and several `x-view` tags inside of it, the global `x-view` header and/or footer will still appear while its children are being displayed individually.

* A `header` child element of `x-view` is special. It is pinned at the top of the view and comes with a few default styles, which you can override in CSS.
  * An `h1` inside of a `header` **is required**. It is centered and set as the title for the view.
  * When a view with a header is added to the navigation stack, a "back" button is automatically added to the header.

* A `footer` child element of `x-view` is special also. It is pinned at the bottom of the view and comes with default styles.

* A `button` element inside of a `header` or `footer` is special; it receives some default styles and is meant to to used to open other views. Because of this, it has two data attributes that customize its behavior:
  * `data-view`: Specifies the view to open when pressed. The value is a CSS selector which selects the `x-view` tag. Example: `<button data-view=".myview">MyView</button>`
  * `data-push`: If set to "true", always push the view onto the view stack. Usually if the view being opened does not cover up this button, it instead simply makes it appear and does not push it onto the navigation stack. Use this to force the "push" behavior. Example: `<button data-view=".myview" data-push="true">MyView</button>`

### x-listview

The `x-listview` tag is exactly like the `x-view` tag, except it manages a list of items and displays it for you. The backbone view attached to the list view tag manages a collection of items, and it is automatically displayed as a list.

### Example

Here's how a simple list-detail app would look:

```html
<html>
  <head>
    <title>My Awesome App</title>
  </head>
  <body>
    <x-listview class="list">
      <header>
        <h1>My Items</h1>
        <button data-view=".new">Add New</a>
      </header>
    </x-listview>

    <x-view class="detail">
      <header>
        <h1>Details</h1>
      </header>

      <h1 class="title"></h1>
      <p class="desc"></p>
      <p class="date"></p>
    </x-view>

    <x-view class="new">
      <header>
        <h1>New</h1>
      </header>

      Title: <input type="text" name="title" />
      Description: <input type="text" name="desc" />
      <button type="submit" class="add">Add</button>
    </x-view>
  </body>
</html>
```

In this example, you would only see the first `x-listview` tag because when `x-view` tags have siblings, only one is shown at a time. When the "Add New" button is clicked, the `.new` tag slides in and a back button is added to the header. Lastly, when an item is clicked in the list, the `.detail` tag is shown. How that happens is described below.

[View some more example HTML](https://github.com/mozilla/mortar-list-detail/blob/master/www/index.html) from the mortar-list-detail template.

## Javascript

Obviously `x-view` and `x-listview` are not purely about presentation, they have special behaviors too. You can customize and extent these behaviors with the javascript API.

For example, in the about example HTML, there's nothing that 

For the javascript side of things, you just grab those DOM tags and do stuff with them. Here are the javascript API's:

**`x-view`**:

* `view.titleField = 'title'` -- Set the item field for the title
* `view.render = function(item) { ... }` -- Set the function for rendering the view
* `view.getTitle = function() { ... }` -- Set the function for dynamically generating a title
* `view.model` -- Get or set the model
* `view.onOpen = function() { ... }` -- set a callback for when the view is opened
* `view.open(model, anim)` -- Open the view with the model and animation (both are optional)
* `view.close(anim)` -- Close the view with the animation (optional)

The currently available animations are `instant`, `instantOut`, `slideLeft`, and `slideRightOut`.

**`x-listview`**:

All of the properties/methods from `x-view` are available except `render` and `model`. The following are additional properties/methods:

* `view.renderRow = function(item) { ... }` -- Set the function for rendering a row
* `view.nextView = function(sel) { ... }` -- Set the view to open when a row is selected (as a CSS selector)
* `view.collection` -- Get or set the view's collection
* `view.add(item)` -- Add an item (either a javascript dict or a Backbone model)

[View some example code in the mortar-list-detail project](https://github.com/mozilla/mortar-list-detail/blob/master/www/js/app.js).

For example, to add items to the list, just grab the list tag and add them.

```js
var list = $('.list').get(0);
list.add({ title: "Foo", desc: "Foo is a thing" });
list.add({ title: "Bar", desc: "Bar is something else" });
```

Those items will automatically appear in the list according to your `renderRow` function.

In your HTML, define as many x-views or x-listviews as you want, configure them in javascript, and hook them up to be displayed through user events. You can configure it as much as you want.
