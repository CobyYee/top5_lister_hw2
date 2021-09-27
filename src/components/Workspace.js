import React from "react";

export default class Workspace extends React.Component {
    render() {
        return (
            <div id="top5-workspace">
                <div id="workspace-edit">
                    <div id="edit-numbering">
                        <div className="item-number">1.</div>
                        <div className="item-number">2.</div>
                        <div className="item-number">3.</div>
                        <div className="item-number">4.</div>
                        <div className="item-number">5.</div>
                    </div>
                    <div id="list-items">
                        {this.props.currentList
                            ? this.props.currentList.items.map(function(name) {
                                return <div className="top5-item"> {name} </div>;
                            })
                            : console.log("")
                        }
                    </div>
                </div>
            </div>
        )
    }
}