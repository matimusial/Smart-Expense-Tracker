import React from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SubmitButton from "../../ui/SubmitButton/SubmitButton";

const ShowPictureDialog = ({ open, onClose, image }) => {

    const handleSubmit = async (e) => {
        e.preventDefault();
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                style: {
                    borderRadius: '15px',
                    padding: '20px',
                    width: `600px`,
                    height: `600px`,
                    maxWidth: '600px',
                    maxHeight: '600px',
                }
            }}
        >
            <DialogTitle style={{ textAlign: 'center', fontWeight: 'bold' }}>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    style={{ position: 'absolute', right: 8, top: 8, color: '#999' }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    height: '100%',
                }}
            >
                <div className="welcome-message">Zdjęcie po wycięciu</div>
                {image ? (
                    <div style={{
                        flexGrow: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        overflow: 'hidden',
                        width: '100%',
                        maxHeight: '70%',
                        position: 'relative',
                    }}>
                        <img
                            src={image}
                            alt="Podgląd zdjęcia"
                            style={{
                                maxWidth: '80%',
                                maxHeight: '80%',
                                objectFit: 'contain',
                            }}
                        />
                    </div>
                ) : (
                    <p>Upewnij się, że zdjęcie spełnia kryteria</p>
                )}

                <SubmitButton label="Zamknij" onClick={handleSubmit} />

            </DialogContent>
        </Dialog>
    );
};

export default ShowPictureDialog;
