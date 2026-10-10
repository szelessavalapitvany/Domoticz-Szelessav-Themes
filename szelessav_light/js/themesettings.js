function loadSettings() {
   $.ajax({
       url: "styles/szelessav_light/theme.json",
       cache: false,
       async: false,
       dataType: "json",
       success: function(localJson) {
           theme = localJson;
           themeName = theme.name;
           //console.log(themeName + " - local theme settingsfile loaded and saved to localStorage");
       }
   });
}

function enableThemeFeatures() {
    theme.features.custom_page_menu.enabled = (theme.szelessav_firmware === true);
    $.each(theme.features, function(key, feature) {
        if (feature.enabled === true) {
            if (feature.files.length > 0) {
                loadThemeFeatureFiles(key);
            }
        }
    });
    loadedThemeCSSandJS = true;
}

function loadThemeFeatureFiles(featureName) {
    var files = theme.features[featureName].files;
    var arrayLength = files.length;
    for (var i = 0; i < arrayLength; i++) {
        if (files[i].split(".").pop() == "js") {
            var getviarequire = "./styles/" + themeFolder + "/js/" +  files[i] + "?" + themeName;
            requirejs([ getviarequire ]);
        }
        if (files[i].split(".").pop() == "css") {
            var CSSfile = "styles/" + themeFolder + "/css/" + files[i] + "?" + themeName;
            var fileref = document.createElement("link");
            fileref.setAttribute("rel", "stylesheet");
            fileref.setAttribute("type", "text/css");
            fileref.setAttribute("href", CSSfile);
            document.getElementsByTagName("head")[0].appendChild(fileref);
        }
    }
}

function unloadThemeFeatureFiles(featureName) {
    var files = theme.features[featureName].files;
    var arrayLength = files.length;
    for (var i = 0; i < arrayLength; i++) {
        if (files[i].split(".").pop() == "css") {
            $('head link[href*="' + files[i] + '"]').remove();
        }
    }
}

