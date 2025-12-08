// src/cloudinary/multer-cloudinary.ts
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary } from './provider';

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: 'profile',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
    public_id: `${Date.now()}-${file.originalname}`,
  }),
});

export const multerCloudinaryOptions = {
  storage,
};
