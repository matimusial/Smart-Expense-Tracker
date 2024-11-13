import React, {useEffect, useState} from 'react';
import {
    Dialog,
    DialogContent,
    IconButton,
    Slide
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TagFacesIcon from '@mui/icons-material/TagFaces';
import { styled } from '@mui/system';
import SubmitButton from "../../ui/SubmitButton/SubmitButton";
import {addDemoEvents} from "../../../utils/ProtectedApi";

const BounceAnimation = styled('div')`
    @keyframes bounce {
        0% {
            transform: translateY(-100%);
        }
        70% {
            transform: translateY(20px);
        }
        100% {
            transform: translateY(0);
        }
    }

    animation: bounce 1s ease-in-out;
`;



const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="down" ref={ref} {...props} timeout={{ enter: 500, exit: 500 }} />;
});

const WelcomeDialog = ({ open, onClose, onDemoSuccess }) => {
    const [isLoadingDemo, setIsLoadingDemo] = useState(false);
    const [errorKey, setErrorKey] = useState(0);
    const [error, setError] = useState(false);


    useEffect(() => {
        if (!open) {
            setErrorKey(0);
            setError(false);
        }
    }, [error, open]);


    const handleDemo = async (e) => {
        e.preventDefault();
        setErrorKey(prevKey => prevKey + 1);
        setIsLoadingDemo(true);
        const hasError = await addDemoEvents();
        setError(hasError);
        setIsLoadingDemo(false);
        if (!hasError){
            onClose();
            if(onDemoSuccess) onDemoSuccess();
        }
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            TransitionComponent={Transition}
            PaperProps={{
                style: { borderRadius: '15px', padding: '20px', top: '-200px' },
                component: BounceAnimation
            }}
        >
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    style={{ position: 'absolute', right: 8, top: 8, color: '#999' }}
                >
                    <CloseIcon />
                </IconButton>
            <DialogContent style={{textAlign: 'center'}}>
                <div className="welcome-message">Drogi użytkowniku!</div>
                <TagFacesIcon style={{fontSize: '5rem', color: 'green'}}/>
                <p>Dziękujemy za wybranie naszej aplikacji do zarządzania wydatkami!</p>
                <p>Zachęcamy do skorzystania z bezpłatnej wersji demo</p>
                <strong>Transakcje w demo są w datach 2023-01-02/2024-09-30</strong>
                <SubmitButton
                    label="Wypróbuj demo"
                    onClick={handleDemo}
                    isLoading={isLoadingDemo}
                />
                {error ?
                    <div className="error-message" key={errorKey}>
                        Wystąpił błąd.
                    </div> : null}


            </DialogContent>
        </Dialog>
    );
};

export default WelcomeDialog;
