import React from 'react';
import { Modal as PaperModal, Portal, Text, Button, Card, IconButton } from 'react-native-paper';
import { View, StyleSheet, Dimensions, StatusBar, Platform, ScrollView } from 'react-native';


const { width, height } = Dimensions.get('window');

const CustomModal = ({
  visible,
  onDismiss,
  title = "Colocar el titulo que corresponda",
  content = null,
  actions = [],
  showTopbar = false,
  onBack,
  topbarTitle,
  children,
  isDetailModal = false,
  onModifyPress,
  onGoToPlanPress,
  isEditModal = false,
  onSavePress,
  centerTopbarTitle = false,
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
              <Text
                style={[
                  styles.topbarTextTitle,
                  centerTopbarTitle && { textAlign: 'center', flex: 1 },
                ]}
              >{topbarTitle}</Text>
            </View>
          </View>
        )}
        <Card style={styles.theCard}>
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>{title}</Text>
          </View>
          <Card.Content style={styles.cardContent}>
            <ScrollView
              style={{ width: '100%' }}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={true}
            >
              {content}
              {children}
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
            </ScrollView>
          </Card.Content>
        </Card>
        {isDetailModal && (
          <View >
            <Button
              mode="contained"
              onPress={onModifyPress}
              style={styles.detailButton}
              labelStyle={styles.detailButtonLabel}
              buttonColor="#5124A5"
            >
              Modificar
            </Button>
            <Button
              mode="contained"
              onPress={onGoToPlanPress}
              style={styles.detailButton}
              labelStyle={styles.detailButtonLabel}
              buttonColor="#5124A5"
            >
              Ir a planilla
            </Button>
          </View>
        )}
        {isEditModal && (
          <View>
            <Button
              mode="contained"
              onPress={onSavePress}
              style={styles.detailButton}
              labelStyle={styles.detailButtonLabel}
              buttonColor="#5124A5"
            >
              Guardar
            </Button>
          </View>
        )}
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
    top: 'auto',
  },
  topbarTextTitle: {
    color: 'white',
    fontSize: 30,
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
  theCard: {
    backgroundColor: '#ffffff',
    width: '70%',
    borderRadius: 50,
    marginVertical: 10,
    maxHeight: height * 0.6,
    overflow: 'hidden',
    marginTop: height * 0.1,
    alignSelf: 'center',
  },
  cardContent: {
    justifyContent: 'center',
    alignItems: 'center',
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
  topbarBackground: { // ver aca para el status bar
    backgroundColor: '#5124A5',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, // Espacio para el StatusBar
    height: Platform.OS === 'android' ? 100 + StatusBar.currentHeight : 100, // Ajustar altura total
    position: 'absolute',
    top: 0,
    zIndex: 2,
    marginBottom: 30,
  },
  topbarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginVertical: 10
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  topbarTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  detailButton: {
    width: 260,
    height: 50,
    justifyContent: 'center',
    borderRadius: 50,
    marginHorizontal: 10,
    marginVertical: 10,
  },
  detailButtonLabel: {
    fontWeight: 'regular',
    fontSize: 20,
  },
  scrollContent: {
    // justifyContent: 'center',
    // alignItems: 'center',
    // paddingVertical: 10,
    alignItems: 'center',
    paddingBottom: 20,
    paddingTop: 10,
  }
});
