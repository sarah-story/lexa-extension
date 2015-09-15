Firebase.enableLogging(true);
Firebase.INTERNAL.forceWebSockets();
var ref = new Firebase("https://lexa.firebaseio.com/");
var authData = ref.getAuth();
var uid = authData.uid;
var url;
var pageTitle;
var selectedData;
var courses;
var type;

ref.child('courses').orderByChild('uid').equalTo(uid).once('value', function(snapshot) {
  coursesObj = snapshot.val();
  coursesArr = Object.keys(coursesObj);
  var coursesHTML = "";
  for (var i=0; i<coursesArr.length; i++) {
    coursesHTML += "<option value='"+coursesArr[i]+"'>"+coursesObj[coursesArr[i]].title+"</option>";
  }
  console.log(coursesHTML);
  $("#courses").html(coursesHTML);
});


chrome.tabs.query({'active': true, 'lastFocusedWindow': true, 'currentWindow': true}, function (tabs) {
  url = tabs[0].url;
  pageTitle = tabs[0].title;
  if (!authData) {
    $("#main").hide();
    $("#login").show();
  } else if (url.indexOf('youtube.com/watch') != -1) {
    $("#login").hide();
    var attrLocation = url.indexOf("=");
    var videoKey = url.slice(attrLocation + 1);
    var videoUrl = "https://www.youtube-nocookie.com/embed/"+videoKey+"?rel=0";
    $("#youtubeVideoPlayer").attr("src", videoUrl);
    $("#youtubeVideoPlayer").addClass("selected");
    $("#vimeoVideoPlayer").removeClass("selected");
    $("#video").click();
    $("#warning").hide();
    $("#selectedVideo").show();
    $("#youtubeVideo").show();
    $("#vimeoVideo").hide();
  } else if (url.indexOf('vimeo.com/') != -1) {
    $("#login").hide();
    var videoKey = url.slice(18);
    console.log(videoKey);
    var videoUrl = "https://player.vimeo.com/video/"+videoKey+"?title=0&byline=0&portrait=0";
    $("#vimeoVideoPlayer").attr("src", videoUrl);
    $("#youtubeVideoPlayer").removeClass("selected");
    $("#vimeoVideoPlayer").addClass("selected");
    $("#video").click();
    $("#warning").hide();
    $("#selectedVideo").show();
    $("#youtubeVideo").hide();
    $("#vimeoVideo").show();
  } else if (url.indexOf("stitcher.com/podcast/") != -1) {
    $("#login").hide();
    console.log(url);
    var attrLocation = url.indexOf("/e/");
    var audioKey = url.slice(attrLocation+3, attrLocation+11);
    var audioUrl = "http://app.stitcher.com/splayer/f/4903/" + audioKey;
    $("#audioPlayer").attr("src", audioUrl);
    $("#audio").click();
    $("#audioWarning").hide();
    $("#selectedAudio").show();
  } else {
    $("#login").hide();
    $("#text").click();
  }
});

$("#loginBtn").click(function() {
  var email = $("#email").val();
  var password = $("#password").val();
  ref.authWithPassword({
    email    : email,
    password : password
  }, function(error, authData) {
    if (error) {
      console.log("Login Failed!", error);
    } else {
      console.log("Authenticated successfully with payload:", authData);
      uid = authData.uid;
      ref.child('courses').orderByChild('uid').equalTo(uid).once('value', function(snapshot) {
        coursesObj = snapshot.val();
        coursesArr = Object.keys(coursesObj);
        var coursesHTML = "";
        for (var i=0; i<coursesArr.length; i++) {
          coursesHTML += "<option val='"+coursesArr[i]+"'>"+coursesObj[coursesArr[i]].title+"</option>";
        }
        console.log(coursesHTML);
        $("#courses").html(coursesHTML);
      });
      $("#login").hide();
      $("#main").show();
    }
  });
});

$("#text").click(function() {
  $("#selectedText").show();
  $("#getVideo").hide();
  $("#getAudio").hide()
  $(this).addClass('active');
  $("#video").removeClass('active');
  $("#audio").removeClass('active');
});

$("#formattedText").click(function() {
  $("#formattedSelected").show();
  $("#textSelected").hide();
  $(this).addClass('active');
  $("#textOnly").removeClass('active');
});

$("#textOnly").click(function() {
  $("#formattedSelected").hide();
  $("#textSelected").show();
  $(this).addClass('active');
  $("#formattedText").removeClass('active');
});

$("#addText").click(function() {
  $("#main").hide();
  $("#selectCourse").show();

  if ($("#formattedSelected").hasClass('active')) {
    selectedData = $("#formattedSelected").html();
    type = 'text';
  } else {
    selectedData = $("#formattedSelected").html();
    type = 'text';
  }
});

$("#video").click(function() {
  $("#getVideo").show();
  $("#selectedText").hide();
  $("#getAudio").hide();
  $(this).addClass('active');
  $("#text").removeClass('active');
  $("#audio").removeClass('active');
});

$("#addVideo").click(function() {
  if ($("#youtubeVideoPlayer").hasClass("selected")) {
    selectedData = $('#youtubeVideoPlayer').wrap('<p/>').parent().html();
    $('#youtubeVideoPlayer').unwrap();
  } else {
    selectedData = $('#vimeoVideoPlayer').wrap('<p/>').parent().html();
    $('#vimeoVideoPlayer').unwrap();
  }
  type='video';
  $("#main").hide();
  $("#selectCourse").show();
});

$("#audio").click(function() {
  $("#getAudio").show();
  $("#selectedText").hide();
  $("#getVideo").hide();
  $(this).addClass('active');
  $("#text").removeClass('active');
  $("#video").removeClass('active');
});

$("#addAudio").click(function() {
  selectedData = $('#audioPlayer').wrap('<p/>').parent().html();
  $('#audioPlayer').unwrap();
  type='audio';
  $("#main").hide();
  $("#selectCourse").show();
});

$("#addContent").click(function() {
  console.log('click');
  var selectedCourse = $("#courses").val();
  console.log(selectedData);
  ref.child('courses').child(selectedCourse).child('content').push({
    'data': selectedData,
    'url': url,
    'title': pageTitle,
    'type': type,
    'done': false
  });
  $("#selectCourse").hide();
  $("#main").show();
});

$("#newCourseAddContent").click(function() {
  var selectedCourse = $("#newCourse").val();
  var courseRef = ref.child('courses').push();
  courseRef.set({
    'title': selectedCourse,
    'uid': uid
  });
  console.log(courseRef);
  courseRef.child('content').push({
    'data': selectedData,
    'url': url,
    'title': pageTitle,
    'type': type,
    'done': false
  });
  $("#selectCourse").hide();
  $("#main").show();
});

chrome.extension.onRequest.addListener(onSelection);
chrome.tabs.executeScript(null, { file: "selection.js" }); 

function onSelection(payload) {
  console.log('Got selection: ' + payload);
  $("#textWarning").hide();
  $("#formattedSelected").show();
  $("#formattedSelected").html(payload.html);
  $("#textSelected").html(payload.text);
  chrome.extension.onRequest.removeListener(window.onSelection);
};