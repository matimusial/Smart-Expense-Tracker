import { getCategory } from "../../../utils/PublicApi";
import { addEventUser } from "../../../utils/ProtectedApi";


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
        } finally {
            setIsCategoryLoading(false);
        }
    }
};


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
