import jsTPS_Transaction from "../components/jsTPS.js"

export default class MoveItemTransaction extends jsTPS_Transaction {
    constructor(initApp, initOld, initNew) {
        super();
        this.app = initApp;
        this.oldItemIndex = initOld;
        this.newItemIndex = initNew;
    }

    doTransaction() {
        this.app.moveItem(this.oldItemIndex, this.newItemIndex);
    }
    
    undoTransaction() {
        this.app.moveItem(this.newItemIndex, this.oldItemIndex);
    }
}