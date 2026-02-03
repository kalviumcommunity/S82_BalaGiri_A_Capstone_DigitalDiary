import { useState, useEffect, useCallback, useRef } from 'react';

const useIdleTimer = (timeoutMs = 300000, onTimeout, isAuthenticated) => { // Default 5 minutes
    const [isIdle, setIsIdle] = useState(false);
    const lastActivityRef = useRef(Date.now());

    const resetTimer = useCallback(() => {
        const now = Date.now();
        lastActivityRef.current = now;
        if (isIdle) setIsIdle(false);
        localStorage.setItem('lastActivity', now.toString());
    }, [isIdle]);

    useEffect(() => {
        if (!isAuthenticated) return;

        // Events to detect activity
        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click', 'keypress'];

        // Throttle the reset to avoid performance issues
        let throttleTimer;
        const handleEvent = () => {
            if (!throttleTimer) {
                resetTimer();
                throttleTimer = setTimeout(() => {
                    throttleTimer = null;
                }, 1000); // Throttle to 1 second
            }
        };

        events.forEach(event => {
            window.addEventListener(event, handleEvent);
        });

        const intervalId = setInterval(() => {
            const storedLastActivity = localStorage.getItem('lastActivity');
            const lastActivity = storedLastActivity ? parseInt(storedLastActivity, 10) : lastActivityRef.current;
            const now = Date.now();

            if (now - lastActivity >= timeoutMs) {
                if (onTimeout) onTimeout();
                setIsIdle(true);
            }
        }, 1000); // Check every second

        // Sync across tabs
        const handleStorageChange = (event) => {
            if (event.key === 'token' && event.newValue === null) {
                // Token removed in another tab
                if (onTimeout) onTimeout();
            }
        };
        window.addEventListener('storage', handleStorageChange);

        // Initialize lastActivity if logged in and missing (recovery)
        if (!localStorage.getItem('lastActivity')) {
            resetTimer();
        }

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, handleEvent);
            });
            clearInterval(intervalId);
            window.removeEventListener('storage', handleStorageChange);
            if (throttleTimer) clearTimeout(throttleTimer);
        };
    }, [resetTimer, timeoutMs, onTimeout, isAuthenticated]);

    return { isIdle, resetTimer };
};

export default useIdleTimer;
