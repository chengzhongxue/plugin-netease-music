(function () {
    var basic, nminstance = 0;

    function nm_format_time(seconds) {
        if (!seconds) return '--:--';
        var min = Math.floor(seconds / 60);
        if (min < 10) min = '0' + min;
        var second = Math.floor(seconds % 60);
        if (second < 10) second = '0' + second;

        return min + ':' + second;
    }


    function nm_single_playform(id, instance, cover, title, artist, duration, list = false) {
        var text = basic.listopen ? '展开列表' : '隐藏列表';
        var listh = list ? '<span class="list-triggle">' + text + '</span>' : '';
        return '<div id="nm-player-' + instance + '" class="nmsingle-container"><div class="nmsingle-cover" style="background-image:url(' + cover + '?param=148x148)"><span class="nms-play-btn fxfont nm-play" data-index=' + instance + '></span></div><div class="nmsingle-info"><div class="nmplayer-top"><span class="nmplayer-title">' + title + ' - ' + artist + '</span><span class="nmsingle-playtime"><span class="current-time">--:--</span> / <span class="duration">' + nm_format_time(duration) + '</span></span></div><div class="nmplayer-mid"><div class="nmplayer-control" data-index=' + instance + '><span class="fxfont nm-previous"></span><span class="fxfont nm-next"></span><span class="nm-mute fxfont"></span>' + listh + '</div><div class="nmsingle-lrc">(*+﹏+*)</div></div><div class="nmsingle-process" data-index="' + instance + '"><div class="nmsingle-process-bar"></div></div></div></div>';
    }


    async function nm_generate_player(source = null, type = null, id = null, nminstance = null) {

        source = source ? source : 'netease';
        let html = '';
        if (source === 'netease') {
            switch (type) {
                case 'album':
                    let albumData = await netease_album(id);
                    let albumSongs = albumData['songs'];
                    html += nm_single_playform(albumData['album_id'], nminstance, albumData['album_cover'], albumData['album_title'], albumData['album_author'], '', true);
                    var classVal = basic.listopen ? ' hide' : '';
                    html += '<div class="nms-list' + classVal + '" id="nm-list-' + nminstance + '" data-index="' + nminstance + '">';
                    albumSongs.forEach(function (song) {
                        html += '<div class="nms-list-item">' + song['title'] + ' - ' + song['artist'] + '<span class="song-time">' + nm_format_time(song['duration']) + '</span></div>';
                    });
                    html += '</div>';
                    playlist.splice(nminstance, 0, albumSongs);
                    break;
                case 'song':
                    let songData = await netease_song(id);
                    html += '<div>'
                    if (nminstance == 0) {
                        html+='<div id="nm_jplayer" style="display: none;"></div>'
                    }
                    html += nm_single_playform(songData['id'], nminstance, songData['cover'], songData['title'], songData['artist'], songData['duration']);
                    if (basic.comment) {
                        let commentsData = await comments(id);
                        if (commentsData.length > 0) {
                            html += '<div class="nmhotcom"><span class="com-close">X</span><div class="nmhc-title">网易热评</div>';
                            commentsData.forEach(function (comment) {
                                html += '<div class="nmh-item"><span style="background-image:url(' + comment['user']['avatarUrl'] + '?param=48x48)" class="nmu-avatar"></span><span class="nmu-name">' + comment['user']['nickname'] + '</span>:' + comment['content'] + '</div>';
                            });
                            html += '</div>';
                        }
                    }
                    html += '</div>'
                    playlist.splice(nminstance, 0, songData);
                    break;
                case 'playlist':
                    let playlistData = await netease_playlist(id);
                    let playlistSongs = playlistData['songs'];
                    html += nm_single_playform(playlistData['collect_id'], nminstance, playlistData['collect_cover'], playlistData['collect_title'], playlistData['collect_author'], '', true);
                    var classVal = basic.listopen ? ' hide' : '';
                    html += '<div class="nms-list' + classVal + '" id="nm-list-' + nminstance + '" data-index="' + nminstance + '">';
                    playlistSongs.forEach(function (song) {
                        html += '<div class="nms-list-item"><span class="song-info">' + song['title'] + ' - ' + song['artist'] + '</span><span class="song-time">' + nm_format_time(song['duration']) + '</span></div>';
                    });
                    html += '</div>';
                    playlist.splice(nminstance, 0, playlistSongs);
                    break;
                case 'program':
                    let programData = await netease_radio(id);
                    html += nm_single_playform(programData['id'], nminstance, programData['cover'], programData['title'], programData['artist'], programData['duration']);
                    playlist.splice(nminstance, 0, programData);
                    break;
                default:
                    return url;
                    break;
            }
        }
        return html;
    }


    async function getNeteaseMusic(src, parent, nminstance) {
        const result = parse(src)
        var music_id = result.id;
        var html = '';
        html += await nm_generate_player('netease', result.type, music_id, nminstance);
        const figure = document.createElement("figure");
        figure.innerHTML = html;
        parent.appendChild(figure);
    }

    function comments(id) {
        const fetchUrl = "/apis/api.plugin.halo.run/v1alpha1/plugins/plugin-netease-music/music/neteaseComments?id=" + id;
        return fetch(fetchUrl)
                .then(res => res.json())
                .then(response => {
                    return response;
                })
                .catch(error => {
                    console.error('Error fetching song data:', error);
                    return null;
                });
    }

    function netease_song(music_id) {
        const fetchUrl = "/apis/api.plugin.halo.run/v1alpha1/plugins/plugin-netease-music/music/neteaseSong?id=" + music_id;
        return fetch(fetchUrl)
                .then(res => res.json())
                .then(response => {
                    if (response.code === 200 && response.songs.length > 0) {
                        var mp3_url = 'https://music.163.com/song/media/outer/url?id=' + music_id + '.mp3';
                        var music_name = response.songs[0].name;
                        var mp3_cover = response.songs[0].album.picUrl.replace('http://', 'https://');
                        var song_duration = response.songs[0].duration;
                        var artists = response.songs[0].artists.map(function (artist) {
                            return artist.name;
                        }).join(",");
                        var lrc = false ? get_song_lrc(music_id) : "";
                        var result = {
                            id: music_id,
                            title: music_name,
                            artist: artists,
                            mp3: mp3_url,
                            cover: mp3_cover,
                            duration: song_duration / 1000,
                            lrc: lrc
                        };
                        return result;
                    } else {
                        return null;
                    }
                })
                .catch(error => {
                    console.error('Error fetching song data:', error);
                    return null;
                });
    }

    function netease_album(albumId) {
        const fetchUrl = "/apis/api.plugin.halo.run/v1alpha1/plugins/plugin-netease-music/music/neteaseAlbum?albumId=" + albumId;
        return fetch(fetchUrl)
                .then(res => res.json())
                .then(response => {
                    if (response.code === 200 && response.album) {
                        // 处理音乐信息
                        const result = response.album.songs;
                        const count = result.length;
                        if (count < 1) return false;
                        const albumName = response.album.name;
                        const albumAuthor = response.album.artist.name;
                        let albumCover = response.album.blurPicUrl;
                        albumCover = albumCover.replace('http://', 'https://');
                        const album = {
                            albumId: albumId,
                            albumTitle: albumName,
                            albumAuthor: albumAuthor,
                            albumType: "albums",
                            albumCover: albumCover,
                            albumCount: count,
                            songs: []
                        };
                        result.forEach(value => {
                            const mp3Url = `https://music.163.com/song/media/outer/url?id=${value.id}.mp3`;
                            const lrc = false ? get_song_lrc(value.id) : "";
                            album.songs.push({
                                id: value.id,
                                title: value.name,
                                duration: value.duration / 1000,
                                mp3: mp3Url,
                                artist: albumAuthor,
                                lrc: lrc
                            });
                        });
                        return album;
                    } else {
                        return null;
                    }

                })
                .catch(error => {
                    console.error('Error fetching song data:', error);
                    return null;
                });

    }


    function netease_playlist(playlistId) {
        const fetchUrl = "/apis/api.plugin.halo.run/v1alpha1/plugins/plugin-netease-music/music/neteasePlaylist?playlistId=" + playlistId;
        return fetch(fetchUrl)
                .then(res => res.json())
                .then(response => {
                    if (response.code === 200 && response.result) {
                        //处理音乐信息
                        var result = response.result.tracks;
                        var count = result.length;
                        if (count < 1) return false;
                        var collect_name = response.result.name;
                        var collect_author = response.result.creator.nickname;
                        var album_cover = response.result.coverImgUrl;
                        album_cover = album_cover.replace('http://', 'https://');
                        var collect = {
                            collect_id: playlistId,
                            collect_title: collect_name,
                            collect_author: collect_author,
                            collect_type: "collects",
                            collect_count: count,
                            collect_cover: album_cover,
                            songs: []
                        };
                        result.forEach(function (value) {
                            var mp3_url = 'https://music.163.com/song/media/outer/url?id=' + value.id + '.mp3';
                            var artists = value.artists.map(function (artist) {
                                return artist.name;
                            }).join(",");
                            var lrc = false ? get_song_lrc(value.id) : "";
                            collect.songs.push({
                                id: value.id,
                                title: value.name,
                                duration: value.duration / 1000,
                                mp3: mp3_url,
                                artist: artists,
                                lrc: lrc
                            });
                        });
                        return collect;
                    } else {
                        return null;
                    }
                })
                .catch(error => {
                    console.error('Error fetching song data:', error);
                    return null;
                });
    }

    function netease_radio(id) {
        const fetchUrl = "/apis/api.plugin.halo.run/v1alpha1/plugins/plugin-netease-music/music/neteaseRadio?id=" + id;
        return fetch(fetchUrl)
                .then(res => res.json())
                .then(response => {
                    if (response.code === 200 && response.program) {
                        var result = response.program;
                        var mp3_url = result.mainSong.mp3Url?.replace("http://m", "http://p");
                        var results = {
                            id: result.mainSong.id,
                            title: result.mainSong.name,
                            artist: result.mainSong.artists[0].name,
                            mp3: mp3_url,
                            cover: result.mainSong.album.picUrl,
                            duration: result.mainSong.duration / 1000,
                            lrc: ""
                        };
                        return results;
                    } else {
                        return null;
                    }

                })
                .catch(error => {
                    console.error('Error fetching song data:', error);
                    return null;
                });
    }

    function basicConfig() {
        const fetchUrl = "/apis/api.plugin.halo.run/v1alpha1/plugins/plugin-netease-music/music/getBasicConfig";
        return fetch(fetchUrl)
                .then(res => res.json())
                .then(response => {
                    return response;
                })
                .catch(error => {
                    console.error('Error fetching song data:', error);
                    return null;
                });
    }

    async function init() {
        playlist = []
        const parents = document.querySelectorAll('netease-music');
        if (parents) {
            basic = await basicConfig();
        }
        parents.forEach(parent => {
            if (parent.childElementCount === 1) {
                const src = parent.getAttribute("src");
                getNeteaseMusic(src, parent, nminstance);
                nminstance += 1;
            }
        });
    }

    function parse(src) {
        const regex = /https?:\/\/music\.163\.com\/#\/(\w+)\?id=(\d+)/i;
        const match = src.match(regex);

        if (match) {
            const type = match[1]; // 歌曲类型，如 "song", "album", "playlist"
            const id = match[2];   // 歌曲 ID
            return { type, id };
        } else {
            return null;
        }
    }

    function loadSingleMinScript() {
        var script = document.createElement('script');
        script.src = `/plugins/plugin-netease-music/assets/static/single.min.js`;
        document.body.appendChild(script);
    }

    document.addEventListener("DOMContentLoaded",  async () => {
        init();
        loadSingleMinScript();
    }, {
        once: true
    });

})();