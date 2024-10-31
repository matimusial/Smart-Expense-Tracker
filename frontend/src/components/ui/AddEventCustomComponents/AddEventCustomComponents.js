import React from 'react';
import { LinearProgress, Box, Chip, Card, IconButton, Tooltip, RadioGroup, FormControlLabel, Radio, } from '@mui/material';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import InsertPhotoOutlinedIcon from '@mui/icons-material/InsertPhotoOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { motion } from 'framer-motion';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import InputLabel from "../InputLabel/InputLabel";
import DatePicker from "../DatePicker/DatePicker";

const CustomLinearProgress = ({
                                  marginLeft = '6%',
                                  marginRight = '2%',
                                  height = 2,
                                  backgroundColor = '#A0C4C4',
                                  barColor = '#e7f6f6',
                                  ...otherProps
                              }) => {
    return (
        <LinearProgress
            sx={{
                marginLeft: marginLeft,
                marginRight: marginRight,
                height: height,
                backgroundColor: backgroundColor,
                '& .MuiLinearProgress-bar': {
                    backgroundColor: barColor,
                },
                ...otherProps.sx,
            }}
            {...otherProps}
        />
    );
};

// Komponent CustomCategoryBox
const CustomCategoryBox = ({
                               categories,
                               selectedCategory,
                               setSelectedCategory,
                               iconSize = 'large',
                               gap = 2,
                               marginTop = '2%',
                               paddingRight = '10%',
                               selectedColor = '#A0C4C4',
                               unselectedColor = 'transparent',
                               ...otherProps
                           }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: gap,
                marginTop: marginTop,
                alignItems: 'center',
                paddingRight: paddingRight,
                ...otherProps.sx,
            }}
            {...otherProps}
        >
            <AutoAwesomeOutlinedIcon fontSize={iconSize} />
            {categories.map((item, index) => (
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
                            backgroundColor: selectedCategory === item.category ? selectedColor : unselectedColor,
                            "&:hover": {
                                backgroundColor: selectedCategory === item.category ? selectedColor : unselectedColor,
                            },
                        }}
                    />
                </motion.div>
            ))}
        </Box>
    );
};

// Komponent ConditionalTooltip
const ConditionalTooltip = ({ image, children }) => {
    if (!image) {
        return (
            <Tooltip
                title="Dokument nie powinien być zniszczony, ale równomiernie oświetlony, umieszczony na kontrastującym (najlepiej czarnym) tle oraz nie zawierać żadnych dodatkowych elementów poza tłem. Subtelne korekty perspektywy są dozwolone."
                arrow
            >
                {children}
            </Tooltip>
        );
    }
    return children;
};

// Komponent CustomCardWithTooltip
const InsertImageComponent = ({
                                   image,
                                   imageName,
                                   isImageTrimming,
                                   onHandleFileChange,
                                   handleRemoveImage,
                                   handleCardClick,
                                   ...otherProps
                               }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 2,
                marginTop: '2%',
                alignItems: 'center',
            }}
            {...otherProps}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <ConditionalTooltip image={image}>
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
                            accept="image/jpeg"
                            capture="environment"
                            onChange={onHandleFileChange}
                            style={{ display: 'none' }}
                        />
                    </Card>
                </ConditionalTooltip>
            </Box>
        </Box>
    );
};

const RadioDateImgBox = ({
                                  isExpenseChecked,
                                  setIsExpenseChecked,
                                  date,
                                  setDate,
                                  amount,
                                  setAmount,
                                  gap = 2,
                                  marginTop = '2%',
                                  marginBottom = '2%',
                                  paddingLeft = '2%',
                                  paddingRight = '2%',
                                  labelColor = '#333',
                                  ...otherProps
                              }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: gap,
                marginTop: marginTop,
                marginBottom: marginBottom,
                paddingLeft: paddingLeft,
                paddingRight: paddingRight,
                alignItems: 'center',
                ...otherProps.sx,
            }}
            {...otherProps}
        >
            <RadioGroup
                value={isExpenseChecked}
                onChange={(e) => setIsExpenseChecked(e.target.value === 'true')}
            >
                <FormControlLabel
                    value={true}
                    control={
                        <Radio
                            sx={{
                                '&.Mui-checked': {
                                    color: labelColor,
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
                                    color: labelColor,
                                },
                            }}
                        />
                    }
                    label="Przychód"
                />
            </RadioGroup>

            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pl">
                <DatePicker
                    label="Data transakcji"
                    value={date}
                    onChange={(newValue) => setDate(newValue)}
                    disableFuture = {true}
                    width='70%'
                />
            </LocalizationProvider>

            <InputLabel
                label="Kwota zł"
                type="number"
                inputProps={{ step: '0.01', min: '0' }}
                variant="outlined"
                value={amount}
                required={true}
                onChange={(e) => {
                    const value = e.target.value;
                    setAmount(value === '' ? '' : parseFloat(value));
                }}
                margin='none'
            />
        </Box>
    );
};

export { CustomLinearProgress, CustomCategoryBox, InsertImageComponent, RadioDateImgBox };
