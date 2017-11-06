// Global objects:
var ALERT;

var ALERT_TYPE = {
    DEFAULT: {
        alert_type: "",
        alert_icon: "fa-cog",
        alert_icon_description: "Log..."
    },
    SUCCESS: {
        alert_type: "alert-succes",
        alert_icon: "fa-check",
        alert_icon_description: "Succes..."
    },
    INFO: {
        alert_type: "alert-info",
        alert_icon: "fa-info",
        alert_icon_description: "Info..."
    },
    WARNING: {
        alert_type: "alert-warning",
        alert_icon: "fa-exclamation",
        alert_icon_description: "Warning..."
    },
    DANGER: {
        alert_type: "alert-danger",
        alert_icon: "fa-exclamation-triangle",
        alert_icon_description: "Danger..."
    }
};

var ALERT_PATTERN =
    "<div class='row alert {alert-type} nowrap-xs middle-xs width-100' id='{alert-id}'>" +
    "   <div class='col-xs-min'>" +
    "       <i class='fa {alert-icon} alert-icon'></i>" +
    "       <span class='sr-only'>{alert-icon-description}</span>" +
    "   </div>" +
    "   <div class='col-xs-max'>" +
    "       <h5>{alert-title}</h5>" +
    "       <p>{alert-description}</p>" +
    "   </div>" +
    "   <div class='col-xs-min col-xs-push-top'>" +
    "       <i class='fa fa-times alert-close' aria-hidden='true'></i>" +
    "   </div>" +
    "</div>";



// Alert class:
class Alert {
    constructor(id) {
        ////////////////////////////////////
        // Check jQuery
        if (typeof $ !== "function") {
            console.error("[LoadingAnimation] Error: jQuery is required.");
            return;
        }

        // Values:
        this.message_duration = 10000;
        this.message_fade_out = 500;
        this.enable = true;


        // Private members, do not touch:
        this.element; // = document.getElementById(id);
        this.lastID = 0;
        this.queue = [];

        this.class_ready = false;
        this.is_initialized = false;

        if (document.getElementById(id)) {
            this.element = document.getElementById(id);
            this.class_ready = true;
        } else {
            console.error("[ALERT] Unable to locate element of id '" + id + "' during initialization process.");
        }
    }

    init() {
        if (this.is_initialized) return;

        if (this.class_ready) {
            this.is_initialized = true;
            this.display();
            console.info("[ALERT] Initialization successful.");
        } else {
            console.error("[ALERT] Unable to initialize. Target element was not set during object creation.");
        }
    }

    setEnable(value) {
        if (value) {
            this.enable = true;
            console.info("[ALERT] Has been enabled.");
        } else {
            this.enable = false;
            console.info("[ALERT] Has been disabled.");
        }
    }

    display() {
        if (!this.is_initialized) return;

        if (this.queue.length <= 0) return;

        var msg = this.queue[0];
        this.lastID++;
        var new_id = "ALERT_ID_" + this.lastID;
        var complex_message = ALERT_PATTERN
            .replace("{alert-type}", msg.type.alert_type)
            .replace("{alert-icon}", msg.type.alert_icon)
            .replace("{alert-id}", new_id)
            .replace("{alert-icon-description}", msg.type.alert_icon_description)
            .replace("{alert-title}", msg.title)
            .replace("{alert-description}", msg.message);

        $(this.element).append(complex_message);

        var self = this;
        $("#" + new_id + " .alert-close").click(function() {
            var el = $("#" + new_id);
            var h = el.outerHeight();
            el.css("transition", "transform ease " + self.message_fade_out + "ms, opacity ease " + self.message_fade_out * 0.7 + "ms, margin ease " + self.message_fade_out + "ms")
                .addClass("fade-out")
                .css("margin-bottom", -h + "px");

            setTimeout(() => {
                el.remove();
            }, self.message_fade_out);
            $(this).off("click");
        });

        setTimeout(() => {
            $("#" + new_id + " .alert-close").click();
        }, self.message_duration);

        this.queue = this.queue.slice(1);
        if (this.queue.length > 0) this.display();
    }

    push(type, title, message) {
        if (this.enable) {
            if (
                type.alert_type === undefined ||
                type.alert_icon === undefined ||
                type.alert_icon_description === undefined
            ) {
                console.error("[ALERT] No matching types for message '" + message + "', use types from 'INFO_TYPE' instead.");
                return;
            }

            this.queue.push({
                type: type,
                title: title,
                message: message
            });

            this.display();
        } else {
            console.info("[ALERT] You do have to enable INFO first in order to push messages.");
        }
    }
}


// Ready
$(document).ready(function() {
    ALERT = new Alert("alerts-hook");
    ALERT.init();

    //ALERT.push(ALERT_TYPE.SUCCESS, "Excellent!", "Message for the alert.");
    //ALERT.push(ALERT_TYPE.DANGER, "Something is wrong!", "Unable to do someting important.");
});