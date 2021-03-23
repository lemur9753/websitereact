
import axios from 'axios';
import React from 'react';
import { Component } from 'react';
import Cards from './Cards';
import {Grid, Select, MenuItem} from '@material-ui/core';
import { Pagination } from '@material-ui/lab';
import {withRouter} from "react-router-dom";

const initialcardnumbers= 6;
const initialpagenumber = 1;
const downloadpath = 'https://juliusannafelix.ddns.net/downloadblog.php';
const blogentryamountpath = 'https://juliusannafelix.ddns.net/getcontentamount.php'

class Downloadblog extends Component {

	constructor(props) {
		super(props)
		this.state = {
			contentid:[],
			authors:[],
			headers:[],
			pictures:[],
			abstracts:[],
			contents:[],
			dates:[],
			error:'',
			index:0,
			cardnumbers: 0,
			pagenumber: 0,
			blogentryamount: 2,
			items:[],
		}
	}

	componentDidMount(){
		this.getContentAmount();
		this.handleInitialParams();
	}

	componentDidUpdate(prevProps, prevState){
		if(prevState.cardnumbers!==this.state.cardnumbers||prevState.pagenumber!==this.state.pagenumber){
			this.updateUrl();
			this.handleCards();
		}
	}

	componentWillUnmount(){
		axios.Cancel();
	}

	handleInitialParams(){
		var parsedcardnumber = parseInt(this.props.match.params.cardnumber);
		var parsedpagenumber = parseInt(this.props.match.params.pagenumber);

		switch(true){
			case (parsedcardnumber>=24):
				parsedcardnumber = 24;
				break;
			case (parsedcardnumber>=12):
				parsedcardnumber = 12;
				break;
			case (parsedcardnumber>=6):
				parsedcardnumber = 6;
				break;
			case (parsedcardnumber>=1):
				parsedcardnumber = 1;
				break;
			default:
				parsedcardnumber = initialcardnumbers;
		}

		switch(true){
			case(parsedpagenumber===0||!parsedpagenumber):			
				parsedpagenumber = initialpagenumber;
				break;
			case (parsedpagenumber>=this.checkHighestPageNumber(parsedcardnumber)):
				parsedpagenumber = this.checkHighestPageNumber(parsedcardnumber);
				break;
			case (parsedpagenumber>=1):
				parsedpagenumber = this.checkPageNumber(parsedcardnumber, parsedpagenumber);
				break;
			default:
				parsedpagenumber = initialpagenumber;
		}

		this.setState({
			cardnumbers: parsedcardnumber,
			pagenumber: parsedpagenumber,
		})
	}

	checkPageNumber(cardnumbers, newpagenumber = 0){
		if(newpagenumber===0){
			newpagenumber = this.state.pagenumber;
		}
		while((cardnumbers*newpagenumber-cardnumbers)>this.state.blogentryamount){
			newpagenumber= newpagenumber - 1;
		}
		return newpagenumber;
	}

	checkHighestPageNumber(optionalcardnumber){
		return (Math.ceil(this.state.blogentryamount/(optionalcardnumber || this.state.cardnumbers)))
	}
	updateUrl(){
		this.props.history.push(`/home/cardnumber/${this.state.cardnumbers}/pagenumber/${this.state.pagenumber}`);
	}

	handleCardNumberChange = (e) => {
		var updatedpagenumber = this.checkPageNumber(e.target.value);
		this.setState({
			cardnumbers: e.target.value,
			pagenumber: updatedpagenumber,
		})
	}

	handlePageNumberChange = (e, value) => {
		var newpagenumber;
		var highestpagenumber = this.checkHighestPageNumber()
		console.log(highestpagenumber)
		if(highestpagenumber>=value){
			newpagenumber = value
		}
		else{
			newpagenumber = highestpagenumber
		}

		this.setState({
			pagenumber: newpagenumber,
		})
	}

	resetContentState() {
		this.setState({
			contentid:[],
			authors:[],
			headers:[],
			pictures:[],
			abstracts:[],
			contents:[],
			dates:[],
			index: 0,
			items:[],
		});
	}

