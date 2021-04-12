import axios from 'axios';
import React from 'react';
import { Component } from 'react';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css'; // Import Sun Editor's CSS File
import { Checkbox, TextField } from '@material-ui/core';
import Trinkspieledit from './trinkspieledit';
import Editblog from './editblog';

const uploadpath = 'https://juliusannafelix.ddns.net/uploadblog.php';
const uploadtrinkspielpath = 'https://juliusannafelix.ddns.net/uploadtrinkspiel.php';
const reader = new FileReader();
const headerLength = 45;
const abstractLength = 372;
const picturedataLength = 100000;

class Uploadblog extends Component {
	constructor(props) {
		super(props);
		this.state = {
			name: '',
			pw: '',
			header: '',
			picture: '',
			picturehelpertext: '',
			abstract: '',
			message: '',
			headerhelpertext: headerLength.toString(),
			headerLength: 0,
			headerinputerror: null,
			abstracthelpertext: abstractLength.toString(),
			abstractLength: 0,
			abstractinputerror: false,
			uploaderfolgreich: false,
			whattoupload: '',
			trinkspiel: '',
			trinkspieluser: 0,
			istregel: false,
		};
	}
	componentDidMount() {
		this.setState({
			name: this.props.username,
		});
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevProps?.username !== this.props?.username) {
			this.setState({
				name: this.props.username,
			});
			console.log(this.props.username);
		}
	}

	myEditorHandler = (content) => {
		this.setState({ message: content });
	};
	myPictureHandler = (content) => {
		if (content.target.files[0] !== undefined) {
			var image = new Image();
			image = content.target.files[0];
			image.width = '400px';
			reader.readAsDataURL(image);
			reader.onload = (event) => {
				if (event.target.result.length < picturedataLength) {
					this.setState({
						picture: event.target.result,
						picturehelpertext: '',
					});
				} else {
					this.setState({
						picture: '',
						picturehelpertext: 'Das hochgeladene Bild ist leider zu groß',
					});
				}
			};
		} else {
			this.setState({
				picture: '',
				picturehelpertext: '',
			});
		}
	};
	myHeaderHandler = (content) => {
		this.setState({
			header: content.target.value,
			headerLength: content.target.value.length,
		});
		if (content.target.value.length > headerLength) {
			this.setState({
				headerinputerror: true,
				headerhelpertext: 'Zu viele Zeichen',
			});
		} else {
			var num = headerLength - content.target.value.length;
			this.setState({
				headerinputerror: false,
				headerhelpertext: num.toString(),
			});
		}
	};

	myAbstractHandler = (content) => {
		this.setState({
			abstract: content.target.value,
			abstractLength: content.target.value.length,
		});
		if (content.target.value.length > abstractLength) {
			this.setState({
				abstractinputerror: true,
				abstracthelpertext: 'Zu viele Zeichen',
			});
		} else {
			var num = abstractLength - content.target.value.length;
			this.setState({
				abstractinputerror: false,
				abstracthelpertext: num.toString(),
			});
		}
	};

	myUsernameHandler = (event) => {
		this.setState({ name: event.target.value });
	};

	myPasswordHandler = (event) => {
		this.setState({ pw: event.target.value });
	};

	validateUploadData() {
		if (
			this.state.header.length === 0 ||
			this.state.picture.length === 0 ||
			this.state.abstract.length === 0 ||
			this.state.message.length === 0 ||
			this.state.name.length === 0
		) {
			return false;
		}

		if (
			this.state.header.length > headerLength ||
			this.state.picture.length > picturedataLength ||
			this.state.abstract.length > abstractLength
		) {
			return false;
		}

		return true;
	}

	handleUpload = (e) => {
		e.preventDefault();
		if (this.validateUploadData()) {
			var contentdata = new FormData();
			contentdata.append('name', this.state.name);
			contentdata.append('header', this.state.header.padEnd(headerLength - this.state.headerLength));
			contentdata.append('picture', this.state.picture);
			contentdata.append(
				'abstract',
				this.state.abstract.padEnd(abstractLength - this.state.abstractLength)
			);
			contentdata.append('content', this.state.message);
			axios({
				method: 'POST',
				url: `${uploadpath}`,
				headers: { 'content-type': 'multipart/form-data' },
				data: contentdata,
			})
				.then((response) => {
					if (response.data > 0) {
						this.setState({
							uploaderfolgreich: true,
						});
					} else {
						alert('Content konnte nicht hochgeladen werden');
					}
				})
				.catch((error) => this.setState({ error: error.message }));
		} else {
			alert('Bitte fülle alle Felder aus und achte auf die Maximale Größe');
		}
	};

	uploadMore = (e) => {
		e.preventDefault();
		this.setState({
			uploaderfolgreich: false,
			header: '',
			headerLength: 0,
			headerhelpertext: '100',
			message: '',
			picture: '',
			picturehelpertext: '372',
			abstract: '',
			abstractLength: 0,
			abstracthelpertext: '372',
			trinkspielaufgabe: '',
			trinkspieluser: 0,
			whattoupload: '',
		});
	};
	goto(location) {
		this.setState({
			whattoupload: location,
		});
	}

	myTrinkspielHandler = (content) => {
		let trinkspielusermitnummer = new Set(content.target.value.match(/\$user[0-9]/gi)).size;
		let trinkspieluser =
			trinkspielusermitnummer + (content.target.value.match(/\$user\s/gi) || []).length;
		let aufgabentext = content.target.value;
		this.setState({
			trinkspiel: aufgabentext,
			trinkspieluser: trinkspieluser,
			trinkspielusermitnummer: trinkspielusermitnummer,
		});
	};

	handleIstRegelChange() {
		let invertedstate = !this.state.istregel;
		this.setState({
			istregel: invertedstate,
		});
	}

	getUserErsetztAufgabe() {
		let aufgabentext = this.state.trinkspiel;
		for (var i = this.state.trinkspielusermitnummer + 1; i <= 10; i++) {
			var re = new RegExp(`\\$user${i}`, 'gi');
			if (new Set(aufgabentext.match(re)).size > 0) {
				alert(
					'Bitte achte darauf, dass du nicht eine Usernummer überspringst. Schreibe deine Aufgabe bitte noch einmal komplett neu.'
				);
				return null;
			}
			aufgabentext = aufgabentext.replace(/\$user(\s|$)/i, `$user${i} `);
		}
		return aufgabentext;
	}

	handleTrinkspielUpload = (e) => {
		e.preventDefault();
		if (this.state.trinkspiel.length > 0 && this.getUserErsetztAufgabe() !== null) {
			var contentdata = new FormData();
			contentdata.append('trinkspielaufgabe', this.getUserErsetztAufgabe());
			contentdata.append('trinkspieluser', this.state.trinkspieluser);
			contentdata.append('istregel', this.state.istregel);
			axios({
				method: 'POST',
				url: `${uploadtrinkspielpath}`,
				headers: { 'content-type': 'multipart/form-data' },
				data: contentdata,
			})
				.then((response) => {
					if (response.data > 0) {
						this.setState({
							uploaderfolgreich: true,
						});
					} else {
						alert('Content konnte nicht hochgeladen werden');
					}
				})
				.catch((error) => this.setState({ error: error.message }));
		} else {
			alert('Bitte fülle das Feld aus oder schreib die Aufgabe neu.');
		}
		this.setState({
			trinkspieluser: 0,
			trinkspielaufgabe: '',
			trinkspielusermitnummer: 0,
			istregel: false,
		});
	};

	render() {
		if (this.state.whattoupload === 'editblog') {
			if (this.state.uploaderfolgreich) {
				return (
					<>
						<p>Dein Upload war erfolgreich</p>
						<button onClick={this.uploadMore}> Noch mehr hochladen </button>
					</>
				);
			} else {
				return <Editblog username={this.state.name} />;
			}
		}
		if (this.state.whattoupload === 'blogcontent') {
			if (this.state.uploaderfolgreich) {
				return (
					<>
						<p>Dein Upload war erfolgreich</p>
						<button onClick={this.uploadMore}> Noch mehr hochladen </button>
					</>
				);
			} else {
				return (
					<>
						<button onClick={this.uploadMore}> Zurück </button>
						<p>Header:</p>
						<TextField
							onChange={this.myHeaderHandler}
							fullWidth={true}
							multiline={true}
							variant='outlined'
							helperText={this.state.headerhelpertext}
							error={this.state.headerinputerror}
						/>
						<br />
						<p>Abstract:</p>
						<TextField
							onChange={this.myAbstractHandler}
							fullWidth={true}
							multiline={true}
							variant='outlined'
							helperText={this.state.abstracthelpertext}
							error={this.state.abstractinputerror}
						/>
						<br />
						<label for='abstractpicture'> Picture: {this.state.picturehelpertext}</label>
						<br />
						<br />
						<form>
							<input
								type='file'
								id='abstractpicture'
								onChange={this.myPictureHandler}
								name='abstractpicture'
								accept='image/png, image/jpeg, image/jpg'
							></input>
						</form>
						<br />
						<br />
						<p>Content:</p>
						<br />
						<SunEditor
							onChange={this.myEditorHandler}
							setOptions={{
								mode: 'classic',
								rtl: false,
								previewTemplate:
									"<div style='width:auto; max-width:80%; margin:auto;'>    <h1>Preview</h1>     {{contents}} </div>            ",
								katex: 'window.katex',
								width: '100%',
								minHeight: '400px',
								imageMultipleFile: true,
								videoMultipleFile: true,
								audioFileInput: true,
								stickyToolbar: false,
								tabDisable: false,
								placeholder: 'Please type here...',
								defaultStyle: 'font-family: Arial; font-size: 12px',
								buttonList: [
									[
										'undo',
										'redo',
										'font',
										'fontSize',
										'formatBlock',
										'paragraphStyle',
										'blockquote',
										'bold',
										'underline',
										'italic',
										'strike',
										'subscript',
										'superscript',
										'fontColor',
										'hiliteColor',
										'textStyle',
										'removeFormat',
										'outdent',
										'indent',
										'align',
										'horizontalRule',
										'list',
										'lineHeight',
										'table',
										'link',
										'image',
										'video',
										'audio',
										'imageGallery',
										'fullScreen',
										'showBlocks',
										'codeView',
										'preview',
										'save',
										'template',
									],
								],
							}}
						/>
						<br />
						<button onClick={this.handleUpload}> Upload </button>
					</>
				);
			}
		}
		if (this.state.whattoupload === 'trinkspiel') {
			if (this.state.uploaderfolgreich) {
				return (
					<>
						<p>Dein Upload war erfolgreich</p>
						<button onClick={this.uploadMore}> Noch mehr hochladen </button>
					</>
				);
			} else {
				return (
					<>
						<button onClick={this.uploadMore}> Zurück </button>
						<h2>Uploade hier Trinkspielaufgaben.</h2>
						<h4>
							Wenn ein Name eingesetzt werden soll schreibe $user. Lasse ein Leerzeichen nach
							$user. Soll ein Name mehrmals vorkommen schreibe eine Zahl beginnend mit 1 direkt
							dahinter. z.B. "$user1 trinkt mit $user. $user1 springt danach im Kreis." Achte
							darauf keine Zahl zu überspringen.
						</h4>
						<div style={{ width: '100%', display: 'flex' }}>
							<p>Ist es eine Regel?</p>
							<Checkbox
								checked={this.state.istregel}
								onChange={() => this.handleIstRegelChange()}
							/>
						</div>
						<TextField
							onChange={this.myTrinkspielHandler}
							fullWidth={true}
							multiline={true}
							variant='outlined'
						/>
						<button onClick={this.handleTrinkspielUpload}> Upload </button>
						<br />
						<br />
						<br />
						<br />
						<br />
						<Trinkspieledit />
					</>
				);
			}
		} else {
			return (
				<>
					<button onClick={() => this.goto('blogcontent')}> Upload Blog </button>
					<button onClick={() => this.goto('editblog')}> Edit Blog </button>
					<button onClick={() => this.goto('trinkspiel')}> Trinkspiel </button>
				</>
			);
		}
	}
}
export default Uploadblog;
