Cadmus

Develop
-----

### Popup only

Run the devserver. However, any messages to background or content scripts will not be sent (as those scripts don't exist in this mode). The devserver is useful for tweaking layout and styling of the popup.

```
$ yarn start
```

### Full extension

Do once: 

1. Run `yarn build`
1. Navigate to `chrome://extensions` in Chrome
1. Enable "Developer mode",
1. Click "Load unpacked extension" and select the `build/` folder

Do on changes to source files:

1. Run `yarn build`
1. Navigate to `chrome://extensions` in Chrome
1. Click the reload button on the extension card (circular arrow icon)

### Publish

The CI pipeline triggers publish on new git tags.

After a PR is merged to master:

1. Update the version number in `src/manifest.json` on master
1. Create a new git tag for that version and the publish pipeline will be triggered

### Design

CSS and UI elements are from https://tailwind-elements.com/

Roadmap
-------

Further customization of fonts and colors

Attributions
--------

This extension is based on resources and ideas from:

* http://antijingoist.github.io/web-accessibility/
* http://opendyslexic.org/
