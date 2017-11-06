"use strict";

var message_shemat;
var file_to_upload_lock = false;



function save_list_to_obj() {
    var new_list = {};

    $("#messages_list").children().each(function(index) {
        var el = $(this);
        var data = get_data_from_element(el);

        if (new_list[data.key] == undefined) {
            new_list[data.key] = {};
            new_list[data.key]["pl-PL"] = data["pl-PL"];
            new_list[data.key]["en-US"] = data["en-US"];
        } else {
            ALERT.push(ALERT_TYPE.DANGER, "Key duplication!", "Unable to save key '" + data.key + "' twice.");
            return null;
        }

    });

    return new_list;
}


function remove_element(event, status) {
    var el = find_element(event);
    if (status === "prepare") {
        el.find(".btn-delete-confirm").removeClass("hidden-xs");
        el.find(".btn-delete-cancel").removeClass("hidden-xs");
        el.find(".btn-delete").addClass("hidden-xs");
    } else if (status === "confirm") {
        el.remove();
        ALERT.push(ALERT_TYPE.SUCCESS, "Element has been removed!", "Element is no longer in the list.");
    } else { // cancel
        el.find(".btn-delete-confirm").addClass("hidden-xs");
        el.find(".btn-delete-cancel").addClass("hidden-xs");
        el.find(".btn-delete").removeClass("hidden-xs");
    }

}



function button_save() {
    var list = save_list_to_obj();
    list = JSON.stringify(list);

    copy_to_clipboard(list);
    ALERT.push(ALERT_TYPE.SUCCESS, "List copied to clipboard!", "You can paste it now.");
}



function copy_to_clipboard(value) {
    var textarea = $("<textarea></textarea>");
    textarea.css({
        "opacity": "0",
        "position": "fixed",
        "z-index": "-99999"
    });

    textarea.val(value);
    $("body").append(textarea);
    textarea.select();
    document.execCommand('copy');

    textarea.remove();
}


function find_element(event) {
    var el = $(event.target);
    while (el.data("marker") !== "message_element") {
        el = el.parent();
    }
    return el;
}


function get_data_from_element(element) {
    var value = {};
    value.key = element.find(".input-key").val();
    value["pl-PL"] = element.find(".input-pl").val();
    value["en-US"] = element.find(".input-en").val();
    return value;
}


function duplicate_record(event) {
    var el = find_element(event);
    add_record(el);
}


function add_record(duplicate = null) {
    if (duplicate) {
        var data = get_data_from_element(duplicate);

        $(message_shemat
            .replace("{key_value}", data.key)
            .replace("{pl_value}", data["pl-PL"])
            .replace("{en_value}", data["en-US"])
        ).insertAfter(duplicate);
    } else {
        $("#messages_list").append(
            message_shemat
            .replace("{key_value}", "")
            .replace("{pl_value}", "")
            .replace("{en_value}", ""));
    }
}


function display_list(messages_list) {
    var new_list = "";

    for (var name in messages_list) {
        new_list += message_shemat
            .replace("{key_value}", name)
            .replace("{pl_value}", messages_list[name]["pl-PL"])
            .replace("{en_value}", messages_list[name]["en-US"]);
    }

    $("#messages_list").html(new_list);
}



function file_to_upload_listener() {
    if (file_to_upload_lock) return;
    file_to_upload_lock = true;

    var file = $("#choose-file")[0];
    file = file.files[0];
    if (file) {
        var reader = new FileReader();

        reader.onload = function(e) {
            load_file(reader.result);

            file_to_upload_lock = false;
        }

        reader.readAsText(file);
    } else {
        file_to_upload_lock = false;
    }
}


function load_file(text_data) {
    var messages_list = JSON.parse(text_data);
    display_list(messages_list);
}




$(document).ready(function() {
    message_shemat = $("#message_schemat").html();
    $("#message_schemat").remove();

    $(".btn-open").on("change", file_to_upload_listener);
    $(".btn-save").on("click", button_save);
    $(".btn-new-record").on("click", () => add_record(null));
    $("body").on("click", ".btn-duplicate", duplicate_record);
    $("body").on("click", ".btn-delete", (event) => remove_element(event, "prepare"));
    $("body").on("click", ".btn-delete-confirm", (event) => remove_element(event, "confirm"));
    $("body").on("click", ".btn-delete-cancel", (event) => remove_element(event, "cancel"));
});