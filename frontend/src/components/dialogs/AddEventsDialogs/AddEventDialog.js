import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    Chip,
    Dialog,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    IconButton,
    LinearProgress,
    Radio,
    RadioGroup,
    Tooltip, // Dodany import
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import 'dayjs/locale/pl';
import './loader.css';

import SubmitButton from "../../ui/SubmitButton/SubmitButton";

import InputLabel from '../../ui/InputLabel/InputLabel';
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import dayjs from "dayjs";
import InsertPhotoOutlinedIcon from '@mui/icons-material/InsertPhotoOutlined';
import {getCategory, registerUser, uploadAndProcessImage} from "../../../utils/PublicApi";
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import { motion } from 'framer-motion';
import ShowPictureDialog from "../ShowPictureDialog/ShowPictureDialog";
import {mapPolishToEnglish} from "../../../mappers/CategoryMapper";

dayjs.locale('pl');

const AddEventDialog = ({ open, onClose }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [imageName, setImageName] = useState("Dodaj paragon / fakturę");
    const [date, setDate] = useState(dayjs());
    const [insertLoading, setInsertLoading] = useState(false);
    const [isCategoryLoading, setIsCategoryLoading] = useState(false);
    const [categories, setCategories] = useState("");
    const [selectedCategory, setSelectedCategory] = useState('');
    const [isExpenseChecked, setIsExpenseChecked] = useState(true);
    const [isImageTrimming, setIsImageTrimming] = useState(false);
    const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);

    useEffect(() => {
        if (!open) {
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
            setIsImageTrimming(false);
            setIsImageDialogOpen(false);
        }
    }, [open]);

    const handleTitleBlur = async () => {
        if (title !== '') {
            setIsCategoryLoading(true);
            setCategories('');
            const data = await getCategory(title.toLowerCase(), 3);
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
            setIsCategoryLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setInsertLoading(true);
        const category = mapPolishToEnglish(selectedCategory);
        if (isFormValid()) {
            const userData = {
                firstName,
                email,
                username,
                password,
                conPassword
            };

            try {
                setRegistrationLoading(true);
                await registerUser(userData);
                setFirstName('');
                setEmail('');
                setUsername('');
                setPassword('');
                setConPassword('');
                setRegistrationLoading(false);
                openRegistrationSuccessDialog();
            } catch (error) {
                console.error('Registration error:', error);
                throw error;
            }
        }


    };

    const handleRemoveImage = () => {
        setImage(null);
        setImageName('Dodaj paragon / fakturę');
    };

    const handleFileChange = async (event) => {
        setIsImageTrimming(true);
        const file = event.target.files[0];
        if (file) {
            const trimmedName = file.name.length > 40 ? `...${file.name.slice(-40)}` : file.name;
            const imageUrl = await uploadAndProcessImage(file);
            setImageName(trimmedName);
            setImage(imageUrl);
        }
        setIsImageTrimming(false);
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


    const ConditionalTooltip = ({ children }) => {
        if (!image) {
            return (
                <Tooltip
                    title="Dokument powinien być równomiernie oświetlony, umieszczony na kontrastującym (najlepiej czarnym) tle oraz nie zawierać żadnych dodatkowych elementów poza tłem. Subtelne korekty perspektywy są dozwolone."
                    arrow
                >
                    {children}
                </Tooltip>
            );
        }
        return children;
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
                <form onSubmit={handleSubmit}>
                    <InputLabel
                        label="Tytuł"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={handleTitleBlur}
                        tabIndex={0}
                    />

                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: 2,
                            marginTop: '2%',
                            alignItems: 'center',
                            paddingRight: '10%',
                        }}
                    >
                        <AutoAwesomeOutlinedIcon size={40} />
                        {Object.values(categories).map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.2 }}
                            >
                                <Chip
                                    label={item.category}
                                    variant={selectedCategory === item.category ? 'filled' : 'outlined'}
                                    color={selectedCategory === item.category ? 'primary' : 'default'}
                                    onClick={() => setSelectedCategory(item.category)}
                                    tabIndex={-1}
                                    sx={{
                                        backgroundColor: selectedCategory === item.category ? '#A0C4C4' : 'transparent',
                                        "&:hover": {
                                            backgroundColor: selectedCategory === item.category ? '#A0C4C4' : 'transparent',
                                        },
                                    }}
                                />
                            </motion.div>
                        ))}
                    </Box>

                    {isCategoryLoading && (
                        <LinearProgress
                            sx={{
                                marginLeft: '6%',
                                marginRight: '2%',
                                height: 2,
                                backgroundColor: '#A0C4C4',
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: '#e7f6f6',
                                }
                            }}
                        />
                    )}

                    <InputLabel
                        label="Opis"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        tabIndex={0}
                        required={false}
                    />

                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: 2,
                            marginTop: '2%',
                            alignItems: 'center',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                            <ConditionalTooltip>
                                <Card
                                    onClick={handleCardClick}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '8px 16px',
                                        width: '100%',
                                        marginLeft: '20px',
                                        marginRight: '20px',
                                        boxShadow: 0,
                                        borderRadius: '8px',
                                        backgroundColor: '#f5f5f5',
                                        border: '1px solid #bcbcbc',
                                        borderColor: image ? '#333' : '#bcbcbc',
                                        cursor: 'pointer',
                                        height: '30px',
                                        borderWidth: image ? '1px' : '1px',
                                        transition: 'background-color 0.3s, box-shadow 0.3s, transform 0.3s',
                                        "&:hover": {
                                            borderWidth: image ? '1px' : '1px',
                                            borderColor: image ? 'inherit' : '#333',
                                        },
                                        position: 'relative',
                                    }}
                                >
                                    <label
                                        htmlFor="file-upload"
                                        style={{ display: 'flex', alignItems: 'center', flexGrow: 1, cursor: 'pointer' }}
                                    >
                                        <InsertPhotoOutlinedIcon sx={{ marginRight: 2 }} />
                                        <Box
                                            sx={{
                                                textAlign: 'center',
                                                flexGrow: 1,
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            {isImageTrimming ? (
                                                <Box
                                                    className="loader"
                                                    sx={{
                                                        position: 'absolute',
                                                        top: '50%',
                                                        left: '50%',
                                                        transform: 'translate(-50%, -50%)',
                                                    }}
                                                ></Box>
                                            ) : (
                                                <span>{imageName}</span>
                                            )}
                                        </Box>
                                    </label>
                                    {image && (
                                        <IconButton size="small" onClick={handleRemoveImage}>
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    )}

                                    <input
                                        id="file-upload"
                                        type="file"
                                        accept="image/png, image/jpeg"
                                        capture="environment"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                    />
                                </Card>
                            </ConditionalTooltip>
                        </Box>

                    </Box>

                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: 2,
                            marginTop: '2%',
                            marginBottom: '2%',
                            paddingLeft: '5%',
                            paddingRight: '5%',
                            alignItems: 'center',
                        }}
                    >
                        <RadioGroup
                            value={isExpenseChecked}
                            onChange={(e) => setIsExpenseChecked(e.target.value)}
                        >
                            <FormControlLabel
                                value={true}
                                control={
                                    <Radio
                                        sx={{
                                            '&.Mui-checked': {
                                                color: '#333',
                                            },
                                        }}
                                    />
                                }
                                label="Wydatek"
                            />
                            <FormControlLabel
                                value={false}
                                control={
                                    <Radio
                                        sx={{
                                            '&.Mui-checked': {
                                                color: '#333',
                                            },
                                        }}
                                    />
                                }
                                label="Przychód"
                            />
                        </RadioGroup>

                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pl">
                            <DesktopDatePicker
                                label="Data transakcji"
                                value={date}
                                onChange={(newValue) => setDate(newValue)}
                                disableFuture
                                slotProps={{
                                    textField: {
                                        sx: {
                                            width: '70%',
                                            borderRadius: '8px',
                                            borderColor: '#333',
                                            '& .MuiInputBase-root': {
                                                borderColor: 'gray',
                                            },
                                            '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderWidth: '1px',
                                                borderColor: '#333',
                                            },
                                            '& .Mui-focused': {
                                                color: '#333',
                                                borderWidth: '1px',
                                                borderColor: '#333',
                                            },
                                        },
                                    },
                                }}
                            />
                        </LocalizationProvider>
                    </Box>

                    <SubmitButton
                        label="Dodaj"
                        type="sumbit"
                        isLoading={insertLoading}
                    />
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddEventDialog;
