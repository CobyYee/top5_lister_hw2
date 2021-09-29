import jsTPS_Transaction from "../components/jsTPS.js"

export default class ChangeItemTransaction extends jsTPS_Transaction {
    constructor(initApp, initId, initOldText, initNewText) {
        super();
        this.app = initApp;
        this.id = initId;
        this.oldText = initOldText;
        this.newText = initNewText;
    }

    doTransaction() {
        this.app.renameItem(this.id, this.newText);
    }
    
    undoTransaction() {
        this.app.renameItem(this.id, this.oldText);
    }
}