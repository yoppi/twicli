registerPlugin({
	newMessageElement: function(elem) {
		var status = null;
		for(var i = 0; i < elem.childNodes.length; i++) {
			status = elem.childNodes[i];
			if (status.className && status.className.indexOf('status') >= 0)
				break;
		}
		var links = status.getElementsByTagName('a');
		for (var i = 0; i < links.length; i++) {
			this.replaceUrl(elem, links[i], links[i].href);
		}
	},
	replaceUrl: function(elem, link, url) {
		var flickr_id;
		if (url.indexOf(twitterURL) == 0 || url.indexOf("javascript:") == 0)
			return; // skip @... or #...
		if (url.match(/^http:\/\/twitpic\.com\/(\w+)/)) {
			var id = RegExp.$1;
			addThumbnail(elem, 'http://twitpic.com/show/thumb/' + id, url);
		}
		else if (url.match(/^http:\/\/movapic\.com\/pic\/(\w+)$/)) {
			var id = RegExp.$1;
			addThumbnail(elem, 'http://image.movapic.com/pic/t_' + id + '.jpeg', url);
		}
		else if (url.match(/^http:\/\/f\.hatena\.ne\.jp\/([\w\-]+)\/(\d{8})(\w+)$/)) {
			var user = RegExp.$1;
			var date = RegExp.$2;
			var id = RegExp.$3;
			addThumbnail(elem,
					'http://f.hatena.ne.jp/images/fotolife/' + user[0] + '/' + user +
					'/' + date + '/' + date + id + '_120.jpg',
					url);
		}
		else if (url.match(/^(http:\/\/[\w\-]+\.tumblr\.com\/)post\/(\d+)/)) {
			var _url = url;
			xds.load(RegExp.$1+'api/read/json?id='+RegExp.$2,
					function(x) {
						var p = x.posts[0]['photo-url-75'];
						if (!p) return;
						addThumbnail(elem, p, _url);
					});
		}
		else if (url.match(/^http:\/\/yfrog\.com\/\w+$/)) {
			addThumbnail(elem, url + '.th.jpg', url);
		}
		else if (flickr_id = flickrPhotoID(url)) {
			var _url = url;
			xds.load('http://www.flickr.com/services/rest?method=flickr.photos.getInfo'+
					'&format=json&api_key=9bc57a7248847fd9a80982989e80cfd0&photo_id='+flickr_id,
					function(x) {
						var p = x.photo;
						if (!p) return;
						addThumbnail(elem, 'http://farm'+p.farm+'.static.flickr.com/'+p.server+'/'+
									p.id+'_'+p.secret+'_s.jpg', _url);
					},
					null, 1, 'jsoncallback');
		}
		else if (url.match(/^(http:\/\/plixi.com\/p\/\d+)/)) {
			addThumbnail(elem, 'http://api.plixi.com/api/TPAPI.svc/imagefromurl?size=thumbnail&url='+url, url);
		}
		else if (url.match(/^http:\/\/img.ly\/(\w+)/)) {
			addThumbnail(elem, 'http://img.ly/show/thumb/'+RegExp.$1, url);
		}
		else if (url.match(/^http:\/\/ow.ly\/i\/(\w+)/)) {
			addThumbnail(elem, 'http://static.ow.ly/photos/thumb/'+RegExp.$1+".jpg", url);
		}
		else if (url.match(/^(http:\/\/gyazo.com\/\w+\.png)/)) {
			addThumbnail(elem, 'http://gyazo-thumbnail.appspot.com/thumbnail?url='+url, url);
		}
		else if (url.match(/^http:\/\/(?:www\.youtube\.com\/watch\?.*v=|youtu\.be\/)([\w\-]+)/)) {
			var id = RegExp.$1;
			addThumbnail(elem, 'http://i.ytimg.com/vi/' + id + '/default.jpg', url);
		}
		else if (url.match(/^http:\/\/(?:www\.nicovideo\.jp\/watch|nico\.ms)\/([a-z][a-z])(\d+)$/)) {
			if (RegExp.$1 == "lv") return; // live thumbnail is not supported
			var id = RegExp.$2;
			var host = parseInt(id)%4 + 1;
			addThumbnail(elem, 'http://tn-skr' + host + '.smilevideo.jp/smile?i=' + id, url);
		}
		else if (url.match(/^(http:\/\/instagr\.am\/p\/[\w\-]+)\/?$/)) {
			addThumbnail(elem, RegExp.$1+'/media/?size=t', url);
		}
		else if (url.match(/^(http:\/\/picplz.com\/\w+)/)) {
			addThumbnail(elem, url+'/thumb/150', url);
		}
		else if (url.match(/^http:\/\/photozou\.jp\/photo\/show\/\d+\/(\d+)/)) {
			addThumbnail(elem, "http://art"+Math.floor(Math.random()*40+1)+".photozou.jp/bin/photo/"+
							RegExp.$1 +"/org.bin?size=120", url);
		}
	}
});

function flickrPhotoID(url) {
	if (url.match(/^http:\/\/(?:www\.flickr\.com\/photos\/[\w\-@]+\/(\d+)|flic\.kr\/p\/(\w+)$)/))
		return RegExp.$2 ? decodeBase58(RegExp.$2) : RegExp.$1;
}
function decodeBase58(snipcode) {
	var base58_letters = '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
	var ret = 0;
	for (var i = snipcode.length, m = 1; i; i--, m *= 58)
		ret += base58_letters.indexOf(snipcode.substr(i-1,1)) * m;
	return ret;
}

function addThumbnail(elem, src, url) {
	var thm = document.createElement('img');
	thm.src = src;
	thm.className = 'thumbnail-image';
	thm.ontouchstart = function(){ thm.style.maxWidth = '200px'; };
	thm.ontouchend   = function(){ thm.style.maxWidth = '30px'; };
	var a = document.createElement('a');
	a.href = url;
	a.target = 'twitter';
	a.className = 'thumbnail-link';
	a.onclick = function(){ return link(a); };
	a.appendChild(thm);
	elem.insertBefore(a, elem.childNodes[2]);
}
