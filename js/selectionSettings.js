/**
 * initialize selection setting panel
 */
(function () {
  'use strict';
  var selectionSettings = function () {
    const _self = this;

    (() => {

      document.querySelector(`#addText`).addEventListener('click', function (e) {
        _self.history.addToHistory();
        const text = new fabric.Textbox('text here');
        _self.canvas.add(text);
        _self.history.addToHistory();

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
      document.querySelector("#removeTextBGColor").addEventListener("click", function(event) {
        _self.canvas.getActiveObject().set({backgroundColor :'',dirty:true})
        _self.canvas.renderAll();
        _self.history.addToHistory();
      });

      // Add event listener
      document.querySelector("#font-family").addEventListener("change", function(event) {
        // Log the selected value to the console
        const selectedFontFamily = event.target.value.toLowerCase();
        _self.canvas.getActiveObject().set({fontFamily :selectedFontFamily,dirty:true})
        _self.canvas.renderAll();
        _self.history.addToHistory();
      });


      document.querySelector("#draw").addEventListener("click", function(event) {
        _self.canvas.isDrawingMode = true
        _self.canvas.freeDrawingBrush = new fabric.PencilBrush(_self.canvas);
        _self.canvas.freeDrawingBrush.width = parseInt(document.querySelector("#draw-width").value)
        _self.history.addToHistory();
        document.querySelector('#rotate-left').classList.toggle('none')
        document.querySelector('#rotate-right').classList.toggle('none')
        document.querySelector('#crop').classList.toggle('none')
        document.querySelector('#draw').classList.toggle('none')
        document.querySelector('#addText').classList.toggle('none')
        // document.querySelector('.undo-redo-options').classList.toggle('none')
        document.querySelector('.draw-options').classList.toggle('none')

      });

      document.querySelector(`#draw-blur`).addEventListener('click', (e) => {
        const enabled = Boolean(parseInt(e.target.getAttribute('enabled')))
        if(!enabled){
          e.target.textContent = 'Disable Blur'
          e.target.setAttribute('enabled',1)
          _self.canvas.freeDrawingBrush = new fabric.EraserBrush(_self.canvas);
          _self.canvas.freeDrawingBrush.inverted = true;
        } else {
          e.target.textContent = 'Enable Blur'
          e.target.setAttribute('enabled',0)
          _self.canvas.freeDrawingBrush = new fabric.PencilBrush(_self.canvas);
          _self.canvas.freeDrawingBrush.inverted = false;
        }
        _self.canvas.freeDrawingBrush.width = parseInt(document.querySelector("#draw-width").value)


      })

      document.querySelector("#draw-color").addEventListener("input", function(event) {
        const selectedColor = event.target.value;
        _self.canvas.freeDrawingBrush.color = selectedColor
        _self.canvas.renderAll();
        _self.history.addToHistory();
      });

      document.querySelector("#draw-width").addEventListener("input", function(event) {
        const selectedValue = event.target.value;
        event.target.previousSibling.textContent = `${selectedValue}`;
        _self.canvas.freeDrawingBrush.width = parseInt(selectedValue)
        _self.canvas.renderAll();
        _self.history.addToHistory();
      });


      document.querySelector(`#draw-done`).addEventListener('click', (e) => {
        _self.canvas.isDrawingMode = false
        document.querySelector('#rotate-left').classList.toggle('none')
        document.querySelector('#rotate-right').classList.toggle('none')
        document.querySelector('#crop').classList.toggle('none')
        document.querySelector('#draw').classList.toggle('none')
        document.querySelector('#addText').classList.toggle('none')
        // document.querySelector('.undo-redo-options').classList.toggle('none')
        document.querySelector('.draw-options').classList.add('none')
      })

      document.querySelector(`#undo`).addEventListener('click', function (e) {
        _self.history.undo()
      })
      document.querySelector(`#redo`).addEventListener('click', function (e) {
        _self.history.redo()
      })

      document.querySelector(`#downloadPng`).addEventListener('click', function (e) {
        downloadImage(_self.canvas.toDataURL({multiplier: 2}));
      })

    })();


    // end effect section
  }

  window.ImageEditor.prototype.initializeSelectionSettings = selectionSettings;
})()