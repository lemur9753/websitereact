import {TextField } from '@material-ui/core';
import axios from 'axios';
import React from 'react';
import { Component } from 'react';
import './trinkspiel.css'
const trinkspielpath = 'https://juliusannafelix.ddns.net/trinkspiel.php';


class Aufgabe{
    constructor(aufgabe, usersneeded, isRegel){
        this.aufgabentext = aufgabe;
        this.usersneeded = usersneeded;
        if(isRegel === "1"){
            this.regel = 'ja';
        }
        else{
            this.regel='nein';
        }
    }
}

class Viewtrinkspiel extends Component {

    constructor(props) {
		super(props)
		this.state = {
			aufgaben:[],
            error:'',
        }
	}

    componentDidMount() {
        this.gettrinkspiel();
    }




    componentWillUnmount(){
        axios.Cancel();
    }

    gettrinkspiel(){
        axios({
			method: 'GET',
			url: `${trinkspielpath}`,
			headers: { 'content-type': 'multipart/form-data' },
		  })
			.then(response => {
                let newaufgabenarray= [];
                for(var i = 0; i < response.data.length-1; i++) {
                    let obj = response.data[i];
                    if(obj.content!==null || obj.content!==undefined){
                        let newaufgabe= new Aufgabe(obj.content,obj.usernumber, obj.istregel)
                        newaufgabenarray.push(newaufgabe);                       
                    }
                }
                this.setState({
                    aufgaben: newaufgabenarray
                })
                console.log('download erfolgreich')
			})
			.catch(error => this.setState({ error: error.message }));
    }

    render(){
        return(
            <>
                <h5> Bereits geschriebene Regeln: </h5>
            {
                this.state.aufgaben.map((aufgabe,i) => 
                    <div style={{display:'flex'}}>
                        <TextField 
                            value={`${i}: ${aufgabe.aufgabentext}`}
                            key={i}
                            multiline
                            fullWidth
                            readOnly
                            variant="outlined"
                        />
                    </div>

                )
            }
            </>
        )
    }
}
export default Viewtrinkspiel;