/**
 * Define action to add emoji into canvas
 */
(function () {
  const emoji = function (canvas) {
    const _self = this;
    const emojiAddTextButton = document.querySelector(`#emoji-add-text`);
    const emojiAddButton = document.querySelector(`#emoji-add`);
    emojiAddButton.addEventListener('change',  (e) => {
      const selectedEmojiValue = e.target.value;
      _self.history.addToHistory();
      const text = new fabric.Text(selectedEmojiValue);
      _self.canvas.add(text);
      _self.history.addToHistory();

    })
    emojiAddTextButton.addEventListener('change',  (e) => {
      const selectedEmojiValue = e.target.value;
      const activeObject = canvas.getActiveObject();

      if (activeObject && activeObject.type === 'textbox') {
        activeObject.isEditing && activeObject.insertChars(selectedEmojiValue, null, activeObject.selectionStart, activeObject.selectionEnd);
        (!activeObject.isEditing) && (activeObject.text += selectedEmojiValue)
        canvas.renderAll();
      }

    })

  }

  window.ImageEditor.prototype.initializeEmoji = emoji;
})()