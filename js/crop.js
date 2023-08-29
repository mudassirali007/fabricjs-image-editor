/**
 * Define action to upload, drag & drop images into canvas
 */
(function () {
  var crop = function (canvas) {
    const _self = this;


    let activeObject;


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
    const cropImage = () => {
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

    function fitImageOnScreen(){
      activeObject = canvas.getItemById('image')
      const scaleX = window.innerWidth / activeObject.width;
      const scaleY = (window.innerHeight * 0.9) / activeObject.height;
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
        console.log('selection:created')
        if(e?.selected[0].type === 'textbox'){
          document.querySelector('#rotate').classList.add('none')
          document.querySelector('#crop').classList.add('none')
          document.querySelector('#draw').classList.add('none')
          document.querySelector('#addText').classList.add('none')
          document.querySelector('.undo-redo-options').classList.add('none')
          document.querySelector('.text-options').classList.remove('none')
        }
        if(e?.selected[0].id === 'croppingRect'){
          document.querySelector('#rotate').classList.add('none')
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
        console.log('selection:updated')
        if (e.deselected && e.deselected[0].id == "crop") {
          canvas.remove(e.deselected[0]).renderAll();
        }
        if(e?.selected[0].type === 'textbox'){
          document.querySelector('#rotate').classList.add('none')
          document.querySelector('#crop').classList.add('none')
          document.querySelector('#draw').classList.add('none')
          document.querySelector('#addText').classList.add('none')
          document.querySelector('.undo-redo-options').classList.add('none')
          document.querySelector('.crop-options').classList.add('none')
          document.querySelector('.text-options').classList.remove('none')
        }
        if(e?.selected[0].id === 'croppingRect'){
          document.querySelector('#rotate').classList.add('none')
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
        document.querySelector('#rotate').classList.remove('none')
        document.querySelector('#crop').classList.remove('none')
        document.querySelector('#draw').classList.remove('none')
        document.querySelector('#addText').classList.remove('none')
        document.querySelector('.undo-redo-options').classList.remove('none')
        document.querySelector('.text-options').classList.add('none')
        document.querySelector('.crop-options').classList.add('none')
      });

    })();


    document.querySelector(`#crop`).addEventListener('click', (e) => {
      if(canvas.getItemById('croppingRect')) return
      // _self.history.addToHistory();
      activeObject = canvas.getItemById('image');
      activeObject
          .set({
            id: 'image',
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

      document.querySelector('#rotate').classList.toggle('none')
      document.querySelector('#crop').classList.toggle('none')
      document.querySelector('#draw').classList.toggle('none')
      document.querySelector('#addText').classList.toggle('none')
      document.querySelector('.undo-redo-options').classList.toggle('none')
      document.querySelector('.crop-options').classList.toggle('none')
    })
    document.querySelector(`#crop-done`).addEventListener('click', (e) => {
      document.querySelector('#rotate').classList.toggle('none')
      document.querySelector('#crop').classList.toggle('none')
      document.querySelector('#draw').classList.toggle('none')
      document.querySelector('#addText').classList.toggle('none')
      document.querySelector('.undo-redo-options').classList.toggle('none')
      document.querySelector('.crop-options').classList.toggle('none')
      cropImage();
      fitImageOnScreen()
      // _self.history.addToHistory();
    })
  }

  window.ImageEditor.prototype.initializeCrop = crop;
})()