/**
 * Define action to upload, drag & drop images into canvas
 */
(function () {
    const crop = function (canvas) {
        const _self = this;
        let activeObject;

        const addCropRect = () => {
            const image = canvas.getItemById('image');
            const isCroppingRect = canvas.getItemById('croppingRect'); // Get cropping rectangle
            if(isCroppingRect) {
                isCroppingRect.visible = true
                canvas.setActiveObject(isCroppingRect).renderAll();
                return
            }
            // After rendering the image, add a rectangle for cropping
            const croppingRect = new fabric.Rect({
                id: 'croppingRect',
                width: 200,
                height: 200,
                fill: 'rgba(0,0,0,0.5)', // semi-transparent
                hasControls: true,       // allow resizing
                hasBorders: true,
                originX: "center",
                originY: "center",
                angle: image.angle,
            });


            croppingRect.setControlsVisibility({
                mtr: false,
            });
            canvas.centerObject(croppingRect);
            canvas.add(croppingRect).setActiveObject(croppingRect).renderAll();


        }



        const checkBoundariesMoving = (event) => {

            let obj = event.target;
            // Get bounding box of the cropping rectangle
            // if object is too big ignore
            if(obj.currentHeight > obj.canvas.height || obj.currentWidth > obj.canvas.width){
                return;
            }
            obj.setCoords();
            // top-left  corner
            if(obj.getBoundingRect().top < 0 || obj.getBoundingRect().left < 0){
                obj.top = Math.max(obj.top, obj.top-obj.getBoundingRect().top) - 0.001;
                obj.left = Math.max(obj.left, obj.left-obj.getBoundingRect().left)  - 0.001;
                left1 = obj.left;
                top1 = obj.top;
            }
            // bot-right corner
            if(obj.getBoundingRect().top+obj.getBoundingRect().height  > obj.canvas.height || obj.getBoundingRect().left+obj.getBoundingRect().width  > obj.canvas.width){
                obj.top = Math.min(obj.top, obj.canvas.height-obj.getBoundingRect().height+obj.top-obj.getBoundingRect().top) - 0.001;
                obj.left = Math.min(obj.left, obj.canvas.width-obj.getBoundingRect().width+obj.left-obj.getBoundingRect().left) - 0.001;
                left1 = obj.left;
                top1 = obj.top;

            }

            canvas.renderAll();
        }
        let left1 = 0;
        let top1 = 0 ;
        let scale1x = 0 ;
        let scale1y = 0 ;

        const checkBoundariesScaling = (event) => {
            let obj = event.target;

            obj.setCoords();
            let brNew = obj.getBoundingRect();

            // Check if the object is outside the canvas boundaries
            if ((brNew.width + brNew.left) > obj.canvas.width) {
                obj.left -= (brNew.width + brNew.left) - obj.canvas.width;
            }
            if (brNew.left < 0) {
                obj.left -= brNew.left;
            }
            if ((brNew.height + brNew.top) > obj.canvas.height) {
                obj.top -= (brNew.height + brNew.top) - obj.canvas.height;
            }
            if (brNew.top < 0) {
                obj.top -= brNew.top;
            }

            // Update the previous values
            left1 = obj.left;
            top1 = obj.top;
            scale1x = obj.scaleX;
            scale1y = obj.scaleY;
        }



        // Function to crop the image
        const rotatePoint = (x, y, cx, cy, angle) => {
            const angleRad = (angle * Math.PI) / 180;
            const cos = Math.cos(angleRad);
            const sin = Math.sin(angleRad);

            const nx = (cos * (x - cx)) - (sin * (y - cy)) + cx;
            const ny = (cos * (y - cy)) + (sin * (x - cx)) + cy;

            return { x: nx, y: ny };
        };
        const cropImage = () => {
            const image = canvas.getItemById('image');
            const croppingRect = canvas.getItemById('croppingRect');

            let scaleX = image.scaleX;
            let scaleY = image.scaleY;

            // Calculate the actual top-left position of the image
            const imgActualLeft = image.left - (image.width * scaleX) / 2;
            const imgActualTop = image.top - (image.height * scaleY) / 2;

            // Calculate the relative position of the rectangle's top-left to the image's center
            const relRectLeft = croppingRect.left - image.left;
            const relRectTop = croppingRect.top - image.top;

            // Rotate this relative position by the negative of the image's rotation angle
            const rotatedPoint = rotatePoint(relRectLeft, relRectTop, 0, 0, -image.angle);

            // Calculate the actual top-left position of the rectangle in the unrotated frame
            const rectActualLeft = image.left + rotatedPoint.x - (croppingRect.width * croppingRect.scaleX) / 2;
            const rectActualTop = image.top + rotatedPoint.y - (croppingRect.height * croppingRect.scaleY) / 2;

            // Calculate the cropping coordinates
            let cropX = (rectActualLeft - imgActualLeft) / scaleX;
            let cropY = (rectActualTop - imgActualTop) / scaleY;
            let cropWidth = croppingRect.width * croppingRect.scaleX / scaleX;
            let cropHeight = croppingRect.height * croppingRect.scaleY / scaleY;

            // Calculate the center of the cropped region relative to the original image's coordinates
            const croppedCenterX = cropX + cropWidth / 2;
            const croppedCenterY = cropY + cropHeight / 2;

            // Adjust the image's position to make the cropped image appear centered on the canvas
            const newLeft = image.left + (croppedCenterX - image.width / 2) * scaleX;
            const newTop = image.top + (croppedCenterY - image.height / 2) * scaleY;

            image.set({
                left: newLeft,
                top: newTop,
                cropX: cropX,
                cropY: cropY,
                width: cropWidth,
                height: cropHeight
            });

            canvas.renderAll();
        };
        function fitImageOnScreen(){

            const activeObject = canvas.getItemById('image');
            const croppingRect = canvas.getItemById('croppingRect'); // Get cropping rectangle

            const isRotated90 = (activeObject.angle % 360 === 90 || activeObject.angle % 360 === 270);

            const currentImgWidth = isRotated90 ? activeObject.height : activeObject.width;
            const currentImgHeight = isRotated90 ? activeObject.width : activeObject.height;

            const originalScaleX = activeObject.scaleX;
            const originalScaleY = activeObject.scaleY;

            // Calculate new scaling factors for fitting the image on screen
            const scaleX = window.innerWidth / currentImgWidth;
            const scaleY = (window.innerHeight * 0.9) / currentImgHeight;
            const scale = Math.min(scaleX, scaleY);
            const newCanvasWidth = currentImgWidth * scale;
            const newCanvasHeight = currentImgHeight * scale;

            // Scale and reposition the image
            activeObject.scale(scale);
            canvas.setWidth(newCanvasWidth);
            canvas.setHeight(newCanvasHeight);
            canvas.centerObject(activeObject);

            const objects = canvas.getObjects();

            for (let obj of objects) {
                if (obj.id !== 'image' && obj.id !== 'croppingRect') {

                    // Calculate the relative position and scale of the object within the cropping rectangle before cropping
                    const relativeLeft = (obj.left - croppingRect.left) / (croppingRect.width * croppingRect.scaleX);
                    const relativeTop = (obj.top - croppingRect.top) / (croppingRect.height * croppingRect.scaleY);

                    // Calculate new absolute positions based on the relative positions and the new size and position of the image
                    const newLeft = activeObject.left + (relativeLeft * activeObject.width * activeObject.scaleX);
                    const newTop = activeObject.top + (relativeTop * activeObject.height * activeObject.scaleY);

                    // Set new positions and scale for the object
                    obj.set({
                        left: newLeft,
                        top: newTop,
                        scaleX: obj.scaleX * (scale / originalScaleX),
                        scaleY: obj.scaleY * (scale / originalScaleY),
                        ogLeft: obj.left,
                        ogTop: obj.top,
                        ogScaleX: obj.scaleX,
                        ogScaleY: obj.scaleY,
                        ogAngle: obj.angle,
                    });

                    // obj.scale(scale);
                    obj.setCoords();
                }
            }
            // canvas.remove(croppingRect);
            croppingRect.visible = false
            canvas.discardActiveObject(croppingRect)

            canvas.renderAll();
        }

        function rotateAndFitImageOnScreen(angle) {
            const image = canvas.getItemById('image');

            // Rotate the image
            image.angle = (image.angle + angle) % 360;
            const isRotated90 = (image.angle % 360 === 90 || image.angle % 360 === 270);

            const currentImgWidth = isRotated90 ? image.height : image.width;
            const currentImgHeight = isRotated90 ? image.width : image.height;

            const scaleX = window.innerWidth / currentImgWidth;
            const scaleY = (window.innerHeight * 0.9) / currentImgHeight;
            const scale = Math.min(scaleX, scaleY);
            image.scale(scale);
            const newCanvasWidth = currentImgWidth * scale;
            const newCanvasHeight = currentImgHeight * scale;

            // Store the canvas center coordinates before resizing
            const oldCenterX = canvas.width / 2;
            const oldCenterY = canvas.height / 2;

            // Resize canvas and recenter image
            canvas.setWidth(newCanvasWidth);
            canvas.setHeight(newCanvasHeight);
            canvas.centerObject(image);
            canvas.renderAll();

            // Calculate the new canvas center coordinates
            const newCenterX = canvas.width / 2;
            const newCenterY = canvas.height / 2;

            // Update positions of all other objects
            const objects = canvas.getObjects();
            for (let obj of objects) {
                if (obj.id !== 'image') {
                    const vecOld = { x: obj.left - oldCenterX, y: obj.top - oldCenterY };
                    const angleInRadians = angle * (Math.PI / 180);
                    const vecNew = {
                        x: vecOld.x * Math.cos(angleInRadians) - vecOld.y * Math.sin(angleInRadians),
                        y: vecOld.x * Math.sin(angleInRadians) + vecOld.y * Math.cos(angleInRadians),
                    };

                    obj.set({
                        left: vecNew.x + newCenterX,
                        top: vecNew.y + newCenterY,
                        angle: (obj.angle + angle) % 360,
                        ogAngle: obj.angle,
                        ogLeft: obj.left,
                        ogTop: obj.top,
                        ogScaleX: obj.scaleX,
                        ogScaleY: obj.scaleY,
                    }).setCoords();
                }
            }

            // Render the canvas to see the changes
            canvas.renderAll();
        }

        (() => {
            canvas.on("object:modified", function (e) {
                activeObject = e.target;
                if(activeObject.id === 'croppingRect') return
                _self.history.addToHistory(e)
            });
            canvas.on("object:moving", function (e) {
                activeObject = e.target;
                if(activeObject.id === 'croppingRect') checkBoundariesMoving(e)
            });
            canvas.on("object:scaling", function (e) {
                activeObject = e.target;
                if(activeObject.id === 'croppingRect') checkBoundariesScaling(e)
            });
            canvas.on("selection:created", function (e) {
                activeObject = e.target;
                if(e?.selected[0].type === 'textbox'){
                    document.querySelector('#general-options').classList.add('none')
                    document.querySelector('#crop').classList.add('none')
                    document.querySelector('#draw').classList.add('none')
                    document.querySelector('#addText').classList.add('none')
                    document.querySelector('.undo-redo-options').classList.add('none')
                    document.querySelector('.text-options').classList.remove('none')
                }
                if(e?.selected[0].id === 'croppingRect'){
                    document.querySelector('#general-options').classList.add('none')
                    document.querySelector('#crop').classList.add('none')
                    document.querySelector('#draw').classList.add('none')
                    document.querySelector('#addText').classList.add('none')
                    document.querySelector('.undo-redo-options').classList.add('none')
                    document.querySelector('.crop-options').classList.add('none')
                    document.querySelector('.crop-options').classList.remove('none')
                }
            });
            canvas.on("selection:updated", function (e) {
                activeObject = e.target;
                if (e.deselected && e.deselected[0].id == "crop") {
                    canvas.remove(e.deselected[0]).renderAll();
                }
                if(e?.selected[0].type === 'textbox'){
                    document.querySelector('#general-options').classList.add('none')
                   document.querySelector('#crop').classList.add('none')
                    document.querySelector('#draw').classList.add('none')
                    document.querySelector('#addText').classList.add('none')
                    document.querySelector('.undo-redo-options').classList.add('none')
                    document.querySelector('.crop-options').classList.add('none')
                    document.querySelector('.text-options').classList.remove('none')
                }
                if(e?.selected[0].id === 'croppingRect'){
                    document.querySelector('#general-options').classList.add('none')
                    document.querySelector('#crop').classList.add('none')
                    document.querySelector('#draw').classList.add('none')
                    document.querySelector('#addText').classList.add('none')
                    document.querySelector('.undo-redo-options').classList.add('none')
                    document.querySelector('.text-options').classList.add('none')
                    document.querySelector('.draw-options').classList.add('none')
                    document.querySelector('.crop-options').classList.remove('none')

                }
            });
            canvas.on("selection:cleared", function (e) {
                activeObject = e.target;
                document.querySelector('#general-options').classList.remove('none')
                document.querySelector('#crop').classList.remove('none')
                document.querySelector('#draw').classList.remove('none')
                document.querySelector('#addText').classList.remove('none')
                document.querySelector('.undo-redo-options').classList.remove('none')
                document.querySelector('.text-options').classList.add('none')
                document.querySelector('.crop-options').classList.add('none')
            });

        })();


        document.querySelector(`#crop`).addEventListener('click', (e) => {
            _self.history.addToHistory();

            activeObject = canvas.getItemById('image');
            activeObject
                .set({
                    id: 'image',
                    cropX: 0,
                    cropY: 0,
                    // angle: 0,
                    width: activeObject.get("ogWidth"),
                    height: activeObject.get("ogHeight"),
                    // scaleX: activeObject.get("ogScaleX"),
                    // scaleY: activeObject.get("ogScaleY"),
                })
                .setCoords();


            const isRotated90 = (activeObject.angle % 360 === 90 || activeObject.angle % 360 === 270);

            const currentImgWidth = isRotated90 ? activeObject.ogHeight : activeObject.ogWidth;
            const currentImgHeight = isRotated90 ? activeObject.ogWidth : activeObject.ogHeight;

            const scaleX = window.innerWidth / currentImgWidth;
            const scaleY = (window.innerHeight * 0.9) / currentImgHeight;
            const scale = Math.min(scaleX, scaleY);
            activeObject.scale(scale);
            const newCanvasWidth = currentImgWidth * scale;
            const newCanvasHeight = currentImgHeight * scale;


            canvas.setWidth(newCanvasWidth);
            canvas.setHeight(newCanvasHeight);
            canvas.centerObject(activeObject)

            const objects = canvas.getObjects();

            for (let obj of objects) {
                if (obj.id !== 'image' && obj.id !== 'croppingRect') {
                    obj.set({
                        left: obj?.ogLeft ?? obj.left,
                        top: obj?.ogTop ?? obj.top,
                        scaleX: obj?.ogScaleX ?? obj.scaleX,
                        scaleY: obj?.ogScaleY ?? obj.scaleY,
                        angle: obj?.ogAngle ?? obj.angle,
                    });

                    obj.setCoords();
                }
            }

            canvas.renderAll();

            addCropRect();
            // cropOptionsDisplayToggle()
        })
        document.querySelector(`#crop-done`).addEventListener('click', (e) => {

            cropOptionsDisplayToggle()
            cropImage();
            fitImageOnScreen()
            _self.history.addToHistory();
        })
        document.querySelector(`#rotate-right`).addEventListener('click', function (e) {
            if(!canvas.getItemById('image')) return
            rotateAndFitImageOnScreen(90)

        })
        document.querySelector(`#rotate-left`).addEventListener('click', function (e) {
            if(!canvas.getItemById('image')) return
            rotateAndFitImageOnScreen(270)

        })

        const cropOptionsDisplayToggle = () => {
            document.querySelector('#general-options').classList.toggle('none')
            document.querySelector('#crop').classList.toggle('none')
            document.querySelector('#draw').classList.toggle('none')
            document.querySelector('#addText').classList.toggle('none')
            document.querySelector('.undo-redo-options').classList.toggle('none')
            document.querySelector('.crop-options').classList.toggle('none')
        }
    }

    window.ImageEditor.prototype.initializeCrop = crop;
})()