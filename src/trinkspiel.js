import axios from 'axios';
import React from 'react';
import { Component } from 'react';
import {IconButton, Button, Dialog,DialogTitle, DialogContent, FormControl, FilledInput, InputAdornment} from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faMinus, faPlus, faTasks, faTimes, faUserMinus, faUserPlus} from '@fortawesome/free-solid-svg-icons'
import './trinkspiel.css'
const trinkspielpath = 'https://juliusannafelix.ddns.net/trinkspiel.php';
const trinkspielamountpath = 'https://juliusannafelix.ddns.net/gettrinkspielamount.php';
const minregeldauer = 8;
const maxregeldauer = 20;

const trinksprucharray =[
    'Zur Mitte, Zur Titte, zum Sack, Zack Zack!',
    'Wer Liebe mag und Einigkeit, der trinkt auch mal ne Kleinigkeit.',
    'Und Gott sprach: Der Klügere kippt nach',
    'Benediktum, Benedaktum, woanders laufen sie nackt rum. Lassen wir sie laufen. Wir saufen.',
    'Zwischen Leber und Milz passt noch immer ein Pils',
    'Allah ist groß, Allah ist mächtig, hat nen Bauchumfang von 3 Meter Sechzig. Wenn er uns alles wegtrinkt sind wir arm dran, deswegen ALLE MANN RAN !',
    'Trinkfest und arbeitsscheu, aber der Kirche treu',
    'Der kluge Mensch, glaubt es mir, der redet nicht und trinkt sein Bier.',
    'Oh Alkohol, oh Alkohol, dass Du mein Feind bist weiß ich wohl, doch in der Bibel steht geschrieben, du solltest Deine Feinde Lieben. Also Prost!',
]

class Aufgabe{
    constructor(aufgabe, usersneeded, isRegel){
        this.aufgabentext = aufgabe;
        this.usersneeded = usersneeded;
        if(isRegel === "1"){
            this.regel = new Regel(aufgabe);
        }
    }
}

class Regel{
    constructor(regel){
        this.regel = regel;
        this.regelrunden= this.getRandomInt(minregeldauer,maxregeldauer);
    }

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
    }
}

class Trinkspiel extends Component {

    constructor(props) {
		super(props)
		this.state = {
			aufgaben:[],
            error:'',
            jetzigeaufgabenid:0,
            jetzigeaufgabe:'',
            players:['','', '',''],
            maxaufgaben: 0,
            playerAddModalOpen: false,
            regelspeicher:[],
            regelAufhebeModaltext:'',
            regelAufhebeModalOpen: false,
            bestehendeRegelnModalOpen: false,
            getBestehendeRegelnPossible: false,
        }
	}

    componentDidMount() {
        if(!this.props.navexpanded){
            const trinkspielstate = localStorage.getItem('trinkspielstate')
            if(trinkspielstate==null){
                this.initializeGame();
            }
            else{
                let wantToRehydrate = window.confirm('Willst du den letzten Spielstand nutzen?')
                if(wantToRehydrate){
                    this.rehydrate();
                }
                else{
                    localStorage.removeItem('trinkspielstate');
                    this.initializeGame();
                }
            }
        }
    }

    rehydrate(){
        const trinkspielstate = JSON.parse(localStorage.getItem('trinkspielstate'));
        this.setState({
            aufgaben: trinkspielstate.aufgaben,
            jetzigeaufgabenid:trinkspielstate.jetzigeaufgabenid,
            jetzigeaufgabe:trinkspielstate.jetzigeaufgaben,
            players:trinkspielstate.players,
            maxaufgaben:trinkspielstate.maxaufgaben,
            regelspeicher:trinkspielstate.regelspeicher,
        })
    }

    initializeGame(){
        this.gettrinkspiel();
        this.getTrinkspielAmount();
        this.handleStartAufgabe();
        this.setState({
            playerAddModalOpen: true
        })
        
    }

