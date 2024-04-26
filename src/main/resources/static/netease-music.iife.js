!function(){var basic,nminstance=0;function nm_format_time(seconds){if(!seconds)return"--:--";var min=Math.floor(seconds/60);min<10&&(min="0"+min);var second=Math.floor(seconds%60);return second<10&&(second="0"+second),min+":"+second}function nm_single_playform(id,instance,cover,title,artist,duration,list=!1){var text=basic.listopen?"展开列表":"隐藏列表",listh=list?'<span class="list-triggle">'+text+"</span>":"";return'<div id="nm-player-'+instance+'" class="nmsingle-container"><div class="nmsingle-cover" style="background-image:url('+cover+'?param=148x148)"><span class="nms-play-btn fxfont nm-play" data-index='+instance+'></span></div><div class="nmsingle-info"><div class="nmplayer-top"><span class="nmplayer-title">'+title+" - "+artist+'</span><span class="nmsingle-playtime"><span class="current-time">--:--</span> / <span class="duration">'+nm_format_time(duration)+'</span></span></div><div class="nmplayer-mid"><div class="nmplayer-control" data-index='+instance+'><span class="fxfont nm-previous"></span><span class="fxfont nm-next"></span><span class="nm-mute fxfont"></span>'+listh+'</div><div class="nmsingle-lrc">(*+﹏+*)</div></div><div class="nmsingle-process" data-index="'+instance+'"><div class="nmsingle-process-bar"></div></div></div></div>'}async function nm_generate_player(source=null,type=null,id=null,nminstance=null){let html="";if("netease"===(source=source||"netease"))switch(type){case"album":let albumData=await(albumId=id,fetch("/apis/api.plugin.halo.run/v1alpha1/plugins/plugin-netease-music/music/neteaseAlbum?albumId="+albumId).then((res=>res.json())).then((response=>{if(200===response.code&&response.album){const result=response.album.songs,count=result.length;if(count<1)return!1;const albumName=response.album.name,albumAuthor=response.album.artist.name;let albumCover=response.album.blurPicUrl;albumCover=albumCover.replace("http://","https://");const album={albumId:albumId,albumTitle:albumName,albumAuthor:albumAuthor,albumType:"albums",albumCover:albumCover,albumCount:count,songs:[]};return result.forEach((value=>{const mp3Url=`https://music.163.com/song/media/outer/url?id=${value.id}.mp3`,lrc="";album.songs.push({id:value.id,title:value.name,duration:value.duration/1e3,mp3:mp3Url,artist:albumAuthor,lrc:lrc})})),album}return null})).catch((error=>(console.error("Error fetching song data:",error),null)))),albumSongs=albumData.songs;html+=nm_single_playform(albumData.album_id,nminstance,albumData.album_cover,albumData.album_title,albumData.album_author,"",!0);var classVal=basic.listopen?" hide":"";html+='<div class="nms-list'+classVal+'" id="nm-list-'+nminstance+'" data-index="'+nminstance+'">',albumSongs.forEach((function(song){html+='<div class="nms-list-item">'+song.title+" - "+song.artist+'<span class="song-time">'+nm_format_time(song.duration)+"</span></div>"})),html+="</div>",playlist.splice(nminstance,0,albumSongs);break;case"song":let songData=await(music_id=id,fetch("/apis/api.plugin.halo.run/v1alpha1/plugins/plugin-netease-music/music/neteaseSong?id="+music_id).then((res=>res.json())).then((response=>{if(200===response.code&&response.songs.length>0){var mp3_url="https://music.163.com/song/media/outer/url?id="+music_id+".mp3",music_name=response.songs[0].name,mp3_cover=response.songs[0].album.picUrl.replace("http://","https://"),song_duration=response.songs[0].duration,artists=response.songs[0].artists.map((function(artist){return artist.name})).join(",");return{id:music_id,title:music_name,artist:artists,mp3:mp3_url,cover:mp3_cover,duration:song_duration/1e3,lrc:""}}return null})).catch((error=>(console.error("Error fetching song data:",error),null))));if(html+="<div>",html+=nm_single_playform(songData.id,nminstance,songData.cover,songData.title,songData.artist,songData.duration),basic.comment){let commentsData=await function(id){return fetch("/apis/api.plugin.halo.run/v1alpha1/plugins/plugin-netease-music/music/neteaseComments?id="+id).then((res=>res.json())).then((response=>response)).catch((error=>(console.error("Error fetching song data:",error),null)))}(id);commentsData.length>0&&(html+='<div class="nmhotcom"><span class="com-close">X</span><div class="nmhc-title">网易热评</div>',commentsData.forEach((function(comment){html+='<div class="nmh-item"><span style="background-image:url('+comment.user.avatarUrl+'?param=48x48)" class="nmu-avatar"></span><span class="nmu-name">'+comment.user.nickname+"</span>:"+comment.content+"</div>"})),html+="</div>")}html+="</div>",playlist.splice(nminstance,0,songData);break;case"playlist":let playlistData=await(playlistId=id,fetch("/apis/api.plugin.halo.run/v1alpha1/plugins/plugin-netease-music/music/neteasePlaylist?playlistId="+playlistId).then((res=>res.json())).then((response=>{if(200===response.code&&response.result){var result=response.result.tracks,count=result.length;if(count<1)return!1;var collect_name=response.result.name,collect_author=response.result.creator.nickname,album_cover=response.result.coverImgUrl;album_cover=album_cover.replace("http://","https://");var collect={collect_id:playlistId,collect_title:collect_name,collect_author:collect_author,collect_type:"collects",collect_count:count,collect_cover:album_cover,songs:[]};return result.forEach((function(value){var mp3_url="https://music.163.com/song/media/outer/url?id="+value.id+".mp3",artists=value.artists.map((function(artist){return artist.name})).join(","),lrc="";collect.songs.push({id:value.id,title:value.name,duration:value.duration/1e3,mp3:mp3_url,artist:artists,lrc:lrc})})),collect}return null})).catch((error=>(console.error("Error fetching song data:",error),null)))),playlistSongs=playlistData.songs;html+=nm_single_playform(playlistData.collect_id,nminstance,playlistData.collect_cover,playlistData.collect_title,playlistData.collect_author,"",!0);classVal=basic.listopen?" hide":"";html+='<div class="nms-list'+classVal+'" id="nm-list-'+nminstance+'" data-index="'+nminstance+'">',playlistSongs.forEach((function(song){html+='<div class="nms-list-item"><span class="song-info">'+song.title+" - "+song.artist+'</span><span class="song-time">'+nm_format_time(song.duration)+"</span></div>"})),html+="</div>",playlist.splice(nminstance,0,playlistSongs);break;case"program":let programData=await function(id){return fetch("/apis/api.plugin.halo.run/v1alpha1/plugins/plugin-netease-music/music/neteaseRadio?id="+id).then((res=>res.json())).then((response=>{if(200===response.code&&response.program){var result=response.program,mp3_url=result.mainSong.mp3Url?.replace("http://m","http://p");return{id:result.mainSong.id,title:result.mainSong.name,artist:result.mainSong.artists[0].name,mp3:mp3_url,cover:result.mainSong.album.picUrl,duration:result.mainSong.duration/1e3,lrc:""}}return null})).catch((error=>(console.error("Error fetching song data:",error),null)))}(id);html+=nm_single_playform(programData.id,nminstance,programData.cover,programData.title,programData.artist,programData.duration),playlist.splice(nminstance,0,programData);break;default:return url}var playlistId,music_id,albumId;return html}async function init(){playlist=[];const parents=document.querySelectorAll("netease-music");parents&&(basic=await fetch("/apis/api.plugin.halo.run/v1alpha1/plugins/plugin-netease-music/music/getBasicConfig").then((res=>res.json())).then((response=>response)).catch((error=>(console.error("Error fetching song data:",error),null)))),parents.forEach((parent=>{const observer=new IntersectionObserver((entries=>{entries.forEach((entry=>{if(entry.isIntersecting&&0===parent.childElementCount){!async function(src,parent,nminstance){const result=function(src){const regex=/https?:\/\/music\.163\.com\/#\/(\w+)\?id=(\d+)/i,match=src.match(regex);return match?{type:match[1],id:match[2]}:null}(src);var music_id=result.id,html="";html+=await nm_generate_player("netease",result.type,music_id,nminstance);const figure=document.createElement("figure");figure.innerHTML=html,parent.appendChild(figure)}(parent.getAttribute("src"),parent,nminstance),nminstance+=1,parent.animate([{opacity:0},{opacity:1}],{duration:300,fill:"forwards"}),observer.disconnect()}}))}));observer.observe(parent)}))}document.addEventListener("DOMContentLoaded",(()=>{var script;init(),(script=document.createElement("script")).src="/plugins/plugin-netease-music/assets/static/single.min.js",document.body.appendChild(script)}),{once:!0})}();