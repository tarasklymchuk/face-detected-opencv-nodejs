const fs = require('fs');
const path = require('path');
const cv = require('../../../');

module.exports = function (socket) {
    socket.on('recognition', function (data) {
        const basePath = path.join(__dirname + '/imgs');
        const imgsPath = path.resolve(basePath, 'recognitions');
        const nameMappings =  [
            "taras",
            "andrew"
        ];
         const imgFiles = fs.readdirSync(imgsPath);
            if(imgFiles.length){
                const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);
                const getFaceImage = (grayImg) =>{
                    const faceRects = classifier.detectMultiScale(grayImg).objects;
                    return grayImg.getRegion(faceRects[0]);
                };

                const trainImgs = imgFiles
                // get absolute file path
                    .map(file => path.resolve(imgsPath, file))
                // read image
            .map(filePath => cv.imread(filePath))
                // face recognizer works with gray scale images
            .map(img => img.bgrToGray())
                // detect and extract face
            .map(getFaceImage)
                // face images must be equally sized
                    .map(faceImg => faceImg.resize(50, 50)
            );

             // make labels
                const labels = imgFiles
                    .map(file => nameMappings.findIndex(name => file.includes(name)
            ));

                const lbph = new cv.LBPHFaceRecognizer();
                lbph.train(trainImgs, labels);
            const base64text = data;//Base64 encoded string
            const base64data = base64text.replace('data:image/jpeg;base64', '')
                .replace('data:image/png;base64', '');//Strip image type prefix
            const buffer = Buffer.from(base64data, 'base64');

            const twoFacesImg = cv.imdecode(buffer); //Image is now represented as Mat
            const result = classifier.detectMultiScale(twoFacesImg.bgrToGray());

            const minDetections = 10;
            result.objects.forEach((faceRect, i) => {
                if(result.numDetections[i] < minDetections){
                return;
            }
            const faceImg = twoFacesImg.getRegion(faceRect).bgrToGray();
            const who = nameMappings[lbph.predict(faceImg).label];

            const rect = cv.drawDetection(
                twoFacesImg,
                faceRect,
                {color: new cv.Vec(255, 0, 0), segmentFraction: 4}
            );

            const alpha = 0.4;
            cv.drawTextBox(
                twoFacesImg,
                new cv.Point(rect.x, rect.y + rect.height + 10),
                [{text: who}],
                alpha
            );
        });
            socket.emit('frame', {buffer: cv.imencode('.png', twoFacesImg).toString('base64')});
            } else {
                socket.emit('errEmit', {msg: 'Need image to train face recognitions!!'});
            }
        });

}