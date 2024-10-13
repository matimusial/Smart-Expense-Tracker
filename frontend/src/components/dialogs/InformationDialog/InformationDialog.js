import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Fade
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Fade ref={ref} {...props} timeout={{ enter: 750, exit: 0 }} />;
});

const InformationDialog = ({ open, onClose, title, message, icon: IconComponent }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            TransitionComponent={Transition}
            PaperProps={{ style: { borderRadius: '15px', padding: '20px' } }}
        >
            <DialogTitle style={{ textAlign: 'center', fontWeight: 'bold' }}>
                {title}
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    style={{ position: 'absolute', right: 8, top: 8, color: '#999' }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent style={{ textAlign: 'center' }}>
                {IconComponent && <IconComponent style={{ fontSize: '5rem'}} />}
                <p>{message}</p>
            </DialogContent>
        </Dialog>
    );
};

export default InformationDialog;
