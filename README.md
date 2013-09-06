VOBox UI - the web interface to VOBox scientific cloud storage
==============================================================

The application is based on [Dojo Toolkit](http://dojotoolkit.org) JavaScript framework
and uses [Dojo Boilerplate](https://github.com/csnover/dojo-boilerplate) to compile the JavaScript code into
a smaller file for faster startup. The Boilerplate project page contains additional documentation on building the project.

Quick Start
-----------

0. Clone the repository using `git clone --recursive`.
1. Fix the error in dojo by modifying css according to https://bugs.dojotoolkit.org/ticket/16320
2. Modify vobox-ui/src/vobox/resources/regions.json to point to the VOBox mirrors you'd like to use.
3. Run `build.sh`, which will create an optimised build in `dist/`.
4. Upload `dist/` to a Web Server
5. You can start using the VOBox Web UI.

A brief tour
------------

* You can upload your files to the storage by draging-and-dropping it from your local machine into the VOBox panel.
  For example, open the first_container folder created on your first login and drag any file from your desktop into it.
* To download a file, double-click on it.
* To download a folder as a .tar archive, select "Download" from the folder's context menu.
* There is additional documentation available in Help dialog of VOBox.

