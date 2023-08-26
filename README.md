# Tiptap Extension Upload Image

The seamless image upload feature with real-time preview. Effortlessly add images to your content while a dynamic placeholder fills in during the upload process. Enhance your editing experience with this intuitive extension.

## Installation

```bash
npm install tiptap-extension-upload-image
```

## Usage

#### Import package and css
```
import UploadImage from 'tiptap-extension-upload-image';
import 'tiptap-extension-upload-image/dist/upload-image.min.css';
//Optional
import axios from 'axios';
```

#### Register in editor extensions

```
extensions: [
  StarterKit,
  UploadImage.configure({
    uploadFn: uploadFn
  }),
]
```

#### Create a function to upload images

This function is used to upload images using axios or the manager of your preference. It should return a string with the image URL in case of success. In case of an error, it should throw an exception. I am sending this function in the extension's configuration.

```
const uploadFn = (file) => {
    var formData = new FormData();
    formData.append("image", file);
    return axios.post('/tools/guidelines/media', formData)
    .then((response) => {
        return response.data.url
    })
    .catch((e) => {
        //Optionaly you can send only throw
        throw(e.response.data.error);
    }); 
}
```

#### Add command to your menu button

Add this line to your button to open the input type file to select image.

```
editor.chain().focus().addImage().run()
```

#### Styling

You can overwrite the color of spinner.

```
.image-uploading::before {
    border-top-color: #1e986c;
}
```