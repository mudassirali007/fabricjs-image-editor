/**
 * Define action to upload, drag & drop images into canvas
 */
(function () {
  var crop = function (canvas) {
    const _self = this;

    var artboard;
    var a_width = 5400;
    var a_height = 1080;
    var isDragging = false;
    var lastPosX = 0;
    var lastPosY = 0;
    var activeObject;
    var croppableImage;
    var cropleft;
    var croptop;
    var cropscalex;
    var cropscaley;

    const addCropRect = () => {
      // After rendering the image, add a rectangle for cropping
      const croppingRect = new fabric.Rect({
        id: 'croppingRect',
        left: 150,
        top: 150,
        width: 200,
        height: 200,
        fill: 'rgba(0,0,0,0.5)', // semi-transparent
        hasControls: true,       // allow resizing
        hasBorders: true,
        originX: "center",
        originY: "center",
      });

      croppingRect.setControlsVisibility({
        mtr: false,
      });
      canvas.centerObject(croppingRect);
      canvas.add(croppingRect);
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
        obj.top = Math.max(obj.top, obj.top-obj.getBoundingRect().top);
        obj.left = Math.max(obj.left, obj.left-obj.getBoundingRect().left);
      }
      // bot-right corner
      if(obj.getBoundingRect().top+obj.getBoundingRect().height  > obj.canvas.height || obj.getBoundingRect().left+obj.getBoundingRect().width  > obj.canvas.width){
        obj.top = Math.min(obj.top, obj.canvas.height-obj.getBoundingRect().height+obj.top-obj.getBoundingRect().top);
        obj.left = Math.min(obj.left, obj.canvas.width-obj.getBoundingRect().width+obj.left-obj.getBoundingRect().left);
      }

      canvas.renderAll();
    }
    let left1 = 0;
    let top1 = 0 ;
    let scale1x = 0 ;
    let scale1y = 0 ;
    let width1 = 0 ;
    let height1 = 0 ;
    const checkBoundariesScaling = (event) => {
      let obj = event.target;
      obj.setCoords();
      let brNew = obj.getBoundingRect();

      if (((brNew.width+brNew.left)>=obj.canvas.width) || ((brNew.height+brNew.top)>=obj.canvas.height) || ((brNew.left<0) || (brNew.top<0))) {
        obj.left = left1;
        obj.top=top1;
        obj.scaleX=scale1x;
        obj.scaleY=scale1y;
        obj.width=width1;
        obj.height=height1;
      }
      else{
        left1 =obj.left;
        top1 =obj.top;
        scale1x = obj.scaleX;
        scale1y=obj.scaleY;
        width1=obj.width;
        height1=obj.height;
      }
    }

    // Function to crop the image
    const cropImage2 = () => {
      const image = canvas.getItemById('image');
      const croppingRect = canvas.getItemById('croppingRect');

      let scaleX = image.scaleX;
      let scaleY = image.scaleY;

      // Calculate the actual top-left position of the image and croppingRect on the canvas
      const imgActualLeft = image.left - (image.width * scaleX) / 2;
      const imgActualTop = image.top - (image.height * scaleY) / 2;

      const rectActualLeft = croppingRect.left - (croppingRect.width * croppingRect.scaleX) / 2;
      const rectActualTop = croppingRect.top - (croppingRect.height * croppingRect.scaleY) / 2;

      // Now, calculate the position of the cropping rectangle relative to the image
      let cropX = (rectActualLeft - imgActualLeft) / scaleX;
      let cropY = (rectActualTop - imgActualTop) / scaleY;
      let cropWidth = croppingRect.width * croppingRect.scaleX / scaleX;
      let cropHeight = croppingRect.height * croppingRect.scaleY / scaleY;

      image.set({
        cropX: cropX,
        cropY: cropY,
        width: cropWidth,
        height: cropHeight
      });

      // Update the image on the canvas to show the cropped version
      canvas.remove(croppingRect);
      canvas.renderAll();
    };


    function overlay() {
      canvas.add(
          new fabric.Rect({
            // originX: "left",
            // originY: "top",
            width: canvas.width,
            height: canvas.height,
            fill: "rgba(0,0,0,0.5)",
            selectable: false,
            id: "overlay",
          })
      );
    }

    function cropImage() {
      croppableImage = activeObject;
      canvas.uniformScaling = false;
      activeObject.setCoords();
      let left =
          activeObject.get("left") -
          (activeObject.get("width") * activeObject.get("scaleX")) / 2;
      let top =
          activeObject.get("top") -
          (activeObject.get("height") * activeObject.get("scaleY")) / 2;
      let cropx = activeObject.get("cropX");
      let cropy = activeObject.get("cropY");
      let cropUI = new fabric.Rect({
        left: activeObject.get("left"),
        top: activeObject.get("top"),
        width: activeObject.get("width") * activeObject.get("scaleX") - 5,
        height: activeObject.get("height") * activeObject.get("scaleY") - 5,
        // width: activeObject.get("width"),
        // height: activeObject.get("height"),
        // scaleX: activeObject.get("scaleX"),
        // scaleY: activeObject.get("scaleY"),
        originX: "center",
        originY: "center",
        id: "crop",
        fill: "rgba(0,0,0,0)",
        shadow: {
          color: "black",
          offsetX: 0,
          offsetY: 0,
          blur: 0,
          opacity: 0,
        },
      });
      activeObject.clone(function (cloned) {
        cloned.set({
          id: "cropped",
          selectable: false,
          originX: "center",
          originY: "center",
        });
        canvas.add(cloned);
        canvas.bringToFront(cloned);
        canvas.bringToFront(cropUI);
        canvas.renderAll();
      });
      activeObject
          .set({
            cropX: 0,
            cropY: 0,
            width: activeObject.get("ogWidth"),
            height: activeObject.get("ogHeight"),
            // scaleX: activeObject.get("ogScaleX"),
            // scaleY: activeObject.get("ogScaleY"),
          })
          .setCoords();
      canvas.renderAll();
      activeObject.set({
        left:
            left +
            (activeObject.get("width") * activeObject.get("scaleX")) / 2 -
            cropx * activeObject.get("scaleX"),
        top:
            top +
            (activeObject.get("height") * activeObject.get("scaleY")) / 2 -
            cropy * activeObject.get("scaleY"),
      });
      cropUI.setControlsVisibility({
        mt: true,
        mb: true,
        ml: true,
        mr: true,
        bl: true,
        br: true,
        tl: true,
        tr: true,
        mtr: false,
      });
      canvas.add(cropUI).setActiveObject(cropUI).renderAll();
      cropleft = cropUI.get("left");
      croptop = cropUI.get("top");
      cropscalex = cropUI.get("scaleX");
      cropscaley = cropUI.get("scaleY");

      overlay();
    }
    function crop(obj) {
      let crop = canvas.getItemById("crop");
      croppableImage.setCoords();
      crop.setCoords();
      let cleft = crop.get("left") - (crop.get("width") * crop.get("scaleX")) / 2;
      let ctop = crop.get("top") - (crop.get("height") * crop.get("scaleY")) / 2;
      let height =
          (crop.get("height") / croppableImage.get("scaleY")) * crop.get("scaleY");
      let width =
          (crop.get("width") / croppableImage.get("scaleX")) * crop.get("scaleX");
      let left =
          cleft -
          (croppableImage.get("left") -
              (croppableImage.get("width") * croppableImage.get("scaleX")) / 2);
      let top =
          ctop -
          (croppableImage.get("top") -
              (croppableImage.get("height") * croppableImage.get("scaleY")) / 2);

      if (left < 0 && top > 0) {
        obj
            .set({ cropY: top / croppableImage.get("scaleY"), height: height })
            .setCoords();
        canvas.renderAll();
        obj.set({
          top: ctop + (obj.get("height") * obj.get("scaleY")) / 2,
        });
      } else if (top < 0 && left > 0) {
        obj
            .set({ cropX: left / croppableImage.get("scaleX"), width: width })
            .setCoords();
        canvas.renderAll();
        obj.set({
          left: cleft + (obj.get("width") * obj.get("scaleX")) / 2,
        });
      } else if (top > 0 && left > 0) {
        obj
            .set({
              cropX: left / croppableImage.get("scaleX"),
              cropY: top / croppableImage.get("scaleY"),
              height: height,
              width: width,
            })
            .setCoords();
        canvas.renderAll();
        obj.set({
          left: cleft + (obj.get("width") * obj.get("scaleX")) / 2,
          top: ctop + (obj.get("height") * obj.get("scaleY")) / 2,
        });
      }
      canvas.renderAll();
      if (obj.get("id") != "cropped") {
        cancelCrop();
      }
    }
    function cancelCrop() {
      canvas.remove(canvas.getItemById("crop"));
      canvas.remove(canvas.getItemById("overlay"));
      canvas.remove(canvas.getItemById("cropped"));
      canvas.uniformScaling = true;
      canvas.renderAll();
    }
    function checkCrop(obj) {
      if (obj.isContainedWithinObject(croppableImage)) {
        croptop = obj.get("top");
        cropleft = obj.get("left");
        cropscalex = obj.get("scaleX");
        cropscaley = obj.get("scaleY");
      } else {
        obj.top = croptop;
        obj.left = cropleft;
        obj.scaleX = cropscalex;
        obj.scaleY = cropscaley;
        obj.setCoords();
        obj.saveState();
      }
      obj.set({
        borderColor: "#51B9F9",
      });
      canvas.renderAll();
      crop(canvas.getItemById("cropped"));
    }

    function limitRectMoving() {
      let top = activeObject.top;
      let bottom = top + activeObject.getScaledHeight();
      let left = activeObject.left;
      let right = left + activeObject.getScaledWidth();

      // let topBound = croppableImage.getBoundingRect().top;
      let topBound = croppableImage.top;
      let bottomBound = topBound + croppableImage.getScaledHeight();
      // let leftBound = croppableImage.getBoundingRect().left;
      let leftBound = croppableImage.left;
      let rightBound = leftBound + croppableImage.getScaledWidth();

      activeObject.set(
          "left",
          Math.min(
              Math.max(left, leftBound),
              rightBound - activeObject.getScaledWidth()
          )
      );
      activeObject.set(
          "top",
          Math.min(
              Math.max(top, topBound),
              bottomBound - activeObject.getScaledHeight()
          )
      );
    }

    function fitImageOnScreen(){
      activeObject = canvas.getItemById('image')
      const scaleX = canvas.width / activeObject.width;
      const scaleY = canvas.height / activeObject.height;
      const scale = Math.min(scaleX, scaleY); // Use the smaller scale to ensure the image fits both dimensions
      activeObject.scale(scale);
      canvas.setWidth(activeObject.width*scale);
      canvas.setHeight(activeObject.height*scale);
      canvas.centerObject(activeObject);
      canvas.renderAll();
    }


    (() => {
      canvas.on("object:modified", function (e) {
        activeObject = e.target;
        if (activeObject.id == "crop") {
          checkCrop(activeObject);
          return;
        }
      });
      canvas.on("object:moving", function (e) {
        activeObject = e.target;

        if (activeObject.id == "crop") {
          // limitRectMoving();
          if (activeObject.isContainedWithinObject(croppableImage)) {
            cropleft = activeObject.get("left");
            croptop = activeObject.get("top");
            cropscalex = activeObject.get("scaleX");
            cropscaley = activeObject.get("scaleY");
          }
          crop(canvas.getItemById("cropped"));
          return;
        }
        if(activeObject.id === 'croppingRect') checkBoundariesMoving(e)

      });
      canvas.on("object:scaling", function (e) {
        activeObject = e.target;
        if (activeObject.id == "crop") {
          // limitRectScaling();
          if (activeObject.isContainedWithinObject(croppableImage)) {
            cropleft = activeObject.get("left");
            croptop = activeObject.get("top");
            cropscalex = activeObject.get("scaleX");
            cropscaley = activeObject.get("scaleY");
          }
          crop(canvas.getItemById("cropped"));
          return;
        }
        if(activeObject.id === 'croppingRect') checkBoundariesScaling(e)
      });
      canvas.on("selection:created", function (e) {
        activeObject = e.target;
      });
      canvas.on("selection:updated", function (e) {
        activeObject = e.target;
        if (e.deselected && e.deselected[0].id == "crop") {
          canvas.remove(e.deselected[0]).renderAll();
        }
      });
      canvas.on("selection:cleared", function (e) {
        activeObject = e.target;

        if (e.deselected && e.deselected[0].id == "crop") {
          crop(croppableImage);
        }
      });

    })();



    document.querySelector(`#crop`).addEventListener('click', (e) => {
      activeObject = canvas.getItemById('image');
      activeObject
          .set({
            cropX: 0,
            cropY: 0,
            angle: 0,
            width: activeObject.get("ogWidth"),
            height: activeObject.get("ogHeight"),
            scaleX: activeObject.get("ogScaleX"),
            scaleY: activeObject.get("ogScaleY"),
          })
          .setCoords();
      canvas.setWidth(activeObject.width * activeObject.scaleX);
      canvas.setHeight(activeObject.height * activeObject.scaleY);
      canvas.centerObject(activeObject)
      addCropRect();
      // canvas.renderAll();
      // cropImage();
    })
    document.querySelector(`#crop-done`).addEventListener('click', (e) => {
      cropImage2();
      fitImageOnScreen()
      if (activeObject && activeObject.id == "crop") {
        crop(croppableImage);
        fitImageOnScreen()
      }
    })
  }

  window.ImageEditor.prototype.initializeCrop = crop;
})()