    componentDidUpdate(prevProps, prevState){
        if ( prevState.jetzigeaufgabenid!==this.state.jetzigeaufgabenid){
            this.handleAufgabe();
        }
        if(prevState.regelspeicher!==this.state.regelspeicher){
            let regelspeicherpossible = this.state.regelspeicher.length>0;
            this.setState({
                getBestehendeRegelnPossible: regelspeicherpossible,
            })
        }
    }
    componentWillUnmount(){
            let trinkspielstate = this.state;
            if(trinkspielstate.players.length!==0&&trinkspielstate.jetzigeaufgabenid!==0){
                localStorage.setItem('trinkspielstate',JSON.stringify(trinkspielstate));
            }
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

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
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
                        this.setState(previousState =>({  
                                maxaufgaben: previousState.maxaufgaben + 1,
                            }));
                        
                    }
                }
                this.setState({
                    aufgaben: newaufgabenarray
                })
			})
            .then(()=>this.randomizeAufgaben())
			.catch(error => this.setState({ error: error.message }));
    }

    randomizeAufgaben(){
        let randomAufgabenArray = this.shuffleArray(this.state.aufgaben);
        this.setState({
            aufgaben : randomAufgabenArray,
        })
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    handleStartAufgabe(){
        let starttrinksprüche = this.shuffleArray(trinksprucharray)
        this.setState({
            jetzigeaufgabe: `Trinkspruch zu Beginn:\n${starttrinksprüche[0]}`,
        })
    }

    handleAufgabe(){
        let randomplayers = this.shuffleArray(this.state.players);
        let aufgabe = this.state.aufgaben[this.state.jetzigeaufgabenid];
        let aufgabentext = "Aufgabe nicht vorhanden";
        let regelarray = this.regelArrayHelperFunc();
        console.log(aufgabe)
        if(aufgabe!==undefined||aufgabe.aufgabentext !== undefined){
            aufgabentext = aufgabe.aufgabentext;
        }
        if(aufgabe.regel!==undefined&&aufgabe.regel.regelrunden>0&&this.checkIfRegelCanBePutInState(aufgabe)){
            randomplayers.forEach((player, index) =>{
                let re = new RegExp(`\\$user${index+1}`, "gi")
                aufgabe.regel.regel = aufgabe.regel.regel.replace(re, `${player}`)
            }
            )
            regelarray.push(aufgabe.regel);
        }
        randomplayers.forEach((player,i) =>{
                let re = new RegExp(`\\$user${i+1}`, "gi")
                aufgabentext = aufgabentext.replace(re, `${player}`)
        }
        )
        this.setState({
            jetzigeaufgabe: aufgabentext,
            regelspeicher: regelarray,
        });
    }

    checkIfRegelCanBePutInState(neueregel){
        if(this.state.regelspeicher.length===0){
            return true
        }
        let neueregelstring = JSON.stringify(neueregel.regel)
        let regelarray = this.state.regelspeicher;
        for (let index = 0; index < regelarray.length; index++) {
            const element = JSON.stringify(regelarray[index].regel);
            if(element===neueregelstring){
                return false;
            }
        }
        return true;
    }

    regelArrayHelperFunc(){
        let regelarray= this.state.regelspeicher;
        regelarray.sort(this.compareHelperFunc);
        let aufgehobeneRegel;
        if(regelarray[0]===undefined){
            return [];
        }
        for(let i=0; i<regelarray.length; i++){
            if(regelarray[0].regelrunden<=0){
                if(i>0){
                    regelarray[0].regeldauer= this.getRandomInt(2,5);
                }
                else{
                    aufgehobeneRegel = regelarray.shift();
                }
            }
            else{
                break;
            }
        }
        for(let i=0; i<regelarray.length; i++){
            regelarray[i].regelrunden =  regelarray[i].regelrunden-1;
        }
        if(aufgehobeneRegel!==undefined){
            this.setState({
                regelAufhebeModaltext: aufgehobeneRegel.regel,
                regelAufhebeModalOpen:  true,
            })
        }
        return regelarray;
    }

    compareHelperFunc( a, b ) {
        if ( a.regelrunden < b.regelrunden ){
          return -1;
        }
        if ( a.regelrunden > b.regelrunden ){
          return 1;
        }
        return 0;
    }
      
    handleBackClick(i = 1){
        if(this.state.aufgaben[this.state.jetzigeaufgabenid-i]===undefined)
        {
            return null;
        }
        if(this.state.aufgaben[this.state.jetzigeaufgabenid-i].usersneeded>this.state.players.length)
        {
            if(this.handleBackClick(i+1)===null){
                return
            }
            this.handleBackClick(i+1); 
        }
        this.setState(previousState =>({
            jetzigeaufgabenid: previousState.jetzigeaufgabenid-i,
        }))
    }

    handleForwardClick(i=1){
        if(this.state.aufgaben[this.state.jetzigeaufgabenid+i]===undefined)
        {
            return null;
        }
        if(this.state.aufgaben[this.state.jetzigeaufgabenid+i].usersneeded>this.state.players.length)
        {
            if(this.handleForwardClick(i+1)===null){
                return
            }
            this.handleForwardClick(i+1); 
        }
        this.setState(previousState =>({
            jetzigeaufgabenid: previousState.jetzigeaufgabenid+i,
        }))
    }

    handlePlayerClickOpen(){
        this.setState({
            playerAddModalOpen: true,
        })
    }

    handlePlayerClickClose(){
        let cleanedPlayerArray = this.state.players.filter(function(e){return e});
        this.setState({
            playerAddModalOpen: false,
            players: cleanedPlayerArray
        })
    }

    handlePlayerChange = (e) => {
        let newplayerarray = this.state.players;
        newplayerarray[parseInt(e.target.id)]= e.target.value;
        this.setState({
            players: newplayerarray,
        })
    }

    addPlayerButton(){
        let playerarrayplusone = this.state.players;
        playerarrayplusone.push('');
        this.setState({
            players: playerarrayplusone,
        })
    }

    handleDeletePlayerClick(i){
        let playerarrayminusone = this.state.players;
        playerarrayminusone.splice(i,1);
        this.setState({
            player: playerarrayminusone,
        })
    }

    getPlayerControl(){
        return(
        <div>
            <Button
                variant="contained"
                color="primary"
                startIcon={<FontAwesomeIcon icon={faUserPlus} size="sm"/>}
                endIcon={<FontAwesomeIcon icon={faUserMinus} size="sm"/>}
                onClick={() => this.handlePlayerClickOpen()}
            >
            /
            </Button>
            <Dialog open={this.state.playerAddModalOpen} onClose={() => this.handlePlayerClickClose()}>
                <Button
                    color="primary"
                    startIcon={<FontAwesomeIcon icon={faTimes} size="xs"/>}
                    onClick={() => this.handlePlayerClickClose()}
                    style={{marginLeft:'-10px',marginBottom:'-20px', alignSelf:'flex-start'}}
                />
                <DialogTitle>
                    Füge Spieler hinzu:
                </DialogTitle>
                <DialogContent>
                    {this.state.players.map((player, i) =>
                        <>
                        <FormControl key={i+300} style={{width:'100%'}}>
                            <FilledInput
                            key={i}
                            autoFocus
                            margin="dense"
                            id={`${i}`}
                            label={`Player ${i+1}`}
                            value={player}
                            onChange={this.handlePlayerChange}
                            fullWidth
                            endAdornment={
                                <InputAdornment key={i+100} position="end">
                                    <IconButton key={i+200}
                                    onClick={() => this.handleDeletePlayerClick(i)}
                                    edge="end"
                                    >
                                    <FontAwesomeIcon key={i+400} icon={faMinus} size="xs"/>
                                    </IconButton>
                                </InputAdornment>
                            }
                            /> 
                        </FormControl>
                        <br/>
                        </>
                    )}
                    <br/>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<FontAwesomeIcon icon={faPlus} size="sm"/>}
                        onClick={() => this.addPlayerButton()}
                        style={{width:'45%', marginRight:'5%'}}
                    >
                        Spieler
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => this.handlePlayerClickClose()}
                        style={{width:'45%', marginLeft:'5%'}}
                    >
                        OK
                    </Button>
                </DialogContent>
            </Dialog>
            </div>
        )
    }

    handleRegelAufgehobenClose(){
        this.setState({
            regelAufhebeModalOpen:false,
        })
    }

    getRegelAufgehoben(){
        return(
            <div>
                <Dialog open={this.state.regelAufhebeModalOpen} onClose={() => this.handleRegelAufgehobenClose()}>
                    <DialogTitle>
                        Folgende Regel wurde aufgehoben:
                    </DialogTitle>
                    <DialogContent>
                        <div style={{width:'100%', textAlign:'center'}}>
                            <h4>
                                {this.state.regelAufhebeModaltext}
                            </h4>
                        </div>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => this.handleRegelAufgehobenClose()}
                            style={{width:'100%'}}
                        >
                            OK
                        </Button>
                    </DialogContent>
                </Dialog>
            </div>
        )
    }

    handleBestehendeRegelnClickOpen(){
        this.setState({
            bestehendeRegelnModalOpen:true,
        })
    }

    handleBestehendeRegelnClickClose(){
        this.setState({
            bestehendeRegelnModalOpen: false,
        })
    }

    getBestehendeRegeln(){
        return(
            <div>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<FontAwesomeIcon icon={faTasks} size="sm"/>}
                    onClick={() => this.handleBestehendeRegelnClickOpen()}
                    disabled={!this.state.getBestehendeRegelnPossible}
                >
                /
                </Button>
                <Dialog 
                    open={this.state.bestehendeRegelnModalOpen} 
                    onClose={() => this.handleBestehendeRegelnClickClose()}
                    maxWidth={'sm'}
                    fullWidth
                >
                    <DialogTitle>
                        Bestehende Regeln:
                    </DialogTitle>
                    <DialogContent>
                        {this.state.regelspeicher.map((regel, i) =>
                            <>
                            <FormControl key ={i+100} style={{width:'100%'}}>
                                <FilledInput
                                key={i}
                                autoFocus
                                margin="dense"
                                id={`${i}`}
                                label={`Regel ${i+1}`}
                                defaultValue={regel.regel}
                                readOnly
                                multiline
                                fullWidth
                                startAdornment={`${i+1}.`}
                                /> 
                            </FormControl>
                            <br/>
                            </>
                        )}
                        <br/>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => this.handleBestehendeRegelnClickClose()}
                            style={{width:'100%'}}
                        >
                            OK
                        </Button>
                    </DialogContent>
                </Dialog>
                </div>
            ) 
    }

    render() {
            if(this.state.aufgaben.length>0){
                return(
                    <>
                    <div className="topcontainer">
                        {this.getRegelAufgehoben()}
                        <div className="addplayerbutton">
                            {this.getPlayerControl()}
                        </div>
                        <div className="addplayerbutton">
                            {this.getBestehendeRegeln()}
                        </div>
                        <div className="drinkingcontainer">
                            <div className="backbutton">
                                <IconButton onClick={() => this.handleBackClick()} color="primary">
                                    <FontAwesomeIcon icon={faChevronLeft} size="2x"/>
                                </IconButton>
                            </div>
                            <div className="aufgabe" style={{whiteSpace: 'pre-line'}}>
                                <h1>
                                    {this.state.jetzigeaufgabe}
                                </h1>
                            </div>
                            <div className="forwardbutton">
                                <IconButton onClick={() => this.handleForwardClick()} color="primary">
                                    <FontAwesomeIcon icon={ faChevronRight} size="2x"/>
                                </IconButton>
                            </div>
                        </div>
                    </div>
                    </>
                )
            }
            else{
                return (
                    <>
                        <div id="bilderladen">
                        <p>Das Trinkspiel wird geladen:</p>
                        </div>
                         <div className="loader"></div>
                    </>)
            }
    }

}
export default Trinkspiel;