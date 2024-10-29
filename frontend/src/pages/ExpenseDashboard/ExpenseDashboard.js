import React, {useCallback, useEffect, useState} from 'react';
import Header from '../../components/layout/Header/Header';
import {Box, Paper, Skeleton, Typography} from '@mui/material';
import './ExpenseDashboard.css';
import DatePicker from '../../components/ui/DatePicker/DatePicker';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import {getEvents} from '../../utils/ProtectedApi';
import {calculateBalance} from './functions';
import WelcomeDialog from "../../components/dialogs/WelcomeDialog/WelcomeDialog";
import Confetti from "react-confetti";
import AddEventDialog from "../../components/dialogs/AddEventsDialogs/AddEventDialog";
import SubmitButton from "../../components/ui/SubmitButton/SubmitButton";
import BalanceIcon from '@mui/icons-material/Balance';
import SavingsIcon from '@mui/icons-material/Savings';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import { mapEnglishToPolish } from '../../mappers/CategoryMapper';
import 'dayjs/locale/pl';
import ExpensePieChart from "../../components/charts/ExpensePieChart";
import ExpenseIncomeBarChart from "../../components/charts/IncomeExpenseBarChart";
import HistoryContainer from "../../components/layout/HistoryContainer/HistoryContainer";
import {mapEnglishToPolishPaymentType} from "../../mappers/PaymentTypeMapper";
import {mapEnglishToPolishEventType} from "../../mappers/EventTypeMapper";

