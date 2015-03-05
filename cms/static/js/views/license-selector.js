/**
 * Select between a few pre-defined licenses for XBlock content.
 */


define(["js/views/baseview", "underscore", "gettext"],
       function(BaseView, _, gettext, LicenseModel, LicenseView) {

  var defaultLicenseInfo = {
    "all-rights-reserved": {
      "name": gettext("All Rights Reserved")
    },
    "creative-commons": {
      "name": gettext("Creative Commons"),
      "url": "//creativecommons.org/about",
      "options": {
        "ver": {
          "name": gettext("Version")
          "type": "string",
          "default": "4.0",
        },
        "BY": {
          "name": gettext("Attribution")
          "type": "boolean",
          "default": true,
          "help": gettext("Allow others to copy, distribute, display and perform " +
            "your copyrighted work but only if they give credit the way you request."),
        }
        "NC": {
          "name": gettext("Noncommercial"),
          "type": "boolean",
          "default": true,
          "help": gettext("Allow others to copy, distribute, display and perform " +
            "your work - and derivative works based upon it - but for noncommercial purposes only."),
        },
        "ND": {
          "name": gettext("No Derivatives"),
          "type": "boolean",
          "default": true,
          "help": gettext("Allow others to copy, distribute, display and perform " +
            "only verbatim copies of your work, not derivative works based upon it."),
          "conflictsWith": ["SA"]
        },
        "SA": {
          "name": gettext("Share Alike"),
          "type": "boolean",
          "default": false,
          "help": gettext("Allow others to distribute derivative works only under " +
            "a license identical to the license that governs your work."),
          "conflictsWith": ["ND"]
        }
      }
    }
  }

  var LicenseSelector = BaseView.extend({
    events: {
        "click .license-button" : "onLicenseButtonClick",
    },

    initialize: function(options) {
        this.licenseInfo = options.licenseInfo || defaultLicenseInfo;
        this.template = this.loadTemplate("license-selector");

        // Rerender when the model's license changes
        this.listenTo(this.model, 'change:license', this.render);
        this.render();
    },

    /**
     * returns structured information about the stringifed license
     *
     * parseLicense("creative-commons: BY NC ver=4.0")
     * {
     *   "type": "creative-commons",
     *   "options": {
     *     "ver": "4.0",
     *     "BY": true,
     *     "NC": true
     *   }
     * }
     */
    parseLicense: function(license) {
      var licenseType, options = {};

      var colonIndex = license.indexOf(":");
      if (colonIndex == -1) {
        licenseType = license;
      } else {
        licenseType = license.substring(0, colonIndex);
        var optStr = license.substring(colonIndex + 1);
        _.each(optStr.split(" "), function(opt) {
          if (_.isEmpty(opt)) {
            return;
          }
          var eqIndex = opt.indexOf("=");
          if(eqIndex == -1) {
            // this is a boolean flag
            options[opt] = true;
          } else {
            // this is a key-value pair
            var optKey = opt.substring(0, eqIndex);
            var optVal = opt.substring(eqIndex + 1);
            options[optKey] = optVal;
          }
        });
      }
      var ret = {"type": licenseType};
      if (!_.isEmpty(options)) {
        ret.options = options;
      }
      return ret;
    }

    render: function() {
        this.$el.html(this.template({
            license: this.parseLicense(this.model.license('license'))
        }));

        /*
        this.licenseView = new LicenseView({
            model: this.model,
            el: document.getElementById("license-preview")
        });
        */

        return this;
    },

    onLicenseButtonClick: function(e) {
        var $button, buttonLicenseKind;

        $button = $(e.srcElement || e.target).closest('.license-button');
        buttonLicenseKind = $button.attr("data-license");

        this.model.toggleAttribute(buttonLicenseKind);

        return this;
    },

  });

  return LicenseSelector;
}); // end define();
