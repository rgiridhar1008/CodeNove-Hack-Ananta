
"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog";
import Image from "next/image";

interface ImageLightBoxProps {
  imageUrl: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImageLightBox({ imageUrl, isOpen, onOpenChange }: ImageLightBoxProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 border-0 bg-transparent shadow-none max-w-4xl w-full">
        <div className="relative aspect-video w-full h-full">
          <Image
            src={imageUrl}
            alt="Grievance Image Lightbox"
            fill
            style={{ objectFit: 'contain' }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

    