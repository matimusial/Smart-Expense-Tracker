import { getCategory, uploadAndProcessImage } from "../../../utils/PublicApi";
import { addEventUser } from "../../../utils/ProtectedApi";
import {Tooltip} from "@mui/material";
import React from "react";

/**
 * Obsługuje zdarzenie utraty fokusu pola tytułu.
 * @param {string} title - Aktualna wartość tytułu.
 * @param {function} setIsCategoryLoading - Funkcja ustawiająca stan ładowania kategorii.
 * @param {function} setCategories - Funkcja ustawiająca dostępne kategorie.
 * @param {function} setSelectedCategory - Funkcja ustawiająca wybraną kategorię.
 */
export const handleTitleBlur = async (title, setIsCategoryLoading, setCategories, setSelectedCategory) => {
    if (title.trim() !== '') {
        setIsCategoryLoading(true);
        setCategories('');
        try {
            const data = await getCategory(title.toLowerCase(), 2);
            let updatedCategories;
            if (Object.values(data)[0].score <= 0.5) {
                updatedCategories = {
                    category_others: { category: 'inne', score: 0 },
                    ...data,
                };
            } else {
                updatedCategories = {
                    ...data,
                    category_others: { category: 'inne', score: 0 },
                };
            }
            setCategories(updatedCategories);
            setSelectedCategory(Object.values(updatedCategories)[0].category);
        } catch (error) {
            console.error('Błąd podczas pobierania kategorii:', error);
            // Opcjonalnie możesz ustawić stan błędu tutaj
        } finally {
            setIsCategoryLoading(false);
        }
    }
};

/**
 * Obsługuje zdarzenie przesłania formularza.
 * @param {object} event - Obiekt zdarzenia.
 * @param {object} formData - Gotowe dane formularza.
 * @param {function} resetForm - Funkcja resetująca formularz.
 * @param {function} onClose - Funkcja zamykająca dialog.
 * @param {function} onEventAdded - Funkcja wywoływana po dodaniu zdarzenia.
 * @param {function} setError - Funkcja ustawiająca stan błędu.
 * @param {function} setInsertLoading - Funkcja ustawiająca stan ładowania.
 * @param {number} errorKey - Klucz błędu dla React.
 * @param {function} setErrorKey - Funkcja ustawiająca klucz błędu.
 */
export const handleSubmit = async (
    event,
    formData,
    resetForm,
    onClose,
    onEventAdded,
    setError,
    setInsertLoading,
    errorKey,
    setErrorKey
) => {
    event.preventDefault();
    setErrorKey(prevKey => prevKey + 1);
    setInsertLoading(true);

    try {
        const response = await addEventUser(formData);
        if (!response) {
            setError(true);
            setInsertLoading(false);
            return;
        }
        resetForm();
        setInsertLoading(false);
        onClose();
        if (onEventAdded) onEventAdded();
    } catch (error) {
        console.error('Błąd podczas dodawania zdarzenia:', error);
        setError(true);
        setInsertLoading(false);
    }
};

/**
 * Obsługuje zmianę pliku (upload obrazka).
 * @param {object} event - Obiekt zdarzenia.
 * @param {function} setIsImageTrimming - Funkcja ustawiająca stan przycinania obrazu.
 * @param {function} setImage - Funkcja ustawiająca obraz.
 * @param {function} setImageName - Funkcja ustawiająca nazwę obrazu.
 * @param {function} setImageBase64 - Funkcja ustawiająca base64 obrazu.
 */
export const handleFileChange = async (event, setIsImageTrimming, setImage, setImageName, setImageBase64) => {
    setIsImageTrimming(true);
    const file = event.target.files[0];
    if (file) {
        const trimmedName = file.name.length > 40 ? `...${file.name.slice(-40)}` : file.name;
        try {
            const processedImageBlob = await uploadAndProcessImage(file);
            if (processedImageBlob) {
                const imageUrl = URL.createObjectURL(processedImageBlob);
                setImage(imageUrl);
                setImageName(trimmedName);

                const base64 = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result.split(',')[1]);
                    reader.onerror = () => reject('Błąd konwersji Blob na Base64');
                    reader.readAsDataURL(processedImageBlob);
                });
                setImageBase64(base64);
            } else {
                console.error('Przetwarzanie obrazu nie powiodło się.');
            }
        } catch (error) {
            console.error('Błąd podczas przetwarzania obrazu:', error);
            // Opcjonalnie możesz ustawić stan błędu tutaj
        }
    }
    setIsImageTrimming(false);
};
