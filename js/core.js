/**
 * The Core of Image Editor
 */
(function () {
  "use strict";

  /**
   * Image Editor class
   * @param {String} containerSelector jquery selector for image editor container
   * @param {Array} buttons define toolbar buttons
   * @param {Array} shapes define shapes
   * @param {Array} icons define icons
   * 
   */
  var ImageEditor = function () {

    this.propsToSave = [
        `preserveObjectStacking`,
        `animation`,
        `_controlsVisibility`,
    ];

    this.canvas = null;
    this.canvasArray = [];
    this.history = null;


    /**
     * Initialize image editor
     */
    this.init = () => {
      this.initializeSelectionSettings();
      this.canvas = this.initializeCanvas();
      window.canvas = this.canvas
      this.initializeUpload(this.canvas);
      this.initializeCrop(this.canvas);
      this.initializeEmoji(this.canvas);
      this.history = this.initializeHistory(this.canvas);
    };



    this.init();
  };

  window.ImageEditor = ImageEditor;
})();
