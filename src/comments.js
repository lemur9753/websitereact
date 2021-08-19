import { Comment, Reply } from './commentinterface.js';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Button, TextField } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp, faPaperPlane, faReply } from '@fortawesome/free-solid-svg-icons';

const getRepliesByIdUrl = 'https://juliusannafelix.ddns.net/getrepliesbyid.php';
const getCommentsByIdUrl = 'https://juliusannafelix.ddns.net/getcommentsbyid.php';
const uploadCommentUrl = 'https://juliusannafelix.ddns.net/uploadcomment.php';
const uploadReplyUrl = 'https://juliusannafelix.ddns.net/uploadreply.php';

function Comments({ user, blogid }) {
	const [allcomments, SetAllComments] = useState([]);
	const [input, SetInput] = useState('');
	const [username, SetUsername] = useState(user || '');
	const [repliesofcomment, SetRepliesOfComment] = useState(0);
	const [replycomment, SetReplyComment] = useState(0);
	const [replytext, SetReplyText] = useState('');

	const uploadComment = () => {
		let user = username;
		if (!blogid || !input) {
			return;
		}
		if (!user) {
			user = prompt('Please enter a Name');
			if (!user) {
				return;
			}
			SetUsername(user);
		}
		var data = new FormData();
		data.append('blogid', blogid);
		data.append('username', user);
		data.append('comment', input);
		axios({
			method: 'POST',
			url: `${uploadCommentUrl}`,
			headers: { 'content-type': 'multipart/form-data' },
			data: data,
		})
			.then((response) => {
				console.log(response);
				window.location.reload();
			})
			.catch((err) => {
				console.error(err);
			});
	};

	const uploadReply = () => {
		let user = username;
		console.log('test');
		console.log(user);
		if (replycomment === 0 || !replytext) {
			console.log('test2');
			return;
		}
		if (!user || user === '') {
			console.log('test');
			user = prompt('Please enter a Name');
			if (!user) {
				return;
			}
			SetUsername(user);
		}
		var data = new FormData();
		data.append('commentid', replycomment);
		data.append('username', user);
		data.append('comment', replytext);
		axios({
			method: 'POST',
			url: `${uploadReplyUrl}`,
			headers: { 'content-type': 'multipart/form-data' },
			data: data,
		})
			.then((response) => {
				console.log(response);
				window.location.reload();
			})
			.catch((err) => {
				console.error(err);
			});
	};

	const getCommentsForBlogId = async () => {
		if (!blogid) {
			return;
		}
		var data = new FormData();
		data.append('blogid', blogid);
		axios({
			method: 'POST',
			url: `${getCommentsByIdUrl}`,
			headers: { 'content-type': 'multipart/form-data' },
			data: data,
		})
			.then(async (response) => {
				let newcomments = [];
				for (let index = 0; index < response.data.length - 1; index++) {
					const element = response.data[index];
					let replies = await checkReplies(element.id);
					console.log(replies);
					let comment = new Comment(
						element.username,
						element.comment,
						element.blogid,
						element.id,
						replies
					);
					newcomments.push(comment);
				}
				SetAllComments(newcomments);
			})
			.catch((err) => {
				console.error(err);
			});
	};

	const checkReplies = async (commentid) => {
		let replies = [];
		var data = new FormData();
		data.append('commentid', commentid);
		await axios({
			method: 'POST',
			url: `${getRepliesByIdUrl}`,
			headers: { 'content-type': 'multipart/form-data' },
			data: data,
		})
			.then(async (response) => {
				for (let index = 0; index < response.data.length - 1; index++) {
					const element = response.data[index];
					let reply = new Reply(element.username, element.comment, element.commentid, element.id);
					replies.push(reply);
				}
			})
			.catch((err) => {
				console.error(err);
			});
		return replies;
	};

	useEffect(() => {
		getCommentsForBlogId();
	}, []);

	const getTextfield = () => {
		return (
			<>
				<hr />
				<br />
				<div>
					<TextField
						label={<p> Schreibe hier deinen Kommentar</p>}
						variant='outlined'
						fullWidth
						multiline
						rows={4}
						value={input}
						onChange={(e) => SetInput(e.target.value)}
						InputProps={{
							endAdornment: (
								<Button
									onClick={() => uploadComment()}
									endIcon={
										<FontAwesomeIcon icon={faPaperPlane} size='xs'></FontAwesomeIcon>
									}
								>
									{' '}
									Abschicken
								</Button>
							),
						}}
					/>
					<br />
					<br />
					<hr />
				</div>
			</>
		);
	};

	const getReplyfield = (newreply) => {
		if (replycomment !== newreply) {
			return null;
		}
		return (
			<>
				<div>
					<TextField
						label={<p> Schreibe hier deine Antwort auf den Kommentar</p>}
						variant='outlined'
						fullWidth
						multiline
						rows={3}
						value={replytext}
						onChange={(e) => SetReplyText(e.target.value)}
						InputProps={{
							endAdornment: (
								<Button
									onClick={() => uploadReply()}
									endIcon={
										<FontAwesomeIcon icon={faPaperPlane} size='xs'></FontAwesomeIcon>
									}
								>
									{' '}
									Abschicken
								</Button>
							),
						}}
					/>
				</div>
			</>
		);
	};

	const showReplies = (replies, commentid) => {
		if (commentid === repliesofcomment) {
			return (
				<>
					<Button
						size='small'
						variant='text'
						onClick={() => SetRepliesOfComment(0)}
						startIcon={<FontAwesomeIcon icon={faAngleUp} size='xs'></FontAwesomeIcon>}
					>
						verstecke Antworten
					</Button>
					{replies.map((reply) => (
						<div style={{ display: 'flex' }}>
							<div style={{ flexDirection: 'column', width: '86%', marginLeft: '2%' }}>
								<div style={{ fontSize: '15px' }}>{reply.username}</div>
								<div style={{ fontSize: '18px' }}>{reply.comment}</div>
							</div>
							<br />
						</div>
					))}
				</>
			);
		} else {
			return (
				<>
					<Button
						size='small'
						variant='text'
						onClick={() => SetRepliesOfComment(commentid)}
						startIcon={<FontAwesomeIcon icon={faAngleDown} size='xs'></FontAwesomeIcon>}
					>
						zeige Antworten
					</Button>
				</>
			);
		}
	};

	const handleReply = (id) => {
		if (id === replycomment) {
			SetReplyComment(0);
			return;
		}
		SetReplyComment(id);
		SetReplyText('');
	};

	return (
		<>
			{getTextfield()}
			{allcomments.map((comment, i) => (
				<div key={i}>
					<div style={{ display: 'flex' }}>
						<div style={{ flexDirection: 'column', width: '87%', margin: '1%' }}>
							<div style={{ fontSize: '16px' }}>{comment.username}</div>
							<div style={{ fontSize: '19px' }}>{comment.comment}</div>
							{showReplies(comment.replies, comment.commentid)}
							{getReplyfield(comment.commentid)}
						</div>
						<div style={{ right: '0%' }}>
							<Button
								onClick={() => handleReply(comment.commentid)}
								endIcon={<FontAwesomeIcon icon={faReply} size='xs' />}
							>
								{' '}
								antworten
							</Button>
						</div>
					</div>
				</div>
			))}
		</>
	);
}

export default Comments;
