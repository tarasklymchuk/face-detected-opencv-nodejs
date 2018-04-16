const {
    cv,
    getDataFilePath,
    drawBlueRect
} = require('../../utils');


module.exports = function (socket) {
    socket.on('face', function (data) {
        console.log('get stream');
        // load base64 encoded image
        const base64text = data;//Base64 encoded string
        const base64data = base64text.replace('data:image/jpeg;base64', '')
            .replace('data:image/png;base64', '');//Strip image type prefix
        const buffer = Buffer.from(base64data, 'base64');
        const image = cv.imdecode(buffer); //Image is now represented as Mat
        const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);

// detect faces
        const {objects, numDetections} = classifier.detectMultiScale(image.bgrToGray());
        console.log('faceRects:', objects);
        console.log('confidences:', numDetections);
// draw detection
        const numDetectionsTh = 10;
        objects.forEach((rect, i) => {
            const thickness = numDetections[i] < numDetectionsTh ? 1 : 2;
        drawBlueRect(image, rect, {thickness});
    });
        console.log('emit data');
        socket.emit('frame', {buffer: cv.imencode('.png', image).toString('base64')});

    });
};
