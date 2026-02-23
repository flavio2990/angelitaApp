import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import CustomButton from './CustomButton';
import { useAuth } from './UserContext';
import { spacing } from '../constants/Theme';
import AppInput from './AppInput';

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function RegisterAdminForm({ onRegister }) {
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [registerEmailTouched, setRegisterEmailTouched] = useState(false);
    const [registerPasswordTouched, setRegisterPasswordTouched] = useState(false);
    const { register } = useAuth();

    const handleRegister = async () => {
        try {
            await register(registerEmail, registerPassword);
            if (onRegister) onRegister(registerEmail, registerPassword);
        } catch (error) {
            alert("Error al registrar usuario: " + error.message);
        }
    };

    return (
        <>
            <AppInput
                type="email"
                label="Email"
                value={registerEmail}
                onChange={text => {
                    setRegisterEmail(text);
                    if (!registerEmailTouched) setRegisterEmailTouched(true);
                }}
                style={styles.input}
                onBlur={() => setRegisterEmailTouched(true)}
                error={registerEmailTouched && !isValidEmail(registerEmail) ? 'Ingrese un mail válido' : undefined}
            />
            <AppInput
                type="password"
                label="Crea Una Contraseña"
                value={registerPassword}
                onChange={text => {
                    setRegisterPassword(text);
                    if (!registerPasswordTouched) setRegisterPasswordTouched(true);
                }}
                style={styles.input}
                onBlur={() => setRegisterPasswordTouched(true)}
                error={registerPasswordTouched && registerPassword.length > 0 && registerPassword.length < 6 ? 'La contraseña debe tener al menos 6 caracteres' : undefined}
            />
            <CustomButton
                label="Crear Usuario"
                onPress={handleRegister}
                disabled={!isValidEmail(registerEmail) || registerPassword.length < 6}
            />
        </>
    );
}

const styles = StyleSheet.create({
    input: {
        marginBottom: spacing.md,
        alignSelf: 'stretch',
    },
});