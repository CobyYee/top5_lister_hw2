import React from "react";
import EditToolbar from "./EditToolbar";

export default class Banner extends React.Component {
    render() {
        const { title} = this.props;
        return (
            <div id="top5-banner">
                {title}
                <EditToolbar 
                    closeCallback = {this.props.closeCallback} 
                    redoCallback = {this.props.redoCallback}
                    undoCallback = {this.props.undoCallback} 
                    tps={this.tps}/>
            </div>
        );
    }
}