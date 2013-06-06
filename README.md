VOBox UI - the web interface to VOBox scientific cloud storage
==============================================================

The application is based on [Dojo Toolkit](http://dojotoolkit.org) JavaScript framework
and [Dojo Boilerplate](https://github.com/csnover/dojo-boilerplate) to compile the JavaScript into
a smaller files for faster startup. The Boilerplate project page contains additional documentation on building the project.

Quick Start
-----------

0. Clone the repository using `git clone --recursive`.
1. Modify vobox-ui/src/vobox/resources/regions.json to point to the VOBox mirrors you'd like to use.
2. Run `build.sh`, which will create an optimised build in `dist/`.
3. Upload `dist/` to a Web Server
4. You can start using the VOBox Web UI.

A brief tour
------------

* You can upload your files to the storage by drag-and-dropping it from your local machine into the VOBox panel.
  For example, enter the first_container folder created on your first login and drag any file from your desktop into it.
* To download a file, double-click on it.
* To download a folder as .tar archive, select "Download" from folder's context menu.
* There is additional documentation available in Help dialog of VOBox.

