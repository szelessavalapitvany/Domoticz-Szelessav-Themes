function removeRowDivider() {
    if ($("#dashcontent").length) {
        $("#dashcontent > section").each(function() {
            $("div.row.divider:not(:first)", this).children().each(function() {
                $(this).appendTo($(this).closest("section").find("div.row.divider:first"));
            });
            if ($("div.row.divider:first > div:first", this).hasClass("span3")) {
                $("div.row.divider:first", this).parent().addClass("compact");
            }
            $("div.row.divider:not(:first)", this).hide();
        });
    } else {
        $("div.row.divider:not(:first)").children().appendTo("div.row.divider:first");
        $("div.row.divider:not(:first)").hide();
    }
}

function setLogo() {
    let containerLogo = '<header class="logo"><div class="container-logo">';

    if (theme.szelessav_firmware === true) {
        const logo = theme.logo || "logo.png";
        containerLogo += '<img class="header__icon" src="images/' + logo + '">';
        $("<style>#login:before {content: url(../images/" + logo + ") !important;}</style>").appendTo("head");
    }

    containerLogo += "</div></header>";
    $(containerLogo).insertBefore(".navbar-inner");

    $("html").toggleClass("szelessav-firmware", theme.szelessav_firmware === true);
}

function setSearch() {
    $('<div id="search"><input type="text" id="searchInput" autocomplete="off" onkeyup="searchFunction()"><i class="ion-md-search"></i></div>').appendTo(".container-logo");
    window.addEventListener("keydown",function (e) {
        if (e.keyCode === 114 || (e.ctrlKey && e.keyCode === 70)) {
            $("#searchInput").focus();
            e.preventDefault();
        }
    })
    $("#search").click(function() {
        $("#searchInput").focus();
    });
    $("#searchInput").keyup(function(event) {
        if (event.keyCode === 13) {
            $("#searchInput").blur();
        }
        if (event.keyCode === 27) {
            $("#searchInput").val("");
            $("#searchInput").keyup();
        }
    });

}

function searchFunction() {
    var value = $("#searchInput").val().toLowerCase();
    $("div .item").each(function() {
        var element = $(this);
        if ($("#dashcontent").length || $("#weatherwidgets").length || $("#tempwidgets").length) {
            element = $(this).parent();
        }
        var visibility = $(this).find("#name").html().toLowerCase().indexOf(value) > -1;
        element.toggle(visibility);
    });
    $("div.row.divider").show();
    $("section").show();
    if (value.length) {
        removeEmptySectionDashboard();
    }
}

function locationHashChanged() {
    setPageTitle();
    $(".current_page_item:not(:first)").removeClass("current_page_item");
    $("#searchInput").val("");

    if (location.hash == "#/Dashboard" && !isMobile || location.hash == "#/LightSwitches" || location.hash == "#/Scenes" || location.hash == "#/Temperature" || location.hash == "#/Weather" || location.hash == "#/Utility") {
        $("#search").removeClass("readonly");
    } else {
        $("#search").addClass("readonly");
    }
    if (location.hash == "#/Dashboard") {
        if (typeof cameraPreview === "function")
            theme.features.dashboard_camera_section && cameraPreview(theme.features.dashboard_camera_section.enabled);
    }
    if (location.hash == "#/CustomIcons") {
        setCustomIconsPage();
    }
}

function setPageTitle() {
    var pagedetect = window.location.href.split("#/")[1];
    var title = (typeof $.t !== "undefined" ? $.t(pagedetect) : pagedetect );
    document.title = 'Domoticz - ' + title;
}

function isAdmin() {
    if (typeof angular !== "undefined") {
        var injector = angular.element($("html")).injector();
        var permissions = injector.get("permissions");
        return permissions.hasPermission("Admin");
    } else return false;
}

function removeEmptySectionDashboard() {
    $("#dashcontent section").each(function() {
        $(this).show();
        if (!$(this).children("div.row").children(":visible").length) {
            $(this).hide();
        }
    });
}

function setCustomIconsPage() {
     checkIconsmain = setInterval(function() {
        if ($("#iconsmain #fileupload").length && $("#iconsmain label.fileupload").length === 0) {
            clearInterval(checkIconsmain);
   
            $("#iconsmain #fileupload").parent().prepend('<label for="fileupload" class="fileupload btn btn-info">' + $.t("Upload") + "</label>");
            $("#iconsmain > div table:first").find("td:last").append($("#iconsmain > table td:last").children());
            $("#iconsmain #fileupload").on("change", function() {
                $(this).next().click();
                $(this).val("");
            });
        }
    }, 100);
}

function ajaxSuccessCallback(event, xhr, settings) {
    setPageTitle();
    
    if (settings.url.startsWith("json.htm?type=devices") || settings.url.startsWith("json.htm?type=scenes")|| settings.url.startsWith("json.htm?type=command&param=getdevice")) {
        let counter = 0;
        let intervalId = setInterval(function() {
            if ($("#main-view").find(".item").length > 0) {
                setAllDevicesFeatures();
                setAllDevicesIconsStatus();
                clearInterval(intervalId);
            } else {
                counter++;
                if (counter >= 5) {
                    clearInterval(intervalId);
                }
            }
            setDevicesNativeSelectorForMobile();
        }, 100);
    } else if (settings.url.startsWith("json.htm?type=command&param=switchscene")) {
        let id = settings.url.split("&")[2];
        id = id.substr(4);
        let scene = $(".item#" + id);
        let statusElem = scene.find("#status .wrapper");
        statusElem.hide();
        let switcher = statusElem.parent().siblings(".switch").find("input");
        if (switcher.length) {
            let statusText = settings.url.split("&")[3];
            statusText = statusText.substr(10);
            switcher.attr("checked", statusText == "On");
        }
    }
}

function hexToRGB(h, values_only) {
    let r = 0, g = 0, b = 0;

    // 3 digits
    if (h.length == 4) {
        r = "0x" + h[1] + h[1];
        g = "0x" + h[2] + h[2];
        b = "0x" + h[3] + h[3];

    // 6 digits
    } else if (h.length == 7) {
        r = "0x" + h[1] + h[2];
        g = "0x" + h[3] + h[4];
        b = "0x" + h[5] + h[6];
    }

    if (values_only === true) 
        return +r + "," + +g + "," + +b;
    else 
        return "rgb("+ +r + "," + +g + "," + +b + ")";
}
