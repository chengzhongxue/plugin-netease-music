import {
  type Editor,
  isActive,
  mergeAttributes,
  Node,
  nodeInputRule,
  type Range,
  VueNodeViewRenderer,
  type EditorState,
} from "@halo-dev/richtext-editor";
import NeteaseMusicView from "./NeteaseMusicView.vue";
import { markRaw } from "vue";
import { ToolboxItem } from "@halo-dev/richtext-editor";
import MdiShare from "~icons/mdi/share";
import BlockActionSeparator from "./BlockActionSeparator.vue";
import MdiDeleteForeverOutline from "~icons/mdi/delete-forever-outline?color=red";
import RiNeteaseCloudMusicFill from '~icons/ri/netease-cloud-music-fill';
import { deleteNode } from "../utils/delete-node";
declare module "@halo-dev/richtext-editor" {
  interface Commands<ReturnType> {
    neteaseMusic: {
      setNeteaseMusic: (options: { src: string }) => ReturnType;
    };
  }
}

const NeteaseMusic = Node.create({
  name: "neteaseMusic",

  group() {
     return "block";
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      src: {
        default: null,
        parseHTML: (element) => {
          return element.getAttribute("src");
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "netease-music",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
      const divElement = document.createElement('div');
      divElement.id = "nm_jplayer";
      divElement.style.display = "none";
    return ["netease-music", mergeAttributes(HTMLAttributes),divElement];
  },

  addCommands() {
    return {
      setNeteaseMusic:
        (options) =>
          ({ commands }) => {
            return commands.insertContent({
              type: this.name,
              attrs: options,
            });
          },
    };
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: /^\$netease-music\$$/,
        type: this.type,
        getAttributes: (e) => ({
            src: e[1]
        }),
      }),
    ];
  },

  addNodeView() {
    return VueNodeViewRenderer(NeteaseMusicView);
  },

  addOptions() {
    return {
      getCommandMenuItems() {
        return {
          priority: 2e2,
          icon: markRaw(RiNeteaseCloudMusicFill),
          title: "网易云音乐",
          keywords: ["neteaseMusic", "网易云音乐"],
          command: ({ editor, range }: { editor: Editor; range: Range }) => {
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .insertContent([
                { type: "neteaseMusic", attrs: { src: "" } },
                { type: "paragraph", content: "" },
              ])
              .run();
          },
        };
      },
      getToolboxItems({ editor }: { editor: Editor }) {
        return {
          priority: 59,
          component: markRaw(ToolboxItem),
          props: {
            editor,
            icon: markRaw(RiNeteaseCloudMusicFill),
            title: "网易云音乐",
            action: () => {
              editor
                .chain()
                .focus()
                .insertContent([{ type: "neteaseMusic", attrs: { src: "" } }])
                .run();
            },
          },
        };
      },
      getBubbleMenu({ editor }: { editor: Editor }) {
        return {
          pluginKey: "neteaseMusicBubbleMenu",
          shouldShow: ({ state }: { state: EditorState }) => {
            return isActive(state, NeteaseMusic.name);
          },
          items: [
            {
              priority: 50,
              props: {
                icon: markRaw(MdiShare),
                title: "打开链接",
                action: () => {
                  window.open(editor.getAttributes(NeteaseMusic.name).src, "_blank");
                },
              },
            },
            {
              priority: 60,
              component: markRaw(BlockActionSeparator),
            },
            {
              priority: 70,
              props: {
                icon: markRaw(MdiDeleteForeverOutline),
                title: "删除",
                action: ({ editor }: { editor: Editor }) => {
                  deleteNode(NeteaseMusic.name, editor);
                },
              },
            },
          ],
        };
      }
    }
  }
  

})
export default NeteaseMusic;
