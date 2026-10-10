var theme = {}, themeName = "", baseURL = "", switchState = {}, isMobile, newVersionText = "", lang, gitVersion, themeFolder, checkUpdate;
isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
var msgCount = 0;
var supported_lang = "en hu";
$.ajax({
    url: "styles/szelessav_light/js/livestamp.js",
    async: false,
    dataType: "script"
});

var themeFolder = 'szelessav_light';
var lang = $.i18n.lng();
var language = lang;
$.when(
	$.getScript("styles/szelessav_light/js/themesettings.js"),
	$.getScript("styles/szelessav_light/js/functions.js"),
	$.getScript("styles/szelessav_light/js/devices.js"),
	$.Deferred(function(deferred) {
		$(deferred.resolve);
	})
).done(function() {
	moment.locale(lang);
	init_theme();
});

function init_theme() {

    loadSettings();

    window.onhashchange = locationHashChanged;

    /* Set $scope variable when angular is available */
    var $scope = null;
    checkAngular = setInterval(function() {
        if (($scope === null) && (typeof angular !== "undefined") && (typeof angular.element(document.body).injector() !== "undefined")) {
            clearInterval(checkAngular);
            $scope = angular.element(document.body).injector().get('$rootScope');

            $scope.$on('device_update', function (event, data) {
                searchFunction();
                if (data.Type === "Light/Switch") {
                    if (theme.features.icon_image.enabled === true) {
                        /* We have to delay it a few otherwise it's get overwritten by standard icon */
                        setTimeout(setDeviceCustomIcon, 10, data.idx, data.Status);
                    }
                    if (theme.features.switch_instead_of_bigtext.enabled === true && data.SwitchType === "On/Off") {
                        setDeviceSwitch(data.idx, data.Status);
                    }
                }
                if (data.Type.startsWith("Temp") || (data.Type === "Wind")) {
                    /* Temp/Wind widgets are all refreshed, we need to format them again after a delay */
                    setTimeout(function() {
                        $("dzweatherwidget[id='" + data.idx + "']").find("tbody > tr").each(function() {
                            $(this).attr("data-idx", data.idx);
                        });
                        $("dztemperaturewidget[id='" + data.idx + "']").find("tbody > tr").each(function() {
                            $(this).attr("data-idx", data.idx);
                        });
                            setDeviceOptions(data.idx);
                            let lastupd = moment(data.LastUpdate, ["YYYY-MM-DD HH:mm:ss", "L LT"]).format();
                            setDeviceLastUpdate(data.idx, lastupd);
                    }, 10);
                }
                if (data.Type === "Wind") {
                    if (theme.features.wind_direction.enabled === true) {
                        /* We have to delay it a few otherwise it's get overwritten by standard icon */
                        setTimeout(setDeviceWindDirectionIcon, 10, data.idx, data.DirectionStr);
                    }
                }
                setTimeout(function() {
                    let lastupd = moment(data.LastUpdate, ["YYYY-MM-DD HH:mm:ss", "L LT"]).format();
                    setDeviceLastUpdate(data.idx, lastupd);
                    setAllDevicesIconsStatus();
                }, 10);
            }, function errorCallback(response) {
                console.error("Cannot connect to websocket");
            });

            $scope.$on('scene_update', function (event, data) {
                if (theme.features.switch_instead_of_bigtext_scenes.enabled === true) {
                    setDeviceSwitch(data.idx, data.Status);
                }
                let lastupd = moment(data.LastUpdate, ["YYYY-MM-DD HH:mm:ss", "L LT"]).format();
                setDeviceLastUpdate(data.idx, lastupd);
            }, function errorCallback(response) {
                console.error("Cannot connect to websocket");
            });
        }
    }, 100);

    $(document).ready(function() {
	$('.container-logo').click(function() {
		location.reload();
	});
        MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                $("#main-view").children("div.container").removeClass("container").addClass("container-fluid");
                removeRowDivider();
                setCorrectDashboardLinksforMobile();
            });
        });
        var targetNode = document.getElementById("holder");
        observer.observe(targetNode, {
            childList: true,
            subtree: true
        });
        enableThemeFeatures();
        locationHashChanged();
        setLogo();
        setSearch();
        setDevicesNativeSelectorForMobile();
        $(document).ajaxSuccess(ajaxSuccessCallback);

        if (theme.background_img && theme.background_img.length) {
            if (theme.background_img.startsWith("http")) {
                bg_url = theme.background_img;
            } else {
                bg_url = "./images/" + theme.background_img;
            }
            $("html").addClass(theme.background_type);
            $("html").css("background-image", "url(" + bg_url + ")");
            $("body").attr('style', function(i,s) { return (s || '') + 'background: transparent !important;' });
        }
        $(".navbar").append('<div class="menu-toggle"><div></div></div>')
        var navBarInner = $(".navbar-inner"), navBarToggle = $(".menu-toggle");
/*        $(".menu-toggle").prop("title", language.mainmenu);*/
        navBarToggle.click(function() {
            navBarInner.toggleClass("slide");
        });
        navBarInner.find(".container li").not(".dropdown").not(".dropdown-submenu").click(function() {
            navBarInner.removeClass("slide");
        });
        $("#holder").click(function() {
            navBarInner.removeClass("slide");
        });
        $(window).scroll(function() {
            50 < $(this).scrollTop() ? $("div.menu-toggle").addClass("scrolled") : $("div.menu-toggle").removeClass("scrolled");
        });
    });
}
