import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const DialogContext = createContext();

export const useDialog = () => {
    const context = useContext(DialogContext);
    if (!context) {
        throw new Error('useDialog must be used within a DialogProvider');
    }
    return context;
};

export const DialogProvider = ({ children }) => {
    const [dialogState, setDialogState] = useState({
        isOpen: false,
        type: null, // 'alert', 'confirm', 'prompt'
        message: '',
        defaultValue: '',
        resolve: null,
    });

    const resolveRef = useRef(null);

    const openDialog = useCallback((type, message, defaultValue = '') => {
        return new Promise((resolve) => {
            resolveRef.current = resolve;
            setDialogState({
                isOpen: true,
                type,
                message,
                defaultValue,
            });
        });
    }, []);

    const closeDialog = useCallback((value) => {
        setDialogState((prev) => ({ ...prev, isOpen: false }));
        if (resolveRef.current) {
            resolveRef.current(value);
            resolveRef.current = null;
        }
    }, []);

    // Helper functions that mimic window methods
    const customAlert = useCallback(async (message) => {
        await openDialog('alert', message);
        return;
    }, [openDialog]);

    const customConfirm = useCallback(async (message) => {
        return await openDialog('confirm', message);
    }, [openDialog]);

    const customPrompt = useCallback(async (message, defaultValue = '') => {
        return await openDialog('prompt', message, defaultValue);
    }, [openDialog]);

    return (
        <DialogContext.Provider value={{
            dialogState,
            closeDialog,
            alert: customAlert,
            confirm: customConfirm,
            prompt: customPrompt
        }}>
            {children}
        </DialogContext.Provider>
    );
};
