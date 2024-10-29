import React, {useEffect, useState} from 'react';
import { Box, Typography, Avatar, Button } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ShowPictureDialog from "../../dialogs/ShowPictureDialog/ShowPictureDialog";

const SingleEvent = ({ event, color, onEventClick }) => {
    useEffect(() => {}, [color, event]);

    return (
        <Box
            display="flex"
            alignItems="center"
            p={2}
            sx={{
                backgroundColor: '#f4f8fb',
                marginTop: 2,
                borderRadius: 2,
                '&:hover': {
                    backgroundColor: '#e0f2f1',
                    cursor: 'pointer',
                },
            }}
            onClick={() => onEventClick({event, color})}
        >
            <Avatar sx={{ bgcolor: color, width: 40, height: 40, mr: 2 }}>
                {event.title.charAt(0).toUpperCase()}
            </Avatar>
            <Box flex="1">
                <Typography variant="body1" fontWeight="bold">
                    {event.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {event.date}
                </Typography>
            </Box>
            <Box display="flex" alignItems="center">
                <Typography variant="body1" fontWeight="bold" mr={0.5}>
                    {event.amount} zł
                </Typography>
                <KeyboardArrowDownIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            </Box>
        </Box>
    );
};


const ExtendedSingleEvent = ({ event, color, onEventClick }) => {
    const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
    const [image, setImage] = useState(null);

    const handleImageDialogOpen = (e) => {
        e.stopPropagation();
        if (event.receiptImage && event.receiptImage.length > 0) {
            try {
                // Tworzenie URL obrazu bezpośrednio z base64
                const imageUrl = `data:image/jpeg;base64,${event.receiptImage}`;
                console.log("Stworzony URL obrazu z Base64:", imageUrl);
                setImage(imageUrl);
                setIsImageDialogOpen(true);
            } catch (error) {
                console.error('Błąd podczas konwersji obrazu na Base64:', error);
            }
        } else {
            console.log("Dane receiptImage są puste.");
        }
    };



    const handleImageDialogClose = () => {
        setIsImageDialogOpen(false);
        setImage(null);
    };

    return (
        <Box
            display="flex"
            flexDirection="column"
            p={2}
            sx={{
                backgroundColor: '#f4f8fb',
                marginTop: 2,
                borderRadius: 2,
                '&:hover': {
                    backgroundColor: '#e0f2f1',
                    cursor: 'pointer',
                },
            }}
            onClick={() => onEventClick({ event, color })}
        >
            <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: color, width: 40, height: 40, mr: 2 }}>
                    {event.title.charAt(0).toUpperCase()}
                </Avatar>
                <Box flex="1">
                    <Typography variant="h6" fontWeight="bold">
                        {event.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {event.date}
                    </Typography>
                </Box>
                <Box display="flex" alignItems="center">
                    <Typography variant="h6" fontWeight="bold" mr={0.5}>
                        {event.amount} zł
                    </Typography>
                    <KeyboardArrowUpIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </Box>
            </Box>

            {/* Wyświetlanie pól tylko wtedy, gdy mają zawartość */}
            {event.category && (
                <Box mb={1}>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Kategoria:</strong> {event.category}
                    </Typography>
                </Box>
            )}
            {event.invoiceNumber && (
                <Box mb={1}>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Numer faktury:</strong> {event.invoiceNumber}
                    </Typography>
                </Box>
            )}
            {event.paymentType && (
                <Box mb={1}>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Typ płatności:</strong>{' '}
                        {event.paymentType}
                    </Typography>
                </Box>
            )}
            {event.nip && (
                <Box mb={1}>
                    <Typography variant="body2" color="text.secondary">
                        <strong>NIP:</strong> {event.nip}
                    </Typography>
                </Box>
            )}
            {event.description && (
                <Box mb={1}>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Opis:</strong> {event.description}
                    </Typography>
                </Box>
            )}
            {event.type && (
                <Box mb={1}>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Typ wydarzenia:</strong> {event.type}
                    </Typography>
                </Box>
            )}
            {/* Opcjonalny przycisk do wyświetlenia zdjęcia */}
            {event.receiptImage && (
                <Button variant="outlined" color="primary" onClick={handleImageDialogOpen}>
                    Pokaż zdjęcie
                </Button>
            )}

            {/* Komponent dialogu do wyświetlania zdjęcia */}
            {image && (
                <ShowPictureDialog
                    open={isImageDialogOpen}
                    onClose={handleImageDialogClose}
                    image={image}
                />
            )}
        </Box>
    );
};

export { SingleEvent, ExtendedSingleEvent };
