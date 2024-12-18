import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import 'dayjs/locale/pl';
import './loader.css';

import SubmitButton from "../../ui/SubmitButton/SubmitButton";
import InputLabel from '../../ui/InputLabel/InputLabel';
import dayjs from "dayjs";
import ShowPictureDialog from "../ShowPictureDialog/ShowPictureDialog";

import {handleTitleBlur, handleSubmit} from "./addEventHandlers";
import {mapPolishToEnglish} from "../../../mappers/CategoryMapper";
import {
    CustomLinearProgress,
    CustomCategoryBox,
    InsertImageComponent,
    RadioDateImgBox
} from "../../ui/AddEventCustomComponents/AddEventCustomComponents";

dayjs.locale('pl');

const AddEventDialog = ({ open, onClose, onEventAdded }) => {
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [imageName, setImageName] = useState("Dodaj paragon / fakturę");
    const [date, setDate] = useState(dayjs());
    const [insertLoading, setInsertLoading] = useState(false);
    const [isCategoryLoading, setIsCategoryLoading] = useState(false);
    const [categories, setCategories] = useState("");
    const [selectedCategory, setSelectedCategory] = useState('');
    const [isExpenseChecked, setIsExpenseChecked] = useState(true);
    const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
    const [imageBase64, setImageBase64] = useState(null);
    const [error, setError] = useState(false);
    const [errorKey, setErrorKey] = useState(0);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setImage(null);
        setImageName("Dodaj paragon / fakturę");
        setDate(dayjs());
        setInsertLoading(false);
        setIsCategoryLoading(false);
        setCategories("");
        setSelectedCategory('');
        setIsExpenseChecked(true);
        setIsImageDialogOpen(false);
        setImageBase64(null);
        setError(false);
    }

    useEffect(() => {
        if (!open) {
            resetForm();
        }
    }, [open]);

    const onHandleTitleBlur = () => {
        handleTitleBlur(title, setIsCategoryLoading, setCategories, setSelectedCategory);
    };

    const handleImageDialogOpen = () => {
        setIsImageDialogOpen(true);
    };

    const onHandleSubmit = (e) => {
        const formData = {
            title,
            category: mapPolishToEnglish(selectedCategory),
            amount,
            date: date.format('YYYY-MM-DD'),
            base64String: imageBase64,
            description,
            type: isExpenseChecked ? 'EXPENSE' : 'INCOME'
        };
        handleSubmit(
            e,
            formData,
            resetForm,
            onClose,
            onEventAdded,
            setError,
            setInsertLoading,
            errorKey,
            setErrorKey
        );
    };

    const setImageFunction = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const trimmedName = file.name.length > 40 ? `...${file.name.slice(-40)}` : file.name;
            try {
                const imageUrl = URL.createObjectURL(file);
                setImage(imageUrl);
                setImageName(trimmedName);

                const base64 = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result.split(',')[1]);
                    reader.onerror = () => reject('Błąd konwersji pliku na Base64');
                    reader.readAsDataURL(file);
                });
                setImageBase64(base64);
            } catch (error) {
                console.error('Błąd podczas przetwarzania obrazu:', error);
            }
        }
    };

    const handleRemoveImage = () => {
        setImage(null);
        setImageName('Dodaj paragon / fakturę');
        setImageBase64(null);
    };

    useEffect(() => {
        if (image) {
            setIsImageDialogOpen(true);
        }
    }, [image]);

    const handleImageDialogClose = () => {
        setIsImageDialogOpen(false);
    };

    const handleCardClick = (event) => {
        if (image) {
            event.preventDefault();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{ style: { borderRadius: '15px', padding: '20px', width: '100%' } }}
        >
            <ShowPictureDialog
                open={isImageDialogOpen}
                onClose={handleImageDialogClose}
                image={image}
            />

            <DialogTitle style={{ textAlign: 'center', fontWeight: 'bold' }}>
                Dodaj transakcję
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    style={{ position: 'absolute', right: 8, top: 8, color: '#999' }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <form onSubmit={onHandleSubmit}>
                    <InputLabel
                        label="Tytuł"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={onHandleTitleBlur}
                        tabIndex={0}
                    />

                    <CustomCategoryBox
                        categories={Object.values(categories)}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                    />

                    {isCategoryLoading && (
                        <CustomLinearProgress/>
                    )}

                    <InputLabel
                        label="Opis"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        tabIndex={0}
                        required={false}
                    />

                    <InsertImageComponent
                        image={image}
                        imageName={imageName}
                        onHandleFileChange={setImageFunction}
                        handleRemoveImage={handleRemoveImage}
                        handleCardClick={handleCardClick}
                        openImageDialog={handleImageDialogOpen}
                    />

                    <RadioDateImgBox
                        isExpenseChecked={isExpenseChecked}
                        setIsExpenseChecked={setIsExpenseChecked}
                        date={date}
                        setDate={setDate}
                        amount={amount}
                        setAmount={setAmount}
                    />

                    <SubmitButton
                        label="Dodaj"
                        type="submit"
                        isLoading={insertLoading}
                    />

                    {error ?
                        <div className="error-message" key={errorKey}>
                            Wystąpił błąd podczas dodawania transakcji. Spróbuj ponownie.
                        </div> : null}
                </form>
            </DialogContent>
        </Dialog>
    );

};

export default AddEventDialog;
