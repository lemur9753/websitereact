class Comment {
	constructor(username, comment, blogid, commentid, replies = []) {
		this.commentid = commentid;
		this.username = username;
		this.comment = comment;
		this.blogid = blogid;
		this.replies = replies;
	}
}

class Reply {
	constructor(username, comment, parentid, commentid) {
		this.commentid = commentid;
		this.username = username;
		this.comment = comment;
		this.parentid = parentid;
	}
}
export { Comment, Reply };
