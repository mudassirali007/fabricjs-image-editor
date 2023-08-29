/**
 * Define action to upload, drag & drop images into canvas
 */
(function () {
    var history = function (canvas) {
        const _self = this;
        class History {
             canvas;
             enableHistory = false;
             undoArray = [];
             redoArray= [];
             props = [
                `erasable`,
                `id`,
                `cropX`,
                `cropY`,
                `originX`,
                `originY`,
                `width`,
                `height`,
                `ogWidth`,
                `ogHeight`,
                `scaleX`,
                `scaleY`,
                `ogScaleX`,
                `ogScaleY`,
                `path`,
                `eraser`,
                `selectable`,
                `globalCompositeOperation`,
            ];

            constructor(canvas) {
                this.canvas = canvas;
                this.historyInit();
            }
            historyInit = () => {
                this.canvas.on({
                    "path:created": this.pathCreated,
                });
            };
            pathCreated = (e) => {
                if(canvas.freeDrawingBrush.inverted) this.blurPath(e)
                if (e?.path) e.path.selectable = false;
                this.addToHistory()
            };
            blurPath = (options) => {
                const path = options.path;

                path.cloneAsImage(function(image) {

                    const img = new fabric.Image(image.getElement(), {
                        left: path.left,
                        top: path.top,
                    });

                    // Apply the blur filter to the image
                    img.filters.push(new fabric.Image.filters.Blur({
                        blur: 3 // you can adjust the value
                    }));

                    img.applyFilters();

                    // Add the blurred image to the canvas and remove the original path
                    canvas.add(img);
                    canvas.remove(path);
                });
            }
            clearUndoRedoHistory = () => {
                this.undoArray = [];
                this.redoArray = [];
            };
            addToHistory = () => {
                this.redoArray = [];
                this.undoArray.push(JSON.stringify(this.canvas.toDatalessJSON(this.props)));
            };
            undo = () => {
                if (this.undoArray.length > 1) {
                    this.redoArray.push(this.undoArray.pop());
                    this.loadFromJson(this.undoArray[this.undoArray.length - 1]);
                }
            };
            redo = () => {
                if (this.redoArray.length > 0) {
                    const poppedState = this.redoArray.pop();
                    this.undoArray.push(poppedState);
                    this.loadFromJson(poppedState);
                }
            };
            loadFromJson = (state) => {
                const json = JSON.parse(state);
                this.canvas.loadFromJSON(
                    json, () => {
                        this.canvas.setWidth(json.width);
                        this.canvas.setHeight(json.height);
                        this.canvas.renderAll.bind(this.canvas)
                    },
                    () => {

                    }
                );
            };
        }
        return new History(canvas);
    }

    window.ImageEditor.prototype.initializeHistory = history;
})()