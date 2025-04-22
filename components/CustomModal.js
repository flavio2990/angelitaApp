import React from 'react';
import { Modal as PaperModal, Portal, Text, Button } from 'react-native-paper';

const CustomModal = ({ visible, onDismiss, message = "Bienvenido al sistema. Has ingresado correctamente." }) => {
  return (
    <Portal>
      <PaperModal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={{
          backgroundColor: 'white',
          padding: 20,
          margin: 20,
          borderRadius: 10,
        }}
      >
        <Text style={{ fontSize: 16, marginBottom: 10 }}>{message}</Text>
        <Button mode="contained" onPress={onDismiss}>
          Cerrar
        </Button>
      </PaperModal>
    </Portal>
  );
};

export default CustomModal;
