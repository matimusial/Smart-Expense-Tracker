import React, {useEffect, useState} from 'react';
import { Box, Typography, Avatar, Button } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ShowPictureDialog from "../../dialogs/ShowPictureDialog/ShowPictureDialog";
import SubmitButton from "../../ui/SubmitButton/SubmitButton";

const SingleEvent = ({ event, color, onEventClick }) => {
    useEffect(() => {}, [color, event]);

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
                    {event.type === 'Wydatek' ? `-${event.amount.toFixed(2)} zł` : `+${event.amount.toFixed(2)} zł`}
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
                const base64Prefix = "data:image/jpeg;base64,";
                const imageUrl =`${base64Prefix}${event.receiptImage}`;
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
            flexDirection="column"
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
                        {event.type === 'Wydatek' ? `-${event.amount.toFixed(2)} zł` : `+${event.amount.toFixed(2)} zł`}
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
                <SubmitButton
                    label="Pokaż zdjęcie"
                    onClick={handleImageDialogOpen}
                    sx={{
                        minWidth: '120px',
                    }}
                />
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
