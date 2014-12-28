var utilities;
class Utilities {
    public currentTime() {
        return Math.floor(Date.now() / 1000);
    }

    public formToken(token: string) {
        token = atob(token);
        $('form').append("<input type='hidden' name='_token' value='" + token + "' />");

        var meta = document.createElement('meta');
        meta.name = '_token';
        meta.content = token;

        document.getElementsByTagName('head')[0].appendChild(meta);
    }

    public getAJAX(path: string) {
        return $.ajax({
            url: path,
            type: 'get',
            dataType: 'html',
            async: true
        });
    }

    public JSONDecode(json: string) {
        return $.parseJSON(json);
    }
    public postAJAX(path: string, data: any) {
        data._token = $('meta[name="_token"]').attr('content');
        return $.ajax({
            url: path,
            type: 'post',
            data: data,
            async: true
        });
    }

    public scrollTo(element: any, time: number) {
        $('html, body').animate({
            scrollTop: $(element).offset().top
        }, time);
    }

    public timeAgo(ts: number) {
        var nowTs = Math.floor(Date.now() / 1000),
            seconds = nowTs - ts;
        if(seconds > 2 * 24 * 3600) {
            return "a few days ago";
        } else if(seconds > 24 * 3600) {
            return "yesterday";
        } else if(seconds > 7200) {
            return Math.floor(seconds / 3600) + " hours ago";
        } else if(seconds > 3600) {
            return "an hour ago";
        } else if(seconds >= 120) {
            return Math.floor(seconds / 60) + " minutes ago";
        } else if(seconds >= 60) {
            return "1 minute ago";
        } else if(seconds > 1) {
            return seconds + " seconds ago";
        } else {
            return "1 second ago";
        }
    }
}
utilities = new Utilities();