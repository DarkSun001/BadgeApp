import Jimp from "jimp";

async function convertToBadge(imagePath, outputImagePath) {
  try {
    // Chargement de l'image avec Jimp
    const image = await Jimp.read(imagePath);

    // Vérification de la taille
    if (image.bitmap.width !== 512 || image.bitmap.height !== 512) {
      throw new Error("La taille de l'image doit être 512x512.");
    }

    // Vérification que les pixels non transparents sont dans un cercle
    const centerX = image.bitmap.width / 2;
    const centerY = image.bitmap.height / 2;
    const radius = image.bitmap.width / 2;

    for (let y = 0; y < image.bitmap.height; y++) {
      for (let x = 0; x < image.bitmap.width; x++) {
        const distanceToCenter = Math.sqrt(
          (x - centerX) ** 2 + (y - centerY) ** 2
        );
        const idx = image.getPixelIndex(x, y);

        // Vérifier que le pixel n'est pas transparent et est en dehors du cercle
        if (image.bitmap.data[idx + 3] !== 0 && distanceToCenter > radius) {
          throw new Error(
            "Les pixels non transparents doivent être dans un cercle."
          );
        }
      }
    }

    // Logique pour changer les couleurs de l'image pour une impression de "joie"
    image.scan(
      0,
      0,
      image.bitmap.width,
      image.bitmap.height,
      function (x, y, idx) {
        const red = image.bitmap.data[idx];
        const green = image.bitmap.data[idx + 1];
        const blue = image.bitmap.data[idx + 2];

        // Exemple : augmenter la saturation pour une teinte plus joyeuse
        const saturationIncrease = 50;
        const hsv = Jimp.intToRGBA(Jimp.rgbaToInt(red, green, blue, 255));
        hsv.s += saturationIncrease;

        // Mise à jour de la couleur du pixel
        image.bitmap.data[idx] = hsv.r;
        image.bitmap.data[idx + 1] = hsv.g;
        image.bitmap.data[idx + 2] = hsv.b;
      }
    );

    // Sauvegarde de l'image transformée
    await image.writeAsync(outputImagePath);

    return "Image transformée avec succès en badge.";
  } catch (error) {
    return error.message;
  }
}
const inputImagePath = "./téléchargement.jpg";
const outputImagePath = "./badge_transforme.jpg";

convertToBadge(inputImagePath, outputImagePath)
  .then((result) => console.log(result))
  .catch((error) => console.error(error));
