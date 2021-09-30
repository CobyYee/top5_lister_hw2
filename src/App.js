import React from 'react';
import './App.css';
import jsTPS from './components/jsTPS.js';
import ChangeItemTransaction from './transactions/ChangeItemTransaction.js';
import MoveItemTransaction from './transactions/MoveItemTransaction.js';

// IMPORT DATA MANAGEMENT AND TRANSACTION STUFF
import DBManager from './db/DBManager';

// THESE ARE OUR REACT COMPONENTS
import DeleteModal from './components/DeleteModal';
import Banner from './components/Banner.js'
import Sidebar from './components/Sidebar.js'
import Workspace from './components/Workspace.js';
import Statusbar from './components/Statusbar.js'

class App extends React.Component {
    constructor(props) {
        super(props);

        // THIS WILL TALK TO LOCAL STORAGE
        this.db = new DBManager();

        // GET THE SESSION DATA FROM OUR DATA MANAGER
        let loadedSessionData = this.db.queryGetSessionData();

        this.tps = new jsTPS();
        this.undoRedoEvent = this.undoRedoEvent.bind(this);

        // SETUP THE INITIAL STATE
        this.state = {
            currentList : null,
            sessionData : loadedSessionData,
            keyNamePair : null
        }
    }
    sortKeyNamePairsByName = (keyNamePairs) => {
        keyNamePairs.sort((keyPair1, keyPair2) => {
            // GET THE LISTS
            return keyPair1.name.localeCompare(keyPair2.name);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CREATING A NEW LIST
    createNewList = () => {
        // FIRST FIGURE OUT WHAT THE NEW LIST'S KEY AND NAME WILL BE
        let newKey = this.state.sessionData.nextKey;
        let newName = "Untitled" + newKey;

        // MAKE THE NEW LIST
        let newList = {
            key: newKey,
            name: newName,
            items: ["?", "?", "?", "?", "?"]
        };

        // MAKE THE KEY,NAME OBJECT SO WE CAN KEEP IT IN OUR
        // SESSION DATA SO IT WILL BE IN OUR LIST OF LISTS
        let newKeyNamePair = { "key": newKey, "name": newName };
        let updatedPairs = [...this.state.sessionData.keyNamePairs, newKeyNamePair];
        this.sortKeyNamePairsByName(updatedPairs);

        // CHANGE THE APP STATE SO THAT IT THE CURRENT LIST IS
        // THIS NEW LIST AND UPDATE THE SESSION DATA SO THAT THE
        // NEXT LIST CAN BE MADE AS WELL. NOTE, THIS setState WILL
        // FORCE A CALL TO render, BUT THIS UPDATE IS ASYNCHRONOUS,
        // SO ANY AFTER EFFECTS THAT NEED TO USE THIS UPDATED STATE
        // SHOULD BE DONE VIA ITS CALLBACK
        this.setState(prevState => ({
            currentList: newList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey + 1,
                counter: prevState.sessionData.counter + 1,
                keyNamePairs: updatedPairs
            }
        }), () => {
            // PUTTING THIS NEW LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationCreateList(newList);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    renameList = (key, newName) => {
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        // NOW GO THROUGH THE ARRAY AND FIND THE ONE TO RENAME
        for (let i = 0; i < newKeyNamePairs.length; i++) {
            let pair = newKeyNamePairs[i];
            if (pair.key === key) {
                pair.name = newName;
            }
        }
        this.sortKeyNamePairsByName(newKeyNamePairs);

        // WE MAY HAVE TO RENAME THE currentList
        let currentList = this.state.currentList;
        if (currentList.key === key) {
            currentList.name = newName;
        }

        this.setState(prevState => ({
            currentList: prevState.currentList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            let list = this.db.queryGetList(key);
            list.name = newName;
            this.db.mutationUpdateList(list);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    // THIS FUNCTION RENAMES AN ITEM OF THE CURRENT LIST
    renameItem = (index, value) => {
        let newList = this.state.currentList;
        newList.items[index] = value;
                
        this.setState(prevState => ({
            currentList: newList,
            sessionData: prevState.sessionData
        }), () => {
            let list = this.db.queryGetList(this.state.currentList);
            list = newList;
            this.db.mutationUpdateList(list);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    // THIS FUNCTION MOVES THE ITEMS OF THE LIST AROUND
    moveItem = (oldIndex, newIndex) => {
        let newList = this.state.currentList;
        newList.items.splice(newIndex, 0, newList.items.splice(oldIndex, 1)[0]);

        this.setState(prevState => ({
            currentList: newList,
            sessionData: prevState.sessionData
        }), () => {
            let list = this.db.queryGetList(this.state.currentList);
            list = newList;
            this.db.mutationUpdateList(list);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }

    addMoveTransaction = (oldIndex, newIndex) => {
        let transaction = new MoveItemTransaction(this, oldIndex, newIndex);
        this.tps.addTransaction(transaction);
    }

    addRenameTransaction = (index, value) => {
        let transaction = new ChangeItemTransaction(this, index, this.state.currentList.items[index], value);
        this.tps.addTransaction(transaction);
    }

    // THIS FUNCTION BEGINS THE PROCESS OF LOADING A LIST FOR EDITING
    loadList = (key) => {
        this.tps.clearAllTransactions();
        let newCurrentList = this.db.queryGetList(key);
        this.setState(prevState => ({
            currentList: newCurrentList,
            sessionData: prevState.sessionData
        }), () => {
            // ANY AFTER EFFECTS?
        });
    }
    undo = () => {
        this.tps.undoTransaction();       
        this.setState(prevState => ({
            currentList: prevState.currentList,
            sessionData: prevState.sessionData,
            keyNamePair: prevState.keyNamePair
        }));
    }
    redo = () => {
        this.tps.doTransaction();
        this.setState(prevState => ({
            currentList: prevState.currentList,
            sessionData: prevState.sessionData,
            keyNamePair: prevState.keyNamePair
        }));
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CLOSING THE CURRENT LIST
    closeCurrentList = () => {
        this.tps.clearAllTransactions();
        this.setState(prevState => ({
            currentList: null,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            sessionData: this.state.sessionData
        }), () => {
            // ANY AFTER EFFECTS?
        });
    }
    deleteList = (keyNamePair) => {
        // SOMEHOW YOU ARE GOING TO HAVE TO FIGURE OUT
        // WHICH LIST IT IS THAT THE USER WANTS TO
        // DELETE AND MAKE THAT CONNECTION SO THAT THE
        // NAME PROPERLY DISPLAYS INSIDE THE MODAL
        this.setState(prevState => ({
            currentList : prevState.currentList,
            sessionData : prevState.sessionData,
            keyNamePair: keyNamePair
        }));
        this.showDeleteListModal();
    }
    // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
    // TO SEE IF THEY REALLY WANT TO DELETE THE LIST
    showDeleteListModal() {
        let modal = document.getElementById("delete-modal");
        modal.classList.add("is-visible");
    }
    // THIS FUNCTION IS FOR HIDING THE MODAL
    hideDeleteListModal() {
        let modal = document.getElementById("delete-modal");
        modal.classList.remove("is-visible");
    }
    // THIS CALLBACK FUNCTION REMOVES A LIST
    removeList = () => {
        let newSessionData = this.db.queryGetSessionData();
        let newKeyNamePairs = newSessionData.keyNamePairs;
        let index = -1;
        for (let i = 0; i < newKeyNamePairs.length; i++) {
            let pair = newKeyNamePairs[i];
            if (pair.key === this.state.keyNamePair.key) {
                index = i;
            }
        }
        newKeyNamePairs.splice(index, 1);
        newSessionData.keyNamePairs = newKeyNamePairs;

        if((this.state.keyNamePair.key != null) && (this.state.keyNamePair.key === this.state.currentList.key)) {
            this.tps.clearAllTransactions();
            this.setState(prevState => ({
                currentList : null,
                sessionData : newSessionData,
                keyNamePair : null
            }), () => {
                this.db.mutationUpdateSessionData(newSessionData);
                this.closeCurrentList();
            });
        }
        else {
            this.setState(prevState => ({
                currentList : prevState.currentList,
                sessionData : newSessionData,
                keyNamePair : null
            }), () => {
                this.db.mutationUpdateSessionData(newSessionData);
            });
        }
        this.hideDeleteListModal();
    }

    undoRedoEvent(event) {
        if(event.ctrlKey && event.keyCode === 90) {
            this.undo();
        }
        if(event.ctrlKey && event.keyCode === 89) {
            this.redo();
        }
    }
    componentDidMount() {
        document.addEventListener("keydown", this.undoRedoEvent, false);
    }
    componentWillUnmount() {
        document.removeEventListener("keydown", this.undoRedoEvent, false);
    }

    render() {
        return (
            <div id="app-root">
                <Banner 
                    title='Top 5 Lister'
                    closeCallback={this.closeCurrentList} 
                    redoCallback={this.redo}
                    undoCallback={this.undo}
                    tps={this.tps}
                    currentList={this.state.currentList}/>
                <Sidebar
                    heading='Your Lists'
                    currentList={this.state.currentList}
                    keyNamePairs={this.state.sessionData.keyNamePairs}
                    createNewListCallback={this.createNewList}
                    deleteListCallback={this.deleteList}
                    loadListCallback={this.loadList}
                    renameListCallback={this.renameList}
                />
                <Workspace
                    currentList={this.state.currentList} 
                    renameItemCallback={this.addRenameTransaction}
                    moveItemCallback={this.addMoveTransaction}
                />
                <Statusbar 
                    currentList={this.state.currentList} />
                <DeleteModal
                    listKeyPair={this.state.keyNamePair}
                    hideDeleteListModalCallback={this.hideDeleteListModal}
                    confirmDeleteCallback={this.removeList}
                />
            </div>
        );
    }
}

export default App;
