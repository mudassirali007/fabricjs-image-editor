/**
 * Define action to upload, drag & drop images into canvas
 */
(function () {
  var upload = function (canvas) {
    const _self = this;


    const processFiles = (files) => {
      if (files.length === 0) return;
      const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml']
      canvas.clear()
      _self.history.clearUndoRedoHistory();

      for (let file of files) {
        // check type
        if (!allowedTypes.includes(file.type)) continue

        let reader = new FileReader()

        // handle image, read file, add to canvas
        reader.onload = (f) => {
          // Load an image into Fabric canvas
          fabric.Image.fromURL(f.target.result, (img) => {
            // Scale the image according to the screen's width-height ratio
            const scaleX = window.innerWidth / img.width;
            const scaleY = (window.innerHeight * 0.9) / img.height;
            const scale = Math.min(scaleX, scaleY); // Use the smaller scale to ensure the image fits both dimensions
            img.scale(scale);

            // Position the image in the center of the canvas
            img.set({
              id: 'image',
              selectable: false,
              originX: 'center',
              originY: 'center',
              ogWidth: img.width,
              ogHeight: img.height,
              ogScaleX: scale,
              ogScaleY: scale,
              // erasable: false,
            });
            canvas.setWidth(img.width*scale);
            canvas.setHeight(img.height*scale);
            // Add the image to the canvas
            canvas.add(img);
            canvas.centerObject(img);
            canvas.renderAll()

            // document.querySelector('#rotate').classList.toggle('none')
            // document.querySelector('#crop').classList.toggle('none')
            // document.querySelector('#draw').classList.toggle('none')
            // document.querySelector('#addText').classList.toggle('none')
            // document.querySelector('.download').classList.toggle('none')
            // document.querySelector('.undo-redo-options').classList.toggle('none')
          });
        }

        reader.readAsDataURL(file)
      }

    }

    document.querySelector(`#btn-image-upload`).addEventListener('change', function (e) {
      if (e.target.files.length === 0) return;
      processFiles(e.target.files)
    })
  }

  window.ImageEditor.prototype.initializeUpload = upload;
})()