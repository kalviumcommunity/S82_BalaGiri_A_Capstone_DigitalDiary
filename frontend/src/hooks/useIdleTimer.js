import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const useIdleTimer = (timeoutMs = 300000) => { // Default 5 minutes
    const [isIdle, setIsIdle] = useState(false);
    const navigate = useNavigate();
    const lastActivityRef = useRef(Date.now());

    const handleLogout = useCallback(() => {
        localStorage.removeItem("token");
        setIsIdle(true);
        navigate('/');
        // alert("You have been logged out due to inactivity."); 
        // Commented out alert to match requirement "Show no UI changes". 
        // Can be re-enabled or replaced with a toast if desired.
    }, [navigate]);

    const resetTimer = useCallback(() => {
        lastActivityRef.current = Date.now();
        if (isIdle) setIsIdle(false);
        localStorage.setItem('lastActivity', Date.now().toString());
    }, [isIdle]);

    useEffect(() => {
        // Events to detect activity
        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];

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
                if (localStorage.getItem('token')) { // Only logout if logged in
                    handleLogout();
                }
            }
        }, 1000); // Check every second

        // Sync across tabs
        const handleStorageChange = (event) => {
            if (event.key === 'token' && event.newValue === null) {
                // Token removed in another tab
                navigate('/');
            }
        };
        window.addEventListener('storage', handleStorageChange);

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, handleEvent);
            });
            clearInterval(intervalId);
            window.removeEventListener('storage', handleStorageChange);
            if (throttleTimer) clearTimeout(throttleTimer);
        };
    }, [handleLogout, resetTimer, navigate, timeoutMs]);

    return isIdle;
};

export default useIdleTimer;
