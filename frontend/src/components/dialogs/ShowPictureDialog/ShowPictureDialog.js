import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton, Tooltip} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import PrintIcon from '@mui/icons-material/Print';
import SubmitButton from "../../ui/SubmitButton/SubmitButton";

const ShowPictureDialog = ({ open, onClose, image }) => {
    const [zoom, setZoom] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [translateX, setTranslateX] = useState(0);
    const [translateY, setTranslateY] = useState(0);

    useEffect(() => {
        if (!open) {
            setZoom(1);
            setTranslateX(0);
            setTranslateY(0);
            setIsDragging(false);
        }
    }, [open]);

    const handleDialogClose = (event, reason) => {
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
            return;
        }
        onClose();
    };

    const handleSave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!image) return;
        const link = document.createElement('a');
        link.href = image;
        link.download = 'image.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleZoomIn = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setZoom((prevZoom) => Math.min(prevZoom + 0.2, 3));
    };

    const handleZoomOut = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setZoom((prevZoom) => {
            const newZoom = Math.max(prevZoom - 0.2, 1);
            if (newZoom === 1) {
                setTranslateX(0);
                setTranslateY(0);
            }
            return newZoom;
        });
    };

    const handlePrint = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!image) return;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html lang="pl">
                <head>
                    <title>Print Image</title>
                    <style>
                        body, html {
                            margin: 0;
                            padding: 0;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100%;
                        }
                        img {
                            max-width: 100%;
                            max-height: 100%;
                        }
                    </style>
                </head>
                <body>
                    <img src="${image}" alt="Do wydruku" />
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    const handleMouseDown = (e) => {
        if (zoom <= 1) return;
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        setStartX(e.clientX - translateX);
        setStartY(e.clientY - translateY);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const newX = e.clientX - startX;
        const newY = e.clientY - startY;
        setTranslateX(newX);
        setTranslateY(newY);
    };

    const handleMouseUp = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        setIsDragging(false);
    };

    const handleMouseLeave = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        setIsDragging(false);
    };

    const handleWheel = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.deltaY < 0) {
            handleZoomIn(e);
        } else {
            handleZoomOut(e);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleDialogClose}
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
            <DialogTitle style={{ textAlign: 'center', fontWeight: 'bold', position: 'relative' }}>
                Podgląd Zdjęcia
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
                    padding: '10px',
                    height: '100%',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {image ? (
                    <div
                        style={{
                            flexGrow: 1,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            overflow: 'hidden',
                            width: '90%',
                            maxHeight: '70%',
                            position: 'relative',
                            border: '1px solid #ddd',
                            borderRadius: '10px',
                            marginBottom: '10px',
                            cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                        }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeave}
                        onWheel={handleWheel}
                        onTouchStart={(e) => {
                            if (zoom <= 1) return;
                            const touch = e.touches[0];
                            setIsDragging(true);
                            setStartX(touch.clientX - translateX);
                            setStartY(touch.clientY - translateY);
                        }}
                        onTouchMove={(e) => {
                            if (!isDragging) return;
                            const touch = e.touches[0];
                            const newX = touch.clientX - startX;
                            const newY = touch.clientY - startY;
                            setTranslateX(newX);
                            setTranslateY(newY);
                        }}
                        onTouchEnd={(e) => {
                            if (!isDragging) return;
                            setIsDragging(false);
                        }}
                    >
                        <img
                            src={image}
                            alt="Podgląd zdjęcia"
                            style={{
                                transform: `scale(${zoom}) translate(${translateX / zoom}px, ${translateY / zoom}px)`,
                                transition: isDragging ? 'none' : 'transform 0.3s ease',
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                                userSelect: 'none',
                                pointerEvents: 'none',
                            }}
                            draggable="false"
                        />
                    </div>
                ) : (
                    <p>Upewnij się, że zdjęcie spełnia kryteria</p>
                )}

                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <Tooltip title="Zapisz do pliku">
                        <span>
                            <IconButton
                                color="primary"
                                onClick={handleSave}
                                disabled={!image}
                                type="button"
                            >
                                <SaveAltIcon />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title="Powiększ">
                        <span>
                            <IconButton
                                color="primary"
                                onClick={handleZoomIn}
                                disabled={!image || zoom >= 3}
                                type="button"
                            >
                                <ZoomInIcon />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title="Pomniejsz">
                        <span>
                            <IconButton
                                color="primary"
                                onClick={handleZoomOut}
                                disabled={!image || zoom <= 1}
                                type="button"
                            >
                                <ZoomOutIcon />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title="Drukuj">
                        <span>
                            <IconButton
                                color="primary"
                                onClick={handlePrint}
                                disabled={!image}
                                type="button"
                            >
                                <PrintIcon />
                            </IconButton>
                        </span>
                    </Tooltip>
                </div>

                <SubmitButton
                    onClick={onClose}
                    type="button"
                    label="Zamknij"
                />

            </DialogContent>
        </Dialog>
    );

};

export default ShowPictureDialog;
