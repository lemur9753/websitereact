import axios from 'axios';
import React from 'react';
import { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Comments from './comments.js';
import './content.css';
import 'suneditor/src/assets/css/suneditor-contents.css';

const contentpath = 'https://juliusannafelix.ddns.net/getcontent.php';

class Content extends Component {
	constructor(props) {
		super(props);
		this.state = {
			author: '',
			header: '',
			content: '',
			date: '',
			error: '',
		};
	}

	componentDidMount() {
		let contentnumber = this.props.match.params.contentid;
		var formdata = new FormData();
		formdata.append('contentid', contentnumber);
		axios({
			method: 'POST',
			url: `${contentpath}`,
			headers: { 'content-type': 'multipart/form-data' },
			data: formdata,
		})
			.then((response) => {
				var date = new Date(Date.parse(response.data[0].date.replace(/-/g, '/')));
				this.setState({
					author: String(response.data[0].username).toString(),
					header: String(response.data[0].header).toString(),
					content: String(response.data[0].content).toString(),
					date: `${date.getUTCDate()}.${date.getUTCMonth() + 1}.${date.getFullYear()}`,
				});
			})
			.catch((error) =>
				this.setState({ error: error.message + '. Die gesuchte Seite existiert vermutlich nicht.' })
			);
	}
	render() {
		if (this.state?.error?.length > 0) {
			return <p>{this.state.error}</p>;
		}
		if (this.state?.content?.length === 0) {
			return <div class='loader' />;
		}
		return (
			<>
				<div id='contentcontainer'>
					<div id='header'>{this.state.header}</div>
					<hr />
					<div id='metadata'>
						<p>Geschrieben von: {this.state.author}</p>
						<p>Zuletzt verändert am: {this.state.date}</p>
					</div>
					<hr />
					<div
						id='content'
						className='sun-editor-editable'
						dangerouslySetInnerHTML={{ __html: this.state.content }}
					></div>
				</div>
				<Comments blogid={this.props.match.params.contentid} user={this.props.username} />
			</>
		);
	}
}

export default withRouter(Content);
