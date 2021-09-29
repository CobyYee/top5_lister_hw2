import React from "react";

export default class EditToolbar extends React.Component {
    render() {
        let redoClass = "top5-button";
        let undoClass = "top5-button";
        let closeClass = "top5-button";
        if(!this.props.tps.hasTransactionToRedo()) {
            redoClass = "top5-button-disabled";
        }
        if(!this.props.tps.hasTransactionToUndo()) {
            undoClass = "top5-button-disabled";
        }
        if(this.props.currentList == null) {
            closeClass = "top5-button-disabled";
        }
        return (
            <div id="edit-toolbar">
                <div 
                    id='undo-button' 
                    className={undoClass}
                    onClick={this.props.undoCallback}>
                        &#x21B6;
                </div>
                <div
                    id='redo-button'
                    className={redoClass}
                    onClick={this.props.redoCallback}>
                        &#x21B7;
                </div>
                <div
                    id='close-button'
                    className={closeClass}
                    onClick = {this.props.closeCallback}>
                        &#x24E7;
                </div>
            </div>
        )
    }
}