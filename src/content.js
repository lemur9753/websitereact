import axios from 'axios';
import React from 'react';
import { Component } from 'react';
import {withRouter} from 'react-router-dom';
import './content.css';
import 'suneditor/src/assets/css/suneditor-contents.css'

const contentpath = 'https://juliusannafelix.ddns.net/getcontent.php';


class Content extends Component {

    constructor(props) {
		super(props)
		this.state = {
			author:'',
			header:'',
			content:'',
			date:'',
			error:'',
		}
	}


	componentDidMount(){
        console.log(window.location.pathname)
        var formdata = new FormData();
        formdata.append('contentid', this.props.match.params.contentid);
		axios({
			method: 'POST',
			url: `${contentpath}`,
			headers: { 'content-type': 'multipart/form-data' },
            data: formdata
		})
			.then(response => {
                    var date = new Date(Date.parse(response.data[0].date));
					this.setState({
						author: String(response.data[0].username).toString(),
						header: String(response.data[0].header).toString(),
						content: String(response.data[0].content).toString(),
						date: `${date.getUTCDate()}.${date.getUTCMonth()}.${date.getFullYear()}`,
					})
                
			})
			.catch(error => this.setState({ error:error.message +". Die gesuchte Seite existiert vermutlich nicht." }));
		
		
	}
    render(){
        if(this.state?.error?.length>0) {
            return (
                <p>
                    {this.state.error}
                </p>
            )
		}
        if(this.state?.content?.length===0) {
            return <div class="loader"/>
		}
        return (
            <div id="contentcontainer">
                <div id="header">
                    {this.state.header}
                </div>
                <hr/>
                <div id="metadata">
                    <pre>Geschrieben von: {this.state.author}     Zuletzt verändert am: {this.state.date}</pre>
                </div>
                <hr/>
                <div id="content" className="sun-editor-editable" dangerouslySetInnerHTML={{ __html: this.state.content}}>
                    
                </div>
            </div>
        )
    }
}

export default withRouter(Content);