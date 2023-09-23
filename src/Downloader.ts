/*
  Simple tool to download scripts from the server

  */

// Wrapped in an async function to allow returning because esbuild is silly
(async () => {
  const filesRequest = new Request(`${BASE_URL}/files`);

  const files = ((await filesRequest.loadJSON()) as string[]).map((file) =>
    file.replace(".dev.js", "")
  );

  const alert = new Alert();

  alert.title = "Choose a script";
  alert.message = "Choose a script to install";

  for (const file of files) {
    alert.addAction(file);
  }

  alert.addCancelAction("Cancel");

  const choice = await alert.presentAlert();

  if (choice === -1) {
    return Script.complete();
  }

  const script = files[choice];

  const askIfDev = new Alert();

  askIfDev.title = "Do you want to install this as a dev script?";
  askIfDev.message = "Dev scripts are fetched from the server";
  askIfDev.addAction("Yes");
  askIfDev.addAction("No");

  const devChoice = await askIfDev.presentAlert();

  let fileName: string;
  let requestedFile: string;

  if (devChoice === 0) {
    requestedFile = "_DevScript.dev.js";
    fileName = `${script}.dev.js`;
  } else {
    requestedFile = `${script}.dev.js`;
    fileName = `${script}.js`;
  }

  const fileRequest = new Request(`${BASE_URL}/${requestedFile}`);

  const code = await fileRequest.loadString();

  const manager = FileManager.iCloud();

  const dir = manager.documentsDirectory();

  manager.writeString(manager.joinPath(dir, fileName), code);

  console.log(`Installed ${script}`);

  Script.complete();
})();
