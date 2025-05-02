import React from 'react';
import { Modal as PaperModal, Portal, Text, Button, Card, IconButton } from 'react-native-paper';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const CustomModal = ({
  visible,
  onDismiss,
  title = "Título por defecto",
  content = null,
  actions = [],
  showTopbar = false,
  onBack,
  topbarTitle,
}) => {
  return (
    <Portal>
      <PaperModal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.fullscreenContainer}
      >
        {showTopbar && (
          <View style={styles.topbarBackground}>
            <View style={styles.topbarContent}>
              {onBack && (
                <IconButton
                  icon="arrow-left"
                  onPress={onBack}
                  iconColor="white"
                  style={styles.backButton}
                />
              )}
              <Text style={styles.topbarTextTitle}>{topbarTitle}</Text>
            </View>
          </View>
        )}
        <Card style={styles.card}>
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>{title}</Text>
          </View>

          <Card.Content style={styles.cardContent}>
            {content}
            {actions.map((action, index) => (
              <Button
                key={index}
                mode={action.mode || "outlined"}
                onPress={action.onPress}
                style={[styles.button, action.style]}
                labelStyle={styles.buttonLabel}
                icon={action.icon}
                textColor={action.textColor || "#5124A5"}
                buttonColor={action.buttonColor || "white"}
              >
                {action.label}
              </Button>
            ))}
          </Card.Content>
        </Card>
      </PaperModal>
    </Portal>
  );
};

export default CustomModal;

const styles = StyleSheet.create({
  fullscreenContainer: {
    backgroundColor: 'white',
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#5124A5',
    top: 22
  },
  topbar: {
    flexDirection: 'center',
    alignItems: 'center',
    backgroundColor: '#5124A5',
    width: 320,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    justifyContent: 'space-between',
    top: 'auto'
  },
  topbarTextTitle: {
    color: 'white',
    fontSize: 35,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  titleWrapper: {
    backgroundColor: '#5124A5',
    width: 320,
    paddingVertical: 12,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
  },
  card: {
    backgroundColor: '#ffffff',
    width: 320,
    borderRadius: 50,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  button: {
    width: 260,
    height: 50,
    justifyContent: 'center',
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#5124A5',
    marginVertical: 10,
  },
  buttonLabel: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  topbarBackground: {
    backgroundColor: '#5124A5',
    width: '100%',
    height: 100,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    zIndex: 2,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  topbarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  topbarTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