dayjs.locale('pl');
const ExpenseDashboard = () => {
    const [dateFrom, setDateFrom] = useState(dayjs().startOf('month'));
    const [dateTo, setDateTo] = useState(dayjs().endOf('month'));
    const [eventList, setEventList] = useState([]);
    const [possibleDateFrom, setPossibleDateFrom] = useState(null);
    const [balance, setBalance] = useState(0);
    const [incomes, setIncomes] = useState(0);
    const [expenses, setExpenses] = useState(0);
    const [isWelcomeDialogOpen, setIsWelcomeDialogOpen] = useState(false);
    const [isEventAddDialogOpen, setIsEventAddDialogOpen] = useState(false);
    const [demoLoaded, setDemoLoaded] = useState(false);
    const [eventAdded, setEventAdded] = useState(false);

    const [isLoading, setIsLoading] = useState(true);




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
            setIsLoading(true);
            const data = await getEvents(dateFrom.format('YYYY-MM-DD'), dateTo.format('YYYY-MM-DD'));
            if (data == null) {
                openWelcomeDialog();
            } else {
                const events = data.events;
                events.forEach(event => {
                    const category = event.category;
                    event.category = mapEnglishToPolish(category);
                    if (event.paymentType) {
                        const paymentType = event.paymentType;
                        event.paymentType = mapEnglishToPolishPaymentType(paymentType);
                    }
                    const type = event.type;
                    event.type = mapEnglishToPolishEventType(type);
                });
                setEventList(events);
                setPossibleDateFrom(data.firstEventDate);
            }
            setIsLoading(false);
        };


        fetchData();
        if (eventAdded) {
            setEventAdded(false);
        }
    }, [dateFrom, dateTo, demoLoaded, eventAdded, openWelcomeDialog]);


    useEffect(() => {
        const [incomes, expenses, balance] = calculateBalance(eventList);
        setExpenses(expenses);
        setIncomes(incomes);
        setBalance(balance);
    }, [eventList]);


    return (
        <div>
            <Header />

            {isLoading ? (
                    <div className="dashboard-container">
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: 'auto auto auto',
                                gridTemplateRows: 'auto auto auto auto',
                                gap: 1.5,
                                padding: 2,
                                width: '100%',
                                flexWrap: 'wrap',
                            }}
                        >
                            <Skeleton variant="rectangular" height={100} animation="pulse" sx={{ gridRow: '1', gridColumn: '4 / 5' }} />
                            <Skeleton variant="rectangular" animation="pulse" height={100} sx={{ gridRow: '1' }} />
                            <Skeleton variant="rectangular" animation="pulse" height={100} sx={{ gridRow: '1' }} />
                            <Skeleton variant="rectangular" animation="pulse" height={100} sx={{ gridRow: '1' }} />
                            <Skeleton variant="rectangular" animation="pulse" height={300} sx={{ gridRow: '2 / 5', gridColumn: '4 / 5' }} />
                            <Skeleton variant="rectangular" animation="pulse" height={200} sx={{ gridRow: '2', gridColumn: '1 / 4' }} />
                            <Skeleton variant="rectangular" animation="pulse" height={300} sx={{ gridRow: '3 / 5', gridColumn: '1 / 3' }} />
                            <Skeleton variant="rectangular" animation="pulse" height={100} sx={{ gridRow: '3' }} />
                            <Skeleton variant="rectangular" animation="pulse" height={100} sx={{ gridRow: '4' }} />
                        </Box>
                    </div>
                ) : (

                <div className="dashboard-container">
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: 'auto auto auto',
                                gridTemplateRows: 'auto auto auto auto',
                                gap: 1.5,
                                padding: 2,
                                width: '100%',
                                flexWrap: 'wrap',
                            }}
                        >
                            <Paper elevation={3} sx={{ gridRow: '1',  gridColumn: '4 / 5', padding: 2 }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pl">

                                <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            gap: 2,
                                        }}
                                    >
                                    <DatePicker
                                        label="Data od"
                                        value={dateFrom}
                                        onChange={(newValue) => setDateFrom(newValue)}
                                        disableFuture
                                        minDate={dayjs(possibleDateFrom)}
                                        maxDate={dateTo}
                                        disabled={!possibleDateFrom}
                                    />

                                    <DatePicker
                                        label="Data do"
                                        value={dateTo}
                                        onChange={(newValue) => setDateTo(newValue)}
                                        minDate={dateFrom}
                                        maxDate={dayjs().endOf('month')}
                                        disabled={!possibleDateFrom}
                                    />

                                    </Box>
                                </LocalizationProvider>
                            </Paper>
                            <Paper elevation={3} sx={{ gridRow: '1', padding: 2, textAlign: 'left' }}>
                                <Typography variant="subtitle1">Bilans</Typography>
                                <Box display="flex" alignItems="center" mt={1}>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold', marginRight: 1 }}>
                                        zł {balance.toFixed(2)}
                                    </Typography>
                                    <BalanceIcon sx={{ color: 'primary.main' }} />
                                </Box>
                            </Paper>
                            <Paper elevation={3} sx={{ gridRow: '1', padding: 2, textAlign: 'left' }}>
                                <Typography variant="subtitle1">Wydatki</Typography>
                                <Box display="flex" alignItems="center" mt={1}>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold', marginRight: 1 }}>
                                        zł {expenses.toFixed(2)}
                                    </Typography>
                                    <PointOfSaleIcon sx={{ color: 'primary.main' }} />
                                </Box>
                            </Paper>
                            <Paper elevation={3} sx={{ gridRow: '1', padding: 2, textAlign: 'left' }}>
                                <Typography variant="subtitle1">Przychody</Typography>
                                <Box display="flex" alignItems="center" mt={1}>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold', marginRight: 1 }}>
                                        zł {incomes.toFixed(2)}
                                    </Typography>
                                    <SavingsIcon sx={{ color: 'primary.main' }} />
                                </Box>
                            </Paper>
                            <Paper elevation={3} sx={{ gridRow: '2 / 5', gridColumn: '4 / 5',  padding: 2 }}>
                                <Typography variant="h6">Historia</Typography>
                                <HistoryContainer events={eventList}></HistoryContainer>
                            </Paper>
                            <Paper elevation={3} sx={{ gridRow: '2', gridColumn: '1 / 4', paddingTop: 2, paddingBottom: 2 }}>
                                <ExpenseIncomeBarChart events={eventList} dateFrom={dateFrom} dateTo={dateTo} />

                            </Paper>
                            <Paper elevation={3} sx={{ gridRow: '3 / 5', gridColumn: '1 / 3',  paddingTop: 2, paddingBottom: 2 }}>
                                <ExpensePieChart events={eventList} />
                            </Paper>
                            <Paper elevation={3} sx={{ gridRow: '3', display: 'flex', alignItems: "stretch", padding: 2}}>
                                <SubmitButton
                                    label="Dodaj wydatek lidl/biedronka"
                                    type="button"
                                    onClick={openEventAddDialog}
                                    sx = {{
                                        color: 'black',
                                        backgroundColor: 'transparent',
                                    }}
                                />
                            </Paper>
                            <Paper elevation={3} sx={{ gridRow: '4', display: 'flex', alignItems: "stretch", padding: 2}}>
                                <SubmitButton
                                    label="Dodaj wydatek lidl/biedronka"
                                    type="button"
                                    onClick={openEventAddDialog}
                                    sx = {{
                                        color: 'black',
                                        backgroundColor: 'transparent',
                                    }}
                                />
                            </Paper>
                        </Box>
                    {isWelcomeDialogOpen && <Confetti />}
                    <WelcomeDialog
                        open={isWelcomeDialogOpen}
                        onClose={closeDialogs}
                        onDemoSuccess={() => setDemoLoaded(prev => !prev)}
                    />

                    <AddEventDialog
                        open={isEventAddDialogOpen}
                        onClose={closeDialogs}
                        onEventAdded={() => setEventAdded(prev => !prev)}
                    />
                </div>
                )}
        </div>
    );
};

export default ExpenseDashboard;
