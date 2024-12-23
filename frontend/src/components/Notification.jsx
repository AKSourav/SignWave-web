import React, { CSSProperties } from 'react';

const Notification = ({ children }) => {

    return (
        <div style={styles.toast}>
            {children}
        </div>
    );
};

const styles = {
    toast: {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: 'black',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        zIndex: 1000,
    },
};

export default Notification;