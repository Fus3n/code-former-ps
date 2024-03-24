const { entrypoints } = require("uxp");
const app = require("photoshop").app;
const imaging = require("photoshop").imaging
const Replicate = require("./node_modules/replicate/index.js")
const {showAbout, customAlert, customPrompt, getValue } = require("./utils.js")

const CODE_FORMER_MODEL = "sczhou/codeformer:7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cd56";



showSettings = async () => {
  try {
    let prevTok = await getValue("API_TOKEN")
    let token = await customPrompt("Your Replicate API Token", "Please enter your replicate token", prevTok ?? "TOKEN")
    if (token != null && token != "") {
      await require('uxp').storage.secureStorage.setItem("API_TOKEN", token);
    } else {
      // Inform the user that they did not enter a name
      if (!prevTok) {
        customAlert("You did not enter a token.");
      }
    }
  } catch (err) {
    console.error(err);
  }
}
const deleteCache = async () => {
  try {
    const fs = require('fs')
    const paths = await fs.readdir("plugin-data:/");
    for (const path of paths) {
      await fs.unlink("plugin-data:/" + path);
    }
    customAlert("Deleted!")
  } catch (err) {
    console.error(err);
  }
}

entrypoints.setup({
  commands: {
    showAbout,
    showSettings,
    deleteCache
  },
  panels: {
    vanilla: {
      show(node) {
        
      }
    }
  }
});

const settingsBtn = document.getElementById("settings-btn")

const sliderLabel = document.getElementById("slider-label")
const slider = document.getElementById("slider")
const upscaleFactorInput = document.getElementById("upscale-factor")
const bgEnhanceCheck = document.getElementById("bg-enhance")
const faceEnhanceCheck = document.getElementById("face-enhance")

slider.addEventListener("input", (e) => {
  console.log(e.target.value.toFixed(1))
  sliderLabel.innerHTML = `Fidelity (${e.target.value.toFixed(1)})`
})

settingsBtn.addEventListener("click", showSettings)


function isValid(value) {
  return !(value === null || value === undefined || isNaN(value))
}

async function imageUrlToArrayBuffer(imageUrl) {
  try {
    const response = await fetch(imageUrl);

    if (response.ok) {
      const arrayBuffer = await response.arrayBuffer();
      return arrayBuffer;
    } else {
      throw new Error(`Failed to fetch image. Status code: ${response.status}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

async function upscaleImage() {
    const { localFileSystem } = require('uxp').storage;
    const pluginFolder = await localFileSystem.getEntryWithUrl("plugin-data:/");

    
    const runAsModal = async (c) => {
      const doc = app.activeDocument;
      
      if (doc.activeLayers.length == 0) {
        customAlert("Please select the layer you want to upscale");
        return;
      }

      const activeLayerId = doc.activeLayers[0].id
      let options = {
        "documentID": doc.id,
        "componentSize": 8,
        "applyAlpha": true,
        "layerID": activeLayerId
      };

      let pixels = await imaging.getPixels(options);
      const jpegData = await imaging.encodeImageData({"imageData": pixels.imageData, "base64": true});
      const dataUrl = "data:image/jpeg;base64," + jpegData;

      try {
        const apiToken = await getValue("API_TOKEN")
        if (!apiToken) {
          customAlert("Please enter your Replicate API Token in Settings or Click the Cogwheel icon")
          return;
        }
        const replicate = new Replicate({
          auth: apiToken,
        });

        let upscaleFactor = parseInt(upscaleFactorInput.value, 10) 
        upscaleFactor = isValid(upscaleFactor) ? upscaleFactor : 1
        console.log("Upscale Factor", upscaleFactor)
        console.log("background_enhance", bgEnhanceCheck.checked)
        console.log("face_upsample", faceEnhanceCheck.checked)

        const output = await replicate.run(
          CODE_FORMER_MODEL,
          {
            input: {
              image: dataUrl,
              upscale: upscaleFactor,
              face_upsample: bgEnhanceCheck.checked,
              background_enhance: faceEnhanceCheck.checked,
              codeformer_fidelity: slider.value ?? 0.7
            }
          }
        );
        console.log(output)
        const img = await imageUrlToArrayBuffer(output)
        if (pluginFolder.isFolder) {
          const randomInteger = Math.floor(Math.random() * 100000);
          const file = await pluginFolder.createFile(`output-${randomInteger}.png`, {overwrite: true});
          file.write(img);
          const newDocument = await app.open(file);
          if (doc && upscaleFactor == 1) {
            const activeLay = newDocument.activeLayers[0]
            await activeLay.duplicate(doc);
            await newDocument.close();
          }
        }
        
        console.log("Finished")
      } catch (error) {
        customAlert("Error: " + error.message);
      }
      
    }

    require("photoshop").core.executeAsModal(runAsModal, {"commandName": "Upscaling Image..."});
}

document.getElementById("btn-scale").addEventListener("click", upscaleImage);