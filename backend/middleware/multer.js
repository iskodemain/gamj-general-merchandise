import multer from "multer";
import path from 'path';
import { dirname } from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, path.join(__dirname, '../uploads/temp/'));
    },
    filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
})

// File Filter
const fileFilter = (req, file, callback) => {
  const allowedTypes = /jpeg|jpg|png|webp|svg|bmp|ico|tiff|heic|avif/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  const isExtValid = allowedTypes.test(ext);
  const isMimeValid = allowedTypes.test(mime);

  if (isExtValid && isMimeValid) {
    callback(null, true);
  } 
  else {
    callback(
      new Error("Only image formats only are allowed (.jpg, .jpeg, .png, etc.)"),
      false
    );
  }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {fileSize: 10 * 1024 * 1024} // 10MB image size only
});

export default upload;