/**
 * Define action to upload, drag & drop images into canvas
 */
(function () {
  var emoji = function (canvas) {
    const _self = this;
    const emojiDropDown = document.querySelector(`#emojiDropdown`);
    emojiDropDown.addEventListener('change',  (e) => {
      const selectedEmojiValue = e.target.value;
      const activeObject = canvas.getActiveObject();

      if (activeObject && activeObject.type === 'textbox') {
        // activeObject.text += selectedEmojiValue;
        activeObject.isEditing && activeObject.insertChars(selectedEmojiValue, null, activeObject.selectionStart, activeObject.selectionEnd);
        (!activeObject.isEditing) && (activeObject.text += selectedEmojiValue)
        canvas.renderAll();
      } else {
        _self.history.addToHistory();
        const text = new fabric.Text(selectedEmojiValue);
        _self.canvas.add(text);
        _self.history.addToHistory();
      }

    })


  }

  window.ImageEditor.prototype.initializeEmoji = emoji;
})()