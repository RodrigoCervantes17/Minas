// src/hooks/useCamera.ts
import { useState, useEffect } from "react";
import { 
  requestCameraPermissions, 
  requestGalleryPermissions,
  takePhoto,
  selectFromGallery, 
} from "../../services/cameraService";

export const useCamera = () => {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [hasGalleryPermission, setHasGalleryPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const cameraPermission = await requestCameraPermissions();
      const galleryPermission = await requestGalleryPermissions();
      setHasCameraPermission(cameraPermission);
      setHasGalleryPermission(galleryPermission);
    })();
  }, []);

  const takePhoto = async () => {
    if (!hasCameraPermission) return null;
    return await takePhoto();
  };

  const selectFromGallery = async () => {
    if (!hasGalleryPermission) return null;
    return await selectFromGallery();
  };

  return { takePhoto, selectFromGallery };
};