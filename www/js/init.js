// Constants  
var SYSTEM_URL = "http://v4.v3store.com";

// IE bug fix for Bootstrap
if (navigator.userAgent.match(/IEMobile\/10\.0/)) {
  var msViewportStyle = document.createElement("style")
  msViewportStyle.appendChild(
    document.createTextNode(
      "@-ms-viewport{width:auto!important}"
    )
  )
  document.getElementsByTagName("head")[0].appendChild(msViewportStyle)
}
// ************************* //


$(function () 
{
    // Start navbar positioning
    //$(window).scroll($.throttle(1000, navbarPos));
    //window.setInterval("navbarPos()",500);
    //$(window).scroll(navbarPosStart);
    
    // Redirect to login page, if an ajax call returns a 401 Unauthorized Request
    $.ajaxSetup({
        statusCode: {
            401: function () {
                ajax.load("#content", SYSTEM_URL + "/login");
                //document.location.href = SYSTEM_URL + '/login/?return=' + document.location.pathname;
            }
        }
    });
    
    // Test for placeholder support
    placeholderSupport = ("placeholder" in document.createElement("input"));
    if(!placeholderSupport) 
    {
        // Create placeholder support
        $('[placeholder]').focus(function() {
            var input = $(this);
            if (input.val() === input.attr('placeholder')) {
                input.val('');
                input.removeClass('placeholder');
            }
        }).blur(function() {
            var input = $(this);
            if (input.val() === '' || input.val() === input.attr('placeholder')) {
                input.addClass('placeholder');
                input.val(input.attr('placeholder'));
            }
        }).blur();
         
        // Make sure placeholder values, are not posted
        $('[placeholder]').parents('form').submit(function() {
            $(this).find('[placeholder]').each(function() {
                var input = $(this);
                if (input.val() === input.attr('placeholder')) {
                  input.val('');
                }
            });
        });
    }
});


function timer() 
{
    // Notifications
    $.ajax({
        type: "GET",
        url: SYSTEM_URL + "/api/notification/total",
        cache: false,
        success: function(data) {
            var obj = jQuery.parseJSON(data);
            if (typeof obj !== null) {
                if (obj.total_unread > 0) {
                    $(".notification-total").html(obj.total_unread);
                }
                else {
                   $(".notification-total").html(""); 
                }
            }
        }
    });
    
    // Messages
    $.ajax({
        type: "GET",
        url: SYSTEM_URL + "/api/messages/total",
        cache: false,
        success: function(data) {
            var obj = jQuery.parseJSON(data);
            if (typeof obj !== null) {
                if (obj.total_unread > 0) {
                    $(".message-total").html(obj.total_unread);
                }
                else {
                   $(".message-total").html(""); 
                }
            }
        }
    });
    
}


// Cart
function cart_total() {
    $.ajax({
        type: "GET",
        url: SYSTEM_URL + "/api/cart/total",
        cache: false,
        success: function(data) {
            var obj = jQuery.parseJSON(data);
            if (typeof obj !== null) {
                if (obj.total > 0) {
                    $(".cart-total").html("($" + (obj.total/100).toFixed(2) + ")");
                }
                else {
                   $(".cart-total").html("($0.00)"); 
                }
            }
        }
    });
}


var ajax = {};
ajax = (function(){ 

    return {
        clear: function() {
            ajax.type = "GET";
            ajax.post = "";
            ajax.data = "";
            ajax.target = "";
            ajax.url = "";
            ajax.tries = 0;
        },
                
        load: function(target, url, post) {
            ajax.clear();
            ajax.target = target;
            ajax.data = "";
            ajax.url = url;
            
            if (post) {
                ajax.type = "POST";
                ajax.post = post;
            }
            
            // Show busy status
            $("#busy").fadeIn();
            //document.body.style.cursor = 'wait';
            
            // Start timer, to soften out response times
            ajax.timer();
            
            $.ajax({
                type: ajax.type,
                url: ajax.url,
                data: ajax.post,
                cache: false,
                success: function(data) {
                    ajax.data = data;
                    //window.history.pushState(null, null, ajax.url);
                },
                error: function(data) {
                    // TODO: Log the error
                    ajax.data = "<b>We are sorry...</b><br />Seems like we have a technical problem :-(<br />It will be solved as soon as we can...";
                    //window.history.pushState(null, null, ajax.url);
                }
            });
            
        },
        
        timer: function() {
            ajax.tries++;
            var t = 250;
            if (ajax.tries > 1) {
                t = 100;
            }
            setTimeout("ajax.complete();", t);
        },
                
        complete: function() {

            if (ajax.data !== "") {
                if (ajax.target !== "") {
                    $(ajax.target).html(ajax.data);
                }
                $("#busy").fadeOut();
            }
            else if (ajax.tries >= 20) { // We will wait for 3 seconds (1000 + 20x100 ms)
                ajax.data = "<b>We are sorry...</b><br />Seems like our servers are too busy at the moment :-(<br />Please try again later...<br /><br />(We are aware of this, and we are expanding to serve the growing demand)";
                //xhr.abort(); // Stop ajax request
            }
            else {
                ajax.timer();
            }
        }
            
    };
    
})();


function media(text) 
{
    // Embed youtube videos etc.
    words = text.split(" ");
    
    if (words[0].toLowerCase == "http://") {
        // http://www.youtube.com/watch
        var link = words[0].toLowerCase;
        
        
    }
    
    media = text;
}


// Client image resize using canvas 
function resizeImage(image, callback) 
{
    if (image) {
        var dataUrl = image.src;
        convertImageToOriginal(image, function(oImage) {
            var canvas = convertImageToCanvas(oImage, 500);

            // Did we have canvas support?
            if (canvas) 
            {
                dataUrl = canvas.toDataURL("image/jpeg");
            }

            callback(dataUrl);
        });
    }
    else {
        callback("");
    }
}
    
    
    
// Converts image to canvas; returns new canvas element
function convertImageToCanvas(image, maxWidth) 
{
    var width = image.width;
    var height = image.height;
        
    var canvas = document.createElement("canvas");
    if (!!canvas.getContext("2d") && width > maxWidth) 
    {   
        height = ((height * maxWidth) / width);

        canvas.width = maxWidth;
        canvas.height = height;
        ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, maxWidth, height);

        return canvas;
    }
    else 
    {
        return false;
    }
}


// Converts image to an original sized image
function convertImageToOriginal(tempImage, callback) 
{
    var image = new Image();
    image.onload = function(){
        callback(image);
    };
    image.src = tempImage.src;
}


