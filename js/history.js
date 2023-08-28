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
                    "path:created": this.addToHistory,
                    "object:modified": this.addToHistory,
                    "selection:updated": this.addToHistory,
                });
            };
            clearUndoRedoHistory = () => {
                this.undoArray = [];
                this.redoArray = [];
            };
            addToHistory = (e) => {
                this.redoArray = [];
                if (e?.path) e.path.selectable = false;
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
                this.canvas.loadFromJSON(
                    JSON.parse(state),
                    this.canvas.renderAll.bind(this.canvas)
                );
            };
        }
        return new History(canvas);
    }

    window.ImageEditor.prototype.initializeHistory = history;
})()