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

    render() {
        if(this.state.editing) {
            return (<input 
                className="top5-item" 
                type='text'
                defaultValue = {this.props.text}
                onKeyPress = {this.handleKeyPress}
                onBlur = {this.handleBlur} 
                onChange = {this.handleUpdate}/>);
        }
        else {
            return (<div className="top5-item" onClick={this.handleClick}> {this.props.text} </div>);
        }
    }
}