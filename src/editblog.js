import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SunEditor from 'suneditor-react';
import { TextField } from '@material-ui/core';

const maxHeaderLength = 45;
const maxAbstractLength = 372;
const maxPictureSize = 100000;
const reader = new FileReader();
const getallcontent = 'https://juliusannafelix.ddns.net/getblogbyusername.php';
const getcontentbyid = 'https://juliusannafelix.ddns.net/getcontent.php';
const editpath = 'https://juliusannafelix.ddns.net/editblog.php';

function Editblog({ username }) {
	const [editorcontent, setEditorContent] = useState('');
	const [contentid, setContentId] = useState();
	const [allblogs, setAllBlogs] = useState([]);
	const [{ headertext, headerhelpertext, headerLength, headerinputerror }, setHeader] = useState({
		headertext: '',
		headerhelpertext: '',
		headerLength: 0,
		headerinputerror: false,
	});
	const [{ abstracttext, abstractLength, abstractinputerror, abstracthelpertext }, setAbstract] = useState({
		abstracttext: '',
		abstractLength: 0,
		abstracthelpertext: '',
		abstractinputerror: false,
	});
	const [picture, setPicture] = useState('');
	const [picturehelpertext, setPictureHelperText] = useState('');

	useEffect(() => {
		getContentOfUsername();
		return () => {
			axios.Cancel();
		};
		//eslint-disable-next-line
	}, []);

	const getContentOfUsername = () => {
		var data = new FormData();
		data.append('username', username);
		axios({
			method: 'POST',
			url: `${getallcontent}`,
			headers: { 'content-type': 'multipart/form-data' },
			data: data,
		})
			.then((response) => {
				const allblog = [];
				//eslint-disable-next-line
				response.data.map((content) => {
					if (content) {
						allblog.push(content);
					}
				});
				setAllBlogs(allblog);
			})
			.catch((error) => alert(`${error}`));
	};

	const getContentOfId = (id) => {
		var data = new FormData();
		data.append('contentid', id);
		axios({
			method: 'POST',
			url: `${getcontentbyid}`,
			headers: { 'content-type': 'multipart/form-data' },
			data: data,
		})
			.then((response) => {
				myEditorHandler(response.data[0].content);
				console.log(response.data[0]);
				setPicture(response.data[0].picture);
				setPictureHelperText(
					'Dein Bild wird zwar nicht im FileSelector angezeigt, es wurde jedoch korrekt geladen'
				);
				myAbstractHandler({ target: { value: `${response.data[0].abstract}` } });
				myHeaderHandler({ target: { value: `${response.data[0].header}` } });
			})
			.catch((error) => alert(`${error}`));
	};

	const uploadEdit = () => {
		if (validateUploadData()) {
			var contentdata = new FormData();
			contentdata.append('id', contentid);
			contentdata.append('header', headertext);
			contentdata.append('picture', picture);
			contentdata.append('abstract', abstracttext);
			contentdata.append('content', editorcontent);
			axios({
				method: 'POST',
				url: `${editpath}`,
				headers: { 'content-type': 'multipart/form-data' },
				data: contentdata,
			})
				.then((response) => {
					if (response.data > 0) {
						alert('Content konnte hochgeladen werden');
					} else {
						alert('Content konnte nicht hochgeladen werden');
					}
				})
				.catch((error) => this.setState({ error: error.message }));
		} else {
			alert('Bitte fülle alle Felder aus und achte auf die Maximale Größe');
		}
	};
	const validateUploadData = () => {
		if (
			headertext.length === 0 ||
			picture.length === 0 ||
			abstracttext.length === 0 ||
			editorcontent.length === 0
		) {
			return false;
		}

		if (
			headertext.length > maxHeaderLength ||
			picture.length > maxPictureSize ||
			abstracttext.length > maxAbstractLength
		) {
			return false;
		}

		return true;
	};

	const myEditorHandler = (content) => {
		setEditorContent(content);
	};

	const goto = (id) => {
		console.log(id);
		setContentId(id);
		getContentOfId(id);
	};

	const myPictureHandler = (content) => {
		if (content.target.files[0] !== undefined) {
			var image = new Image();
			image = content.target.files[0];
			image.width = '400px';
			reader.readAsDataURL(image);
			reader.onload = (event) => {
				if (event.target.result.length < maxPictureSize) {
					setPicture(event.target.result);
					setPictureHelperText('');
				} else {
					setPicture('');
					setPictureHelperText('Das hochgeladene Bild ist leider zu groß');
				}
			};
		} else {
			setPicture('');
			setPictureHelperText('');
		}
	};

	const myHeaderHandler = (content) => {
		setHeader((currentState) => ({ ...currentState, headertext: content.target.value }));
		if (content.target.value.length > maxHeaderLength) {
			setHeader((currentState) => ({
				...currentState,
				headerinputerror: true,
				headerhelpertext: 'Zu viele Zeichen',
			}));
		} else {
			var num = maxHeaderLength - content.target.value.length;
			setHeader((currentState) => ({
				...currentState,
				headerinputerror: false,
				headerhelpertext: num.toString(),
			}));
		}
	};

	const myAbstractHandler = (content) => {
		setAbstract((currentState) => ({ ...currentState, abstracttext: content.target.value }));
		if (content.target.value.length > maxAbstractLength) {
			setAbstract((currentState) => ({
				...currentState,
				abstractinputerror: true,
				abstracthelpertext: 'Zu viele Zeichen',
			}));
		} else {
			var num = maxAbstractLength - content.target.value.length;
			setAbstract((currentState) => ({
				...currentState,
				abstractinputerror: false,
				abstracthelpertext: num.toString(),
			}));
		}
	};

	const displayBlogButtons = () => {
		if (contentid !== undefined) {
			return (
				<>
					<button onClick={() => setContentId(undefined)}>Zurück</button>
					<button onClick={() => uploadEdit()}>Upload</button>
					<p>Header:</p>
					<TextField
						onChange={myHeaderHandler}
						fullWidth={true}
						multiline={true}
						variant='outlined'
						helperText={headerhelpertext}
						error={headerinputerror}
						value={headertext}
					/>
					<br />
					<p>Abstract:</p>
					<TextField
						onChange={myAbstractHandler}
						fullWidth={true}
						multiline={true}
						variant='outlined'
						helperText={abstracthelpertext}
						error={abstractinputerror}
						value={abstracttext}
					/>
					<br />
					<br />
					<label for='abstractpicture'> Picture: {picturehelpertext}</label>
					<br />
					<form>
						<input
							type='file'
							id='abstractpicture'
							onChange={myPictureHandler}
							name='abstractpicture'
							accept='image/png, image/jpeg, image/jpg'
						></input>
					</form>
					<br />
					<br />
					<p>Content:</p>
					<br />
					<SunEditor
						onChange={myEditorHandler}
						setContents={editorcontent}
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
				</>
			);
		} else {
			console.log(allblogs);
			return allblogs.map((blogentry) => (
				<div key={blogentry.id}>
					<button onClick={() => goto(blogentry.id)}>{blogentry.header}</button>
				</div>
			));
		}
	};

	return displayBlogButtons();
}

export default Editblog;
