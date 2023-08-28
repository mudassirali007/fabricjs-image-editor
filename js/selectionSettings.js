/**
 * initialize selection setting panel
 */
(function () {
  'use strict';
  var selectionSettings = function () {
    const _self = this;

    (() => {

      document.querySelector(`#rotate`).addEventListener('click', function (e) {
        const image = _self.canvas.getItemById('image')
        if(!image) return

        image.angle += 90;
        const isRotated90 = (image.angle % 360 === 90 || image.angle % 360 === 270);
        const currentImgWidth = isRotated90 ? image.height : image.width;
        const currentImgHeight = isRotated90 ? image.width : image.height;

        const scaleX = window.innerWidth / currentImgWidth;
        const scaleY = (window.innerHeight * 0.9) / currentImgHeight;
        const scale = Math.min(scaleX, scaleY); // Use the smaller scale to ensure the image fits both dimensions
        image.scale(scale);
        _self.canvas.setWidth(currentImgWidth*scale);
        _self.canvas.setHeight(currentImgHeight*scale);
        _self.canvas.centerObject(image)
        _self.canvas.renderAll();
      })
      document.querySelector(`#addText`).addEventListener('click', function (e) {
        _self.history.addToHistory();
        const text = new fabric.Textbox('text here');
        _self.canvas.add(text);
        _self.history.addToHistory();
        document.querySelector('#rotate').classList.toggle('none')
        document.querySelector('#crop').classList.toggle('none')
        document.querySelector('#draw').classList.toggle('none')
        document.querySelector('#addText').classList.toggle('none')
        document.querySelector('.undo-redo-options').classList.toggle('none')
        document.querySelector('.text-options').classList.toggle('none')

      })

      document.querySelector("#changeTextColor").addEventListener("input", function(event) {
        const selectedColor = event.target.value;
        _self.canvas.getActiveObject().set({fill:selectedColor,dirty:true})
        _self.canvas.renderAll();
        _self.history.addToHistory();
      });
      document.querySelector("#changeTextBGColor").addEventListener("input", function(event) {
        const selectedColor = event.target.value;
        _self.canvas.getActiveObject().set({backgroundColor :selectedColor,dirty:true})
        _self.canvas.renderAll();
        _self.history.addToHistory();
      });

      document.querySelector("#draw").addEventListener("click", function(event) {
        _self.canvas.isDrawingMode = true
        _self.canvas.freeDrawingBrush.width = 10
        _self.history.addToHistory();
        document.querySelector('#rotate').classList.toggle('none')
        document.querySelector('#crop').classList.toggle('none')
        document.querySelector('#draw').classList.toggle('none')
        document.querySelector('#addText').classList.toggle('none')
        document.querySelector('.undo-redo-options').classList.toggle('none')
        document.querySelector('.draw-options').classList.toggle('none')

      });
      document.querySelector(`#draw-done`).addEventListener('click', (e) => {
        _self.canvas.isDrawingMode = false
        document.querySelector('#rotate').classList.toggle('none')
        document.querySelector('#crop').classList.toggle('none')
        document.querySelector('#draw').classList.toggle('none')
        document.querySelector('#addText').classList.toggle('none')
        document.querySelector('.undo-redo-options').classList.toggle('none')
        document.querySelector('.draw-options').classList.add('none')


      })

      document.querySelector(`#undo`).addEventListener('click', function (e) {
        _self.history.undo()
      })
      document.querySelector(`#redo`).addEventListener('click', function (e) {
        _self.history.redo()
      })

      document.querySelector(`#downloadPng`).addEventListener('click', function (e) {
        downloadImage(_self.canvas.toDataURL());
      })




    })();


    // end effect section
  }

  window.ImageEditor.prototype.initializeSelectionSettings = selectionSettings;
})()