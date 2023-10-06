/**
 * Define action to upload, drag & drop images into canvas
 */
(function () {
  var upload = function (canvas) {
    const _self = this;
    const dropdown = document.querySelector('#canvasDropDown');
    let selectedCanvas = 0;
    let totalCanvas = 0;
    const addNewCanvasDropDown = () => {
      // Create a new option element
      const newOption = document.createElement('option');
      canvasDropDown.classList.remove('none')
      newOption.value = `${dropdown.options.length}`;  // Set the value for the option
      newOption.textContent = `Canvas ${dropdown.options.length+1}`;  // Set the display text for the option
      dropdown.appendChild(newOption);
      dropdown.selectedIndex = dropdown.options.length - 1;
      selectedCanvas = dropdown.options.length - 1
      totalCanvas++;
    }

    dropdown.addEventListener('change', function() {
      let selectedValue = parseInt(this.value); // get the selected option's value (price)
      updateCurrentCanvas();
      _self.history.loadFromJson(_self.canvasArray[selectedValue]?.json)
      _self.history.undoArray =  JSON.parse(_self.canvasArray[selectedValue]?.history?.undoArray) ?? []
      _self.history.redoArray =  JSON.parse(_self.canvasArray[selectedValue]?.history?.redoArray) ?? []
      selectedCanvas = selectedValue

    });

    const updateCurrentCanvas = () => {
      if(totalCanvas){
        _self.canvasArray[selectedCanvas] = {
          json: JSON.stringify(canvas.toDatalessJSON(_self.history.props)),
          history: {
            undoArray: JSON.stringify(_self.history.undoArray),
            redoArray: JSON.stringify(_self.history.redoArray)
          }
        };
      }
    }
    const processFiles = (files) => {
      if (files.length === 0) return;
      const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml']
      updateCurrentCanvas();
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
              ogAngle: 0,
              // erasable: false,
            });
            canvas.setWidth(img.width*scale);
            canvas.setHeight(img.height*scale);
            // Add the image to the canvas
            canvas.add(img);
            canvas.centerObject(img);
            canvas.renderAll()


            _self.canvasArray.push({
              json: JSON.stringify(canvas.toDatalessJSON(_self.history.props)),
              history: {
                undoArray: JSON.stringify(_self.history.undoArray),
                redoArray: JSON.stringify(_self.history.redoArray)
              }
            });
            addNewCanvasDropDown()
            _self.history.addToHistory();
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