'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';

interface LocalPhotoContainerProps {
    children: React.ReactNode;
}

export default function LocalPhotoContainer({ children }: LocalPhotoContainerProps) {
    const params = useParams();
    const photoIndex = params.photoIndex as string;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={photoIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="room-photo-page__image-container"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
