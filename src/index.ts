import { Plugin } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import Image from "@tiptap/extension-image";
import { EditorView } from "@tiptap/pm/view";
import { Schema } from "@tiptap/pm/model";
import "./upload-image.css";

export interface UploadFn {
  (file: File): Promise<string>;
}
export interface CustomImageOptions {
  /**
   * Controls if the image node should be inline or not.
   * @default false
   * @example true
   */
  inline: boolean;

  /**
   * Controls if base64 images are allowed. Enable this if you want to allow
   * base64 image urls in the `src` attribute.
   * @default false
   * @example true
   */
  allowBase64: boolean;

  /**
   * HTML attributes to add to the image element.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>;

  /**
   * Function to upload image
   */
  uploadFn: UploadFn;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    customImage: {
      /**
       * Add an image
       * @example
       * editor
       *   .commands
       *   .addImage()
       */
      addImage: () => ReturnType;

      /**
       * Add an image
       * @param options The image attributes
       * @example
       * editor
       *   .commands
       *   .setImage({ src: 'https://tiptap.dev/logo.png', alt: 'tiptap', title: 'tiptap logo' })
       */
      setImage: (options: {
        src: string;
        alt?: string;
        title?: string;
      }) => ReturnType;
    };
  }
}

let uploadFn: UploadFn;
let imagePreview = "";

const UploadImage = Image.extend<CustomImageOptions>({
  name: "uploadImage",
  onCreate() {
    if (typeof this.options.uploadFn !== "function") {
      console.warn("uploadFn should be a function");
      return;
    }
    uploadFn = this.options.uploadFn;
  },
  addOptions() {
    return {
      ...this.parent?.(),
      uploadFn: async () => {
        return "";
      },
    };
  },
  addProseMirrorPlugins() {
    return [placeholderPlugin];
  },
  addCommands() {
    return {
      ...this.parent?.(),
      addImage: () => () => {
        let fileHolder = document.createElement("input");
        fileHolder.setAttribute("type", "file");
        fileHolder.setAttribute("accept", "image/*");
        fileHolder.setAttribute("style", "visibility:hidden");
        document.body.appendChild(fileHolder);

        const view = this.editor.view;
        const schema = this.editor.schema;

        fileHolder.addEventListener("change", (e: Event) => {
          if (
            view.state.selection.$from.parent.inlineContent &&
            (<HTMLInputElement>e.target)?.files?.length
          ) {
            startImageUpload(
              view,
              (<HTMLInputElement>e.target)?.files![0],
              schema
            );
          }
          view.focus();
        });
        fileHolder.click();
        return true;
      },
    };
  },
});

//Plugin for placeholder
const placeholderPlugin = new Plugin({
  state: {
    init() {
      return DecorationSet.empty;
    },
    apply(tr, set) {
      // Adjust decoration positions to changes made by the transaction
      set = set.map(tr.mapping, tr.doc);
      // See if the transaction adds or removes any placeholders
      let action = tr.getMeta(this);
      if (action && action.add) {
        let widget = document.createElement("div");
        let img = document.createElement("img");
        widget.classList.value = "image-uploading";
        img.src = imagePreview;
        widget.appendChild(img);
        let deco = Decoration.widget(action.add.pos, widget, {
          id: action.add.id,
        });
        set = set.add(tr.doc, [deco]);
      } else if (action && action.remove) {
        set = set.remove(
          set.find(undefined, undefined, (spec) => spec.id == action.remove.id)
        );
      }
      return set;
    },
  },
  props: {
    decorations(state) {
      return this.getState(state);
    },
  },
});

//Find the placeholder in editor
function findPlaceholder(state, id) {
  let decos = placeholderPlugin.getState(state);
  let found = decos?.find(undefined, undefined, (spec) => spec.id == id);

  return found?.length ? found[0].from : null;
}

function startImageUpload(view: EditorView, file: File, schema: Schema) {
  imagePreview = URL.createObjectURL(file);
  // A fresh object to act as the ID for this upload
  let id = {};

  // Replace the selection with a placeholder
  let tr = view.state.tr;
  if (!tr.selection.empty) tr.deleteSelection();
  tr.setMeta(placeholderPlugin, { add: { id, pos: tr.selection.from } });
  view.dispatch(tr);
  uploadFn(file).then(
    (url) => {
      let pos = findPlaceholder(view.state, id);
      // If the content around the placeholder has been deleted, drop
      // the image
      if (pos == null) return;
      // Otherwise, insert it at the placeholder's position, and remove
      // the placeholder
      view.dispatch(
        view.state.tr
          .replaceWith(pos, pos, schema.nodes.uploadImage.create({ src: url }))
          .setMeta(placeholderPlugin, { remove: { id } })
      );
    },
    (e) => {
      // On failure, just clean up the placeholder
      view.dispatch(tr.setMeta(placeholderPlugin, { remove: { id } }));
    }
  );
}
export { UploadImage };

export default UploadImage;
