// // MODIFY THIS TO THE APPROPRIATE URL IF IT IS NOT BEING RUN LOCALLY
var socket = io.connect('https://127.0.0.1:8088');

var canvas = document.getElementById('canvas-video');
var stream = document.getElementById('canvas');
var context = canvas.getContext('2d');
var streamText = stream.getContext('2d');
var img = new Image();
var streamImage = new Image();

// show loading notice
context.fillStyle = '#333';
context.fillText('Loading...', canvas.width / 2 - 30, canvas.height / 3);
streamText.fillStyle = '#333';
streamText.fillText('Loading...', stream.width / 2 - 30, stream.height / 3);
//
socket.on('frame', function (data) {
    var uint8Arr = new Uint8Array(data.buffer);
    streamImage.onload = function () {
        streamText.drawImage(this, 0, 0, canvas.width, canvas.height);
    };
    streamImage.src = 'data:image/png;base64,' + data.buffer;
});

socket.on('errEmit', function (error) {
    $('.error').html('<div class="center-block text-center col-sm-5 alert alert-danger"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>\n' +
        error.msg +
        '</div>');
});

/** browser dependent definition are aligned to one and the same standard name **/
navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition
    || window.msSpeechRecognition || window.oSpeechRecognition;


var localVideoStream = null;

function pageReady() {
    // check browser WebRTC availability
    if (navigator.getUserMedia) {
        localVideo = document.getElementById('localVideo');
        initiateCall();
    } else {
        alert("Sorry, your browser does not support WebRTC!")
    }
};

// run start(true) to initiate a call
function initiateCall() {
    // get the local stream, show it in the local video element and send it
    navigator.getUserMedia({"audio": false, "video": true}, function (stream) {
        localVideoStream = stream;
        localVideo.src = URL.createObjectURL(localVideoStream);
        convertDataURIToBinary(URL.createObjectURL(localVideoStream));

    }, function (error) {
        console.log(error);
    });
};

function convertDataURIToBinary(blob) {
    var video = document.createElement("video");
    video.src = blob;
    video.addEventListener('loadeddata', function () {
        video.play();  // start playing
        update(); //Start rendering
    });

    function update() {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        requestAnimationFrame(update);

    }
}

$('button').click(function () {
    const chanel = $(".face-method").find("input[type='radio']:checked").val();
    socket.emit(chanel, canvas.toDataURL());
});