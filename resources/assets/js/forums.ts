var forums;
class Forums {
	elements: any = {};
	paths: any = {};
	post: Post = null;
	constructor() {
		this.elements = {
			'postEditor': "[rt-data='post.edit']"
		};
		this.paths = {
			'vote': function(id: number) { return '/forums/post/' + id + '/vote'; }
		};
		this.post = new Post();
		$('.upvote').bind('click', function(e: any) {
			var postId = $(e.target).parent().parent().parent().parent().parent().attr('id');
			forums.upvote(postId);
		});
		$('.downvote').bind('click', function(e: any) {
			var postId = $(e.target).parent().parent().parent().parent().parent().attr('id');
			forums.downvote(postId);
		});
		$("[rt-hook='forums.thread.post:quote']").bind('click', function(e: any) {
			var id = $(e.target).attr('rt-data');
			forums.post.quote(id);
		});
	}

	downvote(postId: any) {
		postId = postId.replace("post", "");
		var post = $('#post' + postId),
			isUpvoted = $(post).hasClass('upvote-active'),
			isDownvoted = $(post).hasClass('downvote-active');
		if(isDownvoted === true)
			$(post).removeClass('downvote-active');
		else
			$(post).addClass('downvote-active');
		if(isUpvoted === true)
			$(post).removeClass('upvote-active');
		var data = {
			'vote': 'down'
		};
		var vote = utilities.postAJAX(this.paths.vote(postId), data);
		vote.done(function(data) {
			data = $.parseJSON(data);
		});
	}

	upvote(postId: any) {
		postId = postId.replace("post", "");
		var post = $('#post' + postId),
			isUpvoted = $(post).hasClass('upvote-active'),
			isDownvoted = $(post).hasClass('downvote-active');
		if(isUpvoted === true)
			$(post).removeClass('upvote-active');
		else
			$(post).addClass('upvote-active');
		if(isDownvoted === true)
			$(post).removeClass('downvote-active');
		var data = {
			'vote': 'up'
		};
		var vote = utilities.postAJAX(this.paths.vote(postId), data);
		vote.done(function(data) {
			data = $.parseJSON(data);
		});
	}
}
class Post {
	quote(id: any) {
		var source = $("[rt-data='post#" + id +":source']").html(),
			postContents = $(forums.elements.postEditor).val();
		source = source.replace(/\n/g, '\n>');
		source = source.replace(/&lt;/g, '<');
		source = source.replace(/&gt;/g, '>');
		source = ">" + source;
		if(postContents.length > 0)
			postContents += "\n";
		$(forums.elements.postEditor).val(postContents + source + "\n");
		utilities.scrollTo($(forums.elements.postEditor), 1000);
		$(forums.elements.postEditor).focus();
	}
}

$(function() {
	forums = new Forums();
});