import {Button, TextField, Checkbox } from '@material-ui/core';
import { Pagination } from '@material-ui/lab';
import axios from 'axios';
import React from 'react';
import { Component } from 'react';
import './trinkspiel.css'
const trinkspielmitidpath = 'https://juliusannafelix.ddns.net/gettrinkspielmitid.php';
const deletetrinkspielpath = 'https://juliusannafelix.ddns.net/gettrinkspielmitid.php';
const edittrinkspielpath = 'https://juliusannafelix.ddns.net/edittrinkspiel.php';
const trinkspielamountpath = 'https://juliusannafelix.ddns.net/gettrinkspielamount.php';
const anzahlregeln = 20;

class Aufgabeeditable{
    constructor(aufgabe, usersneeded, isRegel, index){
        this.aufgabentext = aufgabe;
        this.usersneeded = usersneeded;
        if(isRegel === "1"){
            this.regel = true;
        }
        else{
            this.regel= false;
        }
        this.id = index;
    }
}

class Trinkspieledit extends Component {

    constructor(props) {
		super(props)
		this.state = {
			aufgaben:[],
            error:'',
            editedtext: '',
            editableid: 5000,
            trinkspieluser: 0,
            trinkspielusermitnummer: 0,
            maxaufgaben: 0,
            page:0,
        }
	}

    componentDidMount() {
        this.gettrinkspiel();
        this.getTrinkspielAmount();
    }

    componentDidUpdate(prevProps, prevState){
        if(prevState.page!==this.state.page){
            this.gettrinkspiel();
        }
    }

    componentWillUnmount(){
        this.handleTrinkspielEdit();
        axios.Cancel();
    }

    getTrinkspielAmount(){
		axios({
			method: 'GET',
			url: `${trinkspielamountpath}`,
			headers: { 'content-type': 'multipart/form-data' },
		})
		.then(response => {
			this.setState({
				maxaufgaben : response.data,
			})
		})
		.catch(error => this.setState({ error: error.message }));
	}

    gettrinkspiel(){
        let contentdata = new FormData();
        contentdata.append('offset',(this.state.page*anzahlregeln));
        contentdata.append('anzahl',anzahlregeln);
        axios({
			method: 'POST',
			url: `${trinkspielmitidpath}`,
			headers: { 'content-type': 'multipart/form-data' },
            data: contentdata,
		  })
			.then(response => {
                let newaufgabenarray= [];
                for(var i = 0; i < response.data.length-1; i++) {
                    let obj = response.data[i];
                    if(obj.content!==null || obj.content!==undefined){
                        let newaufgabe= new Aufgabeeditable(obj.content,obj.usernumber, obj.istregel, obj.id)
                        newaufgabenarray.push(newaufgabe);                   
                    }
                }
                this.setState({
                    aufgaben: newaufgabenarray
                })
			})
			.catch(error => this.setState({ error: error.message }));
    }


    makeEditAvailable = (text,id) =>{
        if(id!==this.state.editableid&&this.state.editableid!==5000){
            this.handleTrinkspielEdit();
        }
        this.setState({
            editedtext: text,
            editableid: id
        })
    }

    changeTextHelper = (content) =>{
		let trinkspielusermitnummer = new Set(content.target.value.match(/\$user[0-9]/gi)).size;
		let trinkspieluser = trinkspielusermitnummer + (content.target.value.match(/\$user\s/gi) || []).length;
		let aufgabentext = content.target.value;
		this.setState({
			editedtext: aufgabentext,
			trinkspieluser:	trinkspieluser,
			trinkspielusermitnummer: trinkspielusermitnummer,
		});
	}

    getUserErsetztAufgabe(){
		let aufgabentext = this.state.editedtext;
		for(var i=this.state.trinkspielusermitnummer+1; i<=10;i++){
			var re = new RegExp(`\\$user${i}`, "gi");
			if(new Set(aufgabentext.match(re)).size>0){
				alert('Bitte achte darauf, dass du nicht eine Usernummer überspringst. Schreibe deine Aufgabe bitte noch einmal komplett neu.')
				return null;
			}
			aufgabentext = aufgabentext.replace(/\$user(\s|$)/i,`$user${i} `);
		}
		return aufgabentext;
	}

    handleTrinkspielEdit = () => {
        var contentdata = new FormData();
        if(this.state.editedtext.length===0){
            contentdata.append('id',this.state.editableid)
            axios({
                method: 'POST',
                url: `${deletetrinkspielpath}`,
                headers: { 'content-type': 'multipart/form-data' },
                data: contentdata
            })
            .then(response => {
                if(response.data>0){
                    alert('Aufgabe konnte erfolgreich gelöscht werden')
                }
                else{
                    alert('Aufgabe konnte nicht gelöscht werden')
                }
            })
            .catch(error => this.setState({ error: error.message }));
        }
        else{
            if(this.getUserErsetztAufgabe()!==null){
                contentdata.append('id', this.state.editableid)
                contentdata.append('trinkspielaufgabe', this.getUserErsetztAufgabe());
                contentdata.append('trinkspieluser', this.state.trinkspieluser);
                console.log(contentdata)
                console.log(this.getUserErsetztAufgabe())
                    axios({
                        method: 'POST',
                        url: `${edittrinkspielpath}`,
                        headers: { 'content-type': 'multipart/form-data' },
                        data: contentdata
                    })
                        .then(response => {
                            console.log(response)
                        if(response.data>0){
                            alert('Content konnte hochgeladen werden')
                        }
                        else{
                            alert('Content konnte nicht hochgeladen werden')
                        }
                        })
                        .catch(error => this.setState({ error: error.message }));
                    }
            else{
                alert('Bitte Schreib die Aufgabe neu.')
            }
        }
	}

    handlePageNumberChange = (e, value) =>{
        this.setState({
            page: value-1,
        })
    }

    getRegelEdit = () =>{
        return(
        this.state.aufgaben.map((aufgabe,i) =>
            <div style={{display:'flex'}}>
                <TextField
                    onChange={this.changeTextHelper} 
                    defaultValue={`${aufgabe.aufgabentext}`}
                    key={aufgabe.id}
                    multiline
                    fullWidth
                    disabled={!(aufgabe.id===this.state.editableid)}
                    variant="outlined"
                />
                <Checkbox
                    checked={aufgabe.regel}	
                />
                <Button onClick={() => this.makeEditAvailable(aufgabe.aufgabentext,aufgabe.id)}>
                    Edit
                </Button>
            </div>
            )
        )
    }

    render(){
        return(
            <>
                <h4> Bereits geschriebene Regeln: </h4>
                <h5> 
                    Es kann nicht verändert werden, ob eine Aufgabe eine Regel ist oder nicht.
                    <br/>
                    Klickt man auf Edit eines andseren Feldes, wird der Content automatisch hochgeladen.
                    <br/>
                    Ist der komplette Text gelöscht, wird die Aufgabe vom Server gelöscht.
                </h5>
                <Pagination
						page={this.state.page+1}
						onChange={this.handlePageNumberChange}
						count={Math.ceil(this.state.maxaufgaben/anzahlregeln)} 
						defaultPage={1} 
						siblingCount={2} 
				/>
            {this.getRegelEdit()}
            </>
        )
    }
}
export default Trinkspieledit;