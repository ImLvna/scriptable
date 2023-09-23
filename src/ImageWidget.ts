/*
  Simple widget to display an image

  Supports multiple images

  */

const manager = FileManager.local();

const dir = manager.joinPath(manager.documentsDirectory(), "widgetImages");

if (!manager.fileExists(dir)) {
  manager.createDirectory(dir);
}

let imageName = args.widgetParameter;

if (!imageName) {
  if (config.runsInWidget) {
    throw new Error("No image name provided");
  }

  const alert = new Alert();
  alert.title = "Image name";
  alert.message = "Enter the name of the image you want to display";
  alert.addTextField("Image name");
  alert.addAction("OK");
  await alert.present();

  imageName = alert.textFieldValue(0);

  if (!imageName) {
    throw new Error("No image name provided");
  }
}

async function getPhoto() {
  if (config.runsInWidget) {
    throw new Error(`Image ${imageName} not found`);
  }

  const photo = await Photos.fromLibrary();

  const imageData = Data.fromPNG(photo);

  manager.write(imagePath, imageData);
}

const imagePath = manager.joinPath(dir, `${imageName}.png`);

if (!manager.fileExists(imagePath)) await getPhoto();

if (config.runsInApp) {
  const choicesAlert = new Alert();
  choicesAlert.title = "Options";
  choicesAlert.addAction("Change image");
  choicesAlert.addDestructiveAction("Delete image");
  choicesAlert.addCancelAction("Cancel");

  const choice = await choicesAlert.presentAlert();

  switch (choice) {
    case 0:
      await getPhoto();
      break;
    case 1:
      manager.remove(imagePath);
      break;
    default:
      break;
  }
}

const widget = new ListWidget();
widget.backgroundColor = new Color("#000000");

const image = manager.readImage(imagePath);

widget.backgroundImage = image;

Script.setWidget(widget);

if (!config.runsInWidget) {
  await widget.presentSmall();
}