	getContentAmount(){
		axios({
			method: 'GET',
			url: `${blogentryamountpath}`,
			headers: { 'content-type': 'multipart/form-data' },
		})
		.then(response => {
			this.setState({
				blogentryamount : response.data,
			})
		})
		.catch(error => this.setState({ error: error.message }));
	}

	handleCards() {
		this.resetContentState();
		var downloadspec = new FormData();
		downloadspec.append('anzahl', this.state.cardnumbers);
		downloadspec.append('offset', (this.state.pagenumber-1)*this.state.cardnumbers);
		axios({
			method: 'POST',
			url: `${downloadpath}`,
			headers: { 'content-type': 'multipart/form-data' },
			data: downloadspec
		})
		.then(response => {
			let obj;
			let date;
			for(var i = 0; i < response.data.length-1; i++) {
				obj = response.data[i];
				date = new Date(Date.parse(obj.date));
				// eslint-disable-next-line
				this.setState(previousState => ({
					contentid: [...previousState.contentid, obj.id],
					authors: [...previousState.authors, obj.username],
					headers: [...previousState.headers, obj.header],
					pictures: [...previousState.pictures, obj.picture],
					abstracts: [...previousState.abstracts, obj.abstract],
					contents: [...previousState.contents, obj.content],
					dates: [...previousState.dates, `${date.getUTCDate()}.${date.getUTCMonth()}.${date.getFullYear()}`],
					index: this.state.index+1
				}))
			}
			let cards = []
			for(let i=0; i < this.state.index ;i++) {
				if(this.state.authors[i].length>0&&this.state.headers[i].length>0&&this.state.abstracts[i].length>0&&this.state.pictures[i].length>0) {				   
				cards.push(
					<Cards 
						key={i}
						authors={this.state.authors[i]} 
						headers={this.state.headers[i]} 
						abstracts={this.state.abstracts[i]} 
						pictures = {this.state.pictures[i]} 
						dates = {this.state.dates[i]}
						contentid = {this.state.contentid[i]}
					/>
				)
				}
			}
			this.setState({
				items: cards,
			})
		})
		.catch(error => this.setState({ error: error.message }));
		
	}

	getPagination(){
		if(this.state.cardnumbers<=this.state.blogentryamount)
		{
			return (
				<>
					<pre>   Seite:  </pre>
					<Pagination
						page={this.state.pagenumber}
						onChange={this.handlePageNumberChange}
						count={this.state.blogentryamount/this.state.cardnumbers} 
						defaultPage={1} 
						siblingCount={1} 
					/>
				</>
			)
		}
		return (<></>)
	}

	render() {

		let contentselector;
		contentselector = 	<>
							<pre>Wie viele Einträge sollen maximal angezeigt werden?  </pre>
							<Select
								labelId="Cardnumber-select-label"
								id="Cardnumber-simple-select"
								value={this.state.cardnumbers}
								onChange={this.handleCardNumberChange}
							>
								<MenuItem value={1}>1</MenuItem>
								<MenuItem value={6}>6</MenuItem>
								<MenuItem value={12}>12</MenuItem>
								<MenuItem value={24}>24</MenuItem>
							</Select>
							</>;

		if(this.state.authors.length>0&&this.state.headers.length>0&&this.state.abstracts.length>0&&this.state.contents.length>0) {
			return (
				<>
				<div style={{maxheight:'100px'}}>
					<div style={{display: 'flex'}}>
					{contentselector}{this.getPagination()}
					</div>
					<div style={{margin: 20,}}>
						<Grid container spacing={10} style = {{padding: 5, marginTop:0}} justify="space-evenly" overflow="hidden">
							{this.state.items}
						</Grid>
					</div>
				</div>
				</>
			)
		}
        else{
            return(
				<>
				{contentselector}
				<div className="loader"/>
				</>
			)
        }
	}
}
export default withRouter(Downloadblog);