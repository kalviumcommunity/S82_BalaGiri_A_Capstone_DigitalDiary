import { useState, useEffect, useCallback, useRef } from 'react';

const useIdleTimer = (timeoutMs = 300000, onTimeout, isAuthenticated) => {
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

        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click', 'keypress'];

        let throttleTimer;
        const handleEvent = () => {
            if (!throttleTimer) {
                resetTimer();
                throttleTimer = setTimeout(() => {
                    throttleTimer = null;
                }, 1000);
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
        }, 1000);

        const handleStorageChange = (event) => {
            if (event.key === 'token' && event.newValue === null) {
                if (onTimeout) onTimeout();
            }
        };
        window.addEventListener('storage', handleStorageChange);

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
