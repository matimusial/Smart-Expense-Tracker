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

import { handleTitleBlur, handleSubmit } from "./addEventHandlers";
import { mapPolishToEnglish } from "../../../mappers/CategoryMapper";
import {
    CustomLinearProgress,
    CustomCategoryBox,
    InsertImageComponent,
    RadioDateImgBox,
    CustomPaymentMethodBox
} from "../../ui/AddEventCustomComponents/AddEventCustomComponents";
import { uploadAndProcessImage } from "../../../utils/PublicApi";
import { mapPolishToEnglishPaymentType } from "../../../mappers/PaymentTypeMapper";

dayjs.locale('pl');

const AddBiedronkaLidlDialog = ({ open, onClose, onEventAdded }) => {

    const [title, setTitle] = useState('Zakupy spożywcze');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [imageName, setImageName] = useState("Dodaj paragon / fakturę");
    const [date, setDate] = useState(dayjs());
    const [insertLoading, setInsertLoading] = useState(false);
    const [isCategoryLoading, setIsCategoryLoading] = useState(false);
    const [categories, setCategories] = useState({});
    const [selectedCategory, setSelectedCategory] = useState('zakupy codzienne');
    const [isExpenseChecked, setIsExpenseChecked] = useState(true);
    const [isImageTrimming, setIsImageTrimming] = useState(false);
    const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
    const [imageBase64, setImageBase64] = useState(null);
    const [error, setError] = useState(false);
    const [errorKey, setErrorKey] = useState(0);

    const [nip, setNip] = useState('');
    const [paymentType, setPaymentType] = useState('KARTA');
    const [transactionNumber, setTransactionNumber] = useState('');

    const resetForm = () => {
        setTitle('Zakupy spożywcze');
        setDescription('');
        setImage(null);
        setImageName("Dodaj paragon / fakturę");
        setDate(dayjs());
        setAmount('');
        setInsertLoading(false);
        setIsCategoryLoading(false);
        setCategories({});
        setSelectedCategory('zakupy codzienne');
        setIsExpenseChecked(true);
        setIsImageTrimming(false);
        setIsImageDialogOpen(false);
        setImageBase64(null);
        setError(false);
        setNip('');
        setPaymentType('KARTA');
        setTransactionNumber('');
    }

    useEffect(() => {
        if (!open) {
            resetForm();
        }
    }, [open]);

    useEffect(() => {
        if (image) {
            setIsImageDialogOpen(true);
        }
    }, [image]);

    const base64ToBlob = (base64, mime) => {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mime });
    };

    const onHandleTitleBlur = () => {
        handleTitleBlur(title, setIsCategoryLoading, setCategories, setSelectedCategory);
    };

    const handleRemoveImage = () => {
        setImage(null);
        setImageName('Dodaj paragon / fakturę');
        setImageBase64(null);
        setError(false);
        setNip('');
        setPaymentType('KARTA');
        setTransactionNumber('');
        setDate(dayjs());
        setAmount('');
    };

    const handleImageDialogClose = () => {
        setIsImageDialogOpen(false);
    };

    const handleImageDialogOpen = () => {
        setIsImageDialogOpen(true);
    };

    const handleCardClick = (event) => {
        if (image) {
            event.preventDefault();
        }
    };


    const processImageFunction = async (event) => {
        const file = event.target.files[0];

        const trimmedName = file.name.length > 40 ? `...${file.name.slice(-40)}` : file.name;
        setIsImageTrimming(true);
        setError(false);

        try {
            const originalImageUrl = URL.createObjectURL(file);
            const data = await uploadAndProcessImage(file);

            if (data.yolo_image) {
                setImage(URL.createObjectURL(base64ToBlob(data.yolo_image, 'image/jpeg')));
                setImageBase64(data.trimmed_image);
                setNip(data.ocr_data.nip || '');
                setPaymentType(data.ocr_data.payment_type || 'KARTA');
                setAmount(data.ocr_data.sum || '');
                setTransactionNumber(data.ocr_data.transaction_number || '');
                setDate(dayjs(data.ocr_data.date));
            } else {
                setImage(originalImageUrl);
                setImageBase64(data.trimmed_image);
            }
            setImageName(trimmedName);
        } catch (err) {
            console.error('Błąd podczas przetwarzania obrazu:', err);
            setError(true);
        } finally {
            setIsImageTrimming(false);
        }
    };

    const onHandleSubmit = (e) => {
        e.preventDefault();
        const formData = {
            title,
            category: mapPolishToEnglish(selectedCategory),
            amount,
            date: date.format('YYYY-MM-DD'),
            base64String: imageBase64,
            description,
            type: isExpenseChecked ? 'EXPENSE' : 'INCOME',
            nip,
            paymentType: mapPolishToEnglishPaymentType(paymentType),
            invoiceNumber: transactionNumber
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
                        required
                    />

                    <CustomCategoryBox
                        categories={Object.values(categories)}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                    />

                    {isCategoryLoading && (
                        <CustomLinearProgress />
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
                        isImageTrimming={isImageTrimming}
                        onHandleFileChange={processImageFunction}
                        handleRemoveImage={handleRemoveImage}
                        handleCardClick={handleCardClick}
                        openImageDialog={handleImageDialogOpen}
                    />

                    <InputLabel
                        label="NIP"
                        value={nip}
                        onChange={(e) => setNip(e.target.value)}
                        tabIndex={0}
                        required={false}
                    />

                    <InputLabel
                        label="Numer faktury"
                        value={transactionNumber}
                        onChange={(e) => setTransactionNumber(e.target.value)}
                        tabIndex={0}
                        required={false}
                    />

                    <CustomPaymentMethodBox
                        selectedPaymentMethod={paymentType}
                        setPaymentMethod={setPaymentType}
                    />

                    <RadioDateImgBox
                        isExpenseChecked={true}
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

                    {error &&
                        <div className="error-message" key={errorKey}>
                            Wystąpił błąd podczas dodawania transakcji. Spróbuj ponownie.
                        </div>
                    }
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddBiedronkaLidlDialog;
