"use client";
import { PhotoIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Button } from "@heroui/react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import React, {
  FC,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

type Props = PropsWithChildren<{
  setSelectedImages: (images: File[]) => void;
  selectedImages?: File[];
  preview?: boolean;
  buttonText?: string | ReactNode;
  defaultPreviews?: string[];
  maximumFiles?: number;
  showPreview?: boolean;
}>;

const ImagesPicker: FC<Props> = ({
  selectedImages = [],
  preview = true,
  setSelectedImages,
  buttonText,
  defaultPreviews = [],
  maximumFiles = Infinity,
}) => {
  const t = useTranslations();
  const [imagePreviews, setImagePreviews] = useState<string[]>(defaultPreviews);

  useEffect(() => {
    if (!selectedImages.length) return;

    const generatePreviews = async () => {
      const previews = await Promise.all(
        selectedImages.map(
          (file) =>
            new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            })
        )
      );
      setImagePreviews(previews);
    };

    generatePreviews();
  }, [selectedImages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    let fileArray = Array.from(e.target.files);

    // Prevent exceeding max file limit
    if (selectedImages.length + fileArray.length > maximumFiles) {
      fileArray = fileArray.slice(0, maximumFiles - selectedImages.length);
    }

    setSelectedImages([...selectedImages, ...fileArray]);

    const newPreviews = fileArray.map((file) => {
      const reader = new FileReader();
      return new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newPreviews).then((previews) =>
      setImagePreviews((prev) => [...prev, ...previews])
    );
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      {preview && (
        <div className="flex flex-wrap gap-2 mb-3">
          {imagePreviews.map((preview, index) => (
            <div
              key={index}
              className="relative flex items-center justify-center w-24 h-24 bg-gray-200 rounded-lg"
            >
              <Image
                src={preview}
                alt={`Image preview ${index}`}
                width={96}
                height={96}
                className="w-full h-full object-cover rounded-lg border border-solid border-gray-300"
              />
              <Button
                color="danger"
                className="absolute top-1 right-1"
                size="sm"
                isIconOnly
                onPress={() => removeImage(index)}
              >
                <TrashIcon />
              </Button>
            </div>
          ))}
        </div>
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        className="hidden"
        accept="image/*"
        multiple
      />

      <Button
        color="default"
        variant="flat"
        startContent={<PhotoIcon className="size-5" />}
        onPress={() => fileInputRef.current?.click()}
        type="button"
        isDisabled={selectedImages.length >= maximumFiles}
      >
        {buttonText || t("common.selectImage")}
      </Button>
    </>
  );
};

export default ImagesPicker;
