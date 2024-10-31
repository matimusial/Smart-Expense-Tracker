import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import ShowPictureDialog from "../../dialogs/ShowPictureDialog/ShowPictureDialog";
import SubmitButton from "../../ui/SubmitButton/SubmitButton";

const WideExtendedSingleEvent = ({ event }) => {
    const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
    const [image, setImage] = useState(null);

    const handleImageDialogOpen = (e) => {
        e.stopPropagation();
        if (event.receiptImage && event.receiptImage.length > 0) {
            try {
                const base64Prefix = "data:image/jpeg;base64,";
                const imageUrl = `${base64Prefix}${event.receiptImage}`;
                setImage(imageUrl);
                setIsImageDialogOpen(true);
            } catch (error) {
                console.error('Błąd podczas konwersji obrazu na Base64:', error);
            }
        }
    };

    const handleImageDialogClose = () => {
        setIsImageDialogOpen(false);
        setImage(null);
    };

    return (
        <Box
            display="flex"
            alignItems="center"
            p={2}
            sx={{
                backgroundColor: event.type === 'Wydatek' ? '#ffecec' : '#e8ffeb',
                marginTop: 2,
                borderRadius: 2,
                '&:hover': {
                    backgroundColor: event.type === 'Wydatek' ? '#ffdede' : '#d9f5db',
                    cursor: 'pointer',
                },
            }}
        >

            {/* Tytuł i data na początku */}
            <Box display="flex" flexDirection="column" alignItems="flex-start" mr={2}>
                <Typography variant="h6" fontWeight="bold">
                    {event.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {event.date}
                </Typography>
            </Box>

            {/* Pusty Box jako wypełnienie */}
            <Box flex="1" mr={2} />

            {event.invoiceNumber && (
                <Box mr={2}>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Numer faktury:</strong> {event.invoiceNumber}
                    </Typography>
                </Box>
            )}

            {event.paymentType && (
                <Box mr={2}>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Typ płatności:</strong> {event.paymentType}
                    </Typography>
                </Box>
            )}

            {event.nip && (
                <Box mr={2}>
                    <Typography variant="body2" color="text.secondary">
                        <strong>NIP:</strong> {event.nip}
                    </Typography>
                </Box>
            )}

            {event.description && (
                <Box mr={2}>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Opis:</strong> {event.description}
                    </Typography>
                </Box>
            )}

            {/* Przycisk do pokazania zdjęcia */}
            {event.receiptImage && (
                <Box mr={2}>
                    <SubmitButton
                        label="Pokaż zdjęcie"
                        onClick={handleImageDialogOpen}
                        sx={{
                            minWidth: '120px',
                        }}
                    />
                </Box>
            )}

            <Box display="flex" alignItems="center" ml={2}>
                <Typography variant="h6" fontWeight="bold">
                    {event.type === 'Wydatek' ? `-${event.amount.toFixed(2)} zł` : `+${event.amount.toFixed(2)} zł`}
                </Typography>
            </Box>

            <ShowPictureDialog
                open={isImageDialogOpen}
                onClose={handleImageDialogClose}
                image={image}
            />
        </Box>
    );
};

export default WideExtendedSingleEvent;
