var forums;
class Forums {
	public elements: any = {};
	public paths: any = {};
	public post: Post = null;
	public threadCreate: ForumsThreadCreate = null;
	public constructor() {
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

	public downvote(postId: any) {
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

	public upvote(postId: any) {
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
	public quote(id: any) {
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

class ForumsThreadCreate {
	public hooks: any = {};
	public questions: Array = [];
	public values: any = {};
	public views: any = {};
	public constructor() {
		this.hooks = {
			questionAdd: "[rt-hook='forums.thread.create:poll.question.add']",
			questions: "[rt-hook='forums.thread.create:poll.questions']"
		};
		this.questions = Array(500);
		this.values = {
			questions: 0
		};
		this.views = {
			answer: $("[rt-view='forums.thread.create:poll.answer']").html(),
			question: $("[rt-view='forums.thread.create:poll.question']").html()
		};
		$(this.hooks.questionAdd).bind('click', function() {
			forums.threadCreate.addQuestion();
		});
	}
	public addQuestion() {
		var html = this.views.question;
		$(this.hooks.questions).append(html);
		this.values.questions += 1;
	}

	public removeQuestion(number: number) {
		this.questions.splice(number, 1);
	}

	public setListener(element, type) {
		if(type === "remove question") {
			this.setListenerRemoveQuestion(element);
		}
	}

	private setListenerRemoveQuestion(element: any) {
		$(element).bind('click', function(e: any) {
			forums.threadCreate.removeQuestion($(element).parent().parent().attr('rt-data'));
		});
	}
}

$(function() {
	forums = new Forums();
});