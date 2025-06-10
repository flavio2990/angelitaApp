import React, { useState } from 'react';
import { Text } from 'react-native';
import { TextInput } from 'react-native-paper';
import CustomButton from './CustomButton';

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function generateRandomCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export default function RegisterAdminForm({ onRegister, onSendCode }) {
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [registerEmailTouched, setRegisterEmailTouched] = useState(false);
    const [registerPasswordTouched, setRegisterPasswordTouched] = useState(false);
    const [registerCode, setRegisterCode] = useState('');
    const [sentCode, setSentCode] = useState('');
    const [codeTouched, setCodeTouched] = useState(false);
    const [codeStep, setCodeStep] = useState(false);

    const handleSendCode = () => {
        const code = generateRandomCode();
        setSentCode(code);
        setCodeStep(true);
        if (onSendCode) onSendCode(registerEmail, code);
        alert(`Código de validación enviado a ${registerEmail} (simulado): ${code}`);
    };

    const handleRegister = () => {
        if (onRegister) onRegister(registerEmail, registerPassword);
        alert("Usuario creado correctamente (simulado). Pronto se conectará con Firebase.");
    };

    return (
        <>
            {!codeStep ? (
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
                        label="Enviar Código"
                        onPress={handleSendCode}
                        disabled={!isValidEmail(registerEmail) || registerPassword.length < 6}
                    />
                </>
            ) : (
                <>
                    <Text style={{ marginBottom: 12, fontSize: 16 }}>
                        Ingrese el código de validación que recibió en su correo.
                    </Text>
                    <TextInput
                        label="Código de validación"
                        value={registerCode}
                        onChangeText={text => {
                            setRegisterCode(text);
                            if (!codeTouched) setCodeTouched(true);
                        }}
                        keyboardType="numeric"
                        style={{ marginBottom: 12, width: 180, textAlign: 'center' }}
                        onBlur={() => setCodeTouched(true)}
                        maxLength={6}
                    />
                    {codeTouched && registerCode !== sentCode && (
                        <Text style={{ color: 'red', fontSize: 14, marginBottom: 8 }}>
                            Código incorrecto
                        </Text>
                    )}
                    <CustomButton
                        label="Crear Usuario"
                        onPress={handleRegister}
                        disabled={registerCode !== sentCode || registerCode.length === 0}
                    />
                </>
            )}
        </>
    );
}