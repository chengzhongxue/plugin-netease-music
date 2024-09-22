<script lang="ts" setup>
import type { PMNode } from "@halo-dev/richtext-editor";
import type { Editor, Node } from "@halo-dev/richtext-editor";
import { NodeViewWrapper } from "@halo-dev/richtext-editor";
import { computed, onMounted, ref } from "vue";
import { axiosInstance } from "@halo-dev/api-client";
import { VButton,VSpace,VDropdown} from "@halo-dev/components";
import type {BasicConfig} from "@/types";
const selecteNeteaseMusic = ref<Object | undefined>();
const selecteComments = ref<Object | undefined>();
const basicConfig =  ref<BasicConfig | undefined>();

const id = ref("");
const type = ref("");

const props = defineProps<{
  editor: Editor;
  node: PMNode;
  selected: boolean;
  extension: Node<any, any>;
  getPos: () => number;
  updateAttributes: (attributes: Record<string, any>) => void;
  deleteNode: () => void;
}>();

const src = computed({
  get: () => {
    return props.node?.attrs.src;
  },
  set: (src: string) => {
    props.updateAttributes({ src: src });
  },
});

function handleSetFocus() {
  props.editor.commands.setNodeSelection(props.getPos());
}

const editorLinkObtain = ref();

onMounted(() => {
  if (!src.value) {
  }else {
    handleCheckAllChange();
  }
});

const neteaseSong = async () => {
    const { data: response } = await axiosInstance.get(
            `/apis/api.plugin.halo.run/v1alpha1/plugins/plugin-netease-music/music/neteaseSong?id=${id.value}`);
    if (response.code === 200 && response.songs.length > 0) {
        var mp3_url = 'https://music.163.com/song/media/outer/url?id=' + id.value + '.mp3';
        var music_name = response.songs[0].name;
        var mp3_cover = response.songs[0].album.picUrl.replace('http://', 'https://');
        var song_duration = response.songs[0].duration;
        var artists = response.songs[0].artists.map(function (artist: { name: any; }) {
            return artist.name;
        }).join(",");
        selecteNeteaseMusic.value = {
            id: id.value,
            title: music_name,
            artist: artists,
            mp3: mp3_url,
            cover: mp3_cover,
            duration: song_duration / 1000,
        }
    }
};
const comments = async () => {
    const { data: response } = await axiosInstance.get(
            `/apis/api.plugin.halo.run/v1alpha1/plugins/plugin-netease-music/music/neteaseComments?id=${id.value}`);
    selecteComments.value = response;
}

const getBasicConfig = async () => {
    const { data: response } = await axiosInstance.get<BasicConfig>(
            `/apis/api.plugin.halo.run/v1alpha1/plugins/plugin-netease-music/music/getBasicConfig`);
    basicConfig.value = response;
}

const neteaseRadio = async () => {
    const { data: response } = await axiosInstance.get(
            `/apis/api.plugin.halo.run/v1alpha1/plugins/plugin-netease-music/music/neteaseRadio?id=${id.value}`);
    if (response.code === 200 && response.program) {
        var result = response.program;
        var mp3_url = result.mainSong.mp3Url?.replace("http://m", "http://p");
        selecteNeteaseMusic.value = {
            id: result.mainSong.id,
            title: result.mainSong.name,
            artist: result.mainSong.artists[0].name,
            mp3: mp3_url,
            cover: result.mainSong.album.picUrl,
            duration: result.mainSong.duration / 1000
        }
    }
}


const handleCheckAllChange = async () => {
    await getBasicConfig();
    parse();
    if (type.value == 'song'){
        neteaseSong();
        if (basicConfig.value?.comment) {
            comments()
        }
    }else if (type.value == 'program'){
        neteaseRadio();
    }
};

