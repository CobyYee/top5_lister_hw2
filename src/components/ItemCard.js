import React from "react";

export default class ItemCard extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            editing: false,
            index: this.props.index,
            text: this.props.text
        }
    }

    handleClick = (event) => {
        if(event.detail === 2) {
            this.handleToggleEdit(event);
        }
    }

    handleToggleEdit() {
        this.setState({
            editing: !this.state.editing,
            index: this.state.index,
            text: this.state.text
        });
    }

    handleUpdate = (event) => {
        this.setState({
            editing: this.state.editing,
            index: this.state.index,
            text: event.target.value
        })
    }

    handleKeyPress = (event) => {
        if(event.code === "Enter") {
            this.handleBlur();
        }        
    }

    handleBlur = (event) => {
        this.props.renameItemCallback(this.state.index, this.state.text);
        this.handleToggleEdit();
    }

    handleDragStart = (ev, index) => {
        ev.dataTransfer.setData("index", index);
    }

    handleDrop = (ev, index) => {
        let startingIndex = ev.dataTransfer.getData("index");
        this.props.moveItemCallback(startingIndex, index);
        ev.target.className = "top5-item";
        ev.preventDefault();
        ev.stopPropagation();
    }

    handleDragOver = (event) => {
        event.preventDefault();
        event.target.className = "top5-item-dragged-to";
    }

    handleDragLeave = (event) => {
        event.preventDefault();
        event.target.className = "top5-item";
    }

    render() {
        if(this.state.editing) {
            return (<input 
                className="top5-item" 
                type='text'
                defaultValue = {this.props.text}
                onKeyPress = {this.handleKeyPress}
                onBlur = {this.handleBlur} 
                onChange = {this.handleUpdate}
                autoFocus/>);
        }
        else {
            return (<div 
                className="top5-item" 
                onClick={this.handleClick} 
                draggable = "true"
                droppable = "true"
                onDragStart={(e) => this.handleDragStart(e, this.state.index)}
                onDrop={(e) => this.handleDrop(e, this.state.index)}
                onDragLeave={(e) => this.handleDragLeave(e)}
                onDragOver={(e) => this.handleDragOver(e)}> 
                    {this.props.text} 
                </div>);
        }
    }
}