import React, { useState } from 'react';
import { Text } from 'react-native';
import { TextInput } from 'react-native-paper';

import CustomButton from './CustomButton';
import { auth, database } from './../env/firebase';
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { ref, set } from "firebase/database";

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function RegisterAdminForm({ onRegister }) {
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [registerEmailTouched, setRegisterEmailTouched] = useState(false);
    const [registerPasswordTouched, setRegisterPasswordTouched] = useState(false);

    const handleRegister = async () => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, registerEmail, registerPassword);
            const user = userCredential.user;
            const uid = user.uid;

            await set(ref(database, 'users/' + uid), {
                email: registerEmail,
                role: "admin",
                createdAt: new Date().toISOString(),
                uid: uid
            });

            await sendEmailVerification(user);

            alert("Te enviamos un mail de verificación. Por favor, revisa tu correo y haz clic en el enlace para activar tu cuenta.");

            if (onRegister) onRegister(registerEmail, registerPassword);

        } catch (error) {
            alert("Error al registrar usuario: " + error.message);
        }
    };

    return (
        <>
            <TextInput
                label="Email"
                value={registerEmail}
                onChangeText={text => {
                    setRegisterEmail(text);
                    if (!registerEmailTouched) setRegisterEmailTouched(true);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={{ marginBottom: 12, width: 260 }}
                onBlur={() => setRegisterEmailTouched(true)}
            />
            {registerEmailTouched && !isValidEmail(registerEmail) && (
                <Text style={{ color: 'red', fontSize: 14, marginBottom: 8 }}>
                    Ingrese un mail válido
                </Text>
            )}
            <TextInput
                label="Crea Una Contraseña"
                value={registerPassword}
                onChangeText={text => {
                    setRegisterPassword(text);
                    if (!registerPasswordTouched) setRegisterPasswordTouched(true);
                }}
                secureTextEntry
                style={{ marginBottom: 12, width: 260 }}
                onBlur={() => setRegisterPasswordTouched(true)}
            />
            {registerPasswordTouched && registerPassword.length > 0 && registerPassword.length < 6 && (
                <Text style={{ color: 'red', fontSize: 14, marginBottom: 8 }}>
                    La contraseña debe tener al menos 6 caracteres
                </Text>
            )}
            <CustomButton
                label="Crear Usuario"
                onPress={handleRegister}
                disabled={!isValidEmail(registerEmail) || registerPassword.length < 6}
            />
        </>
    );
}