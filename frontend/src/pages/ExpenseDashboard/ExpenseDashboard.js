import React, {useCallback, useEffect, useRef, useState} from 'react';
import Header from '../../components/layout/Header/Header';
import {Box, Paper, Typography} from '@mui/material';
import './ExpenseDashboard.css';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import {getEvents} from '../../utils/ProtectedApi';
import { calculateBalance } from './functions';
import WelcomeDialog from "../../components/dialogs/WelcomeDialog/WelcomeDialog";
import Confetti from "react-confetti";
import AddEventDialog from "../../components/dialogs/AddEventsDialogs/AddEventDialog";
import SubmitButton from "../../components/ui/SubmitButton/SubmitButton";

const ExpenseDashboard = () => {
    const [dateFrom, setDateFrom] = useState(dayjs().startOf('month'));
    const [dateTo, setDateTo] = useState(dayjs().endOf('month'));
    const [eventList, setEventList] = useState([]);
    const fetchingPerformed = useRef(false);
    const [possibleDateFrom, setPossibleDateFrom] = useState(null);
    const [balance, setBalance] = useState(0);
    const [incomes, setIncomes] = useState(0);
    const [expenses, setExpenses] = useState(0);
    const [isWelcomeDialogOpen, setIsWelcomeDialogOpen] = useState(false);
    const [isEventAddDialogOpen, setIsEventAddDialogOpen] = useState(false);

    const closeDialogs = useCallback(() => {
        setIsWelcomeDialogOpen(false);
        setIsEventAddDialogOpen(false);
    }, []);

    const openEventAddDialog = useCallback(()=> {
        closeDialogs();
        setIsEventAddDialogOpen(true);
    }, [closeDialogs]);

    const openWelcomeDialog = useCallback (()=> {
        closeDialogs();
        setIsWelcomeDialogOpen(true);
    }, [closeDialogs]);



    useEffect(() => {
        const fetchData = async () => {
            if (fetchingPerformed.current) return;

            fetchingPerformed.current = true;
            const data = await getEvents(dateFrom.format('YYYY-MM-DD'), dateTo.format('YYYY-MM-DD'));
            if (data == null) {
                openWelcomeDialog();
            } else {
                setEventList(data.events);
                setPossibleDateFrom(data.firstEventDate);
            }
        };

        fetchData();
        setBalance(calculateBalance(eventList)[2]);
        setIncomes(calculateBalance(eventList)[2]);
        setExpenses(calculateBalance(eventList)[0]);
    }, [dateFrom, dateTo]);


    return (
        <div>
            <Header />

            <div className="container">
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'auto auto auto',
                            gridTemplateRows: 'repeat(5, 1fr)',
                            gap: 2,
                            padding: 2,
                            width: '100%',
                            flexWrap: 'wrap',
                        }}
                    >
                        <Paper elevation={3} sx={{ gridColumn: '4 / 5', padding: 2 }}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        gap: 2,
                                    }}
                                >
                                    <DesktopDatePicker
                                        label="Data od"
                                        value={dateFrom}
                                        onChange={(newValue) => setDateFrom(newValue)}
                                        disableFuture
                                        minDate={dayjs(possibleDateFrom)}
                                        maxDate={dateTo}
                                        disabled={!!!possibleDateFrom}
                                        slotProps={{
                                            textField: {
                                                sx: {
                                                    width: '100%',
                                                    borderRadius: '8px',
                                                    borderColor: '#333',
                                                    '& .MuiInputBase-root': {
                                                        borderColor: 'gray',
                                                    },
                                                    '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderWidth: '1px',
                                                        borderColor: 'inherit',
                                                    },
                                                    '& .Mui-focused': {
                                                        color: '#333',
                                                        borderWidth: '1px',
                                                        borderColor: 'inherit',
                                                    },
                                                },
                                            },
                                        }}
                                    />
                                    <DesktopDatePicker
                                        label="Data do"
                                        value={dateTo}
                                        onChange={(newValue) => setDateTo(newValue)}
                                        minDate={dateFrom}
                                        maxDate={dayjs().endOf('month')}
                                        disabled={!!!possibleDateFrom}
                                        slotProps={{
                                            textField: {
                                                sx: {
                                                    width: '100%',
                                                    borderRadius: '8px',
                                                    borderColor: '#333',
                                                    '& .MuiInputBase-root': {
                                                        borderColor: 'gray',
                                                    },
                                                    '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderWidth: '1px',
                                                        borderColor: 'inherit',
                                                    },
                                                    '& .Mui-focused': {
                                                        color: '#333',
                                                        borderWidth: '1px',
                                                        borderColor: 'inherit',
                                                    },
                                                },
                                            },
                                        }}
                                    />
                                </Box>
                            </LocalizationProvider>
                        </Paper>
                        <Paper elevation={3} sx={{ padding: 2 }}>
                            <Typography variant="h6">Balans = {balance}</Typography>
                        </Paper>
                        <Paper elevation={3} sx={{ padding: 2 }}>
                            <Typography variant="h6">Wydatki zł = {expenses}</Typography>
                        </Paper>
                        <Paper elevation={3} sx={{ padding: 2 }}>
                            <Typography variant="h6">Przychody zł = {incomes}</Typography>
                        </Paper>
                        <Paper elevation={3} sx={{ gridColumn: '4 / 5', gridRow: '2 / 6', padding: 2 }}>
                            <Typography variant="h6">Historia</Typography>
                        </Paper>
                        <Paper elevation={3} sx={{ gridColumn: '1 / 4', padding: 2 }}>
                            <Typography variant="h6">Wykres</Typography>

                        </Paper>
                        <Paper elevation={3} sx={{ gridColumn: '1 / 3', gridRow: '4 / 6', padding: 2 }}>
                            <Typography variant="h6">Wykres kołowy</Typography>
                        </Paper>
                        <Paper elevation={3} sx={{ padding: 2 }}>
                            <SubmitButton
                                label="Dodaj wydatek"
                                type="button"
                                onClick={openEventAddDialog}
                                />
                        </Paper>
                        <Paper elevation={3} sx={{ padding: 2 }}>
                            <Typography variant="h6">Dodaj lidl/biedronka</Typography>
                        </Paper>
                    </Box>
                {isWelcomeDialogOpen && <Confetti />}
                <WelcomeDialog
                    open={isWelcomeDialogOpen}
                    onClose={closeDialogs}
                />

                <AddEventDialog
                    open={isEventAddDialogOpen}
                    onClose={closeDialogs}
                />
            </div>
        </div>
    );
};

export default ExpenseDashboard;