const parse = () => {
    const regex = /https?:\/\/music\.163\.com\/#\/(\w+)\?id=(\d+)/i;
    const match = src.value.match(regex);
    if (match) {
        const type1 = match[1]; // 歌曲类型，如 "song", "album", "playlist"
        const id1 = match[2];   // 歌曲 ID
        id.value = id1;
        type.value = type1;
        return { type, id };
    } else {
        return null;
    }
};

const handleEnterSetExternalLink = () => {
  if (!editorLinkObtain.value) {
    return;
  }
  props.updateAttributes({
    src: editorLinkObtain.value,
  });
};

const handleResetInit = () => {
  props.updateAttributes({src: ""});
};

const formattedTime = (seconds: number): string => {
    if (!seconds) return '--:--';
    let min: number = Math.floor(seconds / 60);
    if (min < 10) min = Number('0' + min); // 将字符串转换为数字
    let second: number = Math.floor(seconds % 60);
    if (second < 10) second = Number('0' + second); // 将字符串转换为数字
    return `${min}:${second}`;
}

</script>

<template>
  <node-view-wrapper as="div" class="inline-block-box inline-block">
    <div
      class="inline-block overflow-hidden transition-all text-center relative h-full w-full rounded-md"
      :class="{
        'rounded ring-2': selected,
      }"
    >
      <div v-if="!src || selecteNeteaseMusic == undefined" class="relative">
        <div class="flex h-64 w-full items-center justify-center" style="height: 160px;">
          <div
            class="flex h-full w-full cursor-pointer flex-col items-center justify-center border-2 border-dashed border-gray-300 bg-gray-50"
          >
            <div
              class="flex flex-col items-center justify-center space-y-7 pb-6 pt-5 editor-link-obtain"
            >
              <VSpace>
                <VDropdown>
                  <div class="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20" style="margin: 0.8em 1.5em;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" style="font-size: 1.6rem;">
                          <path fill="currentColor" d="M12.001 22c-5.523 0-10-4.477-10-10s4.477-10 10-10s10 4.477 10 10s-4.477 10-10 10m-1.086-10.432c.24-.84 1.075-1.541 1.99-1.648c.187.694.388 1.373.545 2.063c.053.23.037.495-.018.727c-.213.892-1.248 1.242-1.978.685c-.53-.405-.742-1.12-.539-1.827m3.817-.197c-.125-.465-.256-.927-.393-1.42c.5.13.907.36 1.255.697c1.257 1.222 1.385 3.3.294 4.732c-1.135 1.49-3.155 2.134-5.028 1.605c-2.302-.65-3.808-2.952-3.441-5.316c.274-1.768 1.27-3.004 2.9-3.733c.407-.182.58-.56.42-.93c-.157-.364-.54-.504-.944-.343c-2.721 1.088-4.32 4.134-3.67 6.987c.713 3.118 3.495 5.163 6.675 4.859c1.732-.166 3.164-.948 4.216-2.347c1.506-2.002 1.297-4.783-.463-6.499c-.666-.65-1.471-1.018-2.39-1.153c-.083-.013-.217-.052-.232-.106c-.087-.313-.18-.632-.206-.954c-.029-.357.29-.64.65-.645c.253-.003.434.13.603.3c.303.3.704.322.988.062c.29-.264.296-.678.018-1.008c-.566-.672-1.586-.891-2.43-.523c-.847.37-1.321 1.187-1.2 2.093c.038.28.11.557.167.842l-.26.072a3.863 3.863 0 0 0-2.098 1.414c-.921 1.22-.936 2.828-.041 3.947c1.274 1.594 3.747 1.284 4.523-.568c.284-.677.275-1.368.087-2.065"/>
                      </svg>
                  </div>
                  <VButton>输入链接</VButton>
                  <template #popper>
                    <input
                      v-model="editorLinkObtain"
                      class="block w-full rounded-md border border-gray-300 bg-gray-50 px-2 py-1.5 text-sm text-gray-900 hover:bg-gray-100"
                      placeholder="输入链接，按回车确定"
                      @keydown.enter="handleEnterSetExternalLink"
                      @change="handleCheckAllChange"
                    />
                  </template>
                </VDropdown>
              </VSpace>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="group relative">
          <div v-if="type == 'song'" :class="{'nm-has-hot': basicConfig?.comment && selecteComments?.length > 0}">
              <div class="nmsingle-container">
                  <div class="nmsingle-cover" :style="'background-image:url(' + selecteNeteaseMusic?.cover + '?param=148x148)'">
                  </div>
                  <div class="nmsingle-info">
                      <div class="nmplayer-top">
                          <span class="nmplayer-title">{{ selecteNeteaseMusic?.title }} - {{ selecteNeteaseMusic?.artist }}</span>
                          <span class="nmsingle-playtime">
                          <span class="current-time">--:--</span> / <span class="duration">{{ formattedTime(selecteNeteaseMusic?.duration) }}</span>
                          </span>
                          <div class="nmplayer-mid">
                              <div class="nmsingle-lrc">(*+﹏+*)</div>
                          </div>
                      </div>
                      <div class="nmsingle-process" >
                          <div class="nmsingle-process-bar"></div>
                      </div>
                  </div>
              </div>
              <div v-if="basicConfig?.comment && selecteComments?.length > 0" class="nmhotcom">
                  <div class="nmhc-title">网易热评</div>
                  <div v-for="(comment, index) in selecteComments?.length > 5 ? selecteComments.slice(0, 5) : selecteComments" :key="index" class="nmh-item">
                      <span :style="{ backgroundImage: 'url(' + comment.user.avatarUrl + '?param=48x48)' }" class="nmu-avatar"></span>
                      <span class="nmu-name">{{ comment.user.nickname }}</span>: {{ comment.content }}
                  </div>
              </div>
          </div>
          <div v-if="type == 'program'" class="nmsingle-container">
              <div class="nmsingle-cover" :style="'background-image:url(' + selecteNeteaseMusic?.cover + '?param=148x148)'">
              </div>
              <div class="nmsingle-info">
                  <div class="nmplayer-top">
                      <span class="nmplayer-title">{{ selecteNeteaseMusic?.title }} - {{ selecteNeteaseMusic?.artist }}</span>
                      <span class="nmsingle-playtime">
                      <span class="current-time">--:--</span> / <span class="duration">{{ formattedTime(selecteNeteaseMusic?.duration) }}</span>
                      </span>
                  </div>
                  <div class="nmsingle-process" >
                      <div class="nmsingle-process-bar"></div>
                  </div>
              </div>
          </div>
          <div v-if="src"
               class="absolute left-0 top-0 hidden h-1/4 w-full cursor-pointer justify-end bg-gradient-to-b from-gray-300 to-transparent p-2 ease-in-out group-hover:flex"
          >
              <VButton size="sm" type="secondary" @click="handleResetInit">
                  替换
              </VButton>
          </div>
      </div>
    </div>
  </node-view-wrapper>
</template>

<style>
.inline-block-box {
    width: calc(100% - 1px);
}
@font-face {
    font-family: fx;
    src: url(/plugins/plugin-netease-music/assets/static/fonts/icomoon.eot);
    src: url(/plugins/plugin-netease-music/assets/static/fonts/icomoon.eot?#iefix) format('embedded-opentype'), url(/plugins/plugin-netease-music/assets/static/fonts/icomoon.woff) format('woff'), url(/plugins/plugin-netease-music/assets/static/fonts/icomoon.ttf) format('truetype'), url(/plugins/plugin-netease-music/assets/static/fonts/icomoon.svg#fx) format('svg')
}

.fxfont {
    font-family: fx !important;
    font-style: normal;
    -webkit-font-smoothing: antialiased;
    -webkit-text-stroke-width: .2px;
    -moz-osx-font-smoothing: grayscale
}

.nm-heart:before {
    content: "\e904"
}

.nm-mute:before {
    content: "\e90d"
}

.muted.nm-mute:before {
    content: "\e90e"
}

.nm-unmute:before {
    content: "\e90d"
}

.nm-playselected:before {
    content: "\e604"
}

.nm-next:before {
    content: "\e90c"
}

.nm-pause:before {
    content: "\e906"
}

.nm-play:before,
.paused .nm-pause:before {
    content: "\e905"
}

.nm-note:before {
    content: "\e606"
}

.nm-previous:before {
    content: "\e902"
}

.nmsingle-container {
    border: 1px solid rgba(0, 0, 0, .05);
    border-radius: 3px;
    overflow: hidden;
    line-height: 26px
}

.nmsingle-cover {
    height: 74px;
    width: 74px;
    float: left;
    background-position: center;
    background-size: cover;
    text-align: center;
    line-height: 70px;
    font-size: 36px;
    color: #fff;
    cursor: pointer
}

.nmsingle-cover:hover {
    color: #c00
}

.nmsingle-info {
    padding: 5px 15px;
    margin-left: 74px
}

.nmsingle-process {
    background-color: #ddd;
    cursor: pointer;
    position: relative;
    overflow: hidden
}

.nmsingle-process-bar {
    background-color: #c00;
    position: relative;
    height: 3px;
    -webkit-transition: .5s;
    transition: .5s;
    -webkit-transform: translateX(-100%);
    transform: translateX(-100%)
}

.nmsingle-playtime {
    color: rgba(0, 0, 0, .56);
    float: right
}

.nmsingle-lrc {
    font-size: 12px;
    color: rgba(0, 0, 0, .44);
    text-overflow: ellipsis;
    white-space: nowrap
}

.nmplayer-mid,
.nmsingle-lrc {
    overflow: hidden
}

.nmplayer-control {
    float: right;
    color: rgba(0, 0, 0, .44)
}

.nmplayer-control span {
    margin-left: 2px;
    cursor: pointer
}

.nmplayer-control span:hover {
    color: #c00
}

.nmplayer-control .nm-mute {
    border-left: 1px solid rgba(0, 0, 0, .3);
    padding-left: 5px
}

.nmplayer-control .list-triggle {
    display: inline-block;
    font-size: 12px;
    vertical-align: top;
    margin-left: 6px
}

.nms-list {
    max-height: 400px;
    overflow-y: auto;
    counter-reset: a;
    font-size: 14px;
    border: 1px solid rgba(0, 0, 0, .05);
    border-top: 0;
    border-radius: 0 0 3px 3px
}

.nms-list.hide {
    display: none
}

.nms-list-item {
    padding: 5px 15px;
    color: rgba(0, 0, 0, .44);
    cursor: pointer;
    line-height: 1.4
}

.nms-list-item:before {
    content: counter(a, decimal) ". ";
    counter-increment: a
}

.nms-list-item.is-active {
    color: #c00
}

.nms-list-item:nth-child(odd) {
    background-color: #f0f0f0
}

.nms-list-item .song-time {
    float: right
}

.nmhotcom {
    padding-bottom: 15px;
    border: 1px solid rgba(0, 0, 0, .05);
    font-size: 13px;
    color: rgba(0, 0, 0, .44);
    position: relative
}

.nmhotcom .com-close {
    position: absolute;
    right: 15px;
    top: 5px;
    cursor: pointer
}

.nmhotcom .com-close:hover {
    color: #c00
}

.nmhotcom .nmhc-title {
    background-color: #fafafa;
    text-align: center;
    margin-bottom: 15px;
    line-height: 40px
}

.nmhotcom .nmu-avatar {
    vertical-align: middle;
    border-radius: 100%;
    margin-right: 5px;
    background-size: cover;
    height: 24px;
    width: 24px;
    display: inline-block
}

.nmhotcom .nmh-item {
    padding: 3px 15px
}

.nmhotcom .nmh-item:hover {
    background-color: #fafafa
}

.nmhotcom .nmu-name {
    color: #c00
}

</style>  